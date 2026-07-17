import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, User as UserIcon } from 'lucide-react';

export function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('user_role', data.role);
        navigate('/admin');
      } else {
        alert(data.error || 'Login failed');
      }
    } catch (err) {
      console.error(err);
      alert('Network error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-sm p-8 flex flex-col items-center">
        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-600/20">
          <Shield className="w-8 h-8 text-white" />
        </div>
        
        <h1 className="text-2xl font-extrabold text-slate-900 mb-2">התחברות צוות תמיכה</h1>
        <p className="text-sm text-slate-500 font-medium mb-8 text-center">
          הגישה מותרת לאנשי מקצוע מורשים בלבד. כל הפעולות במערכת מנוטרות.
        </p>

        <form onSubmit={handleLogin} className="w-full space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">שם משתמש / מזהה צוות</label>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <UserIcon className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="block w-full pr-10 pl-3 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-colors bg-slate-50 text-sm"
                placeholder="הזן מזהה צוות"
                required
                dir="rtl"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">סיסמה</label>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pr-10 pl-3 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-colors bg-slate-50 text-sm"
                placeholder="••••••••"
                required
                dir="rtl"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md shadow-blue-600/20 mt-6"
          >
            התחבר למערכת
          </button>
        </form>
        
        <div className="mt-8 text-center border-t border-slate-100 pt-6 w-full">
          <p className="text-xs text-slate-400">
            במקרה של איבוד גישה, יש לפנות לקצין האבטחה (CISO).
          </p>
        </div>
      </div>
    </div>
  );
}
