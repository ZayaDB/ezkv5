'use client';
import { trError } from "@/lib/i18n/runtime";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';
import { supabaseAuth } from '@/lib/auth/supabaseAuth';
import type { AppUserRole } from '@/lib/auth/userRole';
import { markSessionPersistence, isExpiredEphemeralSession, clearSessionPersistence } from '@/lib/auth/rememberSession';

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
  login: (email: string, password: string, remember?: boolean) => Promise<{ success: boolean; error?: string; user?: User }>;
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

    // "Remember me" was off and the browser has been closed since → sign out first.
    const expired = isExpiredEphemeralSession();
    if (expired) {
      clearSessionPersistence();
      localStorage.removeItem(AUTH_USER_CACHE_KEY);
      setUser(null);
      void supabase.auth.signOut().finally(() => setLoading(false));
    } else {
      const cached = readCachedUser();
      if (cached) {
        setUser(cached);
        setLoading(false);
      }
      void refreshUser({ background: cached !== null });
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" && typeof window !== 'undefined') {
        // Recovery links may land on the Site URL; always continue on the reset page.
        const seg = window.location.pathname.split('/')[1];
        const loc = ['kr', 'en', 'mn'].includes(seg) ? seg : 'kr';
        if (!window.location.pathname.endsWith('/reset-password')) {
          window.location.replace(`/${loc}/reset-password`);
        }
        return;
      }
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
        void refreshUser({ background: true });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string, remember = true) => {
    try {
      const result = await supabaseAuth.login(email, password);
      if (!result.success) {
        return { success: false, error: result.error };
      }
      markSessionPersistence(remember);
      setUser(result.user);
      if (typeof window !== 'undefined') {
        localStorage.setItem(AUTH_USER_CACHE_KEY, JSON.stringify(result.user));
      }
      return { success: true, user: result.user };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : trError("loginError");
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
      const message = error instanceof Error ? error.message : trError("signupError");
      return { success: false, error: message };
    }
  };

  const logout = () => {
    clearSessionPersistence();
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
      const message = error instanceof Error ? error.message : trError("profileSaveError");
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
