import React, { useEffect, useState } from 'react';
import { Star, Trash2, Search, MessageCircle, Monitor, User } from 'lucide-react';
import { api } from '@/lib/api';
import { AlertCircle } from 'lucide-react';

const EquipmentReviewsPage: React.FC = () => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const response = await api.equipmentReviews();
        const data = response?.data || response;
        setReviews(Array.isArray(data) ? data : []);
        setError('');
      } catch {
        setReviews([]);
        setError('Rəylər yüklənə bilmədi');
      }
      setLoading(false);
    };
    load();
  }, []);

  const filtered = reviews.filter(r =>
    !search || 
    (r.note || '').toLowerCase().includes(search.toLowerCase()) ||
    (r.user?.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (r.equipment?.equipment_name || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: number) => {
    if (!window.confirm('Bu rəyi silmək istədiyinizə əminsiniz?')) return;
    try {
      await api.equipmentReviewDelete(id);
      setReviews(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Cihaz Rəyləri</h2>
          <p className="text-sm text-slate-400">Cihazlar haqqında istifadəçi rəylərini idarə edin</p>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Rəy, istifadəçi və ya cihaz axtar..."
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-slate-100 animate-pulse">
              <div className="h-4 w-32 bg-slate-100 rounded mb-4" />
              <div className="h-3 w-full bg-slate-100 rounded mb-2" />
              <div className="h-3 w-2/3 bg-slate-100 rounded" />
            </div>
          ))
        ) : (
          filtered.map((review) => (
            <div key={review.id} className="bg-white rounded-2xl p-5 border border-slate-100 hover:shadow-lg transition-all relative group">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-0.5 text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={14} fill={i < review.rating ? "currentColor" : "none"} />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-slate-400 ml-1">#{review.id}</span>
                </div>
                <button
                  onClick={() => handleDelete(review.id)}
                  className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              
              <p className="text-sm text-slate-600 mb-4 italic">"{review.note || 'Şərh yoxdur'}"</p>
              
              <div className="flex flex-wrap gap-4 pt-4 border-t border-slate-50">
                <div className="flex items-center gap-2">
                  <User size={14} className="text-slate-400" />
                  <span className="text-xs font-medium text-slate-700">{review.user?.full_name || 'Naməlum'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Monitor size={14} className="text-slate-400" />
                  <span className="text-xs font-medium text-slate-700">{review.equipment?.equipment_name || 'Cihaz tapılmadı'}</span>
                </div>
                <div className="ml-auto text-[10px] text-slate-300">
                  {new Date(review.created_at).toLocaleDateString('az-AZ')}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default EquipmentReviewsPage;
