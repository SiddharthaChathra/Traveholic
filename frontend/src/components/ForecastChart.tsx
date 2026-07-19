'use client';

import { 
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, AreaChart, Area
} from 'recharts';

interface ForecastChartProps {
  forecast: any;
  baseline: number;
}

export function ForecastChart({ forecast, baseline }: ForecastChartProps) {
  if (!forecast?.horizons) return <div className="h-full flex items-center justify-center text-slate-500">No forecast data</div>;

  const chartData = [
    { horizon: 'Baseline', position: baseline, lower: baseline, upper: baseline, type: 'baseline' },
    ...Object.entries(forecast.horizons).map(([h, d]: [string, any]) => ({
      horizon: h === '7' ? '1 Week' : h === '30' ? '1 Month' : h === '90' ? '3 Months' : h === '180' ? '6 Months' : '1 Year',
      position: d.position,
      lower: d.lower,
      upper: d.upper,
      confidence: d.confidence,
      type: 'forecast',
    })),
  ];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="confidenceGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis 
          dataKey="horizon" 
          tick={{ fontSize: 11, fill: '#64748b' }} 
          axisLine={{ stroke: '#e2e8f0' }} 
        />
        <YAxis 
          tick={{ fontSize: 11, fill: '#64748b' }} 
          axisLine={false} 
        />
        <Tooltip 
          formatter={(value: number) => [value.toFixed(1) + ' m', 'Shoreline Position']}
          labelFormatter={(label) => label}
        />
        <Legend />
        <Area
          type="monotone"
          dataKey="upper"
          stroke="#f59e0b"
          strokeWidth={1}
          strokeDasharray="5 5"
          fillOpacity={0}
          name="Upper Bound"
        />
        <Area
          type="monotone"
          dataKey="lower"
          stroke="#f59e0b"
          strokeWidth={1}
          strokeDasharray="5 5"
          fillOpacity={0}
          name="Lower Bound"
        />
        <Area
          type="monotone"
          dataKey="position"
          stroke="#0ea5e9"
          strokeWidth={2}
          fill="url(#confidenceGradient)"
          name="Forecast"
        >
          <Tooltip />
        </Area>
      </AreaChart>
    </ResponsiveContainer>
  );
}