'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '@/lib/api';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'mentee' | 'mentor' | 'admin';
  locale?: string;
  avatar?: string;
  bio?: string;
  location?: string;
  phone?: string;
  address?: string;
  languages?: string[];
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; user?: User }>;
  signup: (userData: {
    email: string;
    password: string;
    name: string;
    role: 'mentee' | 'mentor' | 'admin';
    locale: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  switchRole: (targetRole: 'mentee' | 'mentor') => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const AUTH_USER_CACHE_KEY = 'auth_user_cache';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [bootstrapped, setBootstrapped] = useState(false);

  const refreshUser = async (options?: { background?: boolean }) => {
    if (!options?.background) {
      setLoading(true);
    }
    try {
      const currentUser = await authApi.getCurrentUser();
      setUser(currentUser);
      if (typeof window !== 'undefined') {
        if (currentUser) {
          localStorage.setItem(AUTH_USER_CACHE_KEY, JSON.stringify(currentUser));
        } else {
          localStorage.removeItem(AUTH_USER_CACHE_KEY);
        }
      }
    } catch (error) {
      setUser(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem(AUTH_USER_CACHE_KEY);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (bootstrapped) return;
    setBootstrapped(true);
    if (typeof window === 'undefined') return;

    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    const cached = localStorage.getItem(AUTH_USER_CACHE_KEY);
    if (cached) {
      try {
        setUser(JSON.parse(cached) as User);
        setLoading(false);
        void refreshUser({ background: true });
        return;
      } catch {
        localStorage.removeItem(AUTH_USER_CACHE_KEY);
      }
    }

    void refreshUser();
  }, [bootstrapped]);

  const login = async (email: string, password: string) => {
    try {
      const response = await authApi.login(email, password);
      if (response.error) {
        return { success: false, error: response.error };
      }
      if (response.data?.user) {
        setUser(response.data.user);
        if (typeof window !== 'undefined') {
          localStorage.setItem(AUTH_USER_CACHE_KEY, JSON.stringify(response.data.user));
        }
        return { success: true, user: response.data.user };
      }
      return { success: false, error: '로그인에 실패했습니다.' };
    } catch (error: any) {
      return { success: false, error: error.message || '로그인 중 오류가 발생했습니다.' };
    }
  };

  const signup = async (userData: {
    email: string;
    password: string;
    name: string;
    role: 'mentee' | 'mentor' | 'admin';
    locale: string;
  }) => {
    try {
      const response = await authApi.signup(userData);
      if (response.error) {
        return { success: false, error: response.error };
      }
      if (response.data?.user) {
        // 회원가입 성공 - 자동 로그인하지 않음 (로그인 페이지로 이동)
        // setUser(response.data.user); // 제거 - 자동 로그인 방지
        return { success: true };
      }
      return { success: false, error: '회원가입에 실패했습니다.' };
    } catch (error: any) {
      return { success: false, error: error.message || '회원가입 중 오류가 발생했습니다.' };
    }
  };

  const logout = () => {
    authApi.logout();
    setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(AUTH_USER_CACHE_KEY);
    }
  };

  const switchRole = async (targetRole: 'mentee' | 'mentor') => {
    try {
      const response = await authApi.switchRole(targetRole);
      if (response.error) {
        return { success: false, error: response.error };
      }
      if (response.data?.user) {
        setUser(response.data.user);
        if (typeof window !== 'undefined') {
          localStorage.setItem(AUTH_USER_CACHE_KEY, JSON.stringify(response.data.user));
        }
        return { success: true };
      }
      return { success: false, error: '역할 전환에 실패했습니다.' };
    } catch (error: any) {
      return { success: false, error: error.message || '역할 전환 중 오류가 발생했습니다.' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        signup,
        logout,
        refreshUser,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

