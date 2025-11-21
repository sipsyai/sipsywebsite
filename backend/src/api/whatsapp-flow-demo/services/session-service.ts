/**
 * Session Service for WhatsApp Flow Demo
 *
 * Manages in-memory session state for active WhatsApp flows.
 * Each session is identified by phone number and stores the current screen and context.
 */

export interface FlowSession {
  phone: string;
  screen: string;
  context: Record<string, any>;
  createdAt: Date;
  lastAccessedAt: Date;
  expiresAt: Date;
}

class SessionService {
  private sessions: Map<string, FlowSession>;
  private readonly SESSION_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.sessions = new Map();
    this.startCleanupInterval();
  }

  /**
   * Start periodic cleanup of expired sessions
   */
  private startCleanupInterval() {
    // Run cleanup every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredSessions();
    }, 5 * 60 * 1000);
  }

  /**
   * Stop cleanup interval (useful for testing or shutdown)
   */
  stopCleanupInterval() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  /**
   * Remove expired sessions from memory
   */
  private cleanupExpiredSessions() {
    const now = new Date();
    let cleanedCount = 0;

    for (const [phone, session] of this.sessions.entries()) {
      if (session.expiresAt < now) {
        this.sessions.delete(phone);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      console.log(`[SessionService] Cleaned up ${cleanedCount} expired session(s)`);
    }
  }

  /**
   * Create or update a session
   */
  saveSession(phone: string, screen: string, context: Record<string, any> = {}): FlowSession {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + this.SESSION_TIMEOUT_MS);

    const existingSession = this.sessions.get(phone);

    const session: FlowSession = {
      phone,
      screen,
      context: { ...context },
      createdAt: existingSession?.createdAt || now,
      lastAccessedAt: now,
      expiresAt
    };

    this.sessions.set(phone, session);

    return session;
  }

  /**
   * Get an existing session by phone number
   */
  getSession(phone: string): FlowSession | null {
    const session = this.sessions.get(phone);

    if (!session) {
      return null;
    }

    // Check if expired
    if (session.expiresAt < new Date()) {
      this.sessions.delete(phone);
      return null;
    }

    // Update last accessed time and extend expiration
    session.lastAccessedAt = new Date();
    session.expiresAt = new Date(Date.now() + this.SESSION_TIMEOUT_MS);

    return session;
  }

  /**
   * Update session context (merge with existing)
   */
  updateSessionContext(phone: string, contextUpdates: Record<string, any>): FlowSession | null {
    const session = this.getSession(phone);

    if (!session) {
      return null;
    }

    session.context = {
      ...session.context,
      ...contextUpdates
    };

    session.lastAccessedAt = new Date();
    session.expiresAt = new Date(Date.now() + this.SESSION_TIMEOUT_MS);

    this.sessions.set(phone, session);

    return session;
  }

  /**
   * Update session screen
   */
  updateSessionScreen(phone: string, screen: string): FlowSession | null {
    const session = this.getSession(phone);

    if (!session) {
      return null;
    }

    session.screen = screen;
    session.lastAccessedAt = new Date();
    session.expiresAt = new Date(Date.now() + this.SESSION_TIMEOUT_MS);

    this.sessions.set(phone, session);

    return session;
  }

  /**
   * Delete a session
   */
  deleteSession(phone: string): boolean {
    return this.sessions.delete(phone);
  }

  /**
   * Clear all sessions (useful for testing)
   */
  clearAllSessions() {
    this.sessions.clear();
  }

  /**
   * Get all active sessions (for monitoring/debugging)
   */
  getAllSessions(): FlowSession[] {
    const now = new Date();
    return Array.from(this.sessions.values()).filter(session => session.expiresAt >= now);
  }

  /**
   * Get session count (for monitoring)
   */
  getSessionCount(): number {
    const now = new Date();
    let count = 0;

    for (const session of this.sessions.values()) {
      if (session.expiresAt >= now) {
        count++;
      }
    }

    return count;
  }

  /**
   * Check if a session exists and is valid
   */
  hasValidSession(phone: string): boolean {
    return this.getSession(phone) !== null;
  }

  /**
   * Get session age in milliseconds
   */
  getSessionAge(phone: string): number | null {
    const session = this.getSession(phone);

    if (!session) {
      return null;
    }

    return Date.now() - session.createdAt.getTime();
  }

  /**
   * Get time until session expires (in milliseconds)
   */
  getTimeUntilExpiration(phone: string): number | null {
    const session = this.getSession(phone);

    if (!session) {
      return null;
    }

    const timeLeft = session.expiresAt.getTime() - Date.now();
    return Math.max(0, timeLeft);
  }
}

// Export singleton instance
export default new SessionService();
