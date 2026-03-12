import React, { useEffect, useRef, useState } from 'react';
import { Plus, Edit2, Trash2, Search, Package as PackageIcon, Upload, Layers } from 'lucide-react';
import Modal from './Modal';
import { api } from '@/lib/api';

const PackagesPage: React.FC = () => {
  const [list, setList] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [features, setFeatures] = useState<Array<{ name: string; value: string }>>([]);

  const [form, setForm] = useState({
    title: '',
    description: '',
    price: 0,
    discount_percent: 0,
    validity_days: 30,
    status: 'active',
    iconFile: null as File | null,
  });

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.packages();
        const data = Array.isArray(res) ? res : (res?.data ?? res);
        setList(Array.isArray(data) ? data : []);
        setError('');
      } catch {
        setList([]);
        setError('Paketlər yüklənə bilmədi');
      }
      setLoading(false);
    };
    load();
  }, []);

  const filtered = list.filter(p => !search || (p.title || '').toLowerCase().includes(search.toLowerCase()));

  const openAdd = () => {
    setEditing(null);
    setForm({ title: '', description: '', price: 0, discount_percent: 0, validity_days: 30, status: 'active', iconFile: null });
    setFeatures([]);
    setImagePreview(null);
    setShowModal(true);
  };

  const openEdit = (p: any) => {
    setEditing(p);
    setForm({
      title: p.title || '',
      description: p.description || '',
      price: Number(p.price || 0),
      discount_percent: Number(p.discount_percent || 0),
      validity_days: Number(p.validity_days || 30),
      status: p.status || 'active',
      iconFile: null,
    });
    setFeatures(Array.isArray(p.features) ? p.features.map((f: any) => ({ name: f.name, value: f.value || '' })) : []);
    setImagePreview(p.icon_url || p.icon_path || null);
    setShowModal(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setForm(f => ({ ...f, iconFile: file }));
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const addFeature = () => setFeatures(prev => [...prev, { name: '', value: '' }]);
  const updateFeature = (idx: number, key: 'name' | 'value', val: string) => {
    setFeatures(prev => prev.map((f, i) => i === idx ? { ...f, [key]: val } : f));
  };
  const removeFeature = (idx: number) => setFeatures(prev => prev.filter((_, i) => i !== idx));

  const handleSave = () => {
    if (!form.title.trim()) return;
    const fd = new FormData();
    fd.append('title', form.title);
    if (form.description) fd.append('description', form.description);
    fd.append('price', String(form.price));
    fd.append('discount_percent', String(form.discount_percent));
    fd.append('validity_days', String(form.validity_days));
    fd.append('status', form.status);
    if (form.iconFile) fd.append('icon', form.iconFile);
    features.forEach((f, i) => {
      if (f.name) {
        fd.append(`features[${i}][name]`, f.name);
        if (f.value) fd.append(`features[${i}][value]`, f.value);
      }
    });
    if (editing) {
      const run = async () => {
        const updated = await api.packageUpdate(editing.id, fd);
        const payload = updated?.data || updated;
        setList(prev => prev.map(p => p.id === editing.id ? { ...p, ...payload } : p));
        setShowModal(false);
      };
      run();
    } else {
      const run = async () => {
        const created = await api.packageStore(fd);
        const newPkg = created?.data || created;
        setList(prev => [...prev, newPkg]);
        setShowModal(false);
      };
      run();
    }
  };

  const handleDelete = (id: number) => {
    const run = async () => {
      await api.packageDelete(id);
      setList(prev => prev.filter(p => p.id !== id));
    };
    run();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">İstifadəçi Paketləri</h2>
          <p className="text-sm text-slate-400">Paketləri idarə edin</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-cyan-500/25 transition-all">
          <Plus size={16} /> Yeni Paket
        </button>
      </div>

      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Paket axtar..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5">
              <div className="h-4 w-24 bg-slate-100 rounded animate-pulse" />
              <div className="mt-3 h-3 w-32 bg-slate-100 rounded animate-pulse" />
              <div className="mt-2 h-3 w-48 bg-slate-100 rounded animate-pulse" />
            </div>
          ))
        ) : filtered.map(pkg => (
          <div key={pkg.id} className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-lg hover:shadow-slate-200/50 transition-all group">
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center text-white">
                <PackageIcon size={18} />
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEdit(pkg)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition-colors">
                  <Edit2 size={14} />
                </button>
                <button onClick={() => handleDelete(pkg.id)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-red-600 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">{pkg.title}</h3>
            <p className="text-xs text-slate-400 mb-2">{pkg.description || '—'}</p>
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-slate-800">{Number(pkg.price).toFixed(2)} AZN</span>
              <span className="text-slate-600">{Number(pkg.discount_percent)}% endirim</span>
              <span className="text-slate-600">{pkg.validity_days} gün</span>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Paket Redaktə' : 'Yeni Paket'}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">İkon</label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="relative w-full h-32 border-2 border-dashed border-cyan-300 rounded-2xl overflow-hidden cursor-pointer hover:border-cyan-400 transition-colors group bg-cyan-50"
            >
              {imagePreview ? (
                <>
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Upload className="text-white" size={24} />
                  </div>
                </>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-cyan-500 gap-2">
                  <Upload size={32} className="text-cyan-500" />
                  <span className="text-xs font-medium">Şəkil yükləmək üçün klikləyin</span>
                </div>
              )}
            </div>
            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageChange} className="hidden" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Paket adı</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Qısa məzmun</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
              rows={3}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 resize-none"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Qiymət (AZN)</label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => setForm(f => ({ ...f, price: Number(e.target.value) }))}
                min={0}
                step={0.1}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Endirim (%)</label>
              <input
                type="number"
                value={form.discount_percent}
                onChange={(e) => setForm(f => ({ ...f, discount_percent: Number(e.target.value) }))}
                min={0}
                max={100}
                step={1}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Müddət (gün)</label>
              <input
                type="number"
                value={form.validity_days}
                onChange={(e) => setForm(f => ({ ...f, validity_days: Number(e.target.value) }))}
                min={1}
                step={1}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
              />
            </div>
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
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-slate-700">Özəlliklər</label>
              <button onClick={addFeature} className="px-2 py-1 text-xs bg-cyan-500 text-white rounded-lg">Əlavə et</button>
            </div>
            <div className="space-y-2">
              {features.map((f, idx) => (
                <div key={idx} className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={f.name}
                    onChange={(e) => updateFeature(idx, 'name', e.target.value)}
                    placeholder="Özəllik adı"
                    className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={f.value}
                      onChange={(e) => updateFeature(idx, 'value', e.target.value)}
                      placeholder="Dəyər"
                      className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                    />
                    <button onClick={() => removeFeature(idx)} className="px-2 py-2 text-xs bg-red-50 text-red-600 rounded-xl">Sil</button>
                  </div>
                </div>
              ))}
              {features.length === 0 && (
                <p className="text-xs text-slate-400">Özəllik əlavə edilməyib</p>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors">
              Ləğv et
            </button>
            <button onClick={handleSave} className="flex-1 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all">
              {editing ? 'Yadda saxla' : 'Əlavə et'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PackagesPage;
