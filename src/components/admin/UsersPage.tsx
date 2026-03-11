import React, { useState, useMemo, useEffect } from 'react';
import {
  Users, Search, Plus, Eye, Wallet, RotateCcw, Ban, ChevronDown,
  ChevronUp, Mail, Phone, Calendar, AlertCircle
} from 'lucide-react';
import Modal from './Modal';
import {
  users as initialUsers, transactionLogs, getStatusColor, getStatusLabel,
  getEquipmentById, getBrandById, getCategoryById, getActionTypeLabel, getActionTypeColor
} from '@/data/mockData';
import type { User } from '@/data/mockData';
import { api } from '@/lib/api';

const UsersPage: React.FC = () => {
  const [userList, setUserList] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [balanceAmount, setBalanceAmount] = useState(5);
  const [refundAmount, setRefundAmount] = useState(1);
  const [expandedUser, setExpandedUser] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const response = await api.users();
        console.log(response);
        const data = Array.isArray(response) ? response : (response?.data ?? response);
        setUserList(Array.isArray(data) ? data : []);
        setError('');
      } catch {
        setUserList([]);
        setError('İstifadəçilər yüklənə bilmədi');
      }
      setLoading(false);
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    let result = [...userList];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(u =>
        (u.full_name || '').toLowerCase().includes(q) ||
        (u.ad || '').toLowerCase().includes(q) ||
        (u.soyad || '').toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q) ||
        (u.phone || u.telefon || '').includes(q)
      );
    }
    if (statusFilter !== 'all') result = result.filter(u => (u.system_status || u.activity_status || u.status) === statusFilter);
    return result;
  }, [userList, search, statusFilter]);

  const handleBalance = () => {
    if (selectedUser) {
      setUserList(prev => prev.map(u =>
        u.id === selectedUser.id ? { ...u, wallet_balance: u.wallet_balance + balanceAmount } : u
      ));
      setShowBalanceModal(false);
      setBalanceAmount(5);
    }
  };

  const handleRefund = () => {
    if (selectedUser) {
      setUserList(prev => prev.map(u =>
        u.id === selectedUser.id ? { ...u, wallet_balance: u.wallet_balance + refundAmount } : u
      ));
      setShowRefundModal(false);
      setRefundAmount(1);
    }
  };

  const handleBlock = (userId: number) => {
    setUserList(prev => prev.map(u =>
      u.id === userId ? { ...u, status: u.status === 'blocked' ? 'active' : 'blocked' } : u
    ));
  };

  const getUserTransactions = (userId: number) =>
    transactionLogs
      .filter(t => t.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">İstifadəçi İdarəetməsi</h2>
          <p className="text-sm text-slate-400">Bütün istifadəçiləri idarə edin</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="İstifadəçi axtar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
        >
          <option value="all">Bütün statuslar</option>
          <option value="active">Aktiv</option>
          <option value="blocked">Bloklanmış</option>
          <option value="deleted">Silinmiş</option>
        </select>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
          <p className="text-2xl font-bold text-blue-700">{userList.length}</p>
          <p className="text-xs text-blue-600">Ümumi istifadəçi</p>
        </div>
        <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
          <p className="text-2xl font-bold text-emerald-700">{userList.filter(u => (u.system_status || u.activity_status || u.status) === 'active').length}</p>
          <p className="text-xs text-emerald-600">Aktiv</p>
        </div>
        <div className="bg-red-50 rounded-xl p-4 border border-red-100">
          <p className="text-2xl font-bold text-red-700">{userList.filter(u => (u.system_status || u.activity_status || u.status) === 'blocked').length}</p>
          <p className="text-xs text-red-600">Bloklanmış</p>
        </div>
        <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
          <p className="text-2xl font-bold text-purple-700">{userList.reduce((s, u) => s + (u.user_current_balance ?? u.wallet_balance ?? 0), 0).toFixed(2)} AZN</p>
          <p className="text-xs text-purple-600">Ümumi balans</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        {error && (
          <div className="flex items-center gap-2 px-4 py-2.5 bg-red-50 border border-red-200 text-red-700 text-sm">
            <AlertCircle size={16} /> {error}
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/80">
                <th className="text-left text-xs font-semibold text-slate-500 px-5 py-3">İstifadəçi</th>
                <th className="text-left text-xs font-semibold text-slate-500 px-5 py-3">Əlaqə</th>
                <th className="text-left text-xs font-semibold text-slate-500 px-5 py-3">Status</th>
                <th className="text-left text-xs font-semibold text-slate-500 px-5 py-3">Balans</th>
                <th className="text-left text-xs font-semibold text-slate-500 px-5 py-3">Qeydiyyat</th>
                <th className="text-left text-xs font-semibold text-slate-500 px-5 py-3">Əməliyyatlar</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <tr key={i} className="border-t border-slate-50">
                    <td className="px-5 py-3.5"><div className="h-4 w-24 bg-slate-100 rounded animate-pulse" /></td>
                    <td className="px-5 py-3.5"><div className="h-3 w-32 bg-slate-100 rounded animate-pulse" /></td>
                    <td className="px-5 py-3.5"><div className="h-3 w-16 bg-slate-100 rounded animate-pulse" /></td>
                    <td className="px-5 py-3.5"><div className="h-3 w-12 bg-slate-100 rounded animate-pulse" /></td>
                    <td className="px-5 py-3.5"><div className="h-3 w-20 bg-slate-100 rounded animate-pulse" /></td>
                    <td className="px-5 py-3.5"><div className="h-3 w-16 bg-slate-100 rounded animate-pulse" /></td>
                  </tr>
                ))
              ) : filtered.map((user) => (
                <React.Fragment key={user.id}>
                  <tr className="border-t border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                          {/* {user.ad[0]}{user.soyad[0]} */}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-700">{user.full_name || `${user.ad || ''} ${user.soyad || ''}`}</p>
                          <p className="text-[10px] text-slate-400">{user.birthdate || user.dogum_tarixi || ''}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1 text-xs text-slate-500">
                          <Mail size={11} /> {user.email || '—'}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-slate-500">
                          <Phone size={11} /> {user.phone || user.telefon || '—'}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-lg ${getStatusColor((user.system_status || user.activity_status || user.status) || 'active')}`}>
                        {getStatusLabel((user.system_status || user.activity_status || user.status) || 'active')}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-sm font-bold text-slate-800">{Number(user.user_current_balance ?? user.wallet_balance ?? 0).toFixed(2)} AZN</span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-400">{user.created_at}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => { setExpandedUser(expandedUser === user.id ? null : user.id); }}
                          className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-cyan-600 transition-colors"
                          title="Əməliyyat tarixçəsi"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => { setSelectedUser(user); setShowBalanceModal(true); }}
                          className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-emerald-600 transition-colors"
                          title="Balans artır"
                        >
                          <Wallet size={16} />
                        </button>
                        <button
                          onClick={() => { setSelectedUser(user); setShowRefundModal(true); }}
                          className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-amber-600 transition-colors"
                          title="Geri ödəniş"
                        >
                          <RotateCcw size={16} />
                        </button>
                        <button
                          onClick={() => handleBlock(user.id)}
                          className={`p-2 rounded-lg hover:bg-slate-100 transition-colors ${user.status === 'blocked' ? 'text-emerald-500 hover:text-emerald-600' : 'text-slate-400 hover:text-red-600'}`}
                          title={user.status === 'blocked' ? 'Bloku aç' : 'Blokla'}
                        >
                          <Ban size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {/* Expanded Transaction History */}
                  {expandedUser === user.id && (
                    <tr>
                      <td colSpan={6} className="px-5 py-4 bg-slate-50/80">
                        <div className="space-y-2">
                          <h4 className="text-sm font-semibold text-slate-700 mb-3">Əməliyyat Tarixçəsi — {user.ad} {user.soyad}</h4>
                          {getUserTransactions(user.id).length === 0 ? (
                            <p className="text-sm text-slate-400">Əməliyyat tapılmadı</p>
                          ) : (
                            getUserTransactions(user.id).map(t => {
                              const eq = t.equipment_id ? getEquipmentById(t.equipment_id) : null;
                              const brand = t.brand_id ? getBrandById(t.brand_id) : null;
                              const cat = t.category_id ? getCategoryById(t.category_id) : null;
                              return (
                                <div key={t.id} className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-100">
                                  <div className="flex items-center gap-3">
                                    <span className={`text-xs font-medium px-2.5 py-1 rounded-lg ${getActionTypeColor(t.action_type)}`}>
                                      {getActionTypeLabel(t.action_type)}
                                    </span>
                                    <div className="text-sm text-slate-600">
                                      {eq && <span>{eq.number}</span>}
                                      {brand && <span className="ml-2 text-slate-400">({brand.name})</span>}
                                      {cat && <span className="ml-1 text-slate-400">— {cat.name}</span>}
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-sm font-semibold text-slate-700">{t.quantity > 0 ? `${t.quantity} ped` : '—'}</p>
                                    <p className="text-[10px] text-slate-400">
                                      {new Date(t.created_at).toLocaleString('az-AZ', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-slate-100 text-xs text-slate-400">
          Cəmi {filtered.length} istifadəçi göstərilir
        </div>
      </div>

      {/* Balance Modal */}
      <Modal isOpen={showBalanceModal} onClose={() => setShowBalanceModal(false)} title={`Balans Artır — ${selectedUser?.ad} ${selectedUser?.soyad}`}>
        <div className="space-y-4">
          <div className="bg-slate-50 rounded-xl p-4">
            <p className="text-xs text-slate-400">Cari balans</p>
            <p className="text-2xl font-bold text-slate-800">{selectedUser?.wallet_balance.toFixed(2)} AZN</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Artırılacaq məbləğ (AZN)</label>
            <input
              type="number"
              value={balanceAmount}
              onChange={(e) => setBalanceAmount(Number(e.target.value))}
              min={0.5}
              step={0.5}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
            />
          </div>
          <div className="flex gap-2">
            {[5, 10, 20, 50].map(v => (
              <button key={v} onClick={() => setBalanceAmount(v)} className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${balanceAmount === v ? 'bg-cyan-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                {v} AZN
              </button>
            ))}
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setShowBalanceModal(false)} className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors">
              Ləğv et
            </button>
            <button onClick={handleBalance} className="flex-1 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all">
              Balans artır
            </button>
          </div>
        </div>
      </Modal>

      {/* Refund Modal */}
      <Modal isOpen={showRefundModal} onClose={() => setShowRefundModal(false)} title={`Geri Ödəniş — ${selectedUser?.ad} ${selectedUser?.soyad}`}>
        <div className="space-y-4">
          <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
            <p className="text-xs text-amber-600">Diqqət: Bu əməliyyat istifadəçinin balansına geri ödəniş edəcək.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Geri ödəniş məbləği (AZN)</label>
            <input
              type="number"
              value={refundAmount}
              onChange={(e) => setRefundAmount(Number(e.target.value))}
              min={0.5}
              step={0.5}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setShowRefundModal(false)} className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors">
              Ləğv et
            </button>
            <button onClick={handleRefund} className="flex-1 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all">
              Geri ödə
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default UsersPage;
