/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { NotificationService } from './lib/notifications';
import { TelegramBotService, TelegramUser } from './lib/telegram-service';
import { CONFIG } from './config';
import { auth } from './lib/firebase.ts';

const getAuthHeaders = async () => {
  const user = auth.currentUser;
  if (!user) return {};
  const token = await user.getIdToken();
  return { 'Authorization': `Bearer ${token}` };
};

export const HubApi = {
  async save(payload: any) {
    try {
      console.log(`🚀 ${CONFIG.APP_NAME} Cloud Sync Initiated:`, payload.type);
      const headers = await getAuthHeaders();
      const response = await fetch('/api/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({ error: 'Unknown server error' }));
        throw new Error(errData.error || 'Failed to save data');
      }

      const result = await response.json();

      // Send Telegram alert if configured
      if (payload.type === 'powderStock' && payload.lowItems?.length > 0) {
        await this.sendTelegramAlert(
          '⚠️ Low Stock Alert',
          `Items running low:\n${payload.lowItems.map((i: any) => `• ${i.name} (${i.type})`).join('\n')}`,
          'warning'
        );
      } else if (payload.type === 'productionLog') {
        await this.sendTelegramAlert(
          '📊 Production Update',
          `New entry recorded for <b>${payload.customer}</b>\n• Total Qty: ${payload.totalQty}\n• Value: ₹${payload.totalAmt.toLocaleString()}\n• Supervisor: ${payload.supervisor}`,
          'success'
        );
      }

      return { status: 'success', ...result };
    } catch (error: any) {
      console.error("❌ Cloud Save Error:", error);
      NotificationService.error(`Sync Failed: ${error.message || 'Check Connection'}`);
      throw error;
    }
  },

  async getStats() {
    try {
      console.log("🚀 Syncing Stats...");
      const headers = await getAuthHeaders();
      const response = await fetch('/api/stats', {
        method: 'GET',
        headers: {
          ...headers,
        },
      });

      if (!response.ok) {
        throw new Error("Sync Offline");
      }

      const result = await response.json();
      return {
        status: 'success',
        ...result,
      };
    } catch (e: any) {
      console.error("Sync Stats Error:", e);
      return {
        status: 'error',
        message: 'Sync Paused'
      };
    }
  },

  async getUserProfile() {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch('/api/users/me', {
        method: 'GET',
        headers: {
          ...headers,
        },
      });
      if (!response.ok) throw new Error('Failed to load user profile');
      return await response.json();
    } catch (e: any) {
      console.error("Error loading user profile:", e);
      NotificationService.error(`Failed to load profile: ${e.message}`);
      return null;
    }
  },

  async getAllUsers() {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch('/api/users', {
        method: 'GET',
        headers: {
          ...headers,
        },
      });
      if (!response.ok) throw new Error('Failed to load users');
      return await response.json();
    } catch (e: any) {
      console.error("Error loading users:", e);
      NotificationService.error(`Failed to load user accounts: ${e.message}`);
      return [];
    }
  },

  async updateUserRole(id: number, role: string) {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`/api/users/${id}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: JSON.stringify({ role }),
      });
      if (!response.ok) throw new Error('Failed to update user role');
      return await response.json();
    } catch (e: any) {
      console.error("Error updating role:", e);
      NotificationService.error(`Failed to update user privilege: ${e.message}`);
      return null;
    }
  },

  async getAuditLogs() {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch('/api/audit-logs', {
        method: 'GET',
        headers: {
          ...headers,
        },
      });
      if (!response.ok) throw new Error('Failed to load audit logs');
      return await response.json();
    } catch (e: any) {
      console.error("Error loading audits:", e);
      NotificationService.error(`Failed to load system audit trail: ${e.message}`);
      return [];
    }
  },

  async getHistoricalProductionLogs() {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch('/api/production-logs', {
        method: 'GET',
        headers: {
          ...headers,
        },
      });
      if (!response.ok) throw new Error('Failed to load production logs');
      return await response.json();
    } catch (e: any) {
      console.error("Error production logs:", e);
      NotificationService.error(`Failed to load material movement logs: ${e.message}`);
      return [];
    }
  },

  async getHistoricalPowderStock() {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch('/api/powder-stock', {
        method: 'GET',
        headers: {
          ...headers,
        },
      });
      if (!response.ok) throw new Error('Failed to load powder stock');
      return await response.json();
    } catch (e: any) {
      console.error("Error powder stock:", e);
      NotificationService.error(`Failed to load powder inventory records: ${e.message}`);
      return [];
    }
  },

  async getHistoricalDailyChecking() {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch('/api/daily-checking', {
        method: 'GET',
        headers: {
          ...headers,
        },
      });
      if (!response.ok) throw new Error('Failed to load daily checking');
      return await response.json();
    } catch (e: any) {
      console.error("Error daily checking:", e);
      NotificationService.error(`Failed to load quality checking history: ${e.message}`);
      return [];
    }
  },

  async getHistoricalDailyReports() {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch('/api/daily-reports', {
        method: 'GET',
        headers: {
          ...headers,
        },
      });
      if (!response.ok) throw new Error('Failed to load daily reports');
      return await response.json();
    } catch (e: any) {
      console.error("Error daily reports:", e);
      NotificationService.error(`Failed to load production reports: ${e.message}`);
      return [];
    }
  },

  async getProductionSchedules() {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch('/api/production-schedules', {
        method: 'GET',
        headers: {
          ...headers,
        },
      });
      if (!response.ok) throw new Error('Failed to load schedules');
      return await response.json();
    } catch (e: any) {
      console.error("Error schedules:", e);
      NotificationService.error(`Failed to load production schedules: ${e.message}`);
      return [];
    }
  },

  async createProductionSchedule(schedule: any) {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch('/api/production-schedules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: JSON.stringify(schedule),
      });
      if (!response.ok) throw new Error('Failed to create production schedule');
      return await response.json();
    } catch (e: any) {
      console.error("Error creating schedule:", e);
      NotificationService.error(`Failed to save production schedule: ${e.message}`);
      throw e;
    }
  },

  async updateProductionSchedule(id: number, schedule: any) {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`/api/production-schedules/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: JSON.stringify(schedule),
      });
      if (!response.ok) throw new Error('Failed to update production schedule');
      return await response.json();
    } catch (e: any) {
      console.error("Error updating schedule:", e);
      NotificationService.error(`Failed to update production schedule: ${e.message}`);
      throw e;
    }
  },

  async deleteProductionSchedule(id: number) {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`/api/production-schedules/${id}`, {
        method: 'DELETE',
        headers: {
          ...headers,
        },
      });
      if (!response.ok) throw new Error('Failed to delete production schedule');
      return await response.json();
    } catch (e: any) {
      console.error("Error deleting schedule:", e);
      NotificationService.error(`Failed to delete production schedule: ${e.message}`);
      throw e;
    }
  },

  async getMaintenanceLogs() {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch('/api/maintenance-logs', {
        method: 'GET',
        headers: {
          ...headers,
        },
      });
      if (!response.ok) throw new Error('Failed to load maintenance logs');
      return await response.json();
    } catch (e: any) {
      console.error("Error loading maintenance logs:", e);
      NotificationService.error(`Failed to load machine maintenance logs: ${e.message}`);
      return [];
    }
  },

  async createMaintenanceLog(log: any) {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch('/api/maintenance-logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: JSON.stringify(log),
      });
      if (!response.ok) throw new Error('Failed to create maintenance log');
      return await response.json();
    } catch (e: any) {
      console.error("Error creating maintenance log:", e);
      NotificationService.error(`Failed to save machine maintenance log: ${e.message}`);
      throw e;
    }
  },

  async updateMaintenanceLog(id: number, log: any) {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`/api/maintenance-logs/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: JSON.stringify(log),
      });
      if (!response.ok) throw new Error('Failed to update maintenance log');
      return await response.json();
    } catch (e: any) {
      console.error("Error updating maintenance log:", e);
      NotificationService.error(`Failed to update machine maintenance log: ${e.message}`);
      throw e;
    }
  },

  async deleteMaintenanceLog(id: number) {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`/api/maintenance-logs/${id}`, {
        method: 'DELETE',
        headers: {
          ...headers,
        },
      });
      if (!response.ok) throw new Error('Failed to delete maintenance log');
      return await response.json();
    } catch (e: any) {
      console.error("Error deleting maintenance log:", e);
      NotificationService.error(`Failed to delete machine maintenance log: ${e.message}`);
      throw e;
    }
  },

  isConfigured() {
    // With PostgreSQL fully operational, the backend is always active
    return true;
  },

  getCloudUrl() {
    return window.location.origin;
  },

  // ==================== TELEGRAM BOT METHODS ====================

  registerTelegramUser(userData: Partial<TelegramUser>): TelegramUser {
    const user = TelegramBotService.registerUser(userData);
    console.log(`✅ Telegram User Registered: ${TelegramBotService.formatUserName(user)}`);
    return user;
  },

  getTelegramUsers(): TelegramUser[] {
    return TelegramBotService.getAllUsers();
  },

  removeTelegramUser(userId: string): boolean {
    return TelegramBotService.removeUser(userId);
  },

  updateUserMessageTime(userId: string): void {
    TelegramBotService.updateUserMessageTime(userId);
    console.log(`⏰ Message timestamp updated for user: ${userId}`);
  },

  async sendTelegramAlert(
    title: string,
    message: string,
    type: 'warning' | 'error' | 'success' | 'info' = 'info'
  ): Promise<void> {
    console.log(`📢 Forwarding Telegram alert broadcast to Google Apps Script:`, {
      title,
      type
    });

    if (!CONFIG.GOOGLE_SHEET_URL) {
      console.warn("⚠️ Google Apps Script URL not configured. Telegram broadcast bypassed.");
      return;
    }

    try {
      // Send broadcast request to the Google Apps Script endpoint which handles dispatch securely
      await fetch(CONFIG.GOOGLE_SHEET_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'broadcast',
          title: title,
          message: message,
        }),
      });
      console.log(`✅ Alert broadcast forwarded successfully.`);
    } catch (e: any) {
      console.error("❌ Failed to forward Telegram alert to Google Apps Script:", e);
    }
  },

  async syncTelegramUserWithGoogleSheets(
    userId: string,
    name: string,
    type: 'ADD' | 'REMOVE'
  ): Promise<void> {
    if (!CONFIG.GOOGLE_SHEET_URL) {
      console.warn("⚠️ Google Apps Script URL not configured. User sync bypassed.");
      return;
    }
    try {
      console.log(`🔄 Syncing Telegram user with Google Sheets: ${name} (${userId}) - Action: ${type}`);
      await fetch(CONFIG.GOOGLE_SHEET_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'syncUser',
          userId,
          name,
          type
        }),
      });
      console.log(`✅ Telegram user sync forwarded successfully.`);
    } catch (e) {
      console.error("❌ Failed to sync Telegram user with Google Sheets:", e);
    }
  },

  async testTelegramAlert(): Promise<boolean> {
    try {
      await this.sendTelegramAlert(
        '🔄 System Connection Test',
        `${CONFIG.APP_NAME} connection verified! \n\nTime: ${new Date().toLocaleString()}\nStatus: ✅ ONLINE`,
        'success'
      );
      return true;
    } catch (e) {
      console.error("Test alert failed:", e);
      return false;
    }
  },

  getTelegramStats() {
    return TelegramBotService.getUserStats();
  },

  getUserRegistrationInfo(userId: string): string | null {
    return TelegramBotService.getRegistrationInfo(userId);
  },

  isTelegramUserRegistered(userId: string): boolean {
    return TelegramBotService.isUserRegistered(userId);
  },

  exportTelegramData() {
    const users = TelegramBotService.getAllUsers();
    const stats = TelegramBotService.getUserStats();

    return {
      exportedAt: new Date().toISOString(),
      stats,
      users: users.map(u => ({
        userId: u.userId,
        name: TelegramBotService.formatUserName(u),
        registeredAt: u.registeredAt,
        lastMessageAt: u.lastMessageAt,
        isActive: u.isActive,
      })),
    };
  },
};
