'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { X, AlertTriangle, TrendingUp, TrendingDown, Waves, MapPin, ExternalLink, BarChart2, Info } from 'lucide-react';

/* Fix Leaflet default icon */
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface TransectDetailPanelProps {
  transect: any;
  risk: any | undefined;
  alerts: any[];
  onClose: () => void;
}

export function TransectDetailPanel({ transect, risk, alerts, onClose }: TransectDetailPanelProps) {
  useEffect(() => {
    // Prevent body scroll when panel is open
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const getErosionRate = () => {
    if (!risk) return null;
    return (risk.factors?.erosion_rate?.value || 0).toFixed(2);
  };

  const getTrend = () => {
    if (!risk) return 'stable';
    const rate = risk.factors?.erosion_rate?.value || 0;
    if (rate > 0.5) return 'eroding';
    if (rate < -0.1) return 'accreting';
    return 'stable';
  };

  return (
    <div className="fixed lg:relative inset-y-0 right-0 z-50 w-full lg:w-96 bg-white border-l border-slate-200 shadow-xl transform transition-transform duration-300 lg:translate-x-0 animate-in slide-in-from-right">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-start justify-between sticky top-0 bg-white z-10">
          <div>
            <h3 className="font-semibold text-slate-800">{transect.name}</h3>
            <p className="text-sm text-slate-500">{transect.beach_name}</p>
            <p className="text-xs text-slate-400 mt-1">
              Baseline: {transect.baseline_distance_m}m from reference
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 lg:hidden">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Risk Summary */}
          {risk && (
            <div className={`p-4 rounded-xl border ${risk.composite_score >= 0.7 ? 'bg-red-50 border-red-200' : 
                                                                      risk.composite_score >= 0.4 ? 'bg-amber-50 border-amber-200' : 
                                                                      'bg-green-50 border-green-200'}`}>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-slate-800">Risk Assessment</h4>
              <span className={`px-2 py-1 rounded text-xs font-medium 
                ${risk.composite_score >= 0.7 ? 'bg-red-100 text-red-700' : 
                 risk.composite_score >= 0.4 ? 'bg-amber-100 text-amber-700' : 
                 'bg-green-100 text-green-700'}`}>
                #{risk.rank}
              </span>
            </div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-3xl font-bold text-slate-800">{(risk.composite_score * 100).toFixed(0)}</span>
              <span className="text-slate-500">/ 100</span>
            </div>
            <div className="h-2 bg-slate-200 rounded overflow-hidden">
              <div 
                className="h-full bg-primary-500 rounded transition-all duration-500" 
                style={{ width: `${risk.composite_score * 100}%` }} 
              />
            </div>
            <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
              <div className="text-center">
                <p className="text-slate-500">Erosion Risk</p>
                <p className="font-medium text-red-600">{(risk.erosion_risk * 100).toFixed(0)}%</p>
              </div>
              <div className="text-center">
                <p className="text-slate-500">Population</p>
                <p className="font-medium text-blue-600">{(risk.population_exposure * 100).toFixed(0)}%</p>
              </div>
              <div className="text-center">
                <p className="text-slate-500">Infrastructure</p>
                <p className="font-medium text-purple-600">{(risk.infrastructure_exposure * 100).toFixed(0)}%</p>
              </div>
            </div>
          </div>
          )}

          {/* Active Alerts */}
          {alerts.length > 0 && (
            <div>
              <h4 className="font-medium text-slate-800 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Active Alerts ({alerts.length})
              </h4>
              <div className="space-y-2">
                {alerts.slice(0, 3).map(alert => (
                  <div key={alert.id} className={`p-3 rounded-lg border-l-4 ${alert.severity === 'critical' ? 'bg-red-50 border-red-500' : 'bg-amber-50 border-amber-500'}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-800">{alert.message}</p>
                        <p className="text-xs text-slate-500 mt-1">{new Date(alert.created_at).toLocaleString()}</p>
                      </div>
                      <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${alert.severity === 'critical' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                        {alert.severity}
                      </span>
                    </div>
                  </div>
                ))}
                {alerts.length > 3 && (
                  <button className="w-full text-center text-sm text-primary-600 hover:text-primary-700 py-2">
                    View all {alerts.length} alerts
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-3">
            <StatCard 
              label="Current Position" 
              value={`${transect.baseline_distance_m}m`} 
              icon={<MapPin className="w-5 h-5" />}
              color="bg-blue-100 text-blue-600"
            />
            <StatCard 
              label="Erosion Trend" 
              value={getTrend() === 'eroding' ? 'Eroding ⬇' : getTrend() === 'accreting' ? 'Accreting ⬆' : 'Stable ➡'} 
              icon={getTrend() === 'eroding' ? <TrendingDown className="w-5 h-5" /> : getTrend() === 'accreting' ? <TrendingUp className="w-5 h-5" /> : <Waves className="w-5 h-5" />}
              color={getTrend() === 'eroding' ? 'bg-red-100 text-red-600' : getTrend() === 'accreting' ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-600'}
            />
          </div>

          {/* Mini Map */}
          <div>
            <h4 className="font-medium text-slate-800 mb-3">Location</h4>
            <div className="rounded-lg overflow-hidden border border-slate-200 h-48">
              <MapContainer
                center={[transect.latitude, transect.longitude]}
                zoom={15}
                className="h-full w-full"
                attributionControl={false}
                zoomControl={false}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <CircleMarker
                  center={[transect.latitude, transect.longitude]}
                  radius={8}
                  pathOptions={{
                    color: '#0ea5e9',
                    fillColor: '#0ea5e9',
                    fillOpacity: 0.8,
                    weight: 2,
                  }}
                />
              </MapContainer>
            </div>
            <p className="text-xs text-slate-500 mt-1 text-center">
              {transect.latitude.toFixed(4)}°N, {transect.longitude.toFixed(4)}°E
            </p>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-200 space-y-2">
            <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
              <TrendingUp className="w-4 h-4" />
              View Forecast
            </button>
            <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
              <BarChart2 className="w-4 h-4" />
              Risk Details
            </button>
            <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
              <Info className="w-4 h-4" />
              AI Explanation
            </button>
            <a 
              href={`https://www.google.com/maps/search/?api=1&query=${transect.latitude},${transect.longitude}`}
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Open in Google Maps
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color }: { label: string; value: string; icon: React.ReactNode; color: string }) {
  return (
    <div className="p-3 bg-white rounded-lg border border-slate-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-500 font-medium">{label}</p>
          <p className="text-sm font-bold text-slate-800">{value}</p>
        </div>
        <div className={`p-2 rounded-lg ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}