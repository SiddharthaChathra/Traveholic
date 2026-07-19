// API Client
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(error.detail || `HTTP ${response.status}`);
  }
  
  return response.json();
}

// Transects API
export const transectsApi = {
  list: (params?: { beach_name?: string; page?: number; page_size?: number }) => 
    fetchApi<any[]>(`/api/v1/transects?${new URLSearchParams(params as any).toString()}`),
  
  get: (id: string) => 
    fetchApi<any>(`/api/v1/transects/${id}`),
  
  getShorelines: (id: string, params?: any) => 
    fetchApi<any[]>(`/api/v1/transects/${id}/shorelines?${new URLSearchParams(params).toString()}`),
  
  getPredictions: (id: string, params?: any) => 
    fetchApi<any[]>(`/api/v1/transects/${id}/predictions?${new URLSearchParams(params).toString()}`),
  
  getRisk: (id: string, date?: string) => 
    fetchApi<any>(`/api/v1/transects/${id}/risk${date ? `?date=${date}` : ''}`),
  
  getExplanation: (id: string) => 
    fetchApi<any>(`/api/v1/transects/${id}/explain`),
};

// Sensors API
export const sensorsApi = {
  list: (params?: { type?: string; status?: string; transect_id?: string; page?: number; page_size?: number }) => 
    fetchApi<any[]>(`/api/v1/sensors?${new URLSearchParams(params as any).toString()}`),
  
  get: (id: string) => 
    fetchApi<any>(`/api/v1/sensors/${id}`),
  
  getReadings: (id: string, params?: { start_time?: string; end_time?: string; limit?: number }) => 
    fetchApi<any[]>(`/api/v1/sensors/${id}/readings?${new URLSearchParams(params as any).toString()}`),
  
  getLatest: (id: string) => 
    fetchApi<any>(`/api/v1/sensors/${id}/latest`),
  
  getSummary: () => 
    fetchApi<any>(`/api/v1/sensors/stats/summary`),
};

// Crowdsource API
export const crowdsourceApi = {
  list: (params?: { status?: string; start_date?: string; end_date?: string; user_id?: string; page?: number; page_size?: number }) => 
    fetchApi<any[]>(`/api/v1/crowdsource/photos?${new URLSearchParams(params as any).toString()}`),
  
  get: (id: string) => 
    fetchApi<any>(`/api/v1/crowdsource/photos/${id}`),
  
  upload: (data: FormData) => 
    fetch(`${API_BASE}/api/v1/crowdsource/upload`, {
      method: 'POST',
      body: data,
    }).then(res => res.json()),
  
  validate: (id: string, data: { status?: string; validation_notes?: string; shoreline_geojson?: any }) => 
    fetchApi<any>(`/api/v1/crowdsource/photos/${id}/validate`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  getStats: () => 
    fetchApi<any>(`/api/v1/crowdsource/stats`),
};

// Alerts API
export const alertsApi = {
  list: (params?: { type?: string; severity?: string; acknowledged?: boolean; transect_id?: string; start_date?: string; end_date?: string; page?: number; page_size?: number }) => 
    fetchApi<any[]>(`/api/v1/alerts?${new URLSearchParams(params as any).toString()}`),
  
  get: (id: string) => 
    fetchApi<any>(`/api/v1/alerts/${id}`),
  
  acknowledge: (id: string, acknowledgedBy: string) => 
    fetchApi<any>(`/api/v1/alerts/${id}/acknowledge`, {
      method: 'POST',
      body: JSON.stringify({ acknowledged_by: acknowledgedBy }),
    }),
  
  getStats: () => 
    fetchApi<any>(`/api/v1/alerts/stats`),
};

// ML API
export const mlApi = {
  extractShoreline: (data: { image_data: string; transect_id: string }) => 
    fetchApi<any>(`/api/v1/ml/shoreline/extract`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  fuseSensorData: (transectId: string, observations: any[]) => 
    fetchApi<any>(`/api/v1/ml/sensor/fuse`, {
      method: 'POST',
      body: JSON.stringify({ transect_id: transectId, observations }),
    }),
  
  forecastErosion: (data: { 
    transect_id: string; 
    shoreline_history: number[]; 
    exog_history: number[][]; 
    dates: string[]; 
  }) => 
    fetchApi<any>(`/api/v1/ml/forecast/erosion`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  explainBehavior: (transectId: string, shorelineSeries: number[]) => 
    fetchApi<any>(`/api/v1/ml/xai/behavior`, {
      method: 'POST',
      body: JSON.stringify({ transect_id: transectId, shoreline_series: shorelineSeries }),
    }),
  
  explainRisk: (transectId: string, riskFeatures: any) => 
    fetchApi<any>(`/api/v1/ml/xai/risk`, {
      method: 'POST',
      body: JSON.stringify({ transect_id: transectId, risk_features: riskFeatures }),
    }),
  
  getLatestPredictions: () => 
    fetchApi<any[]>(`/api/v1/ml/predictions/latest`),
};

// Risk API
export const riskApi = {
  compute: (transectId: string, physicalData: any, socioEconomicData: any) => 
    fetchApi<any>(`/api/v1/risk/compute`, {
      method: 'POST',
      body: JSON.stringify({ transect_id: transectId, physical_data: physicalData, socio_economic_data: socioEconomicData }),
    }),
  
  getAllLatest: () => 
    fetchApi<any[]>(`/api/v1/risk/all-latest`),
  
  getTransect: (id: string) => 
    fetchApi<any>(`/api/v1/risk/${id}`),
};

// Dashboard API
export const dashboardApi = {
  getStats: () => 
    fetchApi<any>(`/api/v1/dashboard/stats`),
  
  getTransectsGeojson: () => 
    fetchApi<any>(`/api/v1/dashboard/map/transects`),
  
  getErosionRates: (params?: { transect_id?: string; days?: number }) => 
    fetchApi<any>(`/api/v1/dashboard/charts/erosion-rates?${new URLSearchParams(params as any).toString()}`),
  
  getRiskTrends: (params?: { transect_id?: string; days?: number }) => 
    fetchApi<any>(`/api/v1/dashboard/charts/risk-trends?${new URLSearchParams(params as any).toString()}`),
  
  getRecentActivity: (limit?: number) => 
    fetchApi<any[]>(`/api/v1/dashboard/recent-activity?limit=${limit || 20}`),
};