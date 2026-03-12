import React, { useEffect, useRef, useState } from 'react';
import { Plus, Edit2, Trash2, Search, Package as PackageIcon, Upload, Layers, Star, Check } from 'lucide-react';
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
    order_index: 0,
    is_popular: false,
    badge_text: '',
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

  const filtered = list
    .filter(p => !search || (p.title || '').toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => (a.order_index || 0) - (b.order_index || 0));

  const openAdd = () => {
    setEditing(null);
    setForm({ title: '', description: '', price: 0, discount_percent: 0, validity_days: 30, order_index: 0, is_popular: false, badge_text: '', status: 'active', iconFile: null });
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
      order_index: Number(p.order_index || 0),
      is_popular: Boolean(p.is_popular),
      badge_text: p.badge_text || '',
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
    fd.append('order_index', String(form.order_index));
    fd.append('is_popular', form.is_popular ? '1' : '0');
    if (form.badge_text) fd.append('badge_text', form.badge_text);
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
              <div className="h-12 w-12 bg-slate-100 rounded-2xl animate-pulse mb-4" />
              <div className="h-6 w-32 bg-slate-100 rounded animate-pulse mb-2" />
              <div className="h-4 w-48 bg-slate-100 rounded animate-pulse mb-6" />
              <div className="space-y-3">
                <div className="h-4 w-full bg-slate-50 rounded animate-pulse" />
                <div className="h-4 w-full bg-slate-50 rounded animate-pulse" />
              </div>
            </div>
          ))
        ) : filtered.map(pkg => (
          <div 
            key={pkg.id} 
            className={`relative bg-white rounded-[2rem] border-2 transition-all duration-300 p-8 flex flex-col group ${
              pkg.is_popular 
                ? 'border-cyan-500 shadow-xl shadow-cyan-500/10 scale-[1.02] z-10' 
                : 'border-slate-100 shadow-sm hover:border-cyan-200 hover:shadow-md'
            }`}
          >
            {/* Badge */}
            {(pkg.badge_text || pkg.is_popular) && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-lg ${
                  pkg.is_popular ? 'bg-cyan-500 text-white' : 'bg-slate-800 text-white'
                }`}>
                  {pkg.badge_text || (pkg.is_popular ? 'Ən Məşhur' : '')}
                </span>
              </div>
            )}

            {/* Actions Overlay */}
            <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
              <button 
                onClick={() => openEdit(pkg)} 
                className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-colors shadow-sm"
                title="Redaktə et"
              >
                <Edit2 size={16} />
              </button>
              <button 
                onClick={() => handleDelete(pkg.id)} 
                className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors shadow-sm"
                title="Sil"
              >
                <Trash2 size={16} />
              </button>
            </div>

            {/* Header */}
            <div className="mb-8">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-inner ${
                pkg.is_popular ? 'bg-cyan-50 text-cyan-600' : 'bg-slate-50 text-slate-400'
              }`}>
                {pkg.icon_url || pkg.icon_path ? (
                  <img src={pkg.icon_url || pkg.icon_path} className="w-8 h-8 object-contain" alt="" />
                ) : (
                  <PackageIcon size={28} />
                )}
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">{pkg.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed min-h-[3rem]">{pkg.description || 'Xüsusi imtiyazlar və üstünlüklər'}</p>
            </div>

            {/* Pricing */}
            <div className="mb-8 flex items-baseline gap-1">
              <span className="text-4xl font-black text-slate-800 tracking-tight">{Number(pkg.price).toFixed(2)}</span>
              <span className="text-lg font-bold text-slate-400">AZN</span>
              <span className="ml-2 text-xs font-bold text-slate-400">/ {pkg.validity_days} gün</span>
            </div>

            {/* Features */}
            <div className="flex-1 space-y-4 mb-8">
              {Array.isArray(pkg.features) && pkg.features.length > 0 ? (
                pkg.features.map((f: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
                      pkg.is_popular ? 'bg-cyan-100 text-cyan-600' : 'bg-slate-100 text-slate-400'
                    }`}>
                      <Check size={12} strokeWidth={3} />
                    </div>
                    <span className="text-sm font-medium text-slate-600">
                      {f.name} {f.value && <span className="text-slate-400 font-normal">— {f.value}</span>}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Özəllik yoxdur</p>
                </div>
              )}
            </div>

            {/* Footer Info */}
            <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers size={14} className="text-slate-300" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sıra: {pkg.order_index}</span>
              </div>
              <div className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                pkg.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
              }`}>
                {pkg.status === 'active' ? 'Aktiv' : 'Deaktiv'}
              </div>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Etibarlılıq (gün)</label>
              <input
                type="number"
                value={form.validity_days}
                onChange={(e) => setForm(f => ({ ...f, validity_days: Number(e.target.value) }))}
                min={1}
                step={1}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Sıralama İndeksi</label>
              <input
                type="number"
                value={form.order_index}
                onChange={(e) => setForm(f => ({ ...f, order_index: Number(e.target.value) }))}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Badge Mətni</label>
              <input
                type="text"
                value={form.badge_text}
                onChange={(e) => setForm(f => ({ ...f, badge_text: e.target.value }))}
                placeholder="Məs: ən sərfəli"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
              />
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
          </div>

          <div className="flex items-center gap-2 py-2">
            <input
              type="checkbox"
              id="is_popular"
              checked={form.is_popular}
              onChange={(e) => setForm(f => ({ ...f, is_popular: e.target.checked }))}
              className="w-4 h-4 text-cyan-500 border-slate-300 rounded focus:ring-cyan-500"
            />
            <label htmlFor="is_popular" className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
              <Star size={14} className={form.is_popular ? 'text-amber-400 fill-amber-400' : 'text-slate-300'} />
              Məşhur paket olaraq işarələ
            </label>
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
