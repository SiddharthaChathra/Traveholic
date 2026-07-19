'use client';

import { useState } from 'react';
import { 
  TrendingUp, TrendingDown, AlertTriangle, Info, 
  Calendar, ChevronLeft, ChevronRight, Download,
  Zap, Droplets, Wind, Sun, CloudRain
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const FORECAST_HORIZONS = [7, 30, 90, 180, 365];
const HORIZON_LABELS: Record<number, string> = {
  7: '1 Week',
  30: '1 Month',
  90: '3 Months',
  180: '6 Months',
  365: '1 Year',
};

export function ForecastTab({ 
  transects, 
  selectedTransect, 
  setSelectedTransect 
}: { 
  transects: any[];
  selectedTransect: string | null;
  setSelectedTransect: (id: string | null) => void;
}) {
  const [forecast, setForecast] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  const handleTransectSelect = async (transect: any) => {
    setSelectedTransect(transect.id);
    await loadForecast(transect.id);
  };

  const loadForecast = async (transectId: string) => {
    setLoading(true);
    try {
      // In production, call API
      // const response = await fetch(`/api/v1/ml/forecast/erosion`, { ... })
      
      // Mock data for demo
      setForecast({
        transect_id: transectId,
        forecast_date: new Date().toISOString(),
        horizons: {
          7: { position: 98.5, lower: 97.8, upper: 99.2, confidence: 0.92 },
          30: { position: 97.2, lower: 95.8, upper: 98.6, confidence: 0.85 },
          90: { position: 95.1, lower: 92.5, upper: 97.7, confidence: 0.72 },
          180: { position: 92.8, lower: 88.5, upper: 97.1, confidence: 0.60 },
          365: { position: 89.5, lower: 82.0, upper: 97.0, confidence: 0.45 },
        },
        model_version: 'monsoon_lstm_v1',
      });
    } catch (error) {
      console.error('Failed to load forecast:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!selectedTransect) {
    return (
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-slate-200">
          <h3 className="font-semibold text-slate-800">Erosion Forecast</h3>
          <p className="text-sm text-slate-500">Select a transect to view multi-horizon predictions</p>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-3">
            {transects.map(t => (
              <button
                key={t.id}
                onClick={() => handleTransectSelect(t)}
                className="w-full p-3 rounded-lg border border-slate-200 hover:border-primary-300 hover:bg-primary-50 transition-colors text-left"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-800">{t.name}</p>
                    <p className="text-xs text-slate-500">{t.beach_name}</p>
                  </div>
                  <TrendingUp className="w-5 h-5 text-primary-600" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const transect = transects.find(t => t.id === selectedTransect);

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-slate-800">{transect?.name}</h3>
            <p className="text-sm text-slate-500">{transect?.beach_name} • Multi-horizon LSTM forecast</p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="text-sm border border-slate-300 rounded px-2 py-1"
            >
              <option value="7d">7 Days</option>
              <option value="30d">30 Days</option>
              <option value="90d">90 Days</option>
              <option value="1y">1 Year</option>
            </select>
            <button className="p-2 rounded-lg hover:bg-slate-100" title="Download forecast">
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Horizon Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {FORECAST_HORIZONS.map(h => {
            const data = forecast?.horizons?.[h];
            if (!data) return null;
            
            const change = data.position - (transect?.baseline_distance_m || 100);
            const isEroding = change < 0;
            
            return (
              <div key={h} className="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-slate-500 uppercase">{HORIZON_LABELS[h]}</span>
                  <span className={cn(
                    'px-1.5 py-0.5 rounded text-xs font-medium',
                    data.confidence > 0.8 ? 'bg-green-100 text-green-700' :
                    data.confidence > 0.6 ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  )}>
                    {Math.round(data.confidence * 100)}%
                  </span>
                </div>
                <div className="text-2xl font-bold text-slate-800 mb-1">
                  {data.position.toFixed(1)}m
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  {isEroding ? <TrendingDown className="w-3 h-3 text-red-500" /> : <TrendingUp className="w-3 h-3 text-green-500" />}
                  <span>{Math.abs(change).toFixed(1)}m from baseline</span>
                </div>
                <div className="mt-2 text-xs text-slate-500">
                  Range: {data.lower.toFixed(1)}m - {data.upper.toFixed(1)}m
                </div>
              </div>
            );
          })}
        </div>

        {/* Forecast Chart */}
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <h4 className="font-medium text-slate-800 mb-4">Position Forecast</h4>
          <div className="h-64">
            <ForecastChart 
              forecast={forecast} 
              baseline={transect?.baseline_distance_m || 100}
            />
          </div>
        </div>

        {/* Monsoon Context */}
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <h4 className="font-medium text-slate-800 mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            Monsoon Season Context
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-3 rounded-lg bg-blue-50">
              <Wind className="w-6 h-6 text-blue-600 mx-auto mb-1" />
              <p className="text-sm font-medium text-blue-800">SW Monsoon</p>
              <p className="text-xs text-blue-600">Jun-Sep peak erosion</p>
            </div>
            <div className="p-3 rounded-lg bg-green-50">
              <Sun className="w-6 h-6 text-green-600 mx-auto mb-1" />
              <p className="text-sm font-medium text-green-800">Dry Season</p>
              <p className="text-xs text-green-600">Oct-May recovery</p>
            </div>
            <div className="p-3 rounded-lg bg-purple-50">
              <Droplets className="w-6 h-6 text-purple-600 mx-auto mb-1" />
              <p className="text-sm font-medium text-purple-800">Rainfall</p>
              <p className="text-xs text-purple-600">Drives surge & runoff</p>
            </div>
            <div className="p-3 rounded-lg bg-orange-50">
              <CloudRain className="w-6 h-6 text-orange-600 mx-auto mb-1" />
              <p className="text-sm font-medium text-orange-800">Cyclones</p>
              <p className="text-xs text-orange-600">Oct-Nov secondary peak</p>
            </div>
          </div>
        </div>

        {/* Model Info */}
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <h4 className="font-medium text-slate-800 mb-3">Model Information</h4>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <dt className="text-slate-500">Model</dt>
            <dd className="font-mono text-slate-800">Monsoon LSTM v1.0</dd>
            <dt className="text-slate-500">Input Features</dt>
            <dd className="font-mono text-slate-800">Shoreline + Wave + Rain + Wind + Tide</dd>
            <dt className="text-slate-500">Sequence Length</dt>
            <dd className="font-mono text-slate-800">24 months</dd>
            <dt className="text-slate-500">Last Retrained</dt>
            <dd className="font-mono text-slate-800">2024-01-15</dd>
            <dt className="text-slate-500">Validation MAE (30d)</dt>
            <dd className="font-mono text-slate-800">1.2 m</dd>
            <dt className="text-slate-500">Monsoon MAE (30d)</dt>
            <dd className="font-mono text-slate-800">2.8 m</dd>
          </dl>
        </div>
      </div>
    </div>
  );
}

function ForecastChart({ forecast, baseline }: { forecast: any; baseline: number }) {
  if (!forecast?.horizons) return <div className="h-full flex items-center justify-center text-slate-500">No forecast data</div>;

  const chartData = [
    { horizon: 'Baseline', position: baseline, lower: baseline, upper: baseline, type: 'baseline' },
    ...Object.entries(forecast.horizons).map(([h, d]: [string, any]) => ({
      horizon: HORIZON_LABELS[parseInt(h)],
      position: d.position,
      lower: d.lower,
      upper: d.upper,
      type: 'forecast',
    })),
  ];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="horizon" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} />
        <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} />
        <Tooltip 
          formatter={(value: number) => [value.toFixed(1) + ' m', 'Shoreline Position']}
          labelFormatter={(label) => label}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="position"
          stroke="#0ea5e9"
          strokeWidth={2}
          dot={{ fill: '#0ea5e9', strokeWidth: 2, r: 4 }}
          name="Forecast"
        />
        <Line
          type="monotone"
          dataKey="lower"
          stroke="#f59e0b"
          strokeWidth={1}
          strokeDasharray="5 5"
          dot={false}
          name="Lower Bound"
        />
        <Line
          type="monotone"
          dataKey="upper"
          stroke="#f59e0b"
          strokeWidth={1}
          strokeDasharray="5 5"
          dot={false}
          name="Upper Bound"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}