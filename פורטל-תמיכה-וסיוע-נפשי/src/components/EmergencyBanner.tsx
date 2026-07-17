import React from 'react';
import { Phone, AlertTriangle } from 'lucide-react';

export function EmergencyBanner() {
  return (
    <div className="bg-red-50 border-b border-red-200 p-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-red-800">
          <AlertTriangle className="w-6 h-6 shrink-0 text-red-600" />
          <div>
            <h2 className="font-semibold text-lg">האם אתה נמצא בסכנה מיידית?</h2>
            <p className="text-sm text-red-700">אם אתה או מישהו אחר בסכנת פגיעה, אנא פנה מיד לעזרה מקצועית.</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <a href="tel:1201" className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white text-red-700 px-4 py-2 rounded-lg font-medium shadow-sm border border-red-100 hover:bg-red-50 transition-colors">
            <Phone className="w-4 h-4" /> ער"ן (1201)
          </a>
          <a href="tel:100" className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg font-medium shadow-sm hover:bg-red-700 transition-colors">
            <Phone className="w-4 h-4" /> משטרה (100)
          </a>
          <a href="tel:101" className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white text-red-700 px-4 py-2 rounded-lg font-medium shadow-sm border border-red-100 hover:bg-red-50 transition-colors">
            <Phone className="w-4 h-4" /> מד"א (101)
          </a>
        </div>
      </div>
    </div>
  );
}
