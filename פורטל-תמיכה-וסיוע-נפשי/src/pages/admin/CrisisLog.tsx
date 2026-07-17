import React from 'react';
import { Download } from 'lucide-react';
import { mockTickets } from '../../store/mockData';

export function CrisisLog() {
  const escalatedTicket = mockTickets[0]; // Example escalated ticket

  const handleExport = () => {
    // Format data as a clear, readable text report for police/authorities
    const reportDate = new Date().toISOString();
    
    let reportContent = `=================================================\n`;
    reportContent += `       דו"ח אירוע חירום - פוֹרְטָל סִיוּעַ נַפְשִׁי      \n`;
    reportContent += `=================================================\n\n`;
    reportContent += `תאריך הפקת הדו"ח: ${reportDate}\n`;
    reportContent += `מזהה אירוע מערכתי: ${escalatedTicket.id}\n\n`;
    
    reportContent += `[ נתוני משתמש וזיהוי ]\n`;
    reportContent += `-------------------------------------------------\n`;
    reportContent += `מזהה אנונימי מערכתי: ${escalatedTicket.userId}\n`;
    reportContent += `שם / כינוי שהוזן על ידי צוות: ${escalatedTicket.userAlias || 'לא הוזן'}\n`;
    reportContent += `כתובת IP שאותרה: 192.168.1.10\n`;
    reportContent += `מיקום משוער (לפי IP): Israel\n`;
    reportContent += `זיהוי דפדפן ומכשיר (User-Agent): Mozilla/5.0 (Macintosh; Intel Mac OS X)\n\n`;
    
    reportContent += `[ היסטוריית התכתבות מלאה ]\n`;
    reportContent += `-------------------------------------------------\n`;
    
    escalatedTicket.messages.forEach(msg => {
      const time = new Date(msg.timestamp).toLocaleTimeString('he-IL');
      const sender = msg.isStaff ? 'צוות תמיכה' : (escalatedTicket.userAlias || 'משתמש');
      reportContent += `[${time}] ${sender}:\n${msg.content}\n\n`;
    });
    
    reportContent += `=================================================\n`;
    reportContent += `סוף הדו"ח. מופק בצורה מאובטחת להעברה לרשויות.\n`;

    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", url);
    downloadAnchorNode.setAttribute("download", `Crisis_Report_${escalatedTicket.id}.txt`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid grid-cols-12 gap-6 h-full">
      {/* Crisis Hub Panel - using the dark styling from the theme */}
      <section className="col-span-12 lg:col-span-5 bg-slate-900 rounded-3xl border border-slate-800 p-6 flex flex-col text-white min-h-[500px]">
        <div className="flex items-center gap-2 mb-6 text-red-500">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          <h2 className="font-bold uppercase tracking-widest text-sm">Crisis Escalation Hub</h2>
        </div>
        
        <div className="flex-1 space-y-6">
          <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700">
            <div className="flex justify-between items-start mb-2">
              <p className="text-xs text-slate-400">אירוע פעיל #{escalatedTicket.id}</p>
              {escalatedTicket.userAlias && (
                <span className="bg-red-900/30 text-red-400 px-2 py-0.5 rounded text-[10px] font-bold">
                  {escalatedTicket.userAlias}
                </span>
              )}
            </div>
            <p className="text-sm mb-4 italic">"אני מרגיש שאני לא יכול יותר, הכל סוגר עליי."</p>
            
            <div className="space-y-1 text-[11px] font-mono text-slate-300 border-t border-slate-700 pt-2">
              <p>IP: 192.168.1.10</p>
              <p>OS: Mozilla/5.0 (Macintosh; Intel Mac OS X)</p>
              <p>Loc: Israel</p>
              <p>Time: {new Date().toISOString()}</p>
            </div>
          </div>
          
          <div className="space-y-3 pt-4">
            <button 
              onClick={handleExport}
              className="w-full py-4 bg-red-600 hover:bg-red-700 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-900/40 text-sm"
            >
              <Download className="w-5 h-5" />
              ייצוא מאובטח לכוחות הביטחון
            </button>
            <p className="text-[10px] text-center text-slate-500">
              הקשה על הכפתור תעביר את כל יומני המכשיר והצ׳אט (כולל זיהוי IP וכינויים מותאמים) בקובץ דו"ח מרוכז למשטרת ישראל.
            </p>
          </div>
        </div>
        
        <div className="mt-auto pt-6">
          <div className="flex items-center gap-3 p-4 bg-blue-900/20 border border-blue-500/30 rounded-xl">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            <p className="text-[11px] text-blue-200">הצפנה מקצה לקצה פעילה בתדר מאובטח</p>
          </div>
        </div>
      </section>

      {/* Chat History Panel - light styling */}
      <section className="col-span-12 lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 flex flex-col min-h-[500px]">
        <h2 className="text-lg font-bold text-slate-800 mb-4">היסטוריית שיחה</h2>
        
        <div className="flex-1 overflow-y-auto space-y-4">
          {escalatedTicket.messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.isStaff ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                msg.isStaff 
                  ? 'bg-blue-50 text-blue-900 border border-blue-100 rounded-bl-none' 
                  : 'bg-slate-50 text-slate-900 border border-slate-200 rounded-br-none'
              }`}>
                <div className="font-bold text-xs mb-1 opacity-70">
                  {msg.isStaff ? 'צוות תמיכה' : (escalatedTicket.userAlias || 'משתמש אנונימי')}
                </div>
                {msg.content}
                <div className="text-[10px] mt-2 opacity-50 text-left">
                  {new Date(msg.timestamp).toLocaleTimeString('he-IL')}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
