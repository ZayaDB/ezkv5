'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '@/lib/api/client';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'mentee' | 'mentor' | 'admin';
  locale?: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (userData: {
    email: string;
    password: string;
    name: string;
    role: 'mentee' | 'mentor' | 'admin';
    locale: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const currentUser = await authApi.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authApi.login(email, password);
      if (response.error) {
        return { success: false, error: response.error };
      }
      if (response.data?.user) {
        setUser(response.data.user);
        return { success: true };
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
        setUser(response.data.user);
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

