import React from 'react';
import { useAppContext, PageType } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Monitor, Users, ArrowLeftRight, Tag, Layers,
  MessageSquare, BookOpen, Image, Map, ChevronLeft, ChevronRight, X, LogOut, Package as PackageIcon
} from 'lucide-react';

interface NavItem {
  id: PageType;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'İdarə Paneli', icon: <LayoutDashboard size={20} /> },
  { id: 'equipments', label: 'Cihazlar', icon: <Monitor size={20} /> },
  { id: 'map', label: 'Xəritə', icon: <Map size={20} /> },
  { id: 'users', label: 'İstifadəçilər', icon: <Users size={20} /> },
  { id: 'transactions', label: 'Əməliyyatlar', icon: <ArrowLeftRight size={20} /> },
  { id: 'brands', label: 'Brendlər', icon: <Tag size={20} /> },
  { id: 'categories', label: 'Kateqoriyalar', icon: <Layers size={20} /> },
  { id: 'packages', label: 'Paketlər', icon: <PackageIcon size={20} /> },
  { id: 'forum', label: 'Forum', icon: <MessageSquare size={20} /> },
  { id: 'stories', label: 'Hekayələr', icon: <BookOpen size={20} /> },
  { id: 'banners', label: 'Reklamlar', icon: <Image size={20} /> },
];

const Sidebar: React.FC = () => {
  const { sidebarOpen, toggleSidebar, currentPage, setCurrentPage } = useAppContext();
  const { user, adminProfile, logout } = useAuth();
  const navigate = useNavigate();

  const pathMap: Record<PageType, string> = {
    dashboard: '/dashboard',
    equipments: '/equipments',
    map: '/map',
    users: '/users',
    transactions: '/transactions',
    brands: '/brands',
    categories: '/categories',
    packages: '/packages',
    forum: '/forum',
    stories: '/stories',
    banners: '/banners',
  };

  // Get user display info
  const userEmail = user?.email || '';
  const userName = adminProfile?.full_name || user?.user_metadata?.full_name || userEmail.split('@')[0] || 'Admin';
  const userRole = adminProfile?.role === 'super_admin' ? 'Super Admin' : adminProfile?.role === 'moderator' ? 'Moderator' : 'Admin';
  const userInitials = userName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'AD';

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 h-full bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white transition-all duration-300 flex flex-col
          ${sidebarOpen ? 'w-64' : 'w-20'}
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center font-bold text-lg shadow-lg shadow-cyan-500/20">
              PD
            </div>
            {sidebarOpen && (
              <div>
                <h1 className="font-bold text-sm leading-tight">PadDispenser</h1>
                <p className="text-[10px] text-slate-400">Admin Panel</p>
              </div>
            )}
          </div>
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-1 rounded-lg hover:bg-slate-700 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          <p className={`text-[10px] uppercase tracking-wider text-slate-500 mb-3 ${sidebarOpen ? 'px-3' : 'text-center'}`}>
            {sidebarOpen ? 'Əsas Menyu' : '···'}
          </p>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setCurrentPage(item.id);
                navigate(pathMap[item.id]);
                if (window.innerWidth < 1024) toggleSidebar();
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative
                ${currentPage === item.id
                  ? 'bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 text-cyan-400 shadow-lg shadow-cyan-500/5'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }
              `}
              title={!sidebarOpen ? item.label : undefined}
            >
              {currentPage === item.id && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-cyan-400 rounded-r-full" />
              )}
              <span className={`flex-shrink-0 ${!sidebarOpen ? 'mx-auto' : ''}`}>{item.icon}</span>
              {sidebarOpen && (
                <>
                  <span className="flex-1 text-left">{item.label}</span>
                </>
              )}
            </button>
          ))}
        </nav>

        {/* Collapse button (desktop only) */}
        <div className="hidden lg:block p-3 border-t border-slate-700/50">
          <button
            onClick={toggleSidebar}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors text-sm"
          >
            {sidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
            {sidebarOpen && <span>Menyunu bağla</span>}
          </button>
        </div>

        {/* Admin info */}
        <div className={`border-t border-slate-700/50 ${sidebarOpen ? 'p-4' : 'p-3'}`}>
          {sidebarOpen ? (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                {userInitials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{userName}</p>
                <p className="text-[10px] text-slate-400 truncate">{userRole}</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-red-400 transition-colors flex-shrink-0"
                title="Çıxış"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-slate-700/50 transition-colors"
              title="Çıxış"
            >
              <LogOut size={18} />
            </button>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
