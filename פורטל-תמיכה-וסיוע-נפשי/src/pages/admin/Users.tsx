import React, { useState } from 'react';
import { mockUsers } from '../../store/mockData';
import { User } from '../../types';
import { cn } from '../../lib/utils';
import { Edit2, Check, X } from 'lucide-react';

export function UsersTable() {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [editingAliasId, setEditingAliasId] = useState<string | null>(null);
  const [editAliasValue, setEditAliasValue] = useState('');

  const handleAction = (userId: string, action: string) => {
    alert(`Action ${action} triggered for user ${userId}`);
  };

  const startEditingAlias = (user: User) => {
    setEditingAliasId(user.id);
    setEditAliasValue(user.alias || '');
  };

  const saveAlias = (userId: string) => {
    setUsers(users.map(u => u.id === userId ? { ...u, alias: editAliasValue } : u));
    setEditingAliasId(null);
  };

  const cancelEditing = () => {
    setEditingAliasId(null);
    setEditAliasValue('');
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-lg font-bold text-slate-800">ניהול משתמשים והרשאות</h1>
          <p className="text-xs text-slate-500 mt-1">צפייה במשתמשים, ניהול גישה, הוספת שמות מזהים לחשבונות וכתובות IP.</p>
        </div>
        <div className="flex gap-2">
          <input type="text" placeholder="חפש משתמש..." className="text-xs border border-slate-200 rounded-lg px-3 py-2 w-48 bg-slate-50" />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-right text-slate-600">
          <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase tracking-wider">
            <tr className="border-b border-slate-100">
              <th className="p-3 font-bold">מזהה אנונימי</th>
              <th className="p-3 font-bold">כינוי / שם פנימי (לפי IP)</th>
              <th className="p-3 font-bold">כתובת IP</th>
              <th className="p-3 font-bold">תפקיד</th>
              <th className="p-3 font-bold">סטטוס</th>
              <th className="p-3 font-bold">פעולות מהירות</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-3 font-medium text-slate-800">{user.username}</td>
                <td className="p-3">
                  {editingAliasId === user.id ? (
                    <div className="flex items-center gap-2">
                      <input 
                        type="text" 
                        value={editAliasValue}
                        onChange={(e) => setEditAliasValue(e.target.value)}
                        className="border border-slate-300 rounded px-2 py-1 text-xs w-32 focus:outline-none focus:border-blue-500"
                        placeholder="הכנס שם מזהה..."
                        autoFocus
                      />
                      <button onClick={() => saveAlias(user.id)} className="text-green-600 hover:text-green-700">
                        <Check className="w-4 h-4" />
                      </button>
                      <button onClick={cancelEditing} className="text-slate-400 hover:text-slate-600">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 group">
                      <span className="text-slate-700 font-medium">{user.alias || <span className="text-slate-400 italic text-xs">ללא שם</span>}</span>
                      <button 
                        onClick={() => startEditingAlias(user)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-slate-400 hover:text-blue-600"
                        title="ערוך שם לכתובת IP זו"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </td>
                <td className="p-3 text-xs font-mono">{user.ipAddress}</td>
                <td className="p-3">
                  <span className={cn(
                    "px-2 py-1 text-[10px] font-bold rounded-full",
                    user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
                    user.role === 'STAFF' ? 'bg-blue-100 text-blue-700' :
                    'bg-slate-100 text-slate-700'
                  )}>
                    {user.role}
                  </span>
                </td>
                <td className="p-3">
                  <span className={cn(
                    "px-2 py-1 text-[10px] font-bold rounded-full inline-flex",
                    user.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                  )}>
                    {user.status === 'ACTIVE' ? 'פעיל' : 'מושעה'}
                  </span>
                </td>
                <td className="p-3 flex gap-2">
                  <button 
                    onClick={() => handleAction(user.id, 'CHANGE_PASSWORD')}
                    className="p-1 text-slate-400 hover:text-blue-600 underline text-xs transition-colors"
                  >
                    סיסמה
                  </button>
                  {user.status === 'ACTIVE' ? (
                    <button 
                      onClick={() => handleAction(user.id, 'TEMP_BAN')}
                      className="p-1 text-slate-400 hover:text-orange-600 underline text-xs transition-colors"
                    >
                      חסימה
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleAction(user.id, 'UNBAN')}
                      className="p-1 text-orange-600 font-bold underline text-xs transition-colors"
                    >
                      שחרור
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
