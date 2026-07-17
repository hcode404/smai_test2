import React from 'react';
import { useApp } from './AppProvider';
import { AlertCircle, X } from 'lucide-react';

export function GlobalAlerts() {
  const { alerts, removeAlert } = useApp();

  if (alerts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-3">
      {alerts.map(alert => (
        <div key={alert.id} className="bg-red-600 text-white p-4 rounded-2xl shadow-xl flex items-start gap-3 w-80 animate-in slide-in-from-right-8">
          <AlertCircle className="w-6 h-6 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-bold text-sm">{alert.title}</h3>
            <p className="text-xs text-red-100 mt-1 leading-relaxed">{alert.message}</p>
          </div>
          <button onClick={() => removeAlert(alert.id)} className="text-red-200 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
      ))}
    </div>
  );
}
