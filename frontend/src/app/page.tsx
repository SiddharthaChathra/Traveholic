'use client';

import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, LayerGroup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { 
  MapPin, AlertTriangle, Waves, Camera, 
  Smartphone, X, ChevronLeft, ChevronRight,
  Info, AlertCircle, CheckCircle, 
  Clock, Map, BarChart2, Settings,
  Zap, Droplets, Wind, Sun, CloudRain,
  Menu, Bell, RefreshCw, Layers, TrendingUp, Users
} from 'lucide-react';
import { TransectDetailPanel } from '@/components/TransectDetailPanel';
import { AlertPanel } from '@/components/AlertPanel';
import { ForecastChart } from '@/components/ForecastChart';
import { RiskHeatmap } from '@/components/RiskHeatmap';
import { CrowdsourceTab } from '@/components/CrowdsourceTab';
import { XAITab } from '@/components/XAIExplanation';
import { OverviewTab } from '@/components/OverviewTab';
import { ForecastTab } from '@/components/ForecastTab';
import { RiskTab } from '@/components/RiskTab';
import { XAITab as XAITabComponent } from '@/components/XAITab';
import { useStore } from '@/lib/store';
import { cn } from '@/lib/utils';

/* Fix Leaflet default icon */
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const BEACH_COLORS: Record<string, string> = {
  'Mangala Beach': '#0ea5e9',
  'Someshwar Beach': '#14b8a6',
  'Tannirbhavi Beach': '#f97316',
  'Panambur Beach': '#8b5cf6',
  'Ullal Beach': '#ef4444',
};

const RISK_COLORS: Record<string, string> = {
  'critical': '#ef4444',
  'very_high': '#f97316',
  'high': '#f59e0b',
  'moderate': '#eab308',
  'low': '#22c55e',
  'very_low': '#10b981',
};

