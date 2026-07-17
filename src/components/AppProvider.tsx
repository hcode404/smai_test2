import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface Alert {
  id: string;
  title: string;
  message: string;
}

interface AppContextType {
  locked: boolean;
  logo: string | null;
  alerts: Alert[];
  removeAlert: (id: string) => void;
  socket: Socket | null;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [locked, setLocked] = useState(false);
  const [logo, setLogo] = useState<string | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    // Fetch initial state
    fetch('/api/state')
      .then(r => r.json())
      .then(data => {
        setLocked(data.locked);
        setLogo(data.logo);
      })
      .catch(console.error);

    const token = localStorage.getItem('auth_token');
    let userId = localStorage.getItem('smai_user_id');

    const newSocket = io({
      auth: { token, userId }
    });

    newSocket.on('set_user_id', (id: string) => {
      localStorage.setItem('smai_user_id', id);
    });

    setSocket(newSocket);

    newSocket.on('state_update', (data: { locked?: boolean, logo?: string | null }) => {
      if (data.locked !== undefined) setLocked(data.locked);
      if (data.logo !== undefined) setLogo(data.logo);
    });

    newSocket.on('realtime_alert', (data: { title: string, message: string }) => {
      setAlerts(prev => [...prev, { id: Math.random().toString(), ...data }]);
    });

    return () => {
      newSocket.close();
    };
  }, []);

  const removeAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  return (
    <AppContext.Provider value={{ locked, logo, alerts, removeAlert, socket }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};

