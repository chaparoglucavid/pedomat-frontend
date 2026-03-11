import React, { useEffect, useMemo, useState } from 'react';
import { Search, Filter, Download, ArrowLeftRight, AlertCircle } from 'lucide-react';
import { } from '@/data/mockData';
import { api } from '@/lib/api';

const TransactionsPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.transactionHistories();
        setLogs(Array.isArray(data) ? data : []);
        setError('');
      } catch {
        setLogs([]);
        setError('Əməliyyatlar yüklənə bilmədi');
      }
      setLoading(false);
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    let result = [...logs].sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(t =>
        (t.user?.full_name || '').toLowerCase().includes(q) ||
        (t.transaction_number || '').toLowerCase().includes(q) ||
        (t.transaction_type || '').toLowerCase().includes(q)
      );
    }

    if (typeFilter !== 'all') {
      result = result.filter(t => (t.transaction_type || '') === typeFilter);
    }

    if (dateFilter === 'today') {
      const today = new Date().toISOString().slice(0, 10);
      result = result.filter(t => (t.created_at || '').startsWith(today));
    } else if (dateFilter === 'week') {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      result = result.filter(t => new Date(t.created_at) >= weekAgo);
    }

    return result;
  }, [logs, search, typeFilter, dateFilter]);

  const stats = { total: logs.length };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Əməliyyat Tarixçəsi</h2>
          <p className="text-sm text-slate-400">Bütün əməliyyatların tam logu</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors">
          <Download size={16} /> CSV İxrac et
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white rounded-xl p-4 border border-slate-100 text-center">
          <p className="text-xl font-bold text-slate-800">{stats.total}</p>
          <p className="text-xs text-slate-400">Ümumi</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Əməliyyat axtar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
        >
          <option value="all">Bütün növlər</option>
          <option value="purchase">Alış</option>
          <option value="topup">Balans artırma</option>
          <option value="refund">Geri ödəniş</option>
        </select>
        <select
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
        >
          <option value="all">Bütün tarixlər</option>
          <option value="today">Bu gün</option>
          <option value="week">Bu həftə</option>
        </select>
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
                <th className="text-left text-xs font-semibold text-slate-500 px-5 py-3">ID</th>
                <th className="text-left text-xs font-semibold text-slate-500 px-5 py-3">İstifadəçi</th>
                <th className="text-left text-xs font-semibold text-slate-500 px-5 py-3">Əməliyyat №</th>
                <th className="text-left text-xs font-semibold text-slate-500 px-5 py-3">Növ</th>
                <th className="text-left text-xs font-semibold text-slate-500 px-5 py-3">Məbləğ</th>
                <th className="text-left text-xs font-semibold text-slate-500 px-5 py-3">Ödəniş</th>
                <th className="text-left text-xs font-semibold text-slate-500 px-5 py-3">Order ID</th>
                <th className="text-left text-xs font-semibold text-slate-500 px-5 py-3">Tarix</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-t border-slate-50">
                    <td className="px-5 py-3.5"><div className="h-3 w-8 bg-slate-100 rounded animate-pulse" /></td>
                    <td className="px-5 py-3.5"><div className="h-3 w-24 bg-slate-100 rounded animate-pulse" /></td>
                    <td className="px-5 py-3.5"><div className="h-3 w-20 bg-slate-100 rounded animate-pulse" /></td>
                    <td className="px-5 py-3.5"><div className="h-3 w-16 bg-slate-100 rounded animate-pulse" /></td>
                    <td className="px-5 py-3.5"><div className="h-3 w-12 bg-slate-100 rounded animate-pulse" /></td>
                    <td className="px-5 py-3.5"><div className="h-3 w-12 bg-slate-100 rounded animate-pulse" /></td>
                    <td className="px-5 py-3.5"><div className="h-3 w-10 bg-slate-100 rounded animate-pulse" /></td>
                    <td className="px-5 py-3.5"><div className="h-3 w-24 bg-slate-100 rounded animate-pulse" /></td>
                  </tr>
                ))
              ) : filtered.map((t) => {
                return (
                  <tr key={t.id} className="border-t border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3.5 text-xs text-slate-400 font-mono">#{t.id}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-[10px] font-bold">
                          {(t.user?.full_name || '??').slice(0, 2).toUpperCase()}
                        </div>
                        <span className="text-sm text-slate-700 font-medium">{t.user?.full_name || 'Naməlum'}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-600 font-mono">{t.transaction_number || '—'}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-600">{t.transaction_type || '—'}</td>
                    <td className="px-5 py-3.5 text-sm font-semibold text-slate-700">{typeof t.amount === 'number' ? `${t.amount.toFixed(2)} AZN` : '—'}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-600">{t.payment_via || '—'}</td>
                    <td className="px-5 py-3.5 text-xs text-slate-400 font-mono">{t.order_id ?? '—'}</td>
                    <td className="px-5 py-3.5 text-xs text-slate-400">
                      {new Date(t.created_at).toLocaleString('az-AZ', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-slate-100 text-xs text-slate-400">
          Cəmi {filtered.length} əməliyyat göstərilir
        </div>
      </div>
    </div>
  );
};

export default TransactionsPage;