export default function Dashboard() {
  const [map, setMap] = useState<L.Map | null>(null);
const mapRef = useRef<L.Map | null>(null);
  const [selectedTransect, setSelectedTransect] = useState<string | null>(null);
  const [showAlerts, setShowAlerts] = useState(true);
  const [showRiskHeatmap, setShowRiskHeatmap] = useState(false);
  const [showCrowdsource, setShowCrowdsource] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'forecast' | 'risk' | 'xai' | 'crowdsource'>('overview');
  
  const { 
    transects, 
    sensors, 
    alerts, 
    riskScores, 
    predictions,
    crowdsourcePhotos,
    loading,
    fetchData,
    wsConnected,
  } = useStore();

  // Fetch data on mount
  useEffect(() => {
    fetchData();
    
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Group transects by beach
  const transectsByBeach = transects.reduce((acc, t) => {
    if (!acc[t.beach_name]) acc[t.beach_name] = [];
    acc[t.beach_name].push(t);
    return acc;
  }, {} as Record<string, typeof transects>);

  // Get latest risk for each transect
  const getLatestRisk = (transectId: string) => {
    return riskScores.find(r => r.transect_id === transectId);
  };

  // Get active alerts for transect
  const getActiveAlerts = (transectId: string) => {
    return alerts.filter(a => a.transect_id === transectId && !a.acknowledged);
  };

  const handleMapClick = (e: L.LeafletMouseEvent) => {
    setSelectedTransect(null);
  };

  if (loading && transects.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-slate-600">Loading coastal data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-full mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-slate-100"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <Waves className="w-5 h-5 text-primary-600" />
                </div>
                <span className="font-bold text-xl text-slate-800">CEIP</span>
              </div>
              <span className="hidden sm:block text-slate-400">|</span>
              <span className="text-sm text-slate-600">Mangalore Coast Monitoring</span>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Connection Status */}
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${wsConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                <span className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                {wsConnected ? 'Live' : 'Offline'}
              </div>
              
              {/* Alert Count */}
              <button
                onClick={() => setShowAlerts(!showAlerts)}
                className="relative p-2 rounded-lg hover:bg-slate-100"
              >
                <Bell className="w-5 h-5 text-slate-600" />
                {alerts.filter(a => !a.acknowledged).length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {alerts.filter(a => !a.acknowledged).length}
                  </span>
                )}
              </button>
              
              {/* Refresh */}
              <button
                onClick={fetchData}
                disabled={loading}
                className="p-2 rounded-lg hover:bg-slate-100"
              >
                <RefreshCw className={`w-5 h-5 text-slate-600 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`fixed lg:relative inset-y-0 left-0 z-50 w-80 bg-white border-r border-slate-200 transform transition-transform duration-300
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
        >
          {/* Mobile close */}
          <div className="lg:hidden p-4 border-b border-slate-200 flex justify-end">
            <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-lg hover:bg-slate-100">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="h-full flex flex-col overflow-y-auto">
            {/* Tabs */}
            <div className="p-4 border-b border-slate-200">
              <div className="flex gap-1 overflow-x-auto pb-2">
                {[
                  { id: 'overview', label: 'Overview', icon: Map },
                  { id: 'forecast', label: 'Forecast', icon: TrendingUp },
                  { id: 'risk', label: 'Risk', icon: AlertTriangle },
                  { id: 'xai', label: 'Explain', icon: Info },
                  { id: 'crowdsource', label: 'Community', icon: Users },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors
                      ${activeTab === tab.id 
                        ? 'bg-primary-100 text-primary-700' 
                        : 'text-slate-600 hover:bg-slate-100'}`}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {activeTab === 'overview' && (
                <OverviewTab 
                  transectsByBeach={transectsByBeach}
                  selectedTransect={selectedTransect}
                  setSelectedTransect={setSelectedTransect}
                  getLatestRisk={getLatestRisk}
                  getActiveAlerts={getActiveAlerts}
                />
              )}
              
              {activeTab === 'forecast' && (
                <ForecastTab 
                  transects={transects}
                  selectedTransect={selectedTransect}
                  setSelectedTransect={setSelectedTransect}
                />
              )}
              
              {activeTab === 'risk' && (
                <RiskTab 
                  transects={transects}
                  riskScores={riskScores}
                  selectedTransect={selectedTransect}
                  setSelectedTransect={setSelectedTransect}
                />
              )}
              
              {activeTab === 'xai' && (
                <XAITabComponent 
                  transects={transects}
                  selectedTransect={selectedTransect}
                />
              )}
              
              {activeTab === 'crowdsource' && (
                <CrowdsourceTab 
                  photos={crowdsourcePhotos}
                />
              )}
            </div>
          </div>
        </aside>

        {/* Map Sidebar Overlay for Mobile */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 z-40 lg:hidden bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Map */}
        <main className="flex-1 relative">
          <MapContainer
            center={[12.9, 74.85]}
            zoom={11}
            ref={mapRef}
            className="h-full w-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              attribution="Tiles &copy; Esri"
            />
            
            {/* Transects */}
            {Object.entries(transectsByBeach).map(([beachName, beachTransects]) => (
              <LayerGroup key={beachName}>
                {beachTransects.map(transect => {
                  const risk = getLatestRisk(transect.id);
                  const activeAlerts = getActiveAlerts(transect.id);
                  const isSelected = selectedTransect === transect.id;
                  
                  const getRiskCategory = (score: number) => {
                    if (score >= 0.7) return 'critical';
                    if (score >= 0.55) return 'high';
                    if (score >= 0.4) return 'moderate';
                    if (score >= 0.25) return 'low';
                    if (score >= 0.1) return 'very_low';
                    return 'very_low';
                  };
                  
                  const riskCategory = risk ? getRiskCategory(risk.composite_score) : 'very_low';
                  
                  return (
                    <CircleMarker
                      key={transect.id}
                      center={[transect.latitude, transect.longitude]}
                      radius={isSelected ? 10 : 8}
                      pathOptions={{
                        color: BEACH_COLORS[beachName] || '#0ea5e9',
                        fillColor: risk ? RISK_COLORS[riskCategory] : '#0ea5e9',
                        fillOpacity: 0.8,
                        weight: isSelected ? 3 : 2,
                        opacity: 1,
                      }}
                    >
                      <Popup>
                        <div className="min-w-[200px]">
                          <h3 className="font-semibold text-slate-800">{transect.name}</h3>
                          <p className="text-sm text-slate-500">{beachName}</p>
                          <div className="mt-2 flex items-center gap-2 text-xs">
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                              risk ? `bg-${riskCategory.replace('_', '-')}-100 text-${riskCategory.replace('_', '-')}-700` 
                              : 'bg-slate-100 text-slate-700'
                            }`}>
                              {risk ? riskCategory.replace('_', ' ') : 'No Data'}
                            </span>
                            {activeAlerts.length > 0 && (
                              <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">
                                {activeAlerts.length} Alert{activeAlerts.length > 1 ? 's' : ''}
                              </span>
                            )}
                          </div>
                        </div>
                      </Popup>
                    </CircleMarker>
                  );
                })}
              </LayerGroup>
            ))}
            
            {/* Sensors */}
            {sensors.map(sensor => (
              <Marker
                key={sensor.id}
                position={[sensor.latitude, sensor.longitude]}
                icon={L.divIcon({
                  className: 'sensor-marker',
                  html: `
                    <div class="w-3 h-3 rounded-full border-2 border-white shadow-lg
                      ${sensor.type === 'tide_gauge' ? 'bg-blue-500' : ''}
                      ${sensor.type === 'wave_buoy' ? 'bg-green-500' : ''}
                      ${sensor.type === 'camera' ? 'bg-purple-500' : ''}
                      ${sensor.type === 'weather' ? 'bg-yellow-500' : ''}
                    "></div>
                  `,
                  iconSize: [12, 12],
                  iconAnchor: [6, 6],
                })}
              >
                <Popup>
                  <div className="min-w-[180px]">
                    <h4 className="font-medium text-slate-800 capitalize">{sensor.name}</h4>
                    <p className="text-xs text-slate-500">{sensor.type.replace('_', ' ')}</p>
                    <p className="text-xs text-slate-400">{sensor.status}</p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          {/* Map Controls Overlay */}
          <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
            <button
              onClick={() => setShowRiskHeatmap(!showRiskHeatmap)}
              className={`p-2 rounded-lg shadow-lg transition-colors ${
                showRiskHeatmap ? 'bg-primary-600 text-white' : 'bg-white text-slate-700'
              }`}
              title="Toggle Risk Heatmap"
            >
              <Layers className="w-5 h-5" />
            </button>
            
            <div className="bg-white rounded-lg shadow-lg p-2 flex items-center gap-2">
              <span className="text-xs text-slate-500">Beaches:</span>
              {Object.keys(transectsByBeach).map(beach => (
                <span
                  key={beach}
                  className="w-3 h-3 rounded-full border border-white shadow-sm"
                  style={{ backgroundColor: BEACH_COLORS[beach] }}
                  title={beach}
                />
              ))}
            </div>
          </div>

          {/* Selected Transect Detail Panel */}
          {selectedTransect && (
            <TransectDetailPanel 
              transect={transects.find(t => t.id === selectedTransect)!}
              risk={getLatestRisk(selectedTransect)}
              alerts={getActiveAlerts(selectedTransect)}
              onClose={() => setSelectedTransect(null)}
            />
          )}

          {/* Alerts Panel */}
          {showAlerts && alerts.filter(a => !a.acknowledged).length > 0 && (
            <AlertPanel 
              alerts={alerts.filter(a => !a.acknowledged).map(a => ({
                id: a.id,
                severity: a.severity as 'critical' | 'warning' | 'info',
                message: a.message,
                created_at: a.created_at,
                data: a.data,
              }))}
              onClose={() => setShowAlerts(false)}
            />
          )}
        </main>
      </div>
    </div>
  );
}