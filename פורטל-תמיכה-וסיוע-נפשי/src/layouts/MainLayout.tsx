import React from 'react';
import { Outlet } from 'react-router-dom';
import { EmergencyBanner } from '../components/EmergencyBanner';
import { useApp } from '../components/AppProvider';
import { AlertTriangle } from 'lucide-react';

export function MainLayout() {
  const { locked } = useApp();

  if (locked) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 items-center justify-center p-4">
        <div className="bg-white rounded-3xl border border-red-200 shadow-sm p-8 max-w-md w-full text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mb-2">האתר ננעל עקב מצב חירום</h1>
          <p className="text-slate-500 text-sm mb-6">
            המערכת כרגע תחת נעילת חירום. הגישה הוגבלה באופן זמני.
          </p>
          <a href="/login" className="text-xs text-blue-600 hover:underline">
            כניסת צוות
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <EmergencyBanner />
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 flex flex-col">
        <Outlet />
      </main>
    </div>
  );
}
