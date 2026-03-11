import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Search, Layers } from 'lucide-react';
import Modal from './Modal';
import { getStatusColor, getStatusLabel } from '@/data/mockData';
import { api } from '@/lib/api';
import { AlertCircle } from 'lucide-react';

const CategoriesPage: React.FC = () => {
  const [catList, setCatList] = useState<any[]>([]);
  const [brandList, setBrandList] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCat, setEditingCat] = useState<any | null>(null);
  const [form, setForm] = useState({ category_name: '', unit_price: 0.5, status: 'active', reason_for_use: '', brand_id: '' as number | '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const response = await api.pedCategories();
        const data = Array.isArray(response) ? response : (response?.data ?? response);
        setCatList(Array.isArray(data) ? data : []);
        const bres = await api.brands();
        const bdata = Array.isArray(bres) ? bres : (bres?.data ?? bres);
        setBrandList(Array.isArray(bdata) ? bdata : []);
        setError('');
      } catch {
        setCatList([]);
        setBrandList([]);
        setError('Kateqoriyalar yüklənə bilmədi');
      }
      setLoading(false);
    };
    load();
  }, []);

  const filtered = catList.filter(c =>
    !search || (c.category_name || '').toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => { setEditingCat(null); setForm({ category_name: '', unit_price: 0.5, status: 'active', reason_for_use: '', brand_id: '' }); setShowModal(true); };
  const openEdit = (c: any) => {
    setEditingCat(c);
    setForm({
      category_name: c.category_name,
      unit_price: c.unit_price,
      status: c.status,
      reason_for_use: c.reason_for_use || '',
      brand_id: c.brand?.id ?? '',
    });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.category_name.trim()) return;
    if (editingCat) {
      const run = async () => {
        const reqPayload: any = { category_name: form.category_name, status: form.status, unit_price: form.unit_price, reason_for_use: form.reason_for_use };
        if (form.brand_id !== '') reqPayload.brand_id = form.brand_id;
        const updated = await api.pedCategoryUpdate(editingCat.id, reqPayload);
        const updatedPayload = updated?.data || updated;
        setCatList(prev => prev.map(c => c.id === editingCat.id ? { ...c, ...updatedPayload } : c));
        setShowModal(false);
      };
      run();
    } else {
      const run = async () => {
        const reqPayload: any = { category_name: form.category_name, status: form.status, unit_price: form.unit_price, reason_for_use: form.reason_for_use };
        if (form.brand_id !== '') reqPayload.brand_id = form.brand_id;
        const created = await api.pedCategoryStore(reqPayload);
        const newCat = created?.data || created;
        setCatList(prev => [...prev, newCat]);
        setShowModal(false);
      };
      run();
    }
  };

  const handleDelete = (id: number) => {
    const run = async () => {
      await api.pedCategoryDelete(id);
      setCatList(prev => prev.filter(c => c.id !== id));
    };
    run();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Kateqoriya İdarəetməsi</h2>
          <p className="text-sm text-slate-400">Ped kateqoriyalarını idarə edin</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-cyan-500/25 transition-all">
          <Plus size={16} /> Yeni Kateqoriya
        </button>
      </div>

      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Kateqoriya axtar..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
        />
      </div>
      {error && (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/80">
                <th className="text-left text-xs font-semibold text-slate-500 px-5 py-3">ID</th>
                <th className="text-left text-xs font-semibold text-slate-500 px-5 py-3">Ad</th>
                <th className="text-left text-xs font-semibold text-slate-500 px-5 py-3">Brend</th>
                <th className="text-left text-xs font-semibold text-slate-500 px-5 py-3">Vahid qiymət</th>
                <th className="text-left text-xs font-semibold text-slate-500 px-5 py-3">Status</th>
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
              ) : filtered.map((cat) => (
                <tr key={cat.id} className="border-t border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-3.5 text-xs text-slate-400 font-mono">#{cat.id}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white">
                        <Layers size={14} />
                      </div>
                      <span className="text-sm font-medium text-slate-700">{cat.category_name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-slate-600">{cat.brand?.name ?? '—'}</td>
                  <td className="px-5 py-3.5">
                    <span className="text-sm font-bold text-slate-800">{Number(cat.unit_price).toFixed(2)} AZN</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-lg ${getStatusColor(cat.status)}`}>
                      {getStatusLabel(cat.status)}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(cat)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition-colors">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(cat.id)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-red-600 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingCat ? 'Kateqoriya Redaktə' : 'Yeni Kateqoriya'}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Kateqoriya adı</label>
            <input
              type="text"
              value={form.category_name}
              onChange={(e) => setForm(f => ({ ...f, category_name: e.target.value }))}
              placeholder="Məs: Normal"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Vahid qiymət (AZN)</label>
            <input
              type="number"
              value={form.unit_price}
              onChange={(e) => setForm(f => ({ ...f, unit_price: Number(e.target.value) }))}
              min={0}
              step={0.05}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">İstifadə səbəbi</label>
            <input
              type="text"
              value={form.reason_for_use}
              onChange={(e) => setForm(f => ({ ...f, reason_for_use: e.target.value }))}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Brend</label>
            <select
              value={form.brand_id}
              onChange={(e) => setForm(f => ({ ...f, brand_id: e.target.value ? Number(e.target.value) : '' }))}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
            >
              <option value="">—</option>
              {brandList.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm(f => ({ ...f, status: e.target.value }))}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
            >
              <option value="active">Aktiv</option>
              <option value="inactive">Deaktiv</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors">
              Ləğv et
            </button>
            <button onClick={handleSave} className="flex-1 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all">
              {editingCat ? 'Yadda saxla' : 'Əlavə et'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CategoriesPage;
