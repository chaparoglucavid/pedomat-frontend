import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Search, Image, Calendar, Eye } from 'lucide-react';
import Modal from './Modal';
import { banners as initialBanners } from '@/data/mockData';
import type { Banner } from '@/data/mockData';

const BannersPage: React.FC = () => {
  const [bannerList, setBannerList] = useState<Banner[]>(initialBanners);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [form, setForm] = useState({ title: '', content: '', image: '', expires_at: '' });

  const filtered = bannerList.filter(b =>
    !search || b.title.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    setEditingBanner(null);
    setForm({ title: '', content: '', image: '', expires_at: '' });
    setShowModal(true);
  };

  const openEdit = (b: Banner) => {
    setEditingBanner(b);
    setForm({ title: b.title, content: b.content, image: b.image, expires_at: b.expires_at });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.title.trim()) return;
    if (editingBanner) {
      setBannerList(prev => prev.map(b => b.id === editingBanner.id ? { ...b, ...form } : b));
    } else {
      const newBanner: Banner = {
        id: Math.max(...bannerList.map(b => b.id)) + 1,
        ...form,
        image: form.image || `https://placehold.co/800x300/0099CC/white?text=${encodeURIComponent(form.title)}`,
        created_at: new Date().toISOString().split('T')[0],
      };
      setBannerList(prev => [...prev, newBanner]);
    }
    setShowModal(false);
  };

  const handleDelete = (id: number) => {
    setBannerList(prev => prev.filter(b => b.id !== id));
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
        {filtered.map((banner) => (
          <div key={banner.id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-lg hover:shadow-slate-200/50 transition-all group">
            <div className="flex flex-col lg:flex-row">
              <div className="relative lg:w-80 h-48 lg:h-auto overflow-hidden flex-shrink-0">
                <img src={banner.image} alt={banner.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
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
                    <p className="text-sm text-slate-500 mb-4">{banner.content}</p>
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
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Şəkil URL</label>
            <input
              type="text"
              value={form.image}
              onChange={(e) => setForm(f => ({ ...f, image: e.target.value }))}
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
