import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Users, AlertOctagon, MessageSquare, LayoutDashboard, LogOut, Settings } from 'lucide-react';
import { cn } from '../lib/utils';
import { useApp } from '../components/AppProvider';

export function AdminLayout() {
  const location = useLocation();
  const { logo } = useApp();
  const role = localStorage.getItem('user_role');
  const isOwner = role === 'OWNER';
  const isAdminOrOwner = role === 'OWNER' || role === 'ADMIN';

  const navItems = [
    { path: '/admin', label: 'לוח בקרה', icon: LayoutDashboard },
    { path: '/admin/tickets', label: 'פניות וצ\'אטים', icon: MessageSquare },
    { path: '/admin/users', label: 'ניהול משתמשים', icon: Users, adminOnly: true },
    { path: '/admin/crisis', label: 'יומן משברים (חירום)', icon: AlertOctagon, emergency: true },
    { path: '/admin/settings', label: 'הגדרות בעלים', icon: Settings, ownerOnly: true },
  ];

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-l border-slate-200 flex flex-col p-6 space-y-8 relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center overflow-hidden shrink-0">
            {logo ? <img src={logo} alt="Logo" className="w-full h-full object-cover" /> : <MessageSquare className="w-6 h-6 text-white" />}
          </div>
          <span className="text-xl font-bold text-slate-800 tracking-tight">פורטל סיוע</span>
        </div>
        
        <nav className="flex-1 flex flex-col space-y-2">
          {navItems.map((item) => {
            if (item.adminOnly && !isAdminOrOwner) return null;
            if (item.ownerOnly && !isOwner) return null;
            
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium text-sm relative",
                  isActive 
                    ? item.emergency ? "bg-red-50 text-red-700 font-bold" : "bg-blue-50 text-blue-700 font-bold"
                    : "text-slate-500 hover:bg-slate-50",
                  item.emergency && !isActive && "hover:text-red-600"
                )}
              >
                {isActive && !item.emergency && <span className="w-2 h-2 bg-blue-600 rounded-full absolute right-3"></span>}
                {isActive && item.emergency && <span className="w-2 h-2 bg-red-600 rounded-full absolute right-3"></span>}
                <Icon className={cn("w-5 h-5", isActive ? (item.emergency ? "text-red-700" : "text-blue-700") : "text-slate-500", item.emergency && !isActive && "text-red-400", isActive && "mr-4")} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="pt-6 border-t border-slate-100 space-y-4">
          <div className="flex items-center gap-3 px-4">
            <div className="w-8 h-8 rounded-full bg-slate-200"></div>
            <div>
              <p className="text-xs font-bold text-slate-800">{role === 'OWNER' ? 'בעלים' : (role === 'ADMIN' ? 'מנהל מערכת' : 'צוות')}</p>
              <p className="text-[10px] text-slate-500">צוות תמיכה</p>
            </div>
          </div>
          <Link to="/" onClick={() => localStorage.removeItem('auth_token')} className="flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-slate-50 transition-colors text-sm font-medium text-slate-500 hover:text-slate-700">
            <LogOut className="w-5 h-5" />
            התנתק וחזור לפורטל
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 flex flex-col gap-6 overflow-y-auto">
        <header className="flex justify-between items-center mb-2">
          <div className="bg-white border border-slate-200 rounded-2xl px-6 py-4 flex-1 flex justify-between items-center">
            <div className="flex flex-col">
              <h1 className="text-2xl font-extrabold text-slate-900">שלום, ברוך הבא</h1>
              <p className="text-slate-500 text-sm font-medium">סטטוס מערכת: תקין • צוות מקוון</p>
            </div>
            <div className="flex gap-3">
              <button className="px-4 py-2 bg-red-50 text-red-600 border border-red-100 rounded-lg text-sm font-bold">
                קו חירום: 1201 (ער״ן)
              </button>
            </div>
          </div>
        </header>
        
        <Outlet />
      </main>
    </div>
  );
}
