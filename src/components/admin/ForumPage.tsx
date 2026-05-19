import React, { useEffect, useMemo, useState } from 'react';
import {
  MessageSquare, Search, Eye, Ban, CheckCircle, Clock,
  ThumbsUp, Share2, MessageCircle, AlertCircle, Plus, Edit2, Trash2
} from 'lucide-react';
import Modal from './Modal';
import { getStatusColor, getStatusLabel } from '@/data/mockData';
import { api } from '@/lib/api';

const ForumPage: React.FC = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedPost, setSelectedPost] = useState<any | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingPost, setEditingPost] = useState<any | null>(null);
  const [form, setForm] = useState({ forum_subject: '', forum_content: '', forum_status: 'pending' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const response = await api.forums();
        const data = Array.isArray(response) ? response : (response?.data ?? response);
        setPosts(Array.isArray(data) ? data : []);
        setError('');
      } catch {
        setPosts([]);
        setError('Forum yazıları yüklənə bilmədi');
      }
      setLoading(false);
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    let result = [...posts];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(p => (p.forum_subject || '').toLowerCase().includes(q) || (p.forum_content || '').toLowerCase().includes(q));
    }
    if (statusFilter !== 'all') result = result.filter(p => p.forum_status === statusFilter);
    return result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [posts, search, statusFilter]);

  const handleStatusChange = (id: number, newStatus: string) => {
    const run = async () => {
      await api.forumUpdate(id, { forum_status: newStatus });
      setPosts(prev => prev.map(p => p.id === id ? { ...p, forum_status: newStatus } : p));
    };
    run();
  };

  const handleSave = async () => {
    if (!form.forum_subject.trim() || !form.forum_content.trim()) return;
    try {
      if (editingPost) {
        const updated = await api.forumUpdate(editingPost.id, form);
        const data = updated?.data || updated;
        setPosts(prev => prev.map(p => p.id === editingPost.id ? { ...p, ...data } : p));
      } else {
        const created = await api.forumStore(form);
        const data = created?.data || created;
        setPosts(prev => [data, ...prev]);
      }
      setShowFormModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Bu forum yazısını silmək istədiyinizə əminsiniz?')) return;
    try {
      await api.forumDelete(id);
      setPosts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const openAdd = () => {
    setEditingPost(null);
    setForm({ forum_subject: '', forum_content: '', forum_status: 'pending' });
    setShowFormModal(true);
  };

  const openEdit = (post: any) => {
    setEditingPost(post);
    setForm({
      forum_subject: post.forum_subject,
      forum_content: post.forum_content,
      forum_status: post.forum_status || 'pending',
    });
    setShowFormModal(true);
  };

  const pendingCount = posts.filter(p => p.forum_status === 'pending').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Forum Moderasiyası</h2>
          <p className="text-sm text-slate-400">Forum yazılarını idarə edin və moderasiya edin</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-cyan-500/25 transition-all"
          >
            <Plus size={16} /> Yeni Yazı
          </button>
          {pendingCount > 0 && (
            <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-xl">
              <AlertCircle size={16} className="text-amber-600" />
              <span className="text-sm font-medium text-amber-700">{pendingCount} yazı təsdiq gözləyir</span>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl p-4 border border-slate-100 text-center">
          <p className="text-xl font-bold text-slate-800">{posts.length}</p>
          <p className="text-xs text-slate-400">Ümumi yazı</p>
        </div>
        <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100 text-center">
          <p className="text-xl font-bold text-emerald-700">{posts.filter(p => p.forum_status === 'active').length}</p>
          <p className="text-xs text-emerald-600">Aktiv</p>
        </div>
        <div className="bg-amber-50 rounded-xl p-4 border border-amber-100 text-center">
          <p className="text-xl font-bold text-amber-700">{pendingCount}</p>
          <p className="text-xs text-amber-600">Gözləyən</p>
        </div>
        <div className="bg-red-50 rounded-xl p-4 border border-red-100 text-center">
          <p className="text-xl font-bold text-red-700">{posts.filter(p => p.forum_status === 'blocked').length}</p>
          <p className="text-xs text-red-600">Bloklanmış</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Forum yazısı axtar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${statusFilter === 'all' ? 'bg-slate-800 text-white' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-100'}`}
          >
            Bütün
          </button>
          <button
            onClick={() => setStatusFilter('accepted')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${statusFilter === 'accepted' ? 'bg-emerald-500 text-white' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-100'}`}
          >
            Aktiv
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${statusFilter === 'pending' ? 'bg-amber-500 text-white' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-100'}`}
          >
            Gözləyən
          </button>
          <button
            onClick={() => setStatusFilter('rejected')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${statusFilter === 'rejected' ? 'bg-red-500 text-white' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-100'}`}
          >
            Bloklanmış
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* Posts */}
      <div className="space-y-4">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5">
              <div className="h-4 w-32 bg-slate-100 rounded animate-pulse" />
              <div className="mt-2 h-3 w-48 bg-slate-100 rounded animate-pulse" />
              <div className="mt-2 h-3 w-40 bg-slate-100 rounded animate-pulse" />
            </div>
          ))
        ) : (
        filtered.map((post) => {
          return (
            <div key={post.id} className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-lg hover:shadow-slate-200/50 transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {(post.user?.full_name || '??').slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-slate-800">{post.forum_subject}</h3>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${getStatusColor(post.forum_status)}`}>
                        {getStatusLabel(post.forum_status)}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 mt-1 line-clamp-2">{post.forum_content}</p>
                    <div className="flex items-center gap-4 mt-3">
                      <span className="text-xs text-slate-400">{post.user?.full_name || 'Naməlum'}</span>
                      <span className="text-xs text-slate-300">|</span>
                      <span className="text-xs text-slate-400">{post.created_at}</span>
                      <div className="ml-auto text-xs text-slate-400">Şərhlər: {(post.comments?.length) ?? 0}</div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => { setSelectedPost(post); setShowDetailModal(true); }}
                    className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-cyan-600 transition-colors"
                    title="Ətraflı bax"
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    onClick={() => openEdit(post)}
                    className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition-colors"
                    title="Redaktə et"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-red-600 transition-colors"
                    title="Sil"
                  >
                    <Trash2 size={16} />
                  </button>
                  {post.forum_status !== 'accepted' && (
                    <button
                      onClick={() => handleStatusChange(post.id, 'accepted')}
                      className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-emerald-600 transition-colors"
                      title="Təsdiqlə"
                    >
                      <CheckCircle size={16} />
                    </button>
                  )}
                  {post.forum_status !== 'rejected' && (
                    <button
                      onClick={() => handleStatusChange(post.id, 'rejected')}
                      className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-red-600 transition-colors"
                      title="Blokla"
                    >
                      <Ban size={16} />
                    </button>
                  )}
                  {post.forum_status !== 'pending' && (
                    <button
                      onClick={() => handleStatusChange(post.id, 'pending')}
                      className="p-2 rounded-lg hover:bg-amber-50 text-slate-400 hover:text-amber-600 transition-colors"
                      title="Gözləməyə al"
                    >
                      <Clock size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        }))}
      </div>

      {/* Detail Modal */}
      <Modal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} title={selectedPost?.forum_subject || ''} size="lg">
        {selectedPost && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                {(selectedPost.user?.full_name || '??').slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-slate-700">
                  {selectedPost.user?.full_name || 'Naməlum'}
                </p>
                <p className="text-xs text-slate-400">{selectedPost.created_at}</p>
              </div>
              <span className={`ml-auto text-xs font-medium px-2.5 py-1 rounded-lg ${getStatusColor(selectedPost.forum_status)}`}>
                {getStatusLabel(selectedPost.forum_status)}
              </span>
            </div>
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-sm text-slate-700 leading-relaxed">{selectedPost.forum_content}</p>
            </div>
            <div className="text-xs text-slate-400">Şərhlər: {(selectedPost.comments?.length) ?? 0}</div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => { handleStatusChange(selectedPost.id, 'active'); setShowDetailModal(false); }}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all"
              >
                Təsdiq et
              </button>
              <button
                onClick={() => { handleStatusChange(selectedPost.id, 'blocked'); setShowDetailModal(false); }}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all"
              >
                Blokla
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Form Modal */}
      <Modal isOpen={showFormModal} onClose={() => setShowFormModal(false)} title={editingPost ? 'Yazını Redaktə Et' : 'Yeni Forum Yazısı'}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Mövzu</label>
            <input
              type="text"
              value={form.forum_subject}
              onChange={(e) => setForm(f => ({ ...f, forum_subject: e.target.value }))}
              placeholder="Mövzu başlığını daxil edin"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Məzmun</label>
            <textarea
              value={form.forum_content}
              onChange={(e) => setForm(f => ({ ...f, forum_content: e.target.value }))}
              placeholder="Yazı məzmununu daxil edin"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 min-h-[150px]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Status</label>
            <select
              value={form.forum_status}
              onChange={(e) => setForm(f => ({ ...f, forum_status: e.target.value }))}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
            >
              <option value="accepted">Aktiv</option>
              <option value="pending">Gözləyən</option>
              <option value="rejected">Bloklanmış</option>
            </select>
          </div>
          <div className="pt-2">
            <button
              onClick={handleSave}
              className="w-full py-3 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-xl font-semibold shadow-lg shadow-cyan-500/25 hover:opacity-90 transition-all"
            >
              Yadda Saxla
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ForumPage;
