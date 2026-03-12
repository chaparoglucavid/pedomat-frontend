import React, { useEffect, useRef, useState } from 'react';
import { Plus, Edit2, Trash2, Search, Image, Calendar, Eye, Upload } from 'lucide-react';
import Modal from './Modal';
import { api } from '@/lib/api';

const BannersPage: React.FC = () => {
  const [bannerList, setBannerList] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState<any | null>(null);
  const [form, setForm] = useState<{ title: string; content: string; status: string; link_url: string; expires_at: string; imageFile: File | null }>({ title: '', content: '', status: 'active', link_url: '', expires_at: '', imageFile: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await api.banners();
        const data = Array.isArray(response) ? response : (response?.data ?? response);
        setBannerList(Array.isArray(data) ? data : []);
        setError('');
      } catch {
        setBannerList([]);
        setError('Bannerlər yüklənə bilmədi');
      }
      setLoading(false);
    };
    load();
  }, []);

  const filtered = bannerList.filter(b =>
    !search || (b.title || '').toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    setEditingBanner(null);
    setForm({ title: '', content: '', status: 'active', link_url: '', expires_at: '', imageFile: null });
    setImagePreview(null);
    setShowModal(true);
  };

  const openEdit = (b: any) => {
    setEditingBanner(b);
    const formatDate = (val: any) => {
      if (!val) return '';
      const s = String(val);
      if (s.includes('T')) return s.split('T')[0];
      if (s.includes(' ')) return s.split(' ')[0];
      // fallback: try Date parsing
      const d = new Date(s);
      if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
      return s;
    };
    setForm({
      title: b.title || '',
      content: b.content || '',
      status: b.status || 'active',
      link_url: b.link_url || '',
      expires_at: formatDate(b.expires_at),
      imageFile: null
    });
    setImagePreview(b.image_url || b.image || b.image_path || null);
    setShowModal(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setForm(f => ({ ...f, imageFile: file }));
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const handleSave = () => {
    if (!form.title.trim()) return;
    if (editingBanner) {
      const run = async () => {
        const fd = new FormData();
        fd.append('title', form.title);
        fd.append('content', form.content);
        fd.append('status', form.status);
        if (form.link_url) fd.append('link_url', form.link_url);
        if (form.expires_at) fd.append('expires_at', form.expires_at);
        if (form.imageFile) fd.append('image', form.imageFile);
        const updated = await api.bannerUpdate(editingBanner.id, fd);
        const payload = updated?.data || updated;
        setBannerList(prev => prev.map(b => b.id === editingBanner.id ? { ...b, ...payload } : b));
        setShowModal(false);
      };
      run();
    } else {
      const run = async () => {
        const fd = new FormData();
        fd.append('title', form.title);
        fd.append('content', form.content);
        fd.append('status', form.status);
        if (form.link_url) fd.append('link_url', form.link_url);
        if (form.expires_at) fd.append('expires_at', form.expires_at);
        if (form.imageFile) fd.append('image', form.imageFile as Blob);
        const created = await api.bannerStore(fd);
        const newBanner = created?.data || created;
        setBannerList(prev => [...prev, newBanner]);
        setShowModal(false);
      };
      run();
    }
  };

  const handleDelete = (id: number) => {
    const run = async () => {
      await api.bannerDelete(id);
      setBannerList(prev => prev.filter(b => b.id !== id));
    };
    run();
  };

  const isExpired = (date: string) => new Date(date) < new Date();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Reklam Banner İdarəetməsi</h2>
          <p className="text-sm text-slate-400">Mobil tətbiqdəki reklam bannerlərini idarə edin</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-cyan-500/25 transition-all">
          <Plus size={16} /> Yeni Banner
        </button>
      </div>

      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Banner axtar..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
        />
      </div>

      <div className="space-y-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 overflow-hidden p-5">
              <div className="h-32 bg-slate-100 rounded animate-pulse" />
              <div className="mt-3 h-4 w-32 bg-slate-100 rounded animate-pulse" />
              <div className="mt-2 h-3 w-48 bg-slate-100 rounded animate-pulse" />
            </div>
          ))
        ) : filtered.map((banner) => (
          <div key={banner.id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-lg hover:shadow-slate-200/50 transition-all group">
            <div className="flex flex-col lg:flex-row">
              <div className="relative lg:w-80 h-48 lg:h-auto overflow-hidden flex-shrink-0">
                <img src={banner.image_url || banner.image || banner.image_path} alt={banner.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                {isExpired(banner.expires_at) && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white text-sm font-bold bg-red-500/80 px-3 py-1 rounded-lg">Müddəti bitib</span>
                  </div>
                )}
              </div>
              <div className="flex-1 p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 mb-1">{banner.title}</h3>
                    <p className="text-sm text-slate-500 mb-4">{banner.content || '—'}</p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(banner)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition-colors">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(banner.id)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-red-600 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <div className="flex items-center gap-1">
                    <Calendar size={12} /> Yaradılıb: {banner.created_at}
                  </div>
                  <div className={`flex items-center gap-1 ${isExpired(banner.expires_at) ? 'text-red-400' : 'text-emerald-400'}`}>
                    <Calendar size={12} /> Bitmə: {banner.expires_at}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingBanner ? 'Banner Redaktə' : 'Yeni Banner'}>
        <div className="space-y-4">
          {/* Image Upload Area (Story-style) */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Şəkil</label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="relative w-full h-40 border-2 border-dashed border-cyan-300 rounded-2xl overflow-hidden cursor-pointer hover:border-cyan-400 transition-colors group bg-cyan-50"
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
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageChange}
              className="hidden"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Başlıq</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="Banner başlığı"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Məzmun</label>
            <textarea
              value={form.content}
              onChange={(e) => setForm(f => ({ ...f, content: e.target.value }))}
              rows={3}
              placeholder="Banner məzmunu"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 resize-none"
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
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Keçid URL</label>
            <input
              type="text"
              value={form.link_url}
              onChange={(e) => setForm(f => ({ ...f, link_url: e.target.value }))}
              placeholder="https://..."
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Bitmə tarixi</label>
            <input
              type="date"
              value={form.expires_at}
              onChange={(e) => setForm(f => ({ ...f, expires_at: e.target.value }))}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors">
              Ləğv et
            </button>
            <button onClick={handleSave} className="flex-1 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all">
              {editingBanner ? 'Yadda saxla' : 'Əlavə et'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default BannersPage;
