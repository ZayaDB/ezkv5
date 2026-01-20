// Local storage based authentication
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'mentee' | 'mentor' | 'admin';
  avatar?: string;
  locale: string;
  createdAt: string;
}

const STORAGE_KEY = 'mentorlink_user';
const SESSION_KEY = 'mentorlink_session';

export const auth = {
  // Register new user
  register: (userData: Omit<User, 'id' | 'createdAt'>, password?: string): User => {
    const user: User = {
      ...userData,
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    // Store password hash (simple demo - in real app use bcrypt)
    if (password) {
      localStorage.setItem(`${STORAGE_KEY}_password`, btoa(password));
    }
    localStorage.setItem(SESSION_KEY, 'true');
    return user;
  },

  // Login
  login: (email: string, password: string): User | null => {
    // In real app, this would check against backend
    // For demo: check if user exists in localStorage
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const user = JSON.parse(stored) as User;
      if (user.email === email) {
        // Check password (simple demo - in real app use bcrypt)
        const storedPassword = localStorage.getItem(`${STORAGE_KEY}_password`);
        if (storedPassword && atob(storedPassword) === password) {
          localStorage.setItem(SESSION_KEY, 'true');
          return user;
        } else if (!storedPassword) {
          // Legacy: if no password stored, allow any password for demo
          localStorage.setItem(SESSION_KEY, 'true');
          return user;
        }
      }
    }
    return null;
  },

  // Get current user
  getCurrentUser: (): User | null => {
    const session = localStorage.getItem(SESSION_KEY);
    if (!session || session !== 'true') return null;
    
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    
    return JSON.parse(stored) as User;
  },

  // Logout
  logout: (): void => {
    localStorage.removeItem(SESSION_KEY);
    // Keep user data, just remove session
  },

  // Update user
  updateUser: (updates: Partial<User>): User | null => {
    const user = auth.getCurrentUser();
    if (!user) return null;
    
    const updated = { ...user, ...updates };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  },

  // Check if logged in
  isAuthenticated: (): boolean => {
    return localStorage.getItem(SESSION_KEY) === 'true';
  },
};


