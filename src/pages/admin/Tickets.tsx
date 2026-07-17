import React, { useEffect, useState, useRef } from 'react';
import { useApp } from '../../components/AppProvider';
import { fetchWithAuth } from '../../lib/api';
import { Send, Check, CheckCheck, User as UserIcon, AlertTriangle, Download, Edit2 } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ServerMessage {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
  isStaff: boolean;
  read: boolean;
}

interface Ticket {
  id: string;
  userId: string;
  status: 'OPEN' | 'CLOSED' | 'ESCALATED';
  messages: ServerMessage[];
  ip: string;
  userAgent: string;
  alias?: string;
  createdAt: string;
  isOnline: boolean;
}

export function Tickets() {
  const { socket } = useApp();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [editingAlias, setEditingAlias] = useState<string | null>(null);
  const [aliasInput, setAliasInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchWithAuth('/api/tickets')
      .then(r => r.json())
      .then(data => {
        if (data.tickets) setTickets(data.tickets);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleTicketsUpdate = (updatedTickets: Ticket[]) => {
      setTickets(updatedTickets);
    };

    socket.on('tickets_update', handleTicketsUpdate);

    return () => {
      socket.off('tickets_update', handleTicketsUpdate);
    };
  }, [socket]);

  const selectedTicket = tickets.find(t => t.id === selectedId);

  useEffect(() => {
    if (selectedTicket) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      const unreadIds = selectedTicket.messages.filter(m => !m.isStaff && !m.read).map(m => m.id);
      if (unreadIds.length > 0 && socket) {
        socket.emit('mark_read', { messageIds: unreadIds, userId: selectedTicket.userId });
      }
    }
  }, [selectedTicket, socket]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !socket || !selectedId) return;
    
    socket.emit('send_message', { content: input, userId: selectedId });
    setInput('');
  };

  const handleSaveAlias = async (ticketId: string) => {
    try {
      await fetchWithAuth(`/api/tickets/${ticketId}/alias`, {
        method: 'POST',
        body: JSON.stringify({ alias: aliasInput })
      });
      setEditingAlias(null);
    } catch (e) {
      console.error(e);
    }
  };

  const exportEmergencyLog = (ticket: Ticket) => {
    const text = `
יומן חירום (Emergency Log)
תאריך ייצוא: ${new Date().toISOString()}
=======================================
מזהה משתמש: ${ticket.userId}
כינוי: ${ticket.alias || 'ללא'}
כתובת IP אמיתית: ${ticket.ip}
דפדפן (User Agent): ${ticket.userAgent}
סטטוס: ${ticket.status}
זמן התחלה: ${ticket.createdAt}

--- הודעות ---
${ticket.messages.map(m => `[${new Date(m.timestamp).toLocaleTimeString('he-IL')}] ${m.isStaff ? 'צוות' : 'משתמש'}: ${m.content}`).join('\n')}
    `.trim();

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `emergency_log_${ticket.userId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex h-full bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Sidebar - Ticket List */}
      <div className="w-80 border-l border-slate-200 flex flex-col bg-slate-50/50">
        <div className="p-4 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-800">פניות פתוחות</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {tickets.length === 0 ? (
            <div className="p-4 text-center text-slate-400 text-sm">אין פניות כרגע.</div>
          ) : (
            tickets.map(ticket => {
              const unreadCount = ticket.messages.filter(m => !m.isStaff && !m.read).length;
              return (
                <button
                  key={ticket.id}
                  onClick={() => setSelectedId(ticket.id)}
                  className={cn(
                    "w-full text-right p-4 border-b border-slate-100 hover:bg-white transition-colors flex flex-col gap-2",
                    selectedId === ticket.id && "bg-blue-50 border-blue-100"
                  )}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-bold text-slate-700 flex items-center gap-2 text-sm">
                      <span className={cn("w-2 h-2 rounded-full", ticket.isOnline ? "bg-emerald-500" : "bg-slate-300")} />
                      {ticket.alias || `משתמש אנונימי`}
                    </span>
                    {unreadCount > 0 && (
                      <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                  {ticket.status === 'ESCALATED' && (
                    <span className="text-[10px] bg-red-100 text-red-600 px-2 py-1 rounded-md font-bold self-start flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> חשש אובדני
                    </span>
                  )}
                  <span className="text-xs text-slate-500 truncate w-full">
                    {ticket.messages.length > 0 ? ticket.messages[ticket.messages.length - 1].content : "אין הודעות"}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        {selectedTicket ? (
          <>
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                    {editingAlias === selectedTicket.id ? (
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          value={aliasInput} 
                          onChange={e => setAliasInput(e.target.value)}
                          className="border border-slate-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-500"
                        />
                        <button onClick={() => handleSaveAlias(selectedTicket.id)} className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold">שמור</button>
                        <button onClick={() => setEditingAlias(null)} className="bg-slate-200 text-slate-700 px-2 py-1 rounded text-xs font-bold">בטל</button>
                      </div>
                    ) : (
                      <>
                        {selectedTicket.alias || `משתמש ${selectedTicket.userId.slice(0,6)}`}
                        <button onClick={() => {
                          setEditingAlias(selectedTicket.id);
                          setAliasInput(selectedTicket.alias || '');
                        }} className="text-slate-400 hover:text-blue-600">
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </h2>
                  <span className={cn("text-xs font-bold px-2 py-1 rounded-md", selectedTicket.isOnline ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600")}>
                    {selectedTicket.isOnline ? 'מחובר עכשיו' : 'מנותק'}
                  </span>
                </div>
                <div className="text-xs text-slate-500 mt-1 flex gap-4">
                  <span className="font-mono">IP: {selectedTicket.ip}</span>
                  <span className="truncate max-w-xs" title={selectedTicket.userAgent}>Agent: {selectedTicket.userAgent}</span>
                </div>
              </div>
              <button 
                onClick={() => exportEmergencyLog(selectedTicket)}
                className="bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors"
              >
                <Download className="w-4 h-4" /> ייצוא יומן חירום
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {selectedTicket.messages.map((msg) => {
                const isStaff = msg.isStaff;
                return (
                  <div key={msg.id} className={cn("flex", isStaff ? "justify-end" : "justify-start")}>
                    <div className={cn(
                      "max-w-[70%] rounded-2xl px-5 py-3.5 text-[15px] leading-relaxed shadow-sm flex flex-col",
                      isStaff 
                        ? "bg-slate-800 text-white rounded-bl-none" 
                        : "bg-blue-50 border border-blue-100 text-slate-800 rounded-br-none"
                    )}>
                      <span>{msg.content}</span>
                      <div className={cn(
                        "text-[10px] mt-2 flex items-center gap-1 justify-end",
                        isStaff ? "text-slate-400" : "text-blue-400"
                      )}>
                        <span>{new Date(msg.timestamp).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}</span>
                        {isStaff && (
                          msg.read ? <CheckCheck className="w-3 h-3 text-blue-400" /> : <Check className="w-3 h-3" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50">
               <form onSubmit={handleSend} className="flex gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="השב למשתמש..."
                  className="flex-1 bg-white border border-slate-300 rounded-xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-[15px]"
                  dir="auto"
                />
                <button 
                  type="submit"
                  disabled={!input.trim()}
                  className="bg-blue-600 text-white w-14 h-14 rounded-xl flex items-center justify-center hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                >
                  <Send className="w-5 h-5 rtl:-scale-x-100" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-400 flex-col gap-4">
             <UserIcon className="w-16 h-16 text-slate-200" />
             <p>בחר פניה מהרשימה כדי להתחיל שיחה</p>
          </div>
        )}
      </div>
    </div>
  );
}
