// Local storage utilities for app data
export interface Session {
  id: string;
  mentorId: string;
  menteeId: string;
  date: string;
  duration: number;
  type: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  notes?: string;
}

export interface Message {
  id: string;
  from: string;
  to: string;
  content: string;
  timestamp: string;
  read: boolean;
}

const SESSIONS_KEY = 'mentorlink_sessions';
const MESSAGES_KEY = 'mentorlink_messages';
const FAVORITES_KEY = 'mentorlink_favorites';

export const storage = {
  // Sessions
  getSessions: (): Session[] => {
    const stored = localStorage.getItem(SESSIONS_KEY);
    return stored ? JSON.parse(stored) : [];
  },

  addSession: (session: Omit<Session, 'id'>): Session => {
    const sessions = storage.getSessions();
    const newSession: Session = {
      ...session,
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
    sessions.push(newSession);
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
    return newSession;
  },

  updateSession: (id: string, updates: Partial<Session>): void => {
    const sessions = storage.getSessions();
    const index = sessions.findIndex((s) => s.id === id);
    if (index !== -1) {
      sessions[index] = { ...sessions[index], ...updates };
      localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
    }
  },

  // Messages
  getMessages: (userId?: string): Message[] => {
    const stored = localStorage.getItem(MESSAGES_KEY);
    const messages = stored ? JSON.parse(stored) : [];
    if (userId) {
      return messages.filter((m: Message) => m.from === userId || m.to === userId);
    }
    return messages;
  },

  addMessage: (message: Omit<Message, 'id' | 'timestamp' | 'read'>): Message => {
    const messages = storage.getMessages();
    const newMessage: Message = {
      ...message,
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      read: false,
    };
    messages.push(newMessage);
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
    return newMessage;
  },

  markAsRead: (messageId: string): void => {
    const messages = storage.getMessages();
    const index = messages.findIndex((m) => m.id === messageId);
    if (index !== -1) {
      messages[index].read = true;
      localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
    }
  },

  // Favorites
  getFavorites: (): string[] => {
    const stored = localStorage.getItem(FAVORITES_KEY);
    return stored ? JSON.parse(stored) : [];
  },

  toggleFavorite: (id: string): boolean => {
    const favorites = storage.getFavorites();
    const index = favorites.indexOf(id);
    if (index > -1) {
      favorites.splice(index, 1);
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
      return false;
    } else {
      favorites.push(id);
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
      return true;
    }
  },

  isFavorite: (id: string): boolean => {
    return storage.getFavorites().includes(id);
  },
};


