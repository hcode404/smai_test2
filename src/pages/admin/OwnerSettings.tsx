import React, { useEffect, useState, useRef } from 'react';
import { fetchWithAuth, getAuthToken } from '../../lib/api';
import { useApp } from '../../components/AppProvider';
import { Lock, Unlock, Upload, Send, ShieldPlus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function OwnerSettings() {
  const { locked, logo } = useApp();
  const [adminIps, setAdminIps] = useState<string[]>([]);
  const [newIp, setNewIp] = useState('');
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if owner
    const role = localStorage.getItem('user_role');
    if (role !== 'OWNER') {
      navigate('/admin');
      return;
    }

    fetchWithAuth('/api/owner/admins')
      .then(r => r.json())
      .then(data => {
        if (data.adminIps) setAdminIps(data.adminIps);
      })
      .catch(console.error);
  }, [navigate]);

  const handleLockToggle = async () => {
    try {
      await fetchWithAuth('/api/owner/lock', {
        method: 'POST',
        body: JSON.stringify({ locked: !locked })
      });
    } catch (e) { console.error(e); }
  };

  const handleAddIp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIp) return;
    try {
      const res = await fetchWithAuth('/api/owner/admins', {
        method: 'POST',
        body: JSON.stringify({ action: 'add', ip: newIp })
      });
      const data = await res.json();
      if (data.adminIps) {
        setAdminIps(data.adminIps);
        setNewIp('');
      }
    } catch (e) { console.error(e); }
  };

  const handleRemoveIp = async (ip: string) => {
    try {
      const res = await fetchWithAuth('/api/owner/admins', {
        method: 'POST',
        body: JSON.stringify({ action: 'remove', ip })
      });
      const data = await res.json();
      if (data.adminIps) setAdminIps(data.adminIps);
    } catch (e) { console.error(e); }
  };

  const handleSendAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!alertTitle || !alertMessage) return;
    try {
      await fetchWithAuth('/api/owner/alert', {
        method: 'POST',
        body: JSON.stringify({ title: alertTitle, message: alertMessage })
      });
      setAlertTitle('');
      setAlertMessage('');
    } catch (e) { console.error(e); }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result;
      if (typeof base64 === 'string') {
        try {
          await fetchWithAuth('/api/owner/logo', {
            method: 'POST',
            body: JSON.stringify({ logo: base64 })
          });
        } catch (e) { console.error(e); }
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="grid grid-cols-12 gap-6 h-full">
      <div className="col-span-12 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">הגדרות בעלים (Owner)</h1>
          <p className="text-sm text-slate-500 font-medium">ניהול מתקדם של המערכת</p>
        </div>
      </div>

      <section className="col-span-12 lg:col-span-6 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col">
        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <ShieldPlus className="w-5 h-5 text-blue-600" /> הגדרת מנהלים לפי IP
        </h2>
        
        <form onSubmit={handleAddIp} className="flex gap-2 mb-6">
          <input 
            type="text" 
            placeholder="הכנס כתובת IP (לדוגמה 192.168.1.1)" 
            value={newIp}
            onChange={(e) => setNewIp(e.target.value)}
            className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 focus:outline-none focus:border-blue-500"
            dir="ltr"
          />
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors">
            הוסף גישה
          </button>
        </form>

        <div className="flex-1 overflow-y-auto">
          {adminIps.length === 0 ? (
            <p className="text-sm text-slate-400 italic">אין כתובות IP מורשות כרגע.</p>
          ) : (
            <ul className="space-y-2">
              {adminIps.map(ip => (
                <li key={ip} className="flex justify-between items-center bg-slate-50 border border-slate-100 p-3 rounded-lg">
                  <span className="font-mono text-sm text-slate-700">{ip}</span>
                  <button onClick={() => handleRemoveIp(ip)} className="text-red-500 hover:text-red-700 p-1">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="col-span-12 lg:col-span-6 space-y-6 flex flex-col">
        {/* Lockdown */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              {locked ? <Lock className="w-5 h-5 text-red-600" /> : <Unlock className="w-5 h-5 text-emerald-600" />}
              מצב חירום: נעילת האתר
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-xs">
              נעילה תחסום גישה מיידית לכל המשתמשים מלבד צוות.
            </p>
          </div>
          <button 
            onClick={handleLockToggle}
            className={`px-6 py-3 rounded-xl font-bold text-white transition-all shadow-md ${locked ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20' : 'bg-red-600 hover:bg-red-700 shadow-red-600/20'}`}
          >
            {locked ? 'בטל נעילה' : 'נעל אתר'}
          </button>
        </div>

        {/* Logo Upload */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Upload className="w-5 h-5 text-blue-600" /> שינוי לוגו מערכת
          </h2>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden bg-slate-50 shrink-0">
              {logo ? <img src={logo} alt="Logo" className="w-full h-full object-contain" /> : <span className="text-[10px] text-slate-400">אין לוגו</span>}
            </div>
            <div className="flex-1">
              <input 
                type="file" 
                accept="image/*" 
                ref={fileInputRef} 
                className="hidden" 
                onChange={handleLogoUpload} 
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-bold transition-colors"
              >
                בחר תמונה...
              </button>
              <p className="text-xs text-slate-400 mt-2">מומלץ יחס ריבוע, מקסימום 2MB.</p>
            </div>
          </div>
        </div>

        {/* Realtime Alert */}
        <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-sm p-6 text-white flex-1">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-blue-400">
            <Send className="w-5 h-5" /> שליחת התראה קופצת
          </h2>
          <form onSubmit={handleSendAlert} className="space-y-3">
            <input 
              type="text" 
              placeholder="כותרת ההתראה..." 
              value={alertTitle}
              onChange={(e) => setAlertTitle(e.target.value)}
              className="w-full border border-slate-700 bg-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              required
            />
            <textarea 
              placeholder="תוכן ההתראה..." 
              value={alertMessage}
              onChange={(e) => setAlertMessage(e.target.value)}
              className="w-full border border-slate-700 bg-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 min-h-[80px]"
              required
            />
            <button type="submit" className="w-full bg-blue-600 text-white px-4 py-3 rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors">
              שלח לכל המשתמשים
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
