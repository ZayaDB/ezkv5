'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';
import { supabaseAuth } from '@/lib/auth/supabaseAuth';
import type { AppUserRole } from '@/lib/auth/userRole';

export interface User {
  id: string;
  email: string;
  name: string;
  role: AppUserRole;
  locale?: string;
  avatar?: string;
  bio?: string;
  location?: string;
  phone?: string;
  address?: string;
  languages?: string[];
  nationality?: string | null;
  university?: string | null;
  region?: string | null;
  visaType?: string | null;
  visaExpireDate?: string | null;
  countryStatus?: string;
  onboardingStatus?: string;
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
    locale: string;
    nationality?: string;
    university?: string;
    region?: string;
    residingInKorea?: boolean;
    visaType?: string;
    visaExpireDate?: string;
  }) => Promise<{ success: boolean; error?: string; user?: User }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  switchRole: (targetRole: 'user' | 'mentor') => Promise<{ success: boolean; error?: string }>;
  updateProfile: (data: {
    name?: string;
    avatar?: string;
    bio?: string;
    location?: string;
    phone?: string;
    newPassword?: string;
  }) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const AUTH_USER_CACHE_KEY = 'auth_user_cache';

function readCachedUser(): User | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(AUTH_USER_CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async (options?: { background?: boolean }) => {
    if (!options?.background) {
      setLoading(true);
    }
    try {
      const currentUser = await supabaseAuth.getCurrentUser();
      setUser(currentUser);
      if (typeof window !== 'undefined') {
        if (currentUser) {
          localStorage.setItem(AUTH_USER_CACHE_KEY, JSON.stringify(currentUser));
        } else {
          localStorage.removeItem(AUTH_USER_CACHE_KEY);
        }
      }
    } catch {
      setUser(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem(AUTH_USER_CACHE_KEY);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const supabase = createClient();
    const cached = readCachedUser();
    if (cached) {
      setUser(cached);
      setLoading(false);
    }

    void refreshUser({ background: cached !== null });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void refreshUser({ background: true });
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const result = await supabaseAuth.login(email, password);
      if (!result.success) {
        return { success: false, error: result.error };
      }
      setUser(result.user);
      if (typeof window !== 'undefined') {
        localStorage.setItem(AUTH_USER_CACHE_KEY, JSON.stringify(result.user));
      }
      return { success: true, user: result.user };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '로그인 중 오류가 발생했습니다.';
      return { success: false, error: message };
    }
  };

  const signup = async (userData: {
    email: string;
    password: string;
    name: string;
    locale: string;
    nationality?: string;
    university?: string;
    region?: string;
    residingInKorea?: boolean;
    visaType?: string;
    visaExpireDate?: string;
  }) => {
    try {
      const result = await supabaseAuth.signup(userData);
      if (!result.success) {
        return { success: false, error: result.error };
      }
      setUser(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem(AUTH_USER_CACHE_KEY);
        localStorage.removeItem('token');
      }
      return { success: true };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '회원가입 중 오류가 발생했습니다.';
      return { success: false, error: message };
    }
  };

  const logout = () => {
    void supabaseAuth.logout();
    setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(AUTH_USER_CACHE_KEY);
      localStorage.removeItem('token');
    }
  };

  const updateProfile = async (data: {
    name?: string;
    avatar?: string;
    bio?: string;
    location?: string;
    phone?: string;
    newPassword?: string;
  }) => {
    try {
      const result = await supabaseAuth.updateProfile(data);
      if (!result.success) {
        return { success: false, error: result.error };
      }
      setUser(result.user);
      if (typeof window !== 'undefined') {
        localStorage.setItem(AUTH_USER_CACHE_KEY, JSON.stringify(result.user));
      }
      return { success: true };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '프로필 저장 중 오류가 발생했습니다.';
      return { success: false, error: message };
    }
  };

  const switchRole = async (targetRole: 'user' | 'mentor') => {
    try {
      const result = await supabaseAuth.switchRole(targetRole);
      if (!result.success) {
        return { success: false, error: result.error };
      }
      setUser(result.user);
      if (typeof window !== 'undefined') {
        localStorage.setItem(AUTH_USER_CACHE_KEY, JSON.stringify(result.user));
      }
      return { success: true };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '역할 전환 중 오류가 발생했습니다.';
      return { success: false, error: message };
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
        updateProfile,
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
