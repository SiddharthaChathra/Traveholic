'use client';

import { useState, useEffect } from 'react';
import { 
  Brain, Zap, Target, Search, 
  ChevronDown, ChevronUp, Info, 
  AlertTriangle, TrendingUp, TrendingDown,
  Minus, Plus, Circle, Check, X
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface XAITabProps {
  transects: any[];
  selectedTransect: string | null;
}

export function XAITab({ transects, selectedTransect }: XAITabProps) {
  const [explanation, setExplanation] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState<'behavior' | 'risk' | 'forecast'>('behavior');

  useEffect(() => {
    if (selectedTransect) {
      fetchExplanation(selectedTransect);
    } else {
      setExplanation(null);
    }
  }, [selectedTransect]);

  const fetchExplanation = async (transectId: string) => {
    setLoading(true);
    try {
      // In production: call ML API
      // const data = await mlApi.explainBehavior(transectId, shorelineSeries);
      // Mock data for now
      await new Promise(r => setTimeout(r, 500));
      setExplanation({
        transect_id: transectId,
        behavior_classification: {
          class_id: 2,
          class_name: 'Erosive',
          confidence: 0.87,
          description: 'Persistent net erosion. Shoreline retreating year-over-year.',
          features: {
            mean_position: 95.2,
            std_position: 3.1,
            mean_change_rate: -0.42,
            trend_significance: 0.92,
            seasonal_amplitude: 1.8,
            volatility: 0.35,
            extreme_event_count: 3,
            recovery_ratio: 0.6,
          },
          feature_importance: {
            mean_change_rate: 0.35,
            trend_significance: 0.28,
            seasonal_amplitude: 0.15,
            volatility: 0.12,
            extreme_event_count: 0.10,
          },
          natural_language: 'This transect shows clear erosive behavior with a retreat rate of 0.42 m/year. The trend is statistically significant (p<0.01). Seasonal oscillation is moderate but does not offset the long-term loss.',
        },
        risk_explanation: {
          top_factors: [
            { feature: 'erosion_rate', importance: 0.42, value: 0.42, description: 'High erosion rate is the primary risk driver' },
            { feature: 'population_density', importance: 0.28, value: 2400, description: 'Dense coastal population increases exposure' },
            { feature: 'infrastructure_value', importance: 0.18, value: 45000000, description: 'Significant infrastructure at risk' },
            { feature: 'social_vulnerability', importance: 0.12, value: 0.65, description: 'Moderately vulnerable community' },
          ],
          composite_score: 0.73,
          natural_language: 'This area has high coastal erosion risk (73/100). Primary driver: erosion rate of 0.42 m/year. Contributing factors: dense population (2,400/km²) and $45M in infrastructure.',
        },
        forecast_explanation: {
          forecast: {
            30: { position: 94.8, lower: 94.2, upper: 95.4, confidence: 0.85 },
            90: { position: 94.1, lower: 93.0, upper: 95.2, confidence: 0.72 },
            180: { position: 93.5, lower: 92.0, upper: 95.0, confidence: 0.65 },
            365: { position: 92.8, lower: 90.5, upper: 95.1, confidence: 0.58 },
          },
          monsoon_context: 'Monsoon season active',
          natural_language: 'Shoreline expected to retreat 0.4m over next 30 days. Monsoon season amplifies uncertainty. 90-day forecast shows 1.1m retreat with wider confidence bounds.',
        },
      });
    } catch (error) {
      console.error('Failed to fetch explanation:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!selectedTransect) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-500">
        <Brain className="w-16 h-16 mb-4 text-slate-300" />
        <h3 className="text-lg font-medium">Select a Transect</h3>
        <p className="text-sm mt-1">Click on a transect in the map or sidebar to view AI explanations</p>
      </div>
    );
  }

  const transect = transects.find(t => t.id === selectedTransect);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-100 rounded-lg">
            <Brain className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800">Explainable AI</h3>
            <p className="text-sm text-slate-500">{transect?.name} • {transect?.beach_name}</p>
          </div>
        </div>
        
        {/* Section Tabs */}
        <div className="mt-4 flex gap-1">
          {[
            { id: 'behavior', label: 'Behavior', icon: Target },
            { id: 'risk', label: 'Risk Factors', icon: AlertTriangle },
            { id: 'forecast', label: 'Forecast', icon: TrendingUp },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id as any)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                ${activeSection === tab.id 
                  ? 'bg-primary-100 text-primary-700' 
                  : 'text-slate-600 hover:bg-slate-100'}`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-3 border-primary-500 border-t-transparent" />
          </div>
        ) : explanation ? (
          <>
            {activeSection === 'behavior' && (
              <BehaviorExplanation data={explanation.behavior_classification} />
            )}
            {activeSection === 'risk' && (
              <RiskExplanation data={explanation.risk_explanation} />
            )}
            {activeSection === 'forecast' && (
              <ForecastExplanation data={explanation.forecast_explanation} />
            )}
          </>
        ) : (
          <div className="text-center text-slate-500 py-8">
            <p>No explanation available</p>
          </div>
        )}
      </div>
    </div>
  );
}

function BehaviorExplanation({ data }: { data: any }) {
  const classColors: Record<number, string> = {
    0: 'bg-green-100 text-green-700 border-green-200',
    1: 'bg-blue-100 text-blue-700 border-blue-200',
    2: 'bg-red-100 text-red-700 border-red-200',
    3: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  };
  const classNames = ['Stable', 'Seasonal', 'Erosive', 'Accretive'];

  return (
    <div className="space-y-6">
      {/* Class Badge */}
      <div className="flex items-center gap-4 p-4 bg-white rounded-lg border border-slate-200">
        <div className={`px-4 py-2 rounded-full text-lg font-bold ${classColors[data.class_id] || classColors[0]}`}>
          {classNames[data.class_id] || 'Unknown'}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-slate-700">Confidence</span>
            <div className="flex-1 h-2 bg-slate-100 rounded overflow-hidden">
              <div 
                className="h-full bg-primary-500 rounded" 
                style={{ width: `${data.confidence * 100}%` }} 
              />
            </div>
            <span className="text-sm font-mono text-slate-600 w-12 text-right">
              {(data.confidence * 100).toFixed(0)}%
            </span>
          </div>
        </div>
      </div>

      {/* Natural Language */}
      <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
        <p className="text-slate-700 leading-relaxed">{data.natural_language}</p>
      </div>

      {/* Feature Importance */}
      <div>
        <h4 className="font-medium text-slate-800 mb-3 flex items-center gap-2">
          <Search className="w-4 h-4" />
          Feature Importance
        </h4>
        <div className="space-y-3">
          {Object.entries(data.feature_importance || {}).map(([feature, importance]) => (
            <FeatureImportanceBar 
              key={feature} 
              feature={feature} 
              importance={importance as number}
              value={data.features?.[feature]}
            />
          ))}
        </div>
      </div>

      {/* Raw Features */}
      <div>
        <h4 className="font-medium text-slate-800 mb-3 flex items-center gap-2">
          <Info className="w-4 h-4" />
          Extracted Features
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(data.features || {}).map(([key, value]) => (
            <div key={key} className="p-3 bg-white rounded-lg border border-slate-200">
              <p className="text-xs text-slate-500 uppercase tracking-wide">{formatFeatureName(key)}</p>
              <p className="font-mono font-medium text-slate-800">
                {typeof value === 'number' ? value.toFixed(2) : value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function FeatureImportanceBar({ feature, importance, value }: { feature: string; importance: number; value: any }) {
  return (
    <div className="p-3 bg-white rounded-lg border border-slate-200">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium text-slate-700 capitalize">{feature.replace(/_/g, ' ')}</span>
        <span className="text-xs font-mono text-slate-600">
          {typeof value === 'number' ? value.toFixed(2) : value}
        </span>
      </div>
      <div className="h-2 bg-slate-100 rounded overflow-hidden">
        <div 
          className="h-full bg-primary-500 rounded" 
          style={{ width: `${importance * 100}%` }} 
        />
      </div>
      <div className="flex justify-between text-xs text-slate-500 mt-1">
        <span>Low</span>
        <span className="font-medium">{(importance * 100).toFixed(0)}%</span>
        <span>High</span>
      </div>
    </div>
  );
}

function RiskExplanation({ data }: { data: any }) {
  const scoreColor = data.composite_score >= 0.7 ? 'text-red-600' : 
                     data.composite_score >= 0.5 ? 'text-orange-600' : 
                     data.composite_score >= 0.3 ? 'text-amber-600' : 'text-green-600';
  const scoreBg = data.composite_score >= 0.7 ? 'bg-red-100' : 
                  data.composite_score >= 0.5 ? 'bg-orange-100' : 
                  data.composite_score >= 0.3 ? 'bg-amber-100' : 'bg-green-100';

  return (
    <div className="space-y-6">
      {/* Score Card */}
      <div className={`p-6 rounded-xl ${scoreBg} border border-slate-200`}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-600 mb-1">Composite Risk Score</p>
            <div className="flex items-baseline gap-2">
              <span className={`text-4xl font-bold ${scoreColor}`}>{(data.composite_score * 100).toFixed(0)}</span>
              <span className="text-slate-500 text-lg mt-2">/ 100</span>
            </div>
            <p className="text-sm text-slate-600 mt-2">{data.natural_language}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500">Risk Level</p>
            <p className={`font-semibold ${scoreColor}`}>
              {data.composite_score >= 0.7 ? 'HIGH' : 
               data.composite_score >= 0.5 ? 'MODERATE-HIGH' : 
               data.composite_score >= 0.3 ? 'MODERATE' : 'LOW'}
            </p>
          </div>
        </div>
      </div>

      {/* Top Factors */}
      <div>
        <h4 className="font-medium text-slate-800 mb-3 flex items-center gap-2">
          <Zap className="w-4 h-4" />
          Top Contributing Factors
        </h4>
        <div className="space-y-3">
          {data.top_factors.map((factor: any, i: number) => (
            <div key={factor.feature} className="p-4 bg-white rounded-lg border border-slate-200">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                  <span className="text-sm font-bold text-primary-600">{i + 1}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-slate-800 capitalize">{factor.feature.replace(/_/g, ' ')}</span>
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-primary-100 text-primary-700">
                      {(factor.importance * 100).toFixed(0)}%
                    </span>
                  </div>
                  <p className="text-sm text-slate-600">{factor.description}</p>
                  <div className="mt-2 h-2 bg-slate-100 rounded overflow-hidden">
                    <div 
                      className="h-full bg-primary-500 rounded" 
                      style={{ width: `${factor.importance * 100}%` }} 
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ForecastExplanation({ data }: { data: any }) {
  return (
    <div className="space-y-6">
      {/* Monsoon Context */}
      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 flex items-center gap-3">
        <div className="p-2 bg-blue-100 rounded-lg">
          <TrendingUp className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <p className="font-medium text-blue-800">Seasonal Context</p>
          <p className="text-sm text-blue-700">{data.monsoon_context}</p>
        </div>
      </div>

      {/* Natural Language */}
      <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
        <p className="text-slate-700 leading-relaxed">{data.natural_language}</p>
      </div>

      {/* Forecast Table */}
      <div>
        <h4 className="font-medium text-slate-800 mb-3">Multi-Horizon Forecast</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-slate-500">
                <th className="pb-2 font-medium">Horizon</th>
                <th className="pb-2 font-medium text-right">Predicted Position (m)</th>
                <th className="pb-2 font-medium text-right">Confidence Interval</th>
                <th className="pb-2 font-medium text-right">Confidence</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(data.forecast).map(([horizon, forecast]: [string, any]) => (
                <tr key={horizon} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-2 font-medium">{horizon} days</td>
                  <td className="py-2 text-right font-mono">{forecast.position.toFixed(1)}</td>
                  <td className="py-2 text-right text-slate-600">
                    [{forecast.lower.toFixed(1)}, {forecast.upper.toFixed(1)}]
                  </td>
                  <td className="py-2 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-24 h-2 bg-slate-100 rounded overflow-hidden">
                        <div 
                          className="h-full bg-primary-500 rounded" 
                          style={{ width: `${forecast.confidence * 100}%` }} 
                        />
                      </div>
                      <span className="font-mono text-xs text-slate-600 w-12 text-right">
                        {(forecast.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function formatFeatureName(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
    .replace('Per Month', '/mo')
    .replace('Significance', 'Sig.');
}