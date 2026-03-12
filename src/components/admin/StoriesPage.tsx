import React, { useState, useEffect, useRef } from 'react';
import { Plus, Edit2, Trash2, Search, BookOpen, Calendar, Eye, Upload, X, Loader2 } from 'lucide-react';
import Modal from './Modal';
import { stories as initialStories } from '@/data/mockData';
import type { Story } from '@/data/mockData';
import { api } from '@/lib/api';
import { toast } from '@/components/ui/use-toast';

const StoriesPage: React.FC = () => {
  const [storyList, setStoryList] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingStory, setEditingStory] = useState<Story | null>(null);
  const [form, setForm] = useState({ title: '', content: '', expires_at: '', status: 'active' });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [previewStory, setPreviewStory] = useState<Story | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadStories();
  }, []);

  const loadStories = async () => {
    setLoading(true);
    try {
      const response = await api.stories();
      const data = Array.isArray(response) ? response : (response?.data ?? response);
      // Map backend fields to frontend interface if needed
      const mappedData = data.map((s: any) => ({
        id: s.id,
        title: s.title,
        content: s.content,
        image: s.image || '',
        expires_at: s.expiration_date_time ? s.expiration_date_time.split('T')[0] : '',
        status: s.status,
        created_at: s.created_at ? s.created_at.split('T')[0] : '',
      }));
      setStoryList(mappedData);
    } catch (error) {
      console.error('Hekayələr yüklənərkən xəta:', error);
      toast({ title: 'Xəta', description: 'Hekayələr yüklənə bilmədi', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const filtered = storyList.filter(s =>
    !search || s.title.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    setEditingStory(null);
    setForm({ title: '', content: '', expires_at: '', status: 'active' });
    setImageFile(null);
    setImagePreview(null);
    setShowModal(true);
  };

  const openEdit = (s: Story) => {
    setEditingStory(s);
    setForm({ 
      title: s.title, 
      content: s.content || '', 
      expires_at: s.expires_at || '', 
      status: s.status || 'active' 
    });
    setImageFile(null);
    setImagePreview(s.image);
    setShowModal(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.expires_at) {
      toast({ title: 'Xəta', description: 'Başlıq və bitmə tarixi mütləqdir', variant: 'destructive' });
      return;
    }

    setIsSaving(true);
    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('content', form.content);
    formData.append('expiration_date_time', form.expires_at);
    formData.append('status', form.status);
    if (imageFile) {
      formData.append('image', imageFile);
    }

    try {
      if (editingStory) {
        await api.storyUpdate(editingStory.id, formData);
        toast({ title: 'Uğurlu', description: 'Hekayə yeniləndi' });
      } else {
        await api.storyStore(formData);
        toast({ title: 'Uğurlu', description: 'Yeni hekayə yaradıldı' });
      }
      setShowModal(false);
      loadStories();
    } catch (error) {
      console.error('Hekayə yadda saxlanılarkən xəta:', error);
      toast({ title: 'Xəta', description: 'Hekayə yadda saxlanıla bilmədi', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Bu hekayəni silmək istədiyinizə əminsiniz?')) return;
    
    try {
      await api.storyDelete(id);
      toast({ title: 'Uğurlu', description: 'Hekayə silindi' });
      loadStories();
    } catch (error) {
      toast({ title: 'Xəta', description: 'Hekayə silinə bilmədi', variant: 'destructive' });
    }
  };

  const isExpired = (date: string) => date ? new Date(date) < new Date() : false;

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

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-cyan-500" size={40} />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filtered.map((story) => (
            <div key={story.id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-lg hover:shadow-slate-200/50 transition-all group">
              <div className="relative h-48 overflow-hidden">
                <img src={story.image || 'https://placehold.co/400x600?text=No+Image'} alt={story.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                {(isExpired(story.expires_at) || story.status === 'expired') && (
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
                  <div className={`flex items-center gap-1 ${(isExpired(story.expires_at) || story.status === 'expired') ? 'text-red-400' : 'text-emerald-400'}`}>
                    Bitmə: {story.expires_at}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full py-20 text-center text-slate-400 font-medium">
              Hekayə tapılmadı
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal isOpen={showModal} onClose={() => !isSaving && setShowModal(false)} title={editingStory ? 'Hekayə Redaktə' : 'Yeni Hekayə'}>
        <div className="space-y-4">
          {/* Image Upload Area */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Şəkil</label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="relative w-full h-40 border-2 border-dashed border-slate-200 rounded-2xl overflow-hidden cursor-pointer hover:border-cyan-500/50 transition-colors group bg-slate-50"
            >
              {imagePreview ? (
                <>
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Upload className="text-white" size={24} />
                  </div>
                </>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 gap-2">
                  <Upload size={32} />
                  <span className="text-xs font-medium">Şəkil yükləmək üçün klikləyin</span>
                </div>
              )}
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageChange} 
              className="hidden" 
              accept="image/*" 
            />
          </div>

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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Bitmə tarixi</label>
              <input
                type="date"
                value={form.expires_at}
                onChange={(e) => setForm(f => ({ ...f, expires_at: e.target.value }))}
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
                <option value="expired">Müddəti bitib</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button 
              onClick={() => setShowModal(false)} 
              disabled={isSaving}
              className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors disabled:opacity-50"
            >
              Ləğv et
            </button>
            <button 
              onClick={handleSave} 
              disabled={isSaving}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSaving && <Loader2 size={16} className="animate-spin" />}
              {editingStory ? 'Yadda saxla' : 'Əlavə et'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Preview Modal */}
      <Modal isOpen={!!previewStory} onClose={() => setPreviewStory(null)} title="Hekayə Önizləmə">
        {previewStory && (
          <div className="space-y-4">
            <img src={previewStory.image || 'https://placehold.co/400x600?text=No+Image'} alt={previewStory.title} className="w-full h-64 object-cover rounded-xl" />
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
