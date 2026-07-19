'use client';

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell } from 'recharts';
import { getRiskColor } from '@/lib/utils';

interface RiskHeatmapProps {
  data: Array<{
    name: string;
    rank: number;
    score: number;
    category: string;
  }>;
}

export function RiskHeatmap({ data }: RiskHeatmapProps) {
  if (!data || data.length === 0) return <div className="h-full flex items-center justify-center text-slate-500">No risk data</div>;

  const chartData = [...data].reverse().map(d => ({
    name: d.name.length > 20 ? d.name.substring(0, 18) + '…' : d.name,
    score: d.score * 100,
    category: d.category,
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={chartData} layout="vertical" margin={{ top: 10, right: 30, left: 120, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} />
        <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} width={110} />
        <Tooltip 
          formatter={(value: number) => [value.toFixed(1) + '%', 'Risk Score']}
          labelFormatter={(label) => label}
        />
        <Legend />
        <Bar dataKey="score" name="Composite Risk" radius={[0, 4, 4, 0]}>
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={getRiskColor(entry.category).replace('bg-', '').replace(' text-', '').replace(' border-', '')} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}