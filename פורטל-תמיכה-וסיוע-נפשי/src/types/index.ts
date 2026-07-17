export type Role = 'ADMIN' | 'MODERATOR' | 'STAFF' | 'USER';

export interface User {
  id: string;
  username: string;
  alias?: string;
  role: Role;
  status: 'ACTIVE' | 'TEMP_BANNED' | 'PERM_BANNED';
  ipAddress: string;
  lastActive: string;
}

export interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
  isStaff: boolean;
}

export interface Ticket {
  id: string;
  userId: string;
  userAlias?: string;
  status: 'OPEN' | 'CLOSED' | 'ESCALATED';
  messages: Message[];
}
