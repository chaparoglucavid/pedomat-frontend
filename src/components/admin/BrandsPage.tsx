import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Search, Tag, AlertCircle, Loader2 } from 'lucide-react';
import Modal from './Modal';
import { api } from '@/lib/api';

const BrandsPage: React.FC = () => {
  const [brandList, setBrandList] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingBrand, setEditingBrand] = useState<any | null>(null);
  const [form, setForm] = useState({ name: '', slug: '', description: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const response = await api.brands();
        const data = Array.isArray(response) ? response : (response?.data ?? response);
        setBrandList(Array.isArray(data) ? data : []);
        setError('');
      } catch {
        setBrandList([]);
        setError('Məlumatlar yüklənə bilmədi');
      }
      setLoading(false);
    };
    load();
  }, []);

  const filtered = brandList.filter(b =>
    !search || (b.name || '').toLowerCase().includes(search.toLowerCase()) || (b.slug || '').toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => { setEditingBrand(null); setForm({ name: '', slug: '', description: '' }); setShowModal(true); };
  const openEdit = (b: any) => { setEditingBrand(b); setForm({ name: b.name || '', slug: b.slug || '', description: b.description || '' }); setShowModal(true); };

  const handleSave = () => {
    if (!form.name.trim() || !form.slug.trim()) return;
    if (editingBrand) {
      const run = async () => {
        const updated = await api.brandUpdate(editingBrand.id, { name: form.name, slug: form.slug, description: form.description });
        const payload = updated?.data || updated;
        setBrandList(prev => prev.map(b => b.id === editingBrand.id ? { ...b, ...payload } : b));
        setShowModal(false);
      };
      run();
    } else {
      const run = async () => {
        const created = await api.brandStore({ name: form.name, slug: form.slug, description: form.description });
        const newBrand = created?.data || created;
        setBrandList(prev => [...prev, newBrand]);
        setShowModal(false);
      };
      run();
    }
  };

  const handleDelete = (id: number) => {
    const run = async () => {
      await api.brandDelete(id);
      setBrandList(prev => prev.filter(b => b.id !== id));
    };
    run();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Brend İdarəetməsi</h2>
          <p className="text-sm text-slate-400">Ped brendlərini idarə edin</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-cyan-500/25 transition-all">
          <Plus size={16} /> Yeni Brend
        </button>
      </div>

      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Brend axtar..."
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5">
              <div className="h-4 w-24 bg-slate-100 rounded animate-pulse" />
              <div className="mt-3 h-3 w-32 bg-slate-100 rounded animate-pulse" />
              <div className="mt-2 h-3 w-48 bg-slate-100 rounded animate-pulse" />
            </div>
          ))
        ) : (
          filtered.map((brand) => (
          <div key={brand.id} className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-lg hover:shadow-slate-200/50 transition-all group">
            <div className="flex items-start justify-between mb-4">
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEdit(brand)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition-colors">
                  <Edit2 size={14} />
                </button>
                <button onClick={() => handleDelete(brand.id)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-red-600 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">{brand.name}</h3>
            <p className="text-xs text-slate-400 mb-2">{brand.slug}</p>
            <p className="text-sm text-slate-600">{brand.description || '—'}</p>
            <div className="flex items-center justify-between mt-3">
              <span className="text-[10px] text-slate-400">Yaradılma: {brand.created_at}</span>
              <span className="text-[10px] text-slate-400">Yenilənmə: {brand.updated_at}</span>
            </div>
          </div>
          ))
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingBrand ? 'Brend Redaktə' : 'Yeni Brend'}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Brend adı</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Məs: Molped"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Slug</label>
            <input
              type="text"
              value={form.slug}
              onChange={(e) => setForm(f => ({ ...f, slug: e.target.value }))}
              placeholder="məs: molped"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Təsvir</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Qısa açıqlama"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors">
              Ləğv et
            </button>
            <button onClick={handleSave} className="flex-1 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all">
              {editingBrand ? 'Yadda saxla' : 'Əlavə et'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default BrandsPage;
