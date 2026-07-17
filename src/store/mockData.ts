import { User, Ticket } from '../types';

export const mockUsers: User[] = [
  { id: 'u1', username: 'אנונימי_124', alias: 'בחור מתל אביב (מצוקה גבוהה)', role: 'USER', status: 'ACTIVE', ipAddress: '192.168.1.10', lastActive: new Date().toISOString() },
  { id: 'u2', username: 'אנונימי_582', role: 'USER', status: 'TEMP_BANNED', ipAddress: '10.0.0.5', lastActive: new Date(Date.now() - 86400000).toISOString() },
  { id: 'u3', username: 'אנונימי_991', role: 'USER', status: 'ACTIVE', ipAddress: '172.16.0.4', lastActive: new Date().toISOString() },
  { id: 's1', username: 'צוות_יעל', role: 'STAFF', status: 'ACTIVE', ipAddress: '127.0.0.1', lastActive: new Date().toISOString() },
  { id: 'a1', username: 'מנהל_ראשי', role: 'ADMIN', status: 'ACTIVE', ipAddress: '127.0.0.1', lastActive: new Date().toISOString() },
];

export const mockTickets: Ticket[] = [
  {
    id: 't1',
    userId: 'u1',
    userAlias: 'בחור מתל אביב (מצוקה גבוהה)',
    status: 'ESCALATED',
    messages: [
      { id: 'm1', senderId: 'u1', content: 'אני מרגיש שאני לא יכול יותר, הכל סוגר עליי.', timestamp: new Date(Date.now() - 300000).toISOString(), isStaff: false },
      { id: 'm2', senderId: 's1', content: 'אני כאן איתך. אתה לא לבד. תוכל לספר לי קצת יותר על מה שקורה?', timestamp: new Date(Date.now() - 250000).toISOString(), isStaff: true },
      { id: 'm3', senderId: 'u1', content: 'אין טעם... חשבתי על דרכים לסיים את זה.', timestamp: new Date(Date.now() - 100000).toISOString(), isStaff: false }
    ]
  }
];
