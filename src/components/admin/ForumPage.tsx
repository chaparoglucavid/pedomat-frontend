import React, { useEffect, useMemo, useState } from 'react';
import {
  MessageSquare, Search, Eye, Ban, CheckCircle, Clock,
  ThumbsUp, Share2, MessageCircle, AlertCircle
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.forums();
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

  const pendingCount = posts.filter(p => p.forum_status === 'pending').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Forum Moderasiyası</h2>
          <p className="text-sm text-slate-400">Forum yazılarını idarə edin və moderasiya edin</p>
        </div>
        {pendingCount > 0 && (
          <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-xl">
            <AlertCircle size={16} className="text-amber-600" />
            <span className="text-sm font-medium text-amber-700">{pendingCount} yazı təsdiq gözləyir</span>
          </div>
        )}
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
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
        >
          <option value="all">Bütün statuslar</option>
          <option value="active">Aktiv</option>
          <option value="pending">Gözləyən</option>
          <option value="blocked">Bloklanmış</option>
        </select>
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
                  {post.forum_status !== 'active' && (
                    <button
                      onClick={() => handleStatusChange(post.id, 'active')}
                      className="p-2 rounded-lg hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 transition-colors"
                      title="Təsdiq et"
                    >
                      <CheckCircle size={16} />
                    </button>
                  )}
                  {post.forum_status !== 'blocked' && (
                    <button
                      onClick={() => handleStatusChange(post.id, 'blocked')}
                      className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
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
    </div>
  );
};

export default ForumPage;
