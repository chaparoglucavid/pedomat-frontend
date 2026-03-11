import React, { useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Menu, Search, Bell, Settings, User, LogOut, ChevronDown, Shield } from 'lucide-react';

const Header: React.FC = () => {
  const { sidebarOpen, toggleSidebar, currentPage, searchQuery, setSearchQuery } = useAppContext();
  const { user, adminProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);


  const notifications = [
    { id: 1, text: 'Nərimanov dispenser oflayn oldu', time: '5 dəq əvvəl', type: 'error' },
    { id: 2, text: 'Yeni forum yazısı təsdiq gözləyir', time: '15 dəq əvvəl', type: 'warning' },
    { id: 3, text: 'Cihaz #4-ə 100 ped əlavə edildi', time: '1 saat əvvəl', type: 'success' },
    { id: 4, text: 'İstifadəçi Ləman bloklandı', time: '2 saat əvvəl', type: 'info' },
  ];

  const handleLogout = async () => {
    setLoggingOut(true);
    setShowProfile(false);
    await logout();
    navigate('/login', { replace: true });
  };

  // Get user display info
  const userEmail = user?.email || 'admin@paddispenser.az';
  const userName = adminProfile?.full_name || user?.user_metadata?.full_name || userEmail.split('@')[0];
  const userRole = adminProfile?.role === 'super_admin' ? 'Super Admin' : adminProfile?.role === 'moderator' ? 'Moderator' : 'Admin';
  const userInitials = userName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'AD';

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 px-4 lg:px-6 py-3">
      <div className="flex items-center justify-between gap-4">
        {/* Left */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-600"
          >
            <Menu size={20} />
          </button>
          <div>
            <h2 className="text-lg font-bold text-slate-800">İdarə Paneli</h2>
            <p className="text-xs text-slate-400">23 Fevral 2026, Bazar ertəsi</p>
          </div>
        </div>

        {/* Center - Search */}
        <div className="hidden md:flex flex-1 max-w-md">
          <div className="relative w-full">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Axtar... (cihaz, istifadəçi, əməliyyat)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false); }}
              className="relative p-2.5 rounded-xl hover:bg-slate-100 transition-colors text-slate-600"
            >
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
            </button>
            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50">
                <div className="p-4 border-b border-slate-100">
                  <h3 className="font-semibold text-slate-800">Bildirişlər</h3>
                  <p className="text-xs text-slate-400">{notifications.length} yeni bildiriş</p>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.map((n) => (
                    <div key={n.id} className="px-4 py-3 hover:bg-slate-50 border-b border-slate-50 cursor-pointer transition-colors">
                      <div className="flex items-start gap-3">
                        <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                          n.type === 'error' ? 'bg-red-500' :
                          n.type === 'warning' ? 'bg-amber-500' :
                          n.type === 'success' ? 'bg-emerald-500' : 'bg-blue-500'
                        }`} />
                        <div>
                          <p className="text-sm text-slate-700">{n.text}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{n.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-3 border-t border-slate-100">
                  <button className="w-full text-center text-xs text-cyan-600 font-medium hover:text-cyan-700">
                    Bütün bildirişlərə bax
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Settings */}
          <button className="p-2.5 rounded-xl hover:bg-slate-100 transition-colors text-slate-600">
            <Settings size={20} />
          </button>

          {/* Profile */}
          <div className="relative">
            <button
              onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); }}
              className="flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                {userInitials}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-medium text-slate-700 leading-tight">{userName}</p>
                <p className="text-[10px] text-slate-400 leading-tight">{userRole}</p>
              </div>
              <ChevronDown size={14} className="text-slate-400" />
            </button>
            {showProfile && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50">
                <div className="p-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-sm font-bold">
                      {userInitials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 text-sm truncate">{userName}</p>
                      <p className="text-xs text-slate-400 truncate">{userEmail}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-1.5">
                    <Shield size={12} className="text-cyan-500" />
                    <span className="text-[10px] font-medium text-cyan-600 bg-cyan-50 px-2 py-0.5 rounded-full">{userRole}</span>
                  </div>
                </div>
                <div className="py-2">
                  <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                    <User size={16} /> Profil
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                    <Settings size={16} /> Parametrlər
                  </button>
                  <div className="border-t border-slate-100 my-1" />
                  <button
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    <LogOut size={16} />
                    {loggingOut ? 'Çıxış edilir...' : 'Çıxış'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Click outside to close dropdowns */}
      {(showNotifications || showProfile) && (
        <div
          className="fixed inset-0 z-[-1]"
          onClick={() => { setShowNotifications(false); setShowProfile(false); }}
        />
      )}
    </header>
  );
};

export default Header;
