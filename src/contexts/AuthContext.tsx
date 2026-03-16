import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { api } from '@/lib/api';

interface AdminProfile {
  id: string;
  user_id: string;
  full_name: string;
  role: string;
  avatar_url: string | null;
  is_active: boolean;
  last_login_at: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  adminProfile: AdminProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, rememberMe: boolean) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  updatePassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  adminProfile: null,
  isLoading: true,
  isAuthenticated: false,
  login: async () => ({ success: false }),
  logout: async () => {},
  resetPassword: async () => ({ success: false }),
  updatePassword: async () => ({ success: false }),
});

export const useAuth = () => useContext(AuthContext);

const REMEMBER_ME_KEY = 'pd_admin_remember_me';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const buildAdminProfile = useCallback((backendUser: any): AdminProfile => {
    return {
      id: String(backendUser.id),
      user_id: String(backendUser.id),
      full_name: backendUser.full_name || backendUser.name || 'Admin',
      role: backendUser.role || 'admin',
      avatar_url: backendUser.avatar_url || null,
      is_active: backendUser.is_active ?? true,
      last_login_at: new Date().toISOString(),
    };
  }, []);

  const buildAuthUser = useCallback((backendUser: any): User => {
    return {
      id: String(backendUser.id),
      email: backendUser.email,
      user_metadata: {
        full_name: backendUser.full_name || backendUser.name || 'Admin',
        role: backendUser.role || 'admin',
        avatar_url: backendUser.avatar_url || null,
      },
    } as unknown as User;
  }, []);

  const fetchCurrentUser = useCallback(async () => {
    const me = await api.me();
    const authUser = buildAuthUser(me);
    const authSession = { user: authUser } as Session;

    setUser(authUser);
    setSession(authSession);
    setAdminProfile(buildAdminProfile(me));
  }, [buildAuthUser, buildAdminProfile]);

  useEffect(() => {
    const init = async () => {
      try {
        const token = api.getToken();
        if (token) {
          await fetchCurrentUser();
        }
      } catch (err) {
        api.setToken(null);
        setUser(null);
        setSession(null);
        setAdminProfile(null);
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, [fetchCurrentUser]);

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'auth_token' && e.newValue === null) {
        setUser(null);
        setSession(null);
        setAdminProfile(null);
      }
    };

    const handleUnauthorized = () => {
      setUser(null);
      setSession(null);
      setAdminProfile(null);
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('auth:logout', handleUnauthorized as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('auth:logout', handleUnauthorized as EventListener);
    };
  }, []);

  const login = async (
      email: string,
      password: string,
      rememberMe: boolean
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      localStorage.setItem(REMEMBER_ME_KEY, rememberMe ? 'true' : 'false');

      await api.login(email, password);
      await fetchCurrentUser();

      return { success: true };
    } catch (err: any) {
      return {
        success: false,
        error: err?.data?.message || err?.message || 'Giriş zamanı xəta baş verdi',
      };
    }
  };

  const logout = async () => {
    try {
      localStorage.removeItem(REMEMBER_ME_KEY);
      sessionStorage.removeItem('pd_tab_active');
      await api.logout();
    } finally {
      setUser(null);
      setSession(null);
      setAdminProfile(null);
    }
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    return { success: false, error: 'Bu funksiya API ilə inteqrasiya olunmayıb' };
  };

  const updatePassword = async (newPassword: string): Promise<{ success: boolean; error?: string }> => {
    return { success: false, error: 'Bu funksiya API ilə inteqrasiya olunmayıb' };
  };

  return (
      <AuthContext.Provider
          value={{
            user,
            session,
            adminProfile,
            isLoading,
            isAuthenticated: !!user && !!session,
            login,
            logout,
            resetPassword,
            updatePassword,
          }}
      >
        {children}
      </AuthContext.Provider>
  );
};