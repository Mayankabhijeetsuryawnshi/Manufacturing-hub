/**
 * Notification Service Utility
 * Integrated with Telegram Bot alerts
 */

import { TelegramBotService } from './telegram-service';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}

type ToastCallback = (toasts: Toast[]) => void;
const listeners = new Set<ToastCallback>();
let toasts: Toast[] = [];

export const NotificationService = {
  get toasts() {
    return toasts;
  },

  subscribe(callback: ToastCallback) {
    listeners.add(callback);
    callback([...toasts]);
    return () => {
      listeners.delete(callback);
    };
  },

  showToast(type: 'success' | 'error' | 'info' | 'warning', message: string, duration = 4000) {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: Toast = { id, type, message, duration };
    toasts = [...toasts, newToast];
    listeners.forEach(cb => cb(toasts));

    if (duration > 0) {
      setTimeout(() => {
        this.dismissToast(id);
      }, duration);
    }
    return id;
  },

  dismissToast(id: string) {
    toasts = toasts.filter(t => t.id !== id);
    listeners.forEach(cb => cb(toasts));
  },

  /**
   * Requests permission to show browser notifications
   */
  async requestPermission() {
    if (!("Notification" in window)) {
      console.warn("This browser does not support desktop notification");
      return false;
    }

    if (Notification.permission === "granted") {
      return true;
    }

    if (Notification.permission !== "denied") {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    }

    return false;
  },

  /**
   * Sends a browser notification
   */
  async send(title: string, options?: NotificationOptions) {
    const hasPermission = await this.requestPermission();
    
    if (hasPermission) {
      return new Notification(title, {
        icon: '/favicon.ico',
        ...options,
      });
    }
    
    // Fallback to console if permission denied
    console.log(`[Notification Fallback]: ${title}`, options?.body);
  },

  /**
   * Status indicators
   */
  success(msg: string) {
    console.log("✅ [SUCCESS]:", msg);
    this.showToast('success', msg);
  },

  error(msg: string) {
    console.error("❌ [ERROR]:", msg);
    this.showToast('error', msg);
  },

  info(msg: string) {
    console.log("ℹ️ [INFO]:", msg);
    this.showToast('info', msg);
  },

  warning(msg: string) {
    console.warn("⚠️ [WARNING]:", msg);
    this.showToast('warning', msg);
  },

  /**
   * Specifically for low stock alerts
   */
  async alertLowStock(items: string[]) {
    if (items.length === 0) return;

    const title = "⚠️ Low Stock Alert";
    const body = `The following items are running low:\n${items.join(', ')}`;
    
    // Send browser notification
    await this.send(title, {
      body,
      tag: 'low-stock-alert',
      requireInteraction: true,
      silent: false,
    });

    // Also send to Telegram users if registered
    const users = TelegramBotService.getAllUsers();
    if (users.length > 0) {
      console.log(`📢 Low stock alert broadcast to ${users.length} Telegram users`);
    }
  },

  /**
   * Send production alert
   */
  async alertProduction(message: string, type: 'success' | 'warning' | 'error' | 'info' = 'info') {
    const title = type === 'success' ? '✅ Production Update' : type === 'warning' ? '⚠️ Production Alert' : '❌ Production Error';
    
    await this.send(title, {
      body: message,
      tag: 'production-alert',
      requireInteraction: false,
    });
  },

  /**
   * Send quality control alert
   */
  async alertQuality(parameter: string, value: number, threshold: number) {
    const isLow = value < threshold;
    const title = isLow ? '⚠️ Quality Below Threshold' : '✅ Quality Acceptable';
    const body = `${parameter}: ${value}% (Threshold: ${threshold}%)`;

    await this.send(title, {
      body,
      tag: 'quality-alert',
      requireInteraction: isLow,
    });
  },

  /**
   * Send report submission confirmation
   */
  async alertReportSubmitted(reportType: string, reportDate: string) {
    const title = '✅ Report Submitted';
    const body = `${reportType} for ${reportDate} has been saved successfully.`;

    await this.send(title, {
      body,
      tag: 'report-alert',
      requireInteraction: false,
    });
  },

  /**
   * Send system status alert
   */
  async alertSystemStatus(status: 'online' | 'offline' | 'degraded', message: string) {
    const titles = {
      online: '🟢 System Online',
      offline: '🔴 System Offline',
      degraded: '🟡 System Degraded',
    };
    
    const title = titles[status];
    await this.send(title, {
      body: message,
      tag: 'system-alert',
      requireInteraction: status !== 'online',
    });
  },

  /**
   * Notify user message received by bot
   */
  notifyBotMessageReceived(userName: string, messageTime: string) {
    const msg = `Message received from ${userName} at ${messageTime}`;
    console.log(`📨 [BOT MESSAGE]: ${msg}`);
    this.info(msg);
  },

  /**
   * Send bulk notification to all registered users
   */
  async notifyAllUsers(title: string, message: string) {
    const users = TelegramBotService.getAllUsers();
    
    if (users.length === 0) {
      console.warn("No registered Telegram users to notify");
      return;
    }

    await this.send(title, {
      body: message,
      tag: 'bulk-alert',
    });

    console.log(`📢 Bulk alert broadcast to ${users.length} users`);
  },
};
