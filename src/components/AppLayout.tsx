import React from 'react';
import { useAppContext } from '@/contexts/AppContext';
import Sidebar from './admin/Sidebar';
import Header from './admin/Header';
import Dashboard from './admin/Dashboard';
import EquipmentPage from './admin/EquipmentPage';
import UsersPage from './admin/UsersPage';
import TransactionsPage from './admin/TransactionsPage';
import BrandsPage from './admin/BrandsPage';
import CategoriesPage from './admin/CategoriesPage';
import ForumPage from './admin/ForumPage';
import StoriesPage from './admin/StoriesPage';
import BannersPage from './admin/BannersPage';
import MapView from './admin/MapView';
import UserDetailsPage from './admin/UserDetailsPage';
import PackagesPage from './admin/PackagesPage';

const AppLayout: React.FC = () => {
  const { sidebarOpen, currentPage } = useAppContext();

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <Dashboard />;
      case 'equipments': return <EquipmentPage />;
      case 'users': return <UsersPage />;
      case 'user-details': return <UserDetailsPage />;
      case 'transactions': return <TransactionsPage />;
      case 'brands': return <BrandsPage />;
      case 'categories': return <CategoriesPage />;
      case 'forum': return <ForumPage />;
      case 'stories': return <StoriesPage />;
      case 'banners': return <BannersPage />;
      case 'packages': return <PackagesPage />;
      case 'map': return <MapView />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50">
      <Sidebar />
      <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}`}>
        <Header />
        <main className="p-4 lg:p-6 pb-20">
          {renderPage()}
        </main>
        <footer className={`fixed bottom-0 right-0 ${sidebarOpen ? 'lg:left-64' : 'lg:left-20'} left-0 px-4 lg:px-6 py-4 border-t border-slate-100 bg-white/80 backdrop-blur-sm z-30`}>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
            <p>PadDispenser Admin Panel v1.0 — Azərbaycan</p>
            <p>Bütün hüquqlar qorunur. 2026</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default AppLayout;
