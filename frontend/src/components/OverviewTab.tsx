'use client';

import { Transect, Alert, RiskScore } from '@/lib/api';
import { cn } from '@/lib/utils';

interface OverviewTabProps {
  transectsByBeach: Record<string, Transect[]>;
  selectedTransect: string | null;
  setSelectedTransect: (id: string | null) => void;
  getLatestRisk: (id: string) => RiskScore | undefined;
  getActiveAlerts: (id: string) => Alert[];
}

export function OverviewTab({ 
  transectsByBeach, 
  selectedTransect, 
  setSelectedTransect,
  getLatestRisk,
  getActiveAlerts,
}: OverviewTabProps) {
  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard 
          label="Transects" 
          value={Object.values(transectsByBeach).flat().length} 
          icon={<MapPin className="w-5 h-5" />}
          color="bg-blue-100 text-blue-600"
        />
        <StatCard 
          label="Active Alerts" 
          value={Object.values(transectsByBeach).flat().reduce((acc, t) => acc + getActiveAlerts(t.id).length, 0)} 
          icon={<Bell className="w-5 h-5" />}
          color="bg-red-100 text-red-600"
        />
      </div>

      {/* Beach Groups */}
      <div className="space-y-4">
        {Object.entries(transectsByBeach).map(([beachName, beachTransects]) => (
          <BeachGroup 
            key={beachName}
            beachName={beachName}
            transects={beachTransects}
            selectedTransect={selectedTransect}
            setSelectedTransect={setSelectedTransect}
            getLatestRisk={getLatestRisk}
            getActiveAlerts={getActiveAlerts}
          />
        ))}
      </div>

      {/* Quick Actions */}
      <div className="pt-4 border-t border-slate-200 space-y-2">
        <h4 className="text-sm font-medium text-slate-600">Quick Actions</h4>
        <div className="grid grid-cols-2 gap-2">
          <QuickActionBtn 
            label="Upload Photo" 
            icon={<Camera className="w-4 h-4" />}
            onClick={() => console.log('upload photo')}
          />
          <QuickActionBtn 
            label="View Forecast" 
            icon={<TrendingUp className="w-4 h-4" />}
            onClick={() => console.log('view forecast')}
          />
          <QuickActionBtn 
            label="Risk Report" 
            icon={<FileText className="w-4 h-4" />}
            onClick={() => console.log('risk report')}
          />
          <QuickActionBtn 
            label="Settings" 
            icon={<Settings className="w-4 h-4" />}
            onClick={() => console.log('settings')}
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color }: { label: string; value: number; icon: React.ReactNode; color: string }) {
  return (
    <div className="p-3 bg-white rounded-lg border border-slate-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-500 font-medium">{label}</p>
          <p className="text-2xl font-bold text-slate-800">{value}</p>
        </div>
        <div className={`p-2 rounded-lg ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function BeachGroup({ 
  beachName, 
  transects, 
  selectedTransect, 
  setSelectedTransect,
  getLatestRisk,
  getActiveAlerts,
}: { 
  beachName: string; 
  transects: Transect[]; 
  selectedTransect: string | null;
  setSelectedTransect: (id: string | null) => void;
  getLatestRisk: (id: string) => RiskScore | undefined;
  getActiveAlerts: (id: string) => Alert[];
}) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
      <div className="px-3 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <h4 className="font-medium text-slate-700 capitalize">{beachName}</h4>
        <span className="text-xs text-slate-500">{transects.length} transects</span>
      </div>
      <div className="divide-y divide-slate-100">
        {transects.map(transect => {
          const risk = getLatestRisk(transect.id);
          const alerts = getActiveAlerts(transect.id);
          const isSelected = selectedTransect === transect.id;
          
          return (
            <button
              key={transect.id}
              onClick={() => setSelectedTransect(isSelected ? null : transect.id)}
              className={cn(
                'w-full px-3 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors',
                isSelected && 'bg-primary-50 border-l-2 border-primary-500'
              )}
            >
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-slate-400" />
                <div>
                  <p className="text-sm font-medium text-slate-800">{transect.name}</p>
                  <p className="text-xs text-slate-500">
                    Baseline: {transect.baseline_distance_m}m from shore
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {risk && (
                  <span className={cn(
                    'px-2 py-0.5 rounded text-xs font-medium',
                    `bg-${risk.risk_category.replace('_', '-')}-100 text-${risk.risk_category.replace('_', '-')}-700`
                  )}>
                    #{risk.rank}
                  </span>
                )}
                {alerts.length > 0 && (
                  <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">
                    {alerts.length}
                  </span>
                )}
                {isSelected && <ChevronDown className="w-4 h-4 text-primary-600" />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function QuickActionBtn({ label, icon, onClick }: { label: string; icon: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="p-3 rounded-lg border border-slate-200 hover:border-primary-300 hover:bg-primary-50 transition-colors flex flex-col items-center gap-1"
    >
      <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
        {icon}
      </div>
      <span className="text-xs font-medium text-slate-700">{label}</span>
    </button>
  );
}