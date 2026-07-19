'use client';

import { TrendingUp, TrendingDown, AlertTriangle, Users, Building2, DollarSign, Shield, Target, ChevronDown, ChevronUp } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';

export function RiskTab({ 
  transects, 
  selectedTransect, 
  setSelectedTransect,
  riskScores,
}: { 
  transects: any[];
  selectedTransect: string | null;
  setSelectedTransect: (id: string | null) => void;
  riskScores: any[];
}) {
  const [sortBy, setSortBy] = useState<'composite' | 'erosion' | 'population' | 'infra' | 'vulnerability'>('composite');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const sortedTransects = [...transects].sort((a, b) => {
    const riskA = riskScores.find(r => r.transect_id === a.id);
    const riskB = riskScores.find(r => r.transect_id === b.id);
    const valA = riskA?.[sortBy === 'composite' ? 'composite_score' : sortBy] || 0;
    const valB = riskB?.[sortBy === 'composite' ? 'composite_score' : sortBy] || 0;
    return sortDir === 'asc' ? valA - valB : valB - valA;
  });

  const handleTransectClick = (id: string) => {
    setSelectedTransect(selectedTransect === id ? null : id);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-slate-200">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-semibold text-slate-800">Coastal Risk Index</h3>
            <p className="text-sm text-slate-500">MCDA-weighted composite scores across all transects</p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-sm border border-slate-300 rounded px-2 py-1"
            >
              <option value="composite">Composite Score</option>
              <option value="erosion_risk">Erosion Risk</option>
              <option value="population_exposure">Population</option>
              <option value="infrastructure_exposure">Infrastructure</option>
              <option value="social_vulnerability">Vulnerability</option>
            </select>
            <button 
              onClick={() => setSortDir(sortDir === 'asc' ? 'desc' : 'asc')}
              className="p-1 rounded hover:bg-slate-100"
            >
              {sortDir === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Risk Heatmap Chart */}
        <div className="p-4">
          <h4 className="font-medium text-slate-800 mb-3">Risk Ranking</h4>
          <div className="bg-white rounded-lg border border-slate-200 p-4 h-64">
            <RiskBarChart 
              data={sortedTransects.slice(0, 10).map((t, i) => ({
                name: t.name,
                rank: i + 1,
                score: riskScores.find(r => r.transect_id === t.id)?.composite_score || 0,
                category: riskScores.find(r => r.transect_id === t.id)?.risk_category || 'low',
              }))}
            />
          </div>
        </div>

        {/* Transect Risk Cards */}
        <div className="px-4 pb-4 space-y-3">
          {sortedTransects.map((transect, index) => {
            const risk = riskScores.find(r => r.transect_id === transect.id);
            const isSelected = selectedTransect === transect.id;
            
            if (!risk) return null;

            return (
              <RiskCard
                key={transect.id}
                transect={transect}
                risk={risk}
                rank={index + 1}
                isSelected={isSelected}
                onClick={() => handleTransectClick(transect.id)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

function RiskCard({ transect, risk, rank, isSelected, onClick }: { 
  transect: any; 
  risk: any; 
  rank: number;
  isSelected: boolean;
  onClick: () => void;
}) {
  const categoryColors: Record<string, string> = {
    critical: 'bg-red-100 text-red-700 border-red-200',
    very_high: 'bg-orange-100 text-orange-700 border-orange-200',
    high: 'bg-amber-100 text-amber-700 border-amber-200',
    moderate: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    low: 'bg-green-100 text-green-700 border-green-200',
    very_low: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  };

  return (
    <div className={`bg-white rounded-lg border transition-all ${isSelected ? 'border-primary-300 shadow-md' : 'border-slate-200'} hover:shadow-sm`}>
      <button 
        onClick={onClick}
        className="w-full p-4 flex items-center gap-4"
      >
        {/* Rank */}
        <div className="flex-shrink-0 w-10 text-center">
          <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full font-bold text-sm ${rank <= 3 ? 'bg-primary-100 text-primary-700' : 'bg-slate-100 text-slate-600'}`}>
            #{rank}
          </span>
        </div>

        {/* Main Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium text-slate-800 truncate">{transect.name}</h4>
            <span className="px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600">
              {transect.beach_name}
            </span>
          </div>
          
          {/* Factor Bars */}
          <div className="space-y-1.5">
            {[
              { key: 'erosion_risk', label: 'Erosion', icon: TrendingDown, color: 'bg-red-500' },
              { key: 'population_exposure', label: 'Population', icon: Users, color: 'bg-blue-500' },
              { key: 'infrastructure_exposure', label: 'Infrastructure', icon: Building2, color: 'bg-amber-500' },
              { key: 'social_vulnerability', label: 'Vulnerability', icon: Shield, color: 'bg-purple-500' },
            ].map(factor => {
              const value = risk.factors?.[factor.key] || risk[factor.key] || 0;
              return (
                <div key={factor.key} className="flex items-center gap-2">
                  <factor.icon className="w-3 h-3 text-slate-400" />
                  <span className="text-xs text-slate-500 w-20">{factor.label}</span>
                  <div className="flex-1 h-2 bg-slate-100 rounded overflow-hidden">
                    <div 
                      className="h-full rounded" 
                      style={{ 
                        width: `${Math.min(value * 100, 100)}%`,
                        backgroundColor: factor.color 
                      }} 
                    />
                  </div>
                  <span className="text-xs font-mono text-slate-600 w-10 text-right">
                    {Math.round(value * 100)}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Composite Score */}
        <div className="flex flex-col items-end gap-2">
          <div className={`px-3 py-1.5 rounded-full text-sm font-semibold ${categoryColors[risk.risk_category] || categoryColors.low}`}>
            {risk.risk_category.replace('_', ' ').toUpperCase()}
          </div>
          <div className="text-2xl font-bold text-slate-800">
            {(risk.composite_score * 100).toFixed(0)}
          </div>
          <div className="text-xs text-slate-500">/100</div>
        </div>
      </button>

      {isSelected && (
        <div className="px-4 pb-4 border-t border-slate-100 bg-slate-50 rounded-b-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div>
              <p className="text-slate-500">Erosion Rate</p>
              <p className="font-mono font-medium">{risk.factors?.erosion_rate?.toFixed(2) || risk.erosion_risk?.toFixed(2)} m/yr</p>
            </div>
            <div>
              <p className="text-slate-500">Population</p>
              <p className="font-mono font-medium">{Math.round(risk.factors?.population_density || risk.population_exposure * 10000)}/km²</p>
            </div>
            <div>
              <p className="text-slate-500">Infra Value</p>
              <p className="font-mono font-medium">${(risk.factors?.infrastructure_value || risk.infrastructure_exposure * 1e6 / 1e6).toFixed(1)}M</p>
            </div>
            <div>
              <p className="text-slate-500">Vulnerability</p>
              <p className="font-mono font-medium">{(risk.factors?.social_vulnerability || risk.social_vulnerability * 100).toFixed(0)}%</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function RiskBarChart({ data }: { data: any[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data.reverse()} layout="vertical" margin={{ top: 10, right: 30, left: 100, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} />
        <YAxis 
          type="category" 
          dataKey="name" 
          tick={{ fontSize: 11, fill: '#64748b' }} 
          axisLine={false}
          width={90}
        />
        <Tooltip formatter={(value: number) => [value.toFixed(1) + '%', 'Risk Score']} />
        <Legend />
        <Bar 
          dataKey="score" 
          name="Composite Risk" 
          fill="#0ea5e9"
          radius={[0, 4, 4, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}