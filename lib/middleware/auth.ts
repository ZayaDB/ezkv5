import { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';
import connectDB from '@/lib/db/mongodb';
import User from '@/models/User';

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

/** JWT와 무관하게 DB의 최신 role을 사용 (관리자 승인 후 토큰 갱신 전에도 동작) */
export async function authenticateRequestDb(
  request: NextRequest
): Promise<{ userId: string; email: string; role: string } | null> {
  const auth = authenticateRequest(request);
  if (!auth) return null;
  await connectDB();
  const u = await User.findById(auth.userId).select('role email').lean();
  if (!u) return null;
  const row = u as { role: string; email?: string };
  return {
    userId: auth.userId,
    email: row.email || auth.email,
    role: row.role,
  };
}

