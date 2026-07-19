import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { transectsApi, sensorsApi, alertsApi, riskApi, mlApi, crowdsourceApi, dashboardApi } from '@/lib/api';

interface Transect {
  id: string;
  name: string;
  geometry_wkt: string;
  latitude: number;
  longitude: number;
  beach_name: string;
  baseline_distance_m: number;
  created_at: string;
}

interface Sensor {
  id: string;
  transect_id: string | null;
  type: string;
  name: string;
  latitude: number;
  longitude: number;
  status: string;
  config: Record<string, any>;
  last_seen: string | null;
  created_at: string;
}

interface Alert {
  id: string;
  transect_id: string;
  user_id: string | null;
  type: string;
  severity: string;
  message: string;
  data: Record<string, any>;
  acknowledged: boolean;
  acknowledged_by: string | null;
  acknowledged_at: string | null;
  created_at: string;
}

interface RiskScore {
  id: string;
  transect_id: string;
  date: string;
  erosion_risk: number;
  population_exposure: number;
  infrastructure_exposure: number;
  economic_value: number;
  composite_score: number;
  rank: number;
  factors: Record<string, any>;
  created_at: string;
}

interface ErosionPrediction {
  id: string;
  transect_id: string;
  prediction_date: string;
  horizon_days: number;
  predicted_position: number;
  lower_bound: number;
  upper_bound: number;
  model_version: string;
  confidence: number;
  features: Record<string, any>;
  created_at: string;
}

interface CrowdsourcePhoto {
  id: string;
  user_id: string;
  image_url: string;
  thumbnail_url: string | null;
  latitude: number;
  longitude: number;
  altitude: number | null;
  heading: number | null;
  pitch: number | null;
  taken_at: string;
  uploaded_at: string;
  status: string;
  shoreline_geojson: Record<string, any> | null;
  validation_notes: string | null;
  validated_by: string | null;
  validated_at: string | null;
}

interface DashboardStats {
  total_transects: number;
  active_sensors: number;
  total_photos: number;
  pending_photos: number;
  active_alerts: number;
  critical_alerts: number;
  avg_erosion_rate: number;
}

interface MapLayer {
  type: string;
  data: any;
  style: any;
}

interface AppState {
  // Data
  transects: Transect[];
  sensors: Sensor[];
  alerts: Alert[];
  riskScores: RiskScore[];
  predictions: ErosionPrediction[];
  crowdsourcePhotos: CrowdsourcePhoto[];
  dashboardStats: DashboardStats | null;
  mapLayers: MapLayer[];
  
  // UI State
  loading: boolean;
  wsConnected: boolean;
  
  // Actions
  fetchData: () => Promise<void>;
  fetchTransects: () => Promise<void>;
  fetchSensors: () => Promise<void>;
  fetchAlerts: () => Promise<void>;
  fetchRiskScores: () => Promise<void>;
  fetchPredictions: () => Promise<void>;
  fetchCrowdsourcePhotos: () => Promise<void>;
  fetchDashboardStats: () => Promise<void>;
  
  // WebSocket
  connectWebSocket: () => void;
  disconnectWebSocket: () => void;
}

export const useStore = create<AppState>()(
  devtools(
    (set, get) => ({
      // Initial state
      transects: [],
      sensors: [],
      alerts: [],
      riskScores: [],
      predictions: [],
      crowdsourcePhotos: [],
      dashboardStats: null,
      mapLayers: [],
      loading: true,
      wsConnected: false,
      
      // Fetch all data
      fetchData: async () => {
        set({ loading: true });
        try {
          await Promise.all([
            get().fetchTransects(),
            get().fetchSensors(),
            get().fetchAlerts(),
            get().fetchRiskScores(),
            get().fetchPredictions(),
            get().fetchCrowdsourcePhotos(),
            get().fetchDashboardStats(),
          ]);
        } catch (error) {
          console.error('Failed to fetch data:', error);
        } finally {
          set({ loading: false });
        }
      },
      
      // Individual fetch functions
      fetchTransects: async () => {
        try {
          const data = await transectsApi.list();
          set({ transects: data });
        } catch (error) {
          console.error('Failed to fetch transects:', error);
        }
      },
      
      fetchSensors: async () => {
        try {
          const data = await sensorsApi.list();
          set({ sensors: data });
        } catch (error) {
          console.error('Failed to fetch sensors:', error);
        }
      },
      
      fetchAlerts: async () => {
        try {
          const data = await alertsApi.list({ acknowledged: false, page_size: 50 });
          set({ alerts: data });
        } catch (error) {
          console.error('Failed to fetch alerts:', error);
        }
      },
      
      fetchRiskScores: async () => {
        try {
          const data = await riskApi.getAllLatest();
          set({ riskScores: data });
        } catch (error) {
          console.error('Failed to fetch risk scores:', error);
        }
      },
      
      fetchPredictions: async () => {
        try {
          const data = await mlApi.getLatestPredictions();
          set({ predictions: data });
        } catch (error) {
          console.error('Failed to fetch predictions:', error);
        }
      },
      
      fetchCrowdsourcePhotos: async () => {
        try {
          const data = await crowdsourceApi.list({ page_size: 20 });
          set({ crowdsourcePhotos: data });
        } catch (error) {
          console.error('Failed to fetch crowdsource photos:', error);
        }
      },
      
      fetchDashboardStats: async () => {
        try {
          const data = await dashboardApi.getStats();
          set({ dashboardStats: data });
        } catch (error) {
          console.error('Failed to fetch dashboard stats:', error);
        }
      },
      
      // WebSocket
      connectWebSocket: () => {
        // In production, connect to WebSocket server
        // const ws = new WebSocket(`${import.meta.env.VITE_WS_URL}/api/v1/alerts/stream`);
        // ws.onopen = () => set({ wsConnected: true });
        // ws.onclose = () => set({ wsConnected: false });
        // ws.onmessage = (event) => {
        //   const msg = JSON.parse(event.data);
        //   if (msg.type === 'new_alert') {
        //     set(state => ({ alerts: [msg.payload, ...state.alerts] }));
        //   }
        // };
        set({ wsConnected: true });
      },
      
      disconnectWebSocket: () => {
        set({ wsConnected: false });
      },
    }),
    { name: 'ceip-store' }
  )
);

// Selectors for common derived state
export const useActiveAlerts = () => useStore(state => 
  state.alerts.filter(a => !a.acknowledged)
);

export const useCriticalAlerts = () => useStore(state =>
  state.alerts.filter(a => !a.acknowledged && a.severity === 'critical')
);

export const useLatestRiskScores = () => useStore(state => {
  const latest: Record<string, typeof state.riskScores[0]> = {};
  for (const risk of state.riskScores) {
    if (!latest[risk.transect_id] || new Date(risk.date) > new Date(latest[risk.transect_id].date)) {
      latest[risk.transect_id] = risk;
    }
  }
  return Object.values(latest);
});

export const useTransectsByBeach = () => useStore(state => {
  const byBeach: Record<string, typeof state.transects> = {};
  for (const t of state.transects) {
    if (!byBeach[t.beach_name]) byBeach[t.beach_name] = [];
    byBeach[t.beach_name].push(t);
  }
  return byBeach;
});