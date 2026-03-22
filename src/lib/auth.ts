/**
 * Mock Authentication Utility
 * Structured to be easily replaced by Supabase in the future.
 */

export interface UserSession {
  id: string;
  email: string;
  isRegistered: boolean;
}

const STORAGE_KEY = 'chalto_session';

export const auth = {
  /**
   * Mock login
   */
  async login(email: string, password?: string): Promise<UserSession | null> {
    // Simulating API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const session: UserSession = {
      id: btoa(email), // Mock ID
      email,
      isRegistered: true
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    return session;
  },

  /**
   * Mock registration
   */
  async register(email: string, password?: string): Promise<UserSession | null> {
    // Simulating API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const session: UserSession = {
      id: btoa(email), // Mock ID
      email,
      isRegistered: true
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    return session;
  },

  /**
   * Mock logout
   */
  async logout(): Promise<void> {
    localStorage.removeItem(STORAGE_KEY);
  },

  /**
   * Get current session
   */
  getSession(): UserSession | null {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  },

  /**
   * Get namespaced storage key for the current user
   */
  getStorageKey(baseKey: string): string {
    const session = this.getSession();
    if (!session) return baseKey;
    return `${baseKey}_${session.id}`;
  },

  /**
   * Check if authenticated
   */
  isAuthenticated(): boolean {
    return this.getSession() !== null;
  }
};
