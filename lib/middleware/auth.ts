import { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';

export interface AuthRequest extends NextRequest {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

export function getAuthToken(request: NextRequest): string | null {
  // Check Authorization header
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Check cookie
  const token = request.cookies.get('token')?.value;
  return token || null;
}

export function authenticateRequest(request: NextRequest): { userId: string; email: string; role: string } | null {
  const token = getAuthToken(request);
  if (!token) {
    return null;
  }

  const payload = verifyToken(token);
  if (!payload) {
    return null;
  }

  return {
    userId: payload.userId,
    email: payload.email,
    role: payload.role,
  };
}

