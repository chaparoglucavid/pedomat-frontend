import React, { useEffect, useState } from 'react';
import {
  MapPin, Wifi, WifiOff, AlertTriangle, Monitor, Package,
  Navigation, ZoomIn, ZoomOut, Maximize2, Eye
} from 'lucide-react';
import { getStatusColor, getStatusLabel, equipmentStocks, getBrandById, getCategoryById, normalizeEquipmentStatus } from '@/data/mockData';
import type { Equipment } from '@/data/mockData';
import Modal from './Modal';
import { api } from '@/lib/api';
import { AlertCircle } from 'lucide-react';

const MapView: React.FC = () => {
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.equipments();
        const mapped = (Array.isArray(data) ? data : []).map((e: any) => ({
          id: e.id,
          number: e.equipment_number,
          name: e.equipment_name,
          status: e.equipment_status as Equipment['status'],
          current_ped_count: e.current_ped_count ?? 0,
          longitude: e.longitude,
          latitude: e.latitude,
          address: e.current_address,
        })) as Equipment[];
        setEquipmentList(mapped);
        setError('');
      } catch {
        setEquipmentList([]);
        setError('Cihazlar yüklənə bilmədi');
      }
      setLoading(false);
    };
    load();
  }, []);

  const filtered = statusFilter === 'all' ? equipmentList : equipmentList.filter(e => e.status === statusFilter);

  // Map bounds for Baku area
  const mapBounds = {
    minLat: 40.35, maxLat: 40.60,
    minLng: 49.60, maxLng: 50.00,
  };

  const latToY = (lat: number) => ((mapBounds.maxLat - lat) / (mapBounds.maxLat - mapBounds.minLat)) * 100;
  const lngToX = (lng: number) => ((lng - mapBounds.minLng) / (mapBounds.maxLng - mapBounds.minLng)) * 100;

  const getMarkerColor = (eq: Equipment) => {
    if (eq.status === 'active') {
      if (eq.current_ped_count < 20) return 'bg-amber-500 border-amber-300 shadow-amber-500/40';
      return 'bg-emerald-500 border-emerald-300 shadow-emerald-500/40';
    }
    if (eq.status === 'offline') return 'bg-red-500 border-red-300 shadow-red-500/40';
    return 'bg-amber-500 border-amber-300 shadow-amber-500/40';
  };

  const getMarkerPulse = (eq: Equipment) => {
    if (eq.status === 'active' && eq.current_ped_count >= 20) return 'animate-pulse';
    return '';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Cihaz Xəritəsi</h2>
          <p className="text-sm text-slate-400">Bütün dispenser cihazlarının canlı xəritə görünüşü</p>
        </div>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
          >
            <option value="all">Bütün cihazlar ({equipmentList.length})</option>
            <option value="active">Aktiv ({equipmentList.filter(e => e.status === 'active').length})</option>
            <option value="deactive">Deaktiv ({equipmentList.filter(e => e.status === 'deactive').length})</option>
            <option value="under_repair">Təmirdə ({equipmentList.filter(e => e.status === 'under_repair').length})</option>
            <option value="maintenance">Baxımda ({equipmentList.filter(e => e.status === 'maintenance').length})</option>
            <option value="offline">Oflayn ({equipmentList.filter(e => e.status === 'offline').length})</option>
            <option value="broken">Xarab ({equipmentList.filter(e => e.status === 'broken').length})</option>
          </select>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500" />
          <span className="text-xs text-slate-600">Aktiv (stok var)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-amber-500" />
          <span className="text-xs text-slate-600">Az stok / Xarab</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span className="text-xs text-slate-600">Oflayn</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Area */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="relative w-full" style={{ paddingBottom: '65%' }}>
            {/* Map background */}
            <div className="absolute inset-0 bg-gradient-to-br from-sky-50 via-blue-50 to-cyan-50">
              {/* Grid lines */}
              <svg className="absolute inset-0 w-full h-full opacity-10">
                {[...Array(20)].map((_, i) => (
                  <React.Fragment key={i}>
                    <line x1={`${i * 5}%`} y1="0" x2={`${i * 5}%`} y2="100%" stroke="#0099CC" strokeWidth="0.5" />
                    <line x1="0" y1={`${i * 5}%`} x2="100%" y2={`${i * 5}%`} stroke="#0099CC" strokeWidth="0.5" />
                  </React.Fragment>
                ))}
              </svg>

              {/* Caspian Sea hint */}
              <div className="absolute right-0 top-0 bottom-0 w-1/5 bg-gradient-to-l from-blue-200/30 to-transparent" />

              {/* Map label */}
              <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm">
                <p className="text-xs font-semibold text-slate-700">Bakı və ətrafı</p>
                <p className="text-[10px] text-slate-400">OpenStreetMap</p>
              </div>

              {/* Equipment markers */}
              {filtered.map((eq) => {
                const x = lngToX(eq.longitude);
                const y = latToY(eq.latitude);
                const isSelected = selectedEquipment?.id === eq.id;
                const isHovered = hoveredId === eq.id;

                return (
                  <div
                    key={eq.id}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10 cursor-pointer"
                    style={{ left: `${x}%`, top: `${y}%` }}
                    onClick={() => setSelectedEquipment(eq)}
                    onMouseEnter={() => setHoveredId(eq.id)}
                    onMouseLeave={() => setHoveredId(null)}
                  >
                    {/* Pulse ring */}
                    <div className={`absolute inset-0 rounded-full ${getMarkerColor(eq)} opacity-30 ${getMarkerPulse(eq)}`}
                      style={{ transform: 'scale(2.5)', zIndex: -1 }}
                    />
                    {/* Marker */}
                    <div className={`w-5 h-5 rounded-full border-2 ${getMarkerColor(eq)} shadow-lg transition-transform ${
                      isSelected || isHovered ? 'scale-150' : 'scale-100'
                    }`} />

                    {/* Tooltip */}
                    {(isSelected || isHovered) && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-white rounded-xl shadow-xl border border-slate-200 p-3 min-w-[180px] z-50">
                        <p className="font-semibold text-slate-800 text-xs">{eq.name}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{eq.number}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${getStatusColor(eq.status)}`}>
                            {getStatusLabel(eq.status)}
                          </span>
                          <span className="text-[10px] font-bold text-slate-700">{eq.current_ped_count} ped</span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                          <MapPin size={8} /> {eq.address}
                        </p>
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 bg-white border-r border-b border-slate-200 rotate-45" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Equipment List */}
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-800">Cihaz Siyahısı</h3>
            <p className="text-xs text-slate-400">{filtered.length} cihaz göstərilir</p>
          </div>
          <div className="max-h-[500px] overflow-y-auto">
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="p-3 border-b border-slate-50">
                  <div className="h-4 w-40 bg-slate-100 rounded animate-pulse" />
                  <div className="mt-2 h-3 w-24 bg-slate-100 rounded animate-pulse" />
                </div>
              ))
            ) : filtered.map((eq) => (
              <div
                key={eq.id}
                className={`flex items-center gap-3 p-3 border-b border-slate-50 cursor-pointer transition-colors ${
                  selectedEquipment?.id === eq.id ? 'bg-cyan-50' : 'hover:bg-slate-50'
                }`}
                onClick={() => setSelectedEquipment(eq)}
              >
                <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                  eq.status === 'active' ? (eq.current_ped_count < 20 ? 'bg-amber-500' : 'bg-emerald-500') :
                  eq.status === 'offline' ? 'bg-red-500' : 'bg-amber-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 truncate">{eq.name}</p>
                  <p className="text-[10px] text-slate-400">{eq.number} — {eq.current_ped_count} ped</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); setSelectedEquipment(eq); setShowDetailModal(true); }}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-cyan-600 transition-colors"
                >
                  <Eye size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      <Modal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} title={selectedEquipment ? `${selectedEquipment.name}` : ''} size="lg">
        {selectedEquipment && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-xs text-slate-400">Nömrə</p>
                <p className="font-semibold text-slate-700">{selectedEquipment.number}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-xs text-slate-400">Status</p>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-lg ${getStatusColor(selectedEquipment.status)}`}>
                  {getStatusLabel(selectedEquipment.status)}
                </span>
              </div>
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-xs text-slate-400">Stok</p>
                <p className="font-semibold text-slate-700">{selectedEquipment.current_ped_count} ped</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-xs text-slate-400">Koordinatlar</p>
                <p className="font-semibold text-slate-700 text-xs">{selectedEquipment.latitude.toFixed(4)}, {selectedEquipment.longitude.toFixed(4)}</p>
              </div>
            </div>
            <div className="bg-slate-50 rounded-xl p-3">
              <p className="text-xs text-slate-400">Ünvan</p>
              <p className="font-semibold text-slate-700 text-sm">{selectedEquipment.address}</p>
            </div>
            <div>
              <h4 className="font-semibold text-slate-700 mb-2 text-sm">Stok Təfərrüatları</h4>
              <div className="space-y-2">
                {equipmentStocks.filter(s => s.equipment_id === selectedEquipment.id).map(stock => (
                  <div key={stock.id} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
                    <span className="text-sm text-slate-600">{getBrandById(stock.brand_id)?.name} — {getCategoryById(stock.category_id)?.name}</span>
                    <span className="text-sm font-bold text-slate-800">{stock.quantity} ədəd</span>
                  </div>
                ))}
                {equipmentStocks.filter(s => s.equipment_id === selectedEquipment.id).length === 0 && (
                  <p className="text-sm text-slate-400 text-center py-3">Stok məlumatı yoxdur</p>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MapView;
