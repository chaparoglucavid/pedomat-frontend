import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Search, BookOpen, Calendar, Eye } from 'lucide-react';
import Modal from './Modal';
import { stories as initialStories } from '@/data/mockData';
import type { Story } from '@/data/mockData';

const StoriesPage: React.FC = () => {
  const [storyList, setStoryList] = useState<Story[]>(initialStories);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingStory, setEditingStory] = useState<Story | null>(null);
  const [form, setForm] = useState({ title: '', content: '', image: '', expires_at: '' });
  const [previewStory, setPreviewStory] = useState<Story | null>(null);

  const filtered = storyList.filter(s =>
    !search || s.title.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    setEditingStory(null);
    setForm({ title: '', content: '', image: '', expires_at: '' });
    setShowModal(true);
  };

  const openEdit = (s: Story) => {
    setEditingStory(s);
    setForm({ title: s.title, content: s.content, image: s.image, expires_at: s.expires_at });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.title.trim()) return;
    if (editingStory) {
      setStoryList(prev => prev.map(s => s.id === editingStory.id ? { ...s, ...form } : s));
    } else {
      const newStory: Story = {
        id: Math.max(...storyList.map(s => s.id)) + 1,
        ...form,
        image: form.image || `https://placehold.co/400x600/0099CC/white?text=${encodeURIComponent(form.title)}`,
        created_at: new Date().toISOString().split('T')[0],
      };
      setStoryList(prev => [...prev, newStory]);
    }
    setShowModal(false);
  };

  const handleDelete = (id: number) => {
    setStoryList(prev => prev.filter(s => s.id !== id));
  };

  const isExpired = (date: string) => new Date(date) < new Date();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Hekayə İdarəetməsi</h2>
          <p className="text-sm text-slate-400">Mobil tətbiqdəki hekayələri idarə edin</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-cyan-500/25 transition-all">
          <Plus size={16} /> Yeni Hekayə
        </button>
      </div>

      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Hekayə axtar..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filtered.map((story) => (
          <div key={story.id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-lg hover:shadow-slate-200/50 transition-all group">
            <div className="relative h-48 overflow-hidden">
              <img src={story.image} alt={story.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              {isExpired(story.expires_at) && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-white text-sm font-bold bg-red-500/80 px-3 py-1 rounded-lg">Müddəti bitib</span>
                </div>
              )}
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => setPreviewStory(story)} className="p-1.5 rounded-lg bg-white/90 text-slate-600 hover:text-cyan-600 transition-colors">
                  <Eye size={14} />
                </button>
                <button onClick={() => openEdit(story)} className="p-1.5 rounded-lg bg-white/90 text-slate-600 hover:text-blue-600 transition-colors">
                  <Edit2 size={14} />
                </button>
                <button onClick={() => handleDelete(story.id)} className="p-1.5 rounded-lg bg-white/90 text-slate-600 hover:text-red-600 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-slate-800 text-sm mb-1">{story.title}</h3>
              <p className="text-xs text-slate-500 line-clamp-2 mb-3">{story.content}</p>
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <div className="flex items-center gap-1">
                  <Calendar size={10} /> Yaradılıb: {story.created_at}
                </div>
                <div className={`flex items-center gap-1 ${isExpired(story.expires_at) ? 'text-red-400' : 'text-emerald-400'}`}>
                  Bitmə: {story.expires_at}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingStory ? 'Hekayə Redaktə' : 'Yeni Hekayə'}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Başlıq</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="Hekayə başlığı"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Məzmun</label>
            <textarea
              value={form.content}
              onChange={(e) => setForm(f => ({ ...f, content: e.target.value }))}
              rows={3}
              placeholder="Hekayə məzmunu"
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
              {editingStory ? 'Yadda saxla' : 'Əlavə et'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Preview Modal */}
      <Modal isOpen={!!previewStory} onClose={() => setPreviewStory(null)} title="Hekayə Önizləmə">
        {previewStory && (
          <div className="space-y-4">
            <img src={previewStory.image} alt={previewStory.title} className="w-full h-64 object-cover rounded-xl" />
            <h3 className="text-lg font-bold text-slate-800">{previewStory.title}</h3>
            <p className="text-sm text-slate-600 leading-relaxed">{previewStory.content}</p>
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Yaradılıb: {previewStory.created_at}</span>
              <span>Bitmə: {previewStory.expires_at}</span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default StoriesPage;
