'use client';

import { useState } from 'react';
import { X, Bell, AlertTriangle, CheckCircle, Clock, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

type AlertSeverity = 'critical' | 'warning' | 'info';

interface AlertPanelAlert {
  id: string;
  severity: AlertSeverity;
  message: string;
  created_at: string;
  data?: any;
}

interface AlertPanelProps {
  alerts: AlertPanelAlert[];
  onClose: () => void;
}

export function AlertPanel({ alerts, onClose }: AlertPanelProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const severityColors: Record<AlertSeverity, string> = {
    critical: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  };

  const severityIcons: Record<AlertSeverity, React.ReactNode> = {
    critical: <AlertTriangle className="w-4 h-4 text-red-500" />,
    warning: <AlertTriangle className="w-4 h-4 text-amber-500" />,
    info: <Info className="w-4 h-4 text-blue-500" />,
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 w-full max-w-md animate-in slide-in-from-bottom">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-slate-600" />
            <h3 className="font-semibold text-slate-800">Alerts ({alerts.length})</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Alert List */}
        <div className="max-h-96 overflow-y-auto divide-y divide-slate-100">
          {alerts.map(alert => {
            const isExpanded = expandedId === alert.id;
            return (
              <div key={alert.id} className={severityColors[alert.severity]}>
                <button
                  onClick={() => setExpandedId(isExpanded ? null : alert.id)}
                  className="w-full p-4 flex items-start gap-3 text-left"
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {severityIcons[alert.severity]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-slate-800 truncate">{alert.message}</p>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${alert.severity === 'critical' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                        {alert.severity.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}
                    </p>
                    {isExpanded && alert.data && (
                      <div className="mt-2 p-2 bg-white/50 rounded text-xs text-slate-600">
                        <pre className="whitespace-pre-wrap">{JSON.stringify(alert.data, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // Acknowledge alert
                    }}
                    className="flex-shrink-0 p-1 rounded hover:bg-white/50 text-slate-400 hover:text-slate-600"
                    title="Acknowledge"
                  >
                    <CheckCircle className="w-4 h-4" />
                  </button>
                </button>
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-slate-200 bg-white/50">
                    <div className="flex gap-2">
                      <button className="flex-1 py-2 px-3 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700">
                        Acknowledge
                      </button>
                      <button className="flex-1 py-2 px-3 bg-slate-100 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-200">
                        View Details
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        {alerts.length > 0 && (
          <div className="p-3 bg-slate-50 border-t border-slate-200">
            <button className="w-full py-2 text-sm font-medium text-slate-600 hover:text-slate-800">
              View All Alerts
            </button>
          </div>
        )}
      </div>
    </div>
  );
}