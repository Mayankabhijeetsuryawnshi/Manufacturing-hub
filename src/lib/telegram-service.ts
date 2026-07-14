/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Telegram Bot Service
 * Handles user registration, message timestamps, and alert management
 */

import { CONFIG } from '../config';

export interface TelegramUser {
  userId: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  registeredAt: string;
  lastMessageAt?: string;
  isActive: boolean;
}

// --- Safe LocalStorage Utility ---
const safeStorage = {
  getItem: (key: string) => {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.warn("Storage access denied:", e);
      return null;
    }
  },
  setItem: (key: string, value: string) => {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.warn("Storage write denied:", e);
    }
  },
  removeItem: (key: string) => {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn("Storage delete denied:", e);
    }
  }
};

export const TelegramBotService = {
  /**
   * Get stored bot token (deprecated - moved to server side)
   */
  getBotToken(): string {
    return "";
  },

  /**
   * Get Telegram user ID from storage
   */
  getUserId(): string {
    return safeStorage.getItem('TELEGRAM_USER_ID') || '';
  },

  /**
   * Register a new Telegram user with timestamp
   */
  registerUser(userData: Partial<TelegramUser>): TelegramUser {
    const user: TelegramUser = {
      userId: userData.userId || `user_${Date.now()}`,
      username: userData.username,
      firstName: userData.firstName,
      lastName: userData.lastName,
      registeredAt: new Date().toISOString(),
      lastMessageAt: userData.lastMessageAt || new Date().toISOString(),
      isActive: true,
    };

    // Store in storage
    safeStorage.setItem(`TELEGRAM_USER_${user.userId}`, JSON.stringify(user));

    // Add to registered users list
    try {
      const usersRaw = safeStorage.getItem('TELEGRAM_REGISTERED_USERS');
      const users = JSON.parse(usersRaw || '[]');
      if (!users.find((u: TelegramUser) => u.userId === user.userId)) {
        users.push(user);
        safeStorage.setItem('TELEGRAM_REGISTERED_USERS', JSON.stringify(users));
      }
    } catch (e) {
      console.error("Failed to parse user list:", e);
    }

    return user;
  },

  /**
   * Update last message timestamp for a user
   */
  updateUserMessageTime(userId: string): void {
    const user = this.getUser(userId);
    if (user) {
      user.lastMessageAt = new Date().toISOString();
      safeStorage.setItem(`TELEGRAM_USER_${userId}`, JSON.stringify(user));

      // Update in users list
      try {
        const usersRaw = safeStorage.getItem('TELEGRAM_REGISTERED_USERS');
        const users = JSON.parse(usersRaw || '[]');
        const idx = users.findIndex((u: TelegramUser) => u.userId === userId);
        if (idx !== -1) {
          users[idx].lastMessageAt = user.lastMessageAt;
          safeStorage.setItem('TELEGRAM_REGISTERED_USERS', JSON.stringify(users));
        }
      } catch (e) {
        console.error("Failed to update user list time:", e);
      }
    }
  },

  /**
   * Get a specific user
   */
  getUser(userId: string): TelegramUser | null {
    const userData = safeStorage.getItem(`TELEGRAM_USER_${userId}`);
    if (!userData) return null;
    try {
      return JSON.parse(userData);
    } catch (e) {
      return null;
    }
  },

  /**
   * Get all registered users
   */
  getAllUsers(): TelegramUser[] {
    try {
      const usersRaw = safeStorage.getItem('TELEGRAM_REGISTERED_USERS');
      return JSON.parse(usersRaw || '[]');
    } catch (e) {
      return [];
    }
  },

  /**
   * Remove a user
   */
  removeUser(userId: string): boolean {
    safeStorage.removeItem(`TELEGRAM_USER_${userId}`);
    try {
      const usersRaw = safeStorage.getItem('TELEGRAM_REGISTERED_USERS');
      const users = JSON.parse(usersRaw || '[]');
      const filtered = users.filter((u: TelegramUser) => u.userId !== userId);
      safeStorage.setItem('TELEGRAM_REGISTERED_USERS', JSON.stringify(filtered));
    } catch (e) {
      console.error("Failed to remove user from list:", e);
    }
    return true;
  },

  /**
   * Get user statistics
   */
  getUserStats(): {
    totalUsers: number;
    activeUsers: number;
    lastUpdate: string;
    users: TelegramUser[];
  } {
    const users = this.getAllUsers();
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    const activeUsers = users.filter(u => {
      const lastMsg = u.lastMessageAt ? new Date(u.lastMessageAt) : null;
      return lastMsg && lastMsg > oneHourAgo;
    });

    return {
      totalUsers: users.length,
      activeUsers: activeUsers.length,
      lastUpdate: new Date().toISOString(),
      users,
    };
  },

  /**
   * Send a message directly via Telegram API (Frontend-to-Telegram - deprecated)
   */
  async sendMessageDirectly(chatId: string, text: string): Promise<any> {
    console.warn("Direct Telegram dispatching is disabled on frontend. Use Google Apps Script backend instead.");
    return { ok: false, error: "Direct Telegram dispatching is disabled on frontend" };
  },

  /**
   * Check if user is registered
   */
  isUserRegistered(userId: string): boolean {
    return this.getUser(userId) !== null;
  },

  /**
   * Format user display name
   */
  formatUserName(user: TelegramUser): string {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.firstName || user.username || user.userId;
  },

  /**
   * Get formatted registration info
   */
  getRegistrationInfo(userId: string): string | null {
    const user = this.getUser(userId);
    if (!user) return null;

    const registered = new Date(user.registeredAt).toLocaleString();
    const lastMsg = user.lastMessageAt 
      ? new Date(user.lastMessageAt).toLocaleString()
      : 'Never';

    return `
User: ${this.formatUserName(user)}
Registered: ${registered}
Last Message: ${lastMsg}
Status: ${user.isActive ? '✅ Active' : '❌ Inactive'}
    `.trim();
  },
};
