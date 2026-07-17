import React, { useState, useEffect, useRef } from 'react';
import { Shield, Send, Lock, User as UserIcon, Check, CheckCheck } from 'lucide-react';
import { cn } from '../lib/utils';
import { useApp } from '../components/AppProvider';

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

export function Home() {
  const { logo, socket } = useApp();
  const [messages, setMessages] = useState<ServerMessage[]>([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!socket) return;

    const handleHistory = (ticket: Ticket | null) => {
      if (ticket) {
        setMessages(ticket.messages);
        markUnreadAsRead(ticket.messages);
      }
    };

    const handleNewMessage = (msg: ServerMessage) => {
      setMessages(prev => {
        const exists = prev.some(m => m.id === msg.id);
        if (exists) return prev;
        return [...prev, msg];
      });
      if (msg.isStaff) {
        socket.emit('mark_read', { messageIds: [msg.id] });
      }
    };

    socket.on('ticket_history', handleHistory);
    socket.on('new_message', handleNewMessage);

    return () => {
      socket.off('ticket_history', handleHistory);
      socket.off('new_message', handleNewMessage);
    };
  }, [socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const markUnreadAsRead = (msgs: ServerMessage[]) => {
    if (!socket) return;
    const unreadIds = msgs.filter(m => m.isStaff && !m.read).map(m => m.id);
    if (unreadIds.length > 0) {
      socket.emit('mark_read', { messageIds: unreadIds });
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !socket) return;
    
    socket.emit('send_message', { content: input });
    setInput('');
  };

  return (
    <div className="flex-1 flex flex-col max-w-4xl w-full mx-auto bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden mb-6">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 p-4 px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center overflow-hidden shrink-0">
            {logo ? <img src={logo} alt="Logo" className="w-full h-full object-cover" /> : <UserIcon className="w-6 h-6 text-blue-600" />}
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800">תמיכה אנונימית</h1>
            <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
              <Shield className="w-3 h-3 text-emerald-500" />
              <span>צוות התמיכה זמין עבורך | שיחה מוצפנת ומאובטחת</span>
            </p>
          </div>
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="bg-slate-50/50 p-3 text-center border-b border-slate-100">
        <p className="text-xs text-slate-500 flex items-center justify-center gap-2">
          <Lock className="w-3.5 h-3.5" />
          הפרטיות שלך חשובה לנו. המידע אינו נשמר אלא לצרכי הטיפול בפנייתך.
        </p>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30 flex flex-col">
        {messages.length === 0 && (
           <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
             שלח הודעה כדי להתחיל שיחה עם הצוות...
           </div>
        )}
        {messages.map((msg) => {
          const isMe = !msg.isStaff;
          return (
            <div key={msg.id} className={cn("flex", isMe ? "justify-end" : "justify-start")}>
              <div className={cn(
                "max-w-[80%] rounded-2xl px-5 py-3.5 text-[15px] leading-relaxed shadow-sm flex flex-col",
                isMe 
                  ? "bg-blue-600 text-white rounded-bl-none" 
                  : "bg-white border border-slate-100 text-slate-800 rounded-br-none"
              )}>
                <span>{msg.content}</span>
                <div className={cn(
                  "text-[10px] mt-2 flex items-center gap-1 justify-end",
                  isMe ? "text-blue-200" : "text-slate-400"
                )}>
                  <span>{new Date(msg.timestamp).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}</span>
                  {isMe && (
                    msg.read ? <CheckCheck className="w-3 h-3 text-blue-300" /> : <Check className="w-3 h-3" />
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-100 flex flex-col gap-2">
        <form onSubmit={handleSend} className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="כתוב הודעה..."
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-[15px]"
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
        <div className="flex justify-center mt-2">
           <a href="/login" className="text-[10px] text-slate-400 hover:text-blue-600 transition-colors">כניסת צוות</a>
        </div>
      </div>
    </div>
  );
}

