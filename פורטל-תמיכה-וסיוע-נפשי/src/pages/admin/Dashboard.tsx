import React from 'react';
import { Users, AlertOctagon, MessageSquare, Activity } from 'lucide-react';

const stats = [
  { label: 'משתמשים מחוברים', value: '24', icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
  { label: 'פניות פתוחות', value: '12', icon: MessageSquare, color: 'text-indigo-500', bg: 'bg-indigo-50' },
  { label: 'זמן מענה ממוצע', value: '1.5 דק׳', icon: Activity, color: 'text-emerald-500', bg: 'bg-emerald-50' },
  { label: 'אירועי חירום פעילים', value: '0', icon: AlertOctagon, color: 'text-red-500', bg: 'bg-red-50' },
];

export function Dashboard() {
  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${stat.bg}`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-3xl font-black text-slate-900">{stat.value}</p>
                <p className="text-xs font-bold text-slate-500 mt-1">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="col-span-12 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 min-h-[300px] flex items-center justify-center">
        <p className="text-slate-400 font-bold">אזור גרפים ונתונים סטטיסטיים (פעילות יומית)</p>
      </div>
    </div>
  );
}
