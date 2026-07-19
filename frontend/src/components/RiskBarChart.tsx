'use client';

import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, Cell 
} from 'recharts';
import { cn, getRiskColor } from '@/lib/utils';

interface RiskBarChartProps {
  data: Array<{
    name: string;
    rank: number;
    score: number;
    category: string;
  }>;
}

export function RiskBarChart({ data }: RiskBarChartProps) {
  const chartData = data.reverse().map(d => ({
    ...d,
    name: d.name.length > 20 ? d.name.substring(0, 18) + '…' : d.name,
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={chartData} layout="vertical" margin={{ top: 10, right: 30, left: 120, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} />
        <YAxis 
          type="category" 
          dataKey="name" 
          tick={{ fontSize: 11, fill: '#64748b' }} 
          axisLine={false}
          width={110}
        />
        <Tooltip 
          formatter={(value: number) => [(value * 100).toFixed(1) + '%', 'Risk Score']}
          labelFormatter={(label) => label}
        />
        <Legend />
        <Bar 
          dataKey="score" 
          name="Composite Risk" 
          radius={[0, 4, 4, 0]}
        >
          {chartData.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={getRiskColor(entry.category).replace('bg-', '').replace(' text-', '').replace(' border-', '').split(' ')[0] + '-500'}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}