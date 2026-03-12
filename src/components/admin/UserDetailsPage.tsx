import React, { useEffect, useState } from 'react';
import { 
  ArrowLeft, User, Mail, Phone, Calendar, Wallet, 
  History, ShoppingBag, Save, Plus, CreditCard, 
  Shield, AlertCircle, CheckCircle2, Loader2,
  Clock, MapPin, Package as PackageIcon
} from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import { api } from '@/lib/api';
import { getStatusColor, getStatusLabel, getActionTypeLabel, getActionTypeColor } from '@/data/mockData';
import { toast } from '@/components/ui/use-toast';

const UserDetailsPage: React.FC = () => {
  const { selectedUserId, setCurrentPage } = useAppContext();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [balanceAmount, setBalanceAmount] = useState<string>('5');
  const [topUpLoading, setTopUpLoading] = useState(false);
  const [packagesList, setPackagesList] = useState<any[]>([]);
  const [assignPkgLoading, setAssignPkgLoading] = useState(false);
  const [selectedPackageId, setSelectedPackageId] = useState<number | ''>('');

  useEffect(() => {
    if (selectedUserId) {
      loadUserData();
    } else {
      setCurrentPage('users');
    }
  }, [selectedUserId]);

  const loadUserData = async () => {
    setLoading(true);
    try {
      const response = await api.userShow(selectedUserId!);
      setUserData(response.data);
      const pkgs = await api.packages();
      const pdata = Array.isArray(pkgs) ? pkgs : (pkgs?.data ?? pkgs);
      setPackagesList(Array.isArray(pdata) ? pdata : []);
    } catch (error) {
      toast({
        title: "Xəta",
        description: "İstifadəçi məlumatları yüklənə bilmədi",
        variant: "destructive",
      });
      setCurrentPage('users');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.userUpdate(selectedUserId!, {
        full_name: userData.full_name,
        email: userData.email,
        phone: userData.phone,
        birthdate: userData.birthdate,
        system_status: userData.system_status,
        activity_status: userData.activity_status || 'active',
      });
      toast({
        title: "Uğurlu",
        description: "Məlumatlar yeniləndi",
      });
    } catch (error) {
      toast({
        title: "Xəta",
        description: "Yeniləmə zamanı xəta baş verdi",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleTopUp = async () => {
    const amount = parseFloat(balanceAmount);
    if (isNaN(amount) || amount <= 0) return;

    setTopUpLoading(true);
    try {
      await api.userTopUpBalance(selectedUserId!, amount, 'card');
      toast({
        title: "Uğurlu",
        description: `Balans ${amount} AZN artırıldı`,
      });
      loadUserData(); // Reload to get new balance
    } catch (error) {
      toast({
        title: "Xəta",
        description: "Balans artırıla bilmədi",
        variant: "destructive",
      });
    } finally {
      setTopUpLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-cyan-500" size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => setCurrentPage('users')}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors font-medium"
        >
          <ArrowLeft size={20} />
          Geri qayıt
        </button>
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusColor(userData.system_status)}`}>
            {getStatusLabel(userData.system_status)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile & Stats */}
        <div className="lg:col-span-1 space-y-6">
          {/* Profile Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-50 rounded-full -mr-16 -mt-16 opacity-50" />
            <div className="relative flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-3xl font-bold mb-4 shadow-lg shadow-cyan-500/20">
                {userData.full_name?.split(' ').map((n: any) => n[0]).join('').toUpperCase()}
              </div>
              <h3 className="text-xl font-bold text-slate-800">{userData.full_name}</h3>
              <p className="text-sm text-slate-400 mb-6">{userData.email}</p>
              
              <div className="w-full grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-2xl p-4 text-center">
                  <p className="text-xs text-slate-400 mb-1">Cari Balans</p>
                  <p className="text-lg font-bold text-cyan-600">{Number(userData.user_current_balance).toFixed(2)} AZN</p>
                </div>
                <div className="bg-slate-50 rounded-2xl p-4 text-center">
                  <p className="text-xs text-slate-400 mb-1">Sifarişlər</p>
                  <p className="text-lg font-bold text-slate-700">{userData.orders?.length || 0}</p>
                </div>
              <div className="bg-slate-50 rounded-2xl p-4 text-center col-span-2">
                <p className="text-xs text-slate-400 mb-1">Aktiv Paket</p>
                {userData.active_package ? (
                  <p className="text-sm font-bold text-slate-700">
                    {userData.active_package.package?.title} — {userData.active_package.package?.discount_percent}% — bitmə {userData.active_package.end_date}
                  </p>
                ) : (
                  <p className="text-xs text-slate-400">Yoxdur</p>
                )}
              </div>
              </div>
            </div>
          </div>

          {/* Balance Top-up Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
            <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <CreditCard size={18} className="text-cyan-500" />
              Balans Artır
            </h4>
            <div className="space-y-4">
              <div className="flex gap-2">
                {['5', '10', '20', '50'].map(val => (
                  <button 
                    key={val}
                    onClick={() => setBalanceAmount(val)}
                    className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${balanceAmount === val ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/25' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                  >
                    {val} AZN
                  </button>
                ))}
              </div>
              <div className="relative">
                <input 
                  type="number"
                  value={balanceAmount}
                  onChange={(e) => setBalanceAmount(e.target.value)}
                  className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all"
                  placeholder="Məbləğ daxil edin"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">AZN</span>
              </div>
              <button 
                onClick={handleTopUp}
                disabled={topUpLoading}
                className="w-full py-3 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-2xl text-sm font-bold hover:shadow-xl hover:shadow-cyan-500/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {topUpLoading ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                İndi artır
              </button>
            </div>
          </div>
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
            <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <PackageIcon size={18} className="text-cyan-500" />
              Paket Təyin Et
            </h4>
            <div className="space-y-4">
              {userData.active_package ? (
                <div className="bg-cyan-50 rounded-2xl p-4 border border-cyan-100">
                  <p className="text-xs text-cyan-600">Aktiv Paket</p>
                  <p className="text-sm font-bold text-slate-800">
                    {userData.active_package.package?.title} — {userData.active_package.package?.discount_percent}% — bitmə {userData.active_package.end_date}
                  </p>
                  <div className="flex gap-3 mt-3">
                    <button
                      onClick={async () => {
                        try {
                          await api.adminCancelUserPackage(selectedUserId!);
                          const res = await api.userShow(selectedUserId!);
                          setUserData(res.data);
                        } catch {}
                      }}
                      className="px-4 py-2 bg-red-50 text-red-600 rounded-xl text-xs font-bold border border-red-100"
                    >
                      Ləğv et
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400">Aktiv paket yoxdur</p>
              )}
              <div className="grid grid-cols-1 gap-3">
                {packagesList.map((p: any) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPackageId(p.id)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all ${
                      selectedPackageId === p.id ? 'border-cyan-400 bg-cyan-50 shadow-sm' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-slate-800">{p.title}</p>
                        <p className="text-xs text-slate-500">{p.validity_days} gün • {Number(p.discount_percent)}% endirim</p>
                      </div>
                      <span className="text-sm font-bold text-cyan-600">{Number(p.price).toFixed(2)} AZN</span>
                    </div>
                  </button>
                ))}
                {packagesList.length === 0 && (
                  <div className="text-center py-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <p className="text-sm text-slate-400">Paket tapılmadı</p>
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={async () => {
                    if (selectedPackageId === '') return;
                    setAssignPkgLoading(true);
                    try {
                      await api.adminSubscribeUserPackage(selectedUserId!, selectedPackageId as number);
                      const res = await api.userShow(selectedUserId!);
                      setUserData(res.data);
                      setSelectedPackageId('');
                    } catch {} finally {
                      setAssignPkgLoading(false);
                    }
                  }}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-2xl text-sm font-bold hover:shadow-lg transition-all disabled:opacity-50"
                  disabled={assignPkgLoading || selectedPackageId === ''}
                >
                  Təyin et
                </button>
                <button
                  onClick={() => setSelectedPackageId('')}
                  className="px-4 py-2 bg-slate-100 text-slate-600 rounded-2xl text-sm font-bold hover:bg-slate-200 transition-all"
                >
                  Seçimi təmizlə
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Forms & Tabs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Edit Information */}
          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h4 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                <User size={20} className="text-cyan-500" />
                Şəxsi Məlumatlar
              </h4>
            </div>
            <form onSubmit={handleUpdateUser} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Ad Soyad</label>
                  <div className="relative">
                    <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                    <input 
                      type="text"
                      value={userData.full_name}
                      onChange={(e) => setUserData({...userData, full_name: e.target.value})}
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">E-poçt</label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                    <input 
                      type="email"
                      value={userData.email}
                      onChange={(e) => setUserData({...userData, email: e.target.value})}
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Telefon</label>
                  <div className="relative">
                    <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                    <input 
                      type="text"
                      value={userData.phone || ''}
                      onChange={(e) => setUserData({...userData, phone: e.target.value})}
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Doğum Tarixi</label>
                  <div className="relative">
                    <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                    <input 
                      type="date"
                      value={userData.birthdate || ''}
                      onChange={(e) => setUserData({...userData, birthdate: e.target.value})}
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Sistem Statusu</label>
                  <select 
                    value={userData.system_status}
                    onChange={(e) => setUserData({...userData, system_status: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all appearance-none"
                  >
                    <option value="verified">Təsdiqlənmiş</option>
                    <option value="unverified">Təsdiqlənməmiş</option>
                    <option value="banned">Ban edilib</option>
                    <option value="deactivated">Dondurulub</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Aktivlik Statusu</label>
                  <select 
                    value={userData.activity_status || 'active'}
                    onChange={(e) => setUserData({...userData, activity_status: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all appearance-none"
                  >
                    <option value="active">Aktiv</option>
                    <option value="inactive">Deaktiv</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <button 
                  type="submit"
                  disabled={saving}
                  className="px-8 py-3 bg-slate-800 text-white rounded-2xl text-sm font-bold hover:bg-slate-900 transition-all flex items-center gap-2 shadow-lg shadow-slate-200"
                >
                  {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  Dəyişiklikləri yadda saxla
                </button>
              </div>
            </form>
          </div>

          {/* Orders & Transactions Tabs */}
          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <h4 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                <History size={20} className="text-cyan-500" />
                Fəaliyyət Tarixçəsi
              </h4>
            </div>

            <div className="space-y-8">
              {/* Recent Orders */}
              <div>
                <h5 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                  <ShoppingBag size={16} className="text-slate-400" />
                  Son Sifarişlər
                </h5>
                <div className="space-y-3">
                  {userData.orders?.length > 0 ? (
                    userData.orders.slice(0, 5).map((order: any) => (
                      <div key={order.id} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100 hover:border-cyan-100 transition-colors group">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-cyan-500 group-hover:bg-cyan-50 transition-colors">
                            <ShoppingBag size={18} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-700">#{order.order_number || order.id}</p>
                            <div className="flex items-center gap-3 text-[10px] text-slate-400 font-medium">
                              <span className="flex items-center gap-1"><Clock size={10} /> {new Date(order.created_at).toLocaleDateString()}</span>
                              <span className="flex items-center gap-1"><MapPin size={10} /> {order.equipment?.equipment_name || 'Cihaz məlumatı yoxdur'}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-slate-800">{Number(order.total_amount || 0).toFixed(2)} AZN</p>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter ${order.payment_status === 'paid' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                            {order.payment_status === 'paid' ? 'Ödənilib' : 'Gözləyir'}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                      <p className="text-sm text-slate-400 font-medium">Sifariş tapılmadı</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Transactions */}
              <div>
                <h5 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                  <CreditCard size={16} className="text-slate-400" />
                  Maliyyə Əməliyyatları
                </h5>
                <div className="space-y-3">
                  {userData.transactions?.length > 0 ? (
                    userData.transactions.slice(0, 5).map((t: any) => (
                      <div key={t.id} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getActionTypeColor(t.action_type)}`}>
                            <History size={18} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-700">{getActionTypeLabel(t.action_type)}</p>
                            <p className="text-[10px] text-slate-400 font-medium">{new Date(t.created_at).toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-bold ${t.action_type === 'balance_topup' ? 'text-emerald-500' : 'text-slate-800'}`}>
                            {t.action_type === 'balance_topup' ? '+' : ''}{t.amount ? Number(t.amount).toFixed(2) : '0.00'} AZN
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                      <p className="text-sm text-slate-400 font-medium">Əməliyyat tapılmadı</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetailsPage;
