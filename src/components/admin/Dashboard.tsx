import React, { useEffect, useMemo, useState } from 'react';
import {
  Monitor, MonitorOff, Package, Users, TrendingUp, AlertTriangle,
  ArrowUpRight, ArrowDownRight, Activity, Wallet
} from 'lucide-react';
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, BarChart, Bar
} from 'recharts';
import { api } from '@/lib/api';
import { useAppContext } from '@/contexts/AppContext';

const COLORS = ['#0099CC', '#E30A17', '#00B388', '#9333ea', '#f59e0b'];

const Dashboard: React.FC = () => {
  const { setCurrentPage } = useAppContext();
  const [statsData, setStatsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.dashboardStats();
        setStatsData(data);
      } catch (err) {
        console.error('Stats loading failed', err);
      }
      setLoading(false);
    };
    load();
  }, []);

  const stats = useMemo(() => {
    if (!statsData) return [];
    return [
      { label: 'Aktiv Cihazlar', value: statsData.active_equipments ?? 0, icon: <Monitor size={22} />, color: 'from-emerald-500 to-emerald-600', change: '+2', up: true },
      { label: 'Deaktiv Cihazlar', value: statsData.deactive_equipments ?? 0, icon: <MonitorOff size={22} />, color: 'from-red-500 to-red-600', change: '-1', up: false },
      { label: 'Təmirdə Cihazlar', value: statsData.under_repair_equipments ?? 0, icon: <AlertTriangle size={22} />, color: 'from-amber-500 to-amber-600', change: '0', up: false },
      { label: 'Baxımda Cihazlar', value: statsData.maintenance_equipments ?? 0, icon: <Activity size={22} />, color: 'from-indigo-500 to-indigo-600', change: '0', up: false },
      { label: 'Oflayn Cihazlar', value: statsData.offline_equipments ?? 0, icon: <MonitorOff size={22} />, color: 'from-red-500 to-red-600', change: '0', up: false },
      { label: 'Xarab Cihazlar', value: statsData.broken_equipments ?? 0, icon: <AlertTriangle size={22} />, color: 'from-amber-500 to-amber-600', change: '0', up: false },
      { label: 'Bugünkü Əməliyyat', value: statsData.today_transactions_count ?? 0, icon: <Package size={22} />, color: 'from-cyan-500 to-cyan-600', change: '+12%', up: true },
      { label: 'Aktiv İstifadəçilər', value: statsData.active_users ?? 0, icon: <Users size={22} />, color: 'from-blue-500 to-blue-600', change: '+3', up: true },
      { label: 'Ümumi Stok', value: `${statsData.total_ped_stock ?? 0} ped`, icon: <Activity size={22} />, color: 'from-purple-500 to-purple-600', change: '-8%', up: false },
      { label: 'Son 30 gün əməliyyat', value: statsData.monthly_transactions_count ?? 0, icon: <TrendingUp size={22} />, color: 'from-indigo-500 to-indigo-600', change: '+18%', up: true },
      { label: 'Ümumi Balans', value: `${(Number(statsData.total_wallet_balance) || 0).toFixed(2)} AZN`, icon: <Wallet size={22} />, color: 'from-teal-500 to-teal-600', change: '+5%', up: true },
    ];
  }, [statsData]);

  const dailyUsageData = statsData?.daily_usage || [];
  const recentTransactions = statsData?.recent_transactions || [];
  const brandUsageData: any[] = [];
  const categoryUsageData: any[] = [];
  const equipmentUsage: any[] = [];
  const topUsers: any[] = [];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading
          ? Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 border border-slate-100">
                <div className="h-8 w-8 bg-slate-100 rounded-xl animate-pulse" />
                <div className="mt-4 h-6 w-24 bg-slate-100 rounded animate-pulse" />
                <div className="mt-2 h-3 w-32 bg-slate-100 rounded animate-pulse" />
              </div>
            ))
          : stats.map((stat, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 border border-slate-100 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300 group cursor-pointer">
                <div className="flex items-start justify-between">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} text-white shadow-lg group-hover:scale-110 transition-transform`}>
                    {stat.icon}
                  </div>
                  <span className={`flex items-center gap-0.5 text-xs font-semibold px-2 py-1 rounded-full ${stat.up ? 'text-emerald-600 bg-emerald-50' : 'text-red-600 bg-red-50'}`}>
                    {stat.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                    {stat.change}
                  </span>
                </div>
                <div className="mt-4">
                  <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
                  <p className="text-sm text-slate-500 mt-0.5">{stat.label}</p>
                </div>
              </div>
            ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Area Chart - Daily Usage */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-slate-800">Günlük İstifadə Statistikası</h3>
              <p className="text-xs text-slate-400 mt-1">Son 30 gün</p>
            </div>
            <div className="flex gap-2">
              <span className="px-3 py-1.5 bg-cyan-50 text-cyan-600 text-xs font-medium rounded-lg">30 gün</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={dailyUsageData}>
              <defs>
                <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0099CC" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0099CC" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="gun" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                labelStyle={{ fontWeight: 'bold', color: '#1e293b' }}
              />
              <Area type="monotone" dataKey="istifade" stroke="#0099CC" strokeWidth={2.5} fill="url(#colorUsage)" name="Əməliyyat sayı" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart - Brand Usage */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100">
          <h3 className="font-bold text-slate-800 mb-1">Brend Paylanması</h3>
          <p className="text-xs text-slate-400 mb-4">Ümumi istifadə üzrə</p>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={brandUsageData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={4}
                dataKey="deger"
              >
                {brandUsageData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {brandUsageData.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                  <span className="text-slate-600">{item.name}</span>
                </div>
                <span className="font-semibold text-slate-800">{item.deger}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Bar Chart */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100">
          <h3 className="font-bold text-slate-800 mb-1">Kateqoriya İstifadəsi</h3>
          <p className="text-xs text-slate-400 mb-4">Ped növü üzrə</p>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={categoryUsageData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#94a3b8' }} width={80} />
              <Tooltip />
              <Bar dataKey="deger" fill="#00B388" radius={[0, 8, 8, 0]} name="İstifadə" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Equipment */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-800">Ən Aktiv Cihazlar</h3>
              <p className="text-xs text-slate-400 mt-0.5">İstifadə sayına görə</p>
            </div>
            <button onClick={() => setCurrentPage('equipments')} className="text-xs text-cyan-600 hover:text-cyan-700 font-medium">
              Hamısına bax
            </button>
          </div>
          <div className="space-y-3">
            {equipmentUsage.map((eq, i) => (
              <div key={eq.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold ${
                  i === 0 ? 'bg-gradient-to-br from-amber-400 to-amber-500' :
                  i === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-400' :
                  i === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-500' :
                  'bg-slate-200 text-slate-600'
                }`}>
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 truncate">{eq.equipment_name}</p>
                  <p className="text-[10px] text-slate-400">{eq.equipment_number}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-800">{eq.usage}</p>
                  <p className="text-[10px] text-slate-400">əməliyyat</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Users */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-800">Ən Aktiv İstifadəçilər</h3>
              <p className="text-xs text-slate-400 mt-0.5">Ped istifadəsinə görə</p>
            </div>
            <button onClick={() => setCurrentPage('users')} className="text-xs text-cyan-600 hover:text-cyan-700 font-medium">
              Hamısına bax
            </button>
          </div>
          <div className="space-y-3">
            {topUsers.map((user, i) => (
              <div key={user.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold bg-gradient-to-br ${
                  i === 0 ? 'from-cyan-500 to-blue-600' :
                  i === 1 ? 'from-purple-500 to-indigo-600' :
                  i === 2 ? 'from-pink-500 to-rose-600' :
                  'from-slate-400 to-slate-500'
                }`}>
                  {(user.full_name || '??').slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 truncate">{user.full_name || 'Naməlum'}</p>
                  <p className="text-[10px] text-slate-400">{user.email || ''}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-800">{user.usage}</p>
                  <p className="text-[10px] text-slate-400">əməliyyat</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="flex items-center justify-between p-6 pb-4">
          <div>
            <h3 className="font-bold text-slate-800">Son Əməliyyatlar</h3>
            <p className="text-xs text-slate-400 mt-0.5">Real vaxt əməliyyat izləmə</p>
          </div>
          <button onClick={() => setCurrentPage('transactions')} className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-medium rounded-xl transition-colors">
            Hamısına bax
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/80">
                <th className="text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider px-6 py-3">İstifadəçi</th>
                <th className="text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider px-6 py-3">Məbləğ</th>
                <th className="text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider px-6 py-3">Növ</th>
                <th className="text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider px-6 py-3">Tarix</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {recentTransactions.map((tr: any) => (
                <tr key={tr.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-[10px] font-bold">
                        {(tr.user?.full_name || '??').slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-700">{tr.user?.full_name || 'Naməlum'}</p>
                        <p className="text-[10px] text-slate-400">{tr.user?.email || ''}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-sm font-bold ${tr.transaction_type === 'top_up' ? 'text-emerald-600' : 'text-red-600'}`}>
                      {tr.transaction_type === 'top_up' ? '+' : '-'}{Number(tr.amount).toFixed(2)} AZN
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                      tr.transaction_type === 'top_up' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                    }`}>
                      {tr.transaction_type === 'top_up' ? 'Mədaxil' : 'Məxaric'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-400">
                    {new Date(tr.created_at).toLocaleString('az-AZ')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
