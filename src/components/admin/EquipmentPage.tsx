import React, { useEffect, useMemo, useState } from 'react';
import {
  Monitor, Plus, Search, Filter, Edit2, Eye, Package, MapPin,
  ChevronDown, ChevronUp, Wifi, WifiOff, AlertTriangle
} from 'lucide-react';
import Modal from './Modal';
import {
  equipments as initialEquipments, equipmentStocks, brands, categories,
  getStatusColor, getStatusLabel, getBrandById, getCategoryById,
  transactionLogs, getUserById, getActionTypeLabel, getActionTypeColor, normalizeEquipmentStatus
} from '@/data/mockData';
import type { Equipment } from '@/data/mockData';
import { api } from '@/lib/api';
import { AlertCircle } from 'lucide-react';

const EquipmentPage: React.FC = () => {
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'ped' | 'number'>('number');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAddStockModal, setShowAddStockModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [stockForm, setStockForm] = useState({ brand_id: 1, category_id: 1, quantity: 10 });
  const [editForm, setEditForm] = useState({ name: '', address: '', status: 'active' as string });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState<Record<number, boolean>>({});
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');
  const [detailStocks, setDetailStocks] = useState<any[]>([]);
  const [detailOrders, setDetailOrders] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.equipments();
        const mapped = (Array.isArray(data) ? data : []).map((e: any) => ({
          id: e.id,
          number: e.equipment_number,
          name: e.equipment_name,
          status: normalizeEquipmentStatus(e.equipment_status) as Equipment['status'],
          current_ped_count: e.current_ped_count ?? 0,
          longitude: e.longitude,
          latitude: e.latitude,
          address: e.current_address,
        })) as Equipment[];
        setEquipmentList(mapped);
        setError('');
      } catch {
        setEquipmentList([]);
        setError('Cihazlar yüklənə bilmədi');
      }
      setLoading(false);
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    let result = [...equipmentList];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(e =>
        e.name.toLowerCase().includes(q) || e.number.toLowerCase().includes(q) || e.address.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'all') {
      result = result.filter(e => e.status === statusFilter);
    }
    result.sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'name') cmp = a.name.localeCompare(b.name);
      else if (sortBy === 'ped') cmp = a.current_ped_count - b.current_ped_count;
      else cmp = a.number.localeCompare(b.number);
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return result;
  }, [equipmentList, search, statusFilter, sortBy, sortDir]);

  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(field); setSortDir('asc'); }
  };

  const handleStatusChange = (id: number, newStatus: Equipment['status']) => {
    const prevStatus = equipmentList.find(e => e.id === id)?.status;
    setUpdating(s => ({ ...s, [id]: true }));
    setEquipmentList(prev => prev.map(e => e.id === id ? { ...e, status: newStatus } : e));
    const run = async () => {
      try {
        await api.equipmentUpdate(id, { equipment_status: newStatus });
      } catch (err) {
        
        setEquipmentList(prev => prev.map(e => e.id === id ? { ...e, status: prevStatus as Equipment['status'] } : e));
      } finally {
        setUpdating(s => ({ ...s, [id]: false }));
      }
    };
    run();
  };

  const handleAddStock = () => {
    if (!selectedEquipment) return;
    const qty = Number(stockForm.quantity);
    if (!Number.isFinite(qty) || qty <= 0) return;
    const pedCategoryId = Number(stockForm.category_id);
    const run = async () => {
      try {
        await api.equipmentAddStock(selectedEquipment.id, pedCategoryId, qty);
        setEquipmentList(prev => prev.map(e =>
          e.id === selectedEquipment.id
            ? { ...e, current_ped_count: e.current_ped_count + qty }
            : e
        ));
        setShowAddStockModal(false);
        setStockForm({ brand_id: 1, category_id: 1, quantity: 10 });
      } catch {
        // TODO: show error toast if needed
      }
    };
    run();
  };

  const handleEdit = () => {
    if (selectedEquipment) {
      setEquipmentList(prev => prev.map(e =>
        e.id === selectedEquipment.id
          ? { ...e, name: editForm.name, address: editForm.address, status: editForm.status as Equipment['status'] }
          : e
      ));
      setShowEditModal(false);
    }
  };

  const openDetail = (eq: Equipment) => {
    setSelectedEquipment(eq);
    setShowDetailModal(true);
    setDetailLoading(true);
    setDetailError('');
    setDetailStocks([]);
    setDetailOrders([]);
    const run = async () => {
      try {
        const data = await api.equipmentDetails(eq.id);
        const stocks = Array.isArray(data?.equipment_ped_stock) ? data.equipment_ped_stock : [];
        setDetailStocks(stocks);
        const orders = Array.isArray(data?.orders) ? data.orders : [];
        setDetailOrders(orders);
      } catch {
        setDetailError('Detallar yüklənə bilmədi');
      } finally {
        setDetailLoading(false);
      }
    };
    run();
  };
  const openAddStock = (eq: Equipment) => { setSelectedEquipment(eq); setShowAddStockModal(true); };
  const openEdit = (eq: Equipment) => {
    setSelectedEquipment(eq);
    setEditForm({ name: eq.name, address: eq.address, status: eq.status });
    setShowEditModal(true);
  };

  const SortIcon = ({ field }: { field: typeof sortBy }) => (
    sortBy === field ? (sortDir === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />) : <ChevronDown size={14} className="opacity-30" />
  );

  const getStatusIcon = (status: string) => {
    if (status === 'active') return <Wifi size={14} className="text-emerald-500" />;
    if (status === 'deactive') return <WifiOff size={14} className="text-red-500" />;
    return <AlertTriangle size={14} className="text-amber-500" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Cihaz İdarəetməsi</h2>
          <p className="text-sm text-slate-400">Bütün dispenser cihazlarını idarə edin</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-cyan-500/25 transition-all">
            <Plus size={16} /> Yeni Cihaz
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cihaz axtar..."
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
          <option value="deactive">Deaktiv</option>
          <option value="under_repair">Təmirdə</option>
          <option value="maintenance">Baxımda</option>
          <option value="offline">Oflayn</option>
          <option value="broken">Xarab</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
          <div className="flex items-center gap-3">
            <Wifi size={20} className="text-emerald-600" />
            <div>
              <p className="text-2xl font-bold text-emerald-700">{equipmentList.filter(e => e.status === 'active').length}</p>
              <p className="text-xs text-emerald-600">Aktiv cihaz</p>
            </div>
          </div>
        </div>
        <div className="bg-red-50 rounded-xl p-4 border border-red-100">
          <div className="flex items-center gap-3">
            <WifiOff size={20} className="text-red-600" />
            <div>
              <p className="text-2xl font-bold text-red-700">{equipmentList.filter(e => e.status === 'deactive').length}</p>
              <p className="text-xs text-red-600">Deaktiv cihaz</p>
            </div>
          </div>
        </div>
        <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
          <div className="flex items-center gap-3">
            <AlertTriangle size={20} className="text-amber-600" />
            <div>
              <p className="text-2xl font-bold text-amber-700">{equipmentList.filter(e => e.status === 'under_repair').length}</p>
              <p className="text-xs text-amber-600">Təmirdə cihaz</p>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/80">
                <th className="text-left text-xs font-semibold text-slate-500 px-5 py-3 cursor-pointer" onClick={() => handleSort('number')}>
                  <div className="flex items-center gap-1">Nömrə <SortIcon field="number" /></div>
                </th>
                <th className="text-left text-xs font-semibold text-slate-500 px-5 py-3 cursor-pointer" onClick={() => handleSort('name')}>
                  <div className="flex items-center gap-1">Ad <SortIcon field="name" /></div>
                </th>
                <th className="text-left text-xs font-semibold text-slate-500 px-5 py-3">Status</th>
                <th className="text-left text-xs font-semibold text-slate-500 px-5 py-3 cursor-pointer" onClick={() => handleSort('ped')}>
                  <div className="flex items-center gap-1">Stok <SortIcon field="ped" /></div>
                </th>
                <th className="text-left text-xs font-semibold text-slate-500 px-5 py-3">Ünvan</th>
                <th className="text-left text-xs font-semibold text-slate-500 px-5 py-3">Əməliyyatlar</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-6">
                    <div className="h-4 w-32 bg-slate-100 rounded animate-pulse" />
                    <div className="mt-2 h-3 w-48 bg-slate-100 rounded animate-pulse" />
                  </td>
                </tr>
              ) : filtered.map((eq) => (
                <tr key={eq.id} className="border-t border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(eq.status)}
                      <span className="text-sm font-mono font-semibold text-slate-700">{eq.number}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-sm font-medium text-slate-700">{eq.name}</td>
                  <td className="px-5 py-3.5">
                    <select
                      value={eq.status}
                      onChange={(e) => handleStatusChange(eq.id, e.target.value as Equipment['status'])}
                      disabled={!!updating[eq.id]}
                      className={`text-xs font-medium px-3 py-1.5 rounded-lg border-0 cursor-pointer ${getStatusColor(eq.status)} ${updating[eq.id] ? 'opacity-60' : ''}`}
                    >
                      <option value="active">Aktiv</option>
                      <option value="deactive">Deaktiv</option>
                      <option value="under_repair">Təmirdə</option>
                    <option value="maintenance">Baxımda</option>
                    <option value="offline">Oflayn</option>
                    <option value="broken">Xarab</option>
                    </select>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${eq.current_ped_count > 50 ? 'bg-emerald-500' : eq.current_ped_count > 20 ? 'bg-amber-500' : 'bg-red-500'}`}
                          style={{ width: `${Math.min(100, (eq.current_ped_count / 150) * 100)}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-slate-700">{eq.current_ped_count}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1 text-sm text-slate-500">
                      <MapPin size={12} />
                      <span className="truncate max-w-[200px]">{eq.address}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1">
                      <button onClick={() => openDetail(eq)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-cyan-600 transition-colors" title="Detallar">
                        <Eye size={16} />
                      </button>
                      <button onClick={() => openEdit(eq)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition-colors" title="Redaktə">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => openAddStock(eq)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-emerald-600 transition-colors" title="Stok əlavə et">
                        <Package size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-slate-100 text-xs text-slate-400">
          Cəmi {filtered.length} cihaz göstərilir
        </div>
      </div>

      {/* Detail Modal */}
      <Modal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} title={selectedEquipment ? `${selectedEquipment.name} - Detallar` : ''} size="lg">
        {selectedEquipment && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs text-slate-400">Nömrə</p>
                <p className="font-semibold text-slate-700">{selectedEquipment.number}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs text-slate-400">Status</p>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-lg ${getStatusColor(selectedEquipment.status)}`}>
                  {getStatusLabel(selectedEquipment.status)}
                </span>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs text-slate-400">Ümumi Stok</p>
                <p className="font-semibold text-slate-700">{selectedEquipment.current_ped_count} ped</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs text-slate-400">Ünvan</p>
                <p className="font-semibold text-slate-700 text-sm">{selectedEquipment.address}</p>
              </div>
            </div>

            {/* Stock breakdown */}
            <div>
              <h4 className="font-semibold text-slate-700 mb-3">Stok Təfərrüatları (Brend / Kateqoriya)</h4>
              {detailLoading ? (
                <div className="space-y-2">
                  <div className="h-4 w-40 bg-slate-100 rounded animate-pulse" />
                  <div className="h-3 w-52 bg-slate-100 rounded animate-pulse" />
                </div>
              ) : (
                <div className="space-y-2">
                  {detailStocks.map((stock: any) => {
                    const cat = stock?.ped_category;
                    const brandName = cat?.brand?.name || '';
                    const catName = cat?.category_name || '';
                    const qty = stock?.qty_available ?? stock?.quantity ?? 0;
                    return (
                      <div key={stock.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                        <div className="text-sm font-medium text-slate-700">
                          {brandName ? `${brandName} — ${catName}` : catName || 'Naməlum kateqoriya'}
                        </div>
                        <span className="text-sm font-bold text-slate-800">{qty} ədəd</span>
                      </div>
                    );
                  })}
                  {detailStocks.length === 0 && (
                    <p className="text-sm text-slate-400 text-center py-4">Stok məlumatı yoxdur</p>
                  )}
                </div>
              )}
            </div>

            {/* Recent transactions for this equipment */}
            <div>
              <h4 className="font-semibold text-slate-700 mb-3">Son Əməliyyatlar</h4>
              {detailLoading ? (
                <div className="space-y-2">
                  <div className="h-4 w-40 bg-slate-100 rounded animate-pulse" />
                  <div className="h-3 w-52 bg-slate-100 rounded animate-pulse" />
                </div>
              ) : (
                <div className="space-y-2">
                  {detailOrders.slice(0, 5).map((o: any) => (
                    <div key={o.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                      <div className="text-sm text-slate-600">Sifariş #{o.id}</div>
                      <div className="text-[10px] text-slate-400">
                        {o.created_at ? new Date(o.created_at).toLocaleString('az-AZ', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                      </div>
                    </div>
                  ))}
                  {detailOrders.length === 0 && (
                    <p className="text-sm text-slate-400 text-center py-4">Əməliyyat məlumatı yoxdur</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Add Stock Modal */}
      <Modal isOpen={showAddStockModal} onClose={() => setShowAddStockModal(false)} title={`Stok Əlavə Et — ${selectedEquipment?.number}`}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Brend</label>
            <select
              value={stockForm.brand_id}
              onChange={(e) => setStockForm(f => ({ ...f, brand_id: Number(e.target.value) }))}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
            >
              {brands.filter(b => b.status === 'active').map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Kateqoriya</label>
            <select
              value={stockForm.category_id}
              onChange={(e) => setStockForm(f => ({ ...f, category_id: Number(e.target.value) }))}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
            >
              {categories.filter(c => c.status === 'active').map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Miqdar</label>
            <input
              type="number"
              value={stockForm.quantity}
              onChange={(e) => setStockForm(f => ({ ...f, quantity: Number(e.target.value) }))}
              min={1}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setShowAddStockModal(false)} className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors">
              Ləğv et
            </button>
            <button onClick={handleAddStock} className="flex-1 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all">
              Əlavə et
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title={`Cihaz Redaktə — ${selectedEquipment?.number}`}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Ad</label>
            <input
              type="text"
              value={editForm.name}
              onChange={(e) => setEditForm(f => ({ ...f, name: e.target.value }))}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Ünvan</label>
            <input
              type="text"
              value={editForm.address}
              onChange={(e) => setEditForm(f => ({ ...f, address: e.target.value }))}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Status</label>
            <select
              value={editForm.status}
              onChange={(e) => setEditForm(f => ({ ...f, status: e.target.value }))}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
            >
              <option value="active">Aktiv</option>
              <option value="offline">Oflayn</option>
              <option value="broken">Xarab</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setShowEditModal(false)} className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors">
              Ləğv et
            </button>
            <button onClick={handleEdit} className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all">
              Yadda saxla
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default EquipmentPage;
