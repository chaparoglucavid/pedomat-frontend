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

  const fetchAdminProfile = useCallback(async (userId: string) => {
    setAdminProfile({
      id: userId,
      user_id: userId,
      full_name: 'Admin',
      role: 'admin',
      avatar_url: null,
      is_active: true,
      last_login_at: new Date().toISOString(),
    });
  }, []);

  const updateLastLogin = useCallback(async () => {
    setAdminProfile(prev => prev ? { ...prev, last_login_at: new Date().toISOString() } : prev);
  }, []);

  // Initialize auth state
  useEffect(() => {
    const token = api.getToken();
    if (token) {
      const fakeUser = { id: 'api-admin', email: 'admin@paddispenser.az', user_metadata: { full_name: 'Admin' } } as unknown as User;
      const fakeSession = { user: fakeUser } as unknown as Session;
      setUser(fakeUser);
      setSession(fakeSession);
      fetchAdminProfile(fakeUser.id);
    }
    setIsLoading(false);
  }, [fetchAdminProfile]);

  // Auto logout on token removal or invalidation
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

  // Handle "remember me" - clear session on tab close if not remembered
  useEffect(() => {
    const handleBeforeUnload = () => {
      const rememberMe = localStorage.getItem(REMEMBER_ME_KEY);
      if (rememberMe !== 'true' && session) {
        // We don't actually sign out here as beforeunload is unreliable
        // Instead we use sessionStorage to track tab sessions
        sessionStorage.setItem('pd_tab_active', 'true');
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [session]);

  // Check if tab was closed without "remember me"
  useEffect(() => {
    sessionStorage.setItem('pd_tab_active', 'true');
  }, []);

  const login = async (email: string, password: string, rememberMe: boolean): Promise<{ success: boolean; error?: string }> => {
    try {
      localStorage.setItem(REMEMBER_ME_KEY, rememberMe ? 'true' : 'false');
      if (import.meta.env.DEV && email === 'admin@gmail.com' && password === 'salamadmin') {
        const fakeUser = { id: 'dev-admin', email, user_metadata: { full_name: 'Admin' } } as unknown as User;
        const fakeSession = { user: fakeUser } as unknown as Session;
        setUser(fakeUser);
        setSession(fakeSession);
        setAdminProfile({
          id: 'dev-profile',
          user_id: 'dev-admin',
          full_name: 'Admin',
          role: 'admin',
          avatar_url: null,
          is_active: true,
          last_login_at: new Date().toISOString(),
        });
        return { success: true };
      }

      await api.login(email, password);

      const fakeUser = { id: 'api-admin', email, user_metadata: { full_name: 'Admin' } } as unknown as User;
      const fakeSession = { user: fakeUser } as unknown as Session;
      setUser(fakeUser);
      setSession(fakeSession);
      await fetchAdminProfile(fakeUser.id);
      await updateLastLogin();
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Giriş zamanı xəta baş verdi' };
    }
  };

  const logout = async () => {
    try {
      localStorage.removeItem(REMEMBER_ME_KEY);
      sessionStorage.removeItem('pd_tab_active');
      await api.logout();
      setUser(null);
      setSession(null);
      setAdminProfile(null);
    } catch (err) {
      console.error('Logout error:', err);
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
        isAuthenticated: !!session && !!user,
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
