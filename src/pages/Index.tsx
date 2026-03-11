import React, { useEffect } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import AppLayout from '@/components/AppLayout';
import { AppProvider, useAppContext } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center font-bold text-xl text-white shadow-xl shadow-cyan-500/20">
          PD
        </div>
        <div className="flex items-center gap-3">
          <Loader2 size={20} className="animate-spin text-cyan-500" />
          <span className="text-sm text-slate-500 font-medium">Sessiya yoxlanılır...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const Index: React.FC = () => {
  const RouterSync: React.FC = () => {
    const { setCurrentPage } = useAppContext();
    const location = useLocation();
    useEffect(() => {
      const path = location.pathname.replace(/^\//, '') || 'dashboard';
      const pageMap: Record<string, string> = {
        '': 'dashboard',
        'dashboard': 'dashboard',
        'equipments': 'equipments',
        'map': 'map',
        'users': 'users',
        'transactions': 'transactions',
        'brands': 'brands',
        'categories': 'categories',
        'forum': 'forum',
        'stories': 'stories',
        'banners': 'banners',
      };
      const page = pageMap[path] || 'dashboard';
      setCurrentPage(page as any);
    }, [setCurrentPage, location.pathname]);
    return <AppLayout />;
  };

  return (
    <AuthGuard>
      <AppProvider>
        <RouterSync />
      </AppProvider>
    </AuthGuard>
  );
};

export default Index;
