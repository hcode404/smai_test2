import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import http from "http";
import { Server, Socket } from "socket.io";
import crypto from "crypto";

// In-memory application state
const appState = {
  locked: false,
  logo: null as string | null, // base64 string
  adminIps: new Set<string>(),
};

// In-memory sessions
const sessions = new Map<string, { role: 'OWNER' | 'ADMIN', ip: string }>();

const OWNER_USERNAME = 'smai_owner';
const OWNER_PASSWORD = 'Npss7855';

interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
  isStaff: boolean;
  read: boolean;
}

interface Ticket {
  id: string; // same as userId for 1-1 mapping
  userId: string;
  status: 'OPEN' | 'CLOSED' | 'ESCALATED';
  messages: Message[];
  ip: string;
  userAgent: string;
  alias?: string;
  createdAt: string;
  isOnline: boolean;
}

const tickets = new Map<string, Ticket>();
const staffSockets = new Set<string>();
const userSockets = new Map<string, string>(); // socket.id -> userId

const CRISIS_KEYWORDS = ['להתאבד', 'למות', 'לסיים את זה', 'לפגוע בעצמי', 'אין טעם בחיים', 'לחתוך', 'כדורים', 'לסיים הכל'];

function checkCrisis(text: string) {
  return CRISIS_KEYWORDS.some(kw => text.includes(kw));
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  const server = http.createServer(app);
  const io = new Server(server);

  app.use(express.json({ limit: '10mb' }));

  // Helper to get client IP
  const getClientIp = (req: express.Request | any) => {
    return req.headers['x-forwarded-for'] as string || req.socket?.remoteAddress || '';
  };

  // Middleware to authenticate
  const authMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const session = sessions.get(token);
      if (session) {
        (req as any).user = session;
        return next();
      }
    }
    
    // Check if IP is in adminIps
    const ip = getClientIp(req);
    if (appState.adminIps.has(ip)) {
      (req as any).user = { role: 'ADMIN', ip };
      return next();
    }

    res.status(401).json({ error: "Unauthorized" });
  };

  // API Routes
  
  app.get("/api/state", (req, res) => {
    res.json({
      locked: appState.locked,
      logo: appState.logo,
    });
  });

  app.post("/api/login", (req, res) => {
    const { username, password } = req.body;
    const ip = getClientIp(req);

    if (username === OWNER_USERNAME && password === OWNER_PASSWORD) {
      const token = crypto.randomBytes(32).toString('hex');
      sessions.set(token, { role: 'OWNER', ip });
      return res.json({ token, role: 'OWNER' });
    }

    if (appState.adminIps.has(ip)) {
      const token = crypto.randomBytes(32).toString('hex');
      sessions.set(token, { role: 'ADMIN', ip });
      return res.json({ token, role: 'ADMIN' });
    }

    res.status(401).json({ error: "Invalid credentials" });
  });

  const ownerOnly = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if ((req as any).user?.role === 'OWNER') {
      next();
    } else {
      res.status(403).json({ error: "Forbidden - Owner only" });
    }
  };

  app.get("/api/owner/admins", authMiddleware, ownerOnly, (req, res) => {
    res.json({ adminIps: Array.from(appState.adminIps) });
  });

  app.post("/api/owner/admins", authMiddleware, ownerOnly, (req, res) => {
    const { ip, action } = req.body;
    if (action === 'add') {
      appState.adminIps.add(ip);
    } else if (action === 'remove') {
      appState.adminIps.delete(ip);
    }
    res.json({ success: true, adminIps: Array.from(appState.adminIps) });
  });

  app.post("/api/owner/lock", authMiddleware, ownerOnly, (req, res) => {
    const { locked } = req.body;
    appState.locked = !!locked;
    io.emit('state_update', { locked: appState.locked });
    res.json({ success: true, locked: appState.locked });
  });

  app.post("/api/owner/logo", authMiddleware, ownerOnly, (req, res) => {
    const { logo } = req.body;
    appState.logo = logo;
    io.emit('state_update', { logo: appState.logo });
    res.json({ success: true });
  });

  app.post("/api/owner/alert", authMiddleware, ownerOnly, (req, res) => {
    const { title, message } = req.body;
    io.emit('realtime_alert', { title, message });
    res.json({ success: true });
  });

  app.get("/api/me", authMiddleware, (req, res) => {
    res.json({ user: (req as any).user, clientIp: getClientIp(req) });
  });

  // Admin Routes for Tickets
  app.get("/api/tickets", authMiddleware, (req, res) => {
    res.json({ tickets: Array.from(tickets.values()) });
  });

  app.post("/api/tickets/:id/alias", authMiddleware, (req, res) => {
    const ticket = tickets.get(req.params.id);
    if (ticket) {
      ticket.alias = req.body.alias;
      io.to('staff').emit('tickets_update', Array.from(tickets.values()));
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Ticket not found' });
    }
  });

  // Socket connection
  io.on('connection', (socket: Socket) => {
    const isStaff = socket.handshake.auth.token && sessions.has(socket.handshake.auth.token);
    const ip = socket.handshake.headers['x-forwarded-for'] as string || socket.handshake.address || '';
    const userAgent = socket.handshake.headers['user-agent'] || '';

    if (isStaff) {
      staffSockets.add(socket.id);
      socket.join('staff');
      socket.emit('tickets_update', Array.from(tickets.values()));
    } else {
      let userId = socket.handshake.auth.userId;
      if (!userId) {
        userId = crypto.randomBytes(8).toString('hex');
        socket.emit('set_user_id', userId);
      }
      userSockets.set(socket.id, userId);
      socket.join(`user_${userId}`);

      if (!tickets.has(userId)) {
        tickets.set(userId, {
          id: userId,
          userId,
          status: 'OPEN',
          messages: [],
          ip,
          userAgent,
          createdAt: new Date().toISOString(),
          isOnline: true
        });
      } else {
        const ticket = tickets.get(userId)!;
        ticket.isOnline = true;
        ticket.ip = ip; // update ip on reconnect
      }
      
      io.to('staff').emit('tickets_update', Array.from(tickets.values()));
      socket.emit('ticket_history', tickets.get(userId));
    }

    socket.on('send_message', (data: { content: string, userId?: string }) => {
      let targetUserId = '';
      let isStaffMsg = false;

      if (staffSockets.has(socket.id)) {
        targetUserId = data.userId || '';
        isStaffMsg = true;
      } else {
        targetUserId = userSockets.get(socket.id) || '';
      }

      if (!targetUserId || !tickets.has(targetUserId)) return;

      const ticket = tickets.get(targetUserId)!;
      const msg: Message = {
        id: crypto.randomBytes(8).toString('hex'),
        senderId: isStaffMsg ? 'staff' : targetUserId,
        content: data.content,
        timestamp: new Date().toISOString(),
        isStaff: isStaffMsg,
        read: false
      };

      if (!isStaffMsg && checkCrisis(data.content)) {
        ticket.status = 'ESCALATED';
        io.to('staff').emit('realtime_alert', { title: 'התראת חירום אוטומטית!', message: `זוהה תוכן אובדני במזהה ${targetUserId}` });
      }

      ticket.messages.push(msg);
      
      io.to(`user_${targetUserId}`).emit('new_message', msg);
      io.to('staff').emit('tickets_update', Array.from(tickets.values()));
    });

    socket.on('mark_read', (data: { messageIds: string[], userId?: string }) => {
      let targetUserId = '';
      if (staffSockets.has(socket.id)) {
        targetUserId = data.userId || '';
      } else {
        targetUserId = userSockets.get(socket.id) || '';
      }

      const ticket = tickets.get(targetUserId);
      if (ticket) {
        let changed = false;
        ticket.messages.forEach(m => {
          if (data.messageIds.includes(m.id) && !m.read) {
            m.read = true;
            changed = true;
          }
        });
        if (changed) {
          io.to(`user_${targetUserId}`).emit('ticket_history', ticket);
          io.to('staff').emit('tickets_update', Array.from(tickets.values()));
        }
      }
    });

    socket.on('disconnect', () => {
      if (staffSockets.has(socket.id)) {
        staffSockets.delete(socket.id);
      } else {
        const userId = userSockets.get(socket.id);
        if (userId) {
          const ticket = tickets.get(userId);
          if (ticket) {
            // Check if there are other active sockets for this user
            const hasOtherSockets = Array.from(userSockets.entries()).some(([sid, uid]) => uid === userId && sid !== socket.id);
            if (!hasOtherSockets) {
              ticket.isOnline = false;
              io.to('staff').emit('tickets_update', Array.from(tickets.values()));
            }
          }
          userSockets.delete(socket.id);
        }
      }
    });
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
