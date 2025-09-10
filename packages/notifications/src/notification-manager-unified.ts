/**
 * Unified Notification Manager
 * Combines core and advanced functionality with dynamic loading
 */

import { NotificationManagerCore } from './core/notification-manager-core.js';
import { NotificationLazyLoader } from './lazy-loader.js';
import type { NotificationOptions, ToastConfig } from './types/index.js';

/**
 * Unified NotificationManager that provides both core and advanced functionality
 * Advanced features are loaded on demand to optimize bundle size
 */
export class NotificationManager extends NotificationManagerCore {
  private advancedManager: any = null;

  constructor(config?: Partial<ToastConfig>) {
    super(config);
    console.log('Niko Unified Notification Manager initialized');
  }

  /**
   * Show custom notification (loads advanced module on demand)
   */
  async showCustom(options: NotificationOptions & { 
    customStyle?: string;
    icon?: string;
    progress?: boolean;
  }): Promise<string> {
    if (!this.advancedManager) {
      this.advancedManager = await NotificationLazyLoader.createAdvancedNotificationManager(this.config);
    }
    return this.advancedManager.showCustom(options);
  }

  /**
   * Show progress notification (loads advanced module on demand)
   */
  async showProgress(options: NotificationOptions & { 
    progress: number;
    onComplete?: () => void;
  }): Promise<string> {
    if (!this.advancedManager) {
      this.advancedManager = await NotificationLazyLoader.createAdvancedNotificationManager(this.config);
    }
    return this.advancedManager.showProgress(options);
  }

  /**
   * Get notification history (loads advanced module on demand)
   */
  async getHistory(): Promise<{
    id: string;
    type: string;
    message: string;
    title?: string;
    timestamp: Date;
    read: boolean;
  }[]> {
    if (!this.advancedManager) {
      this.advancedManager = await NotificationLazyLoader.createAdvancedNotificationManager(this.config);
    }
    return this.advancedManager.getHistory();
  }

  /**
   * Update notification preferences (loads advanced module on demand)
   */
  async updatePreferences(preferences: Partial<{
    enabled: boolean;
    types: string[];
    position: string;
    duration: number;
    sound: boolean;
  }>): Promise<void> {
    if (!this.advancedManager) {
      this.advancedManager = await NotificationLazyLoader.createAdvancedNotificationManager(this.config);
    }
    this.advancedManager.updatePreferences(preferences);
  }

  /**
   * Mark notification as read (loads advanced module on demand)
   */
  async markAsRead(id: string): Promise<void> {
    if (!this.advancedManager) {
      this.advancedManager = await NotificationLazyLoader.createAdvancedNotificationManager(this.config);
    }
    this.advancedManager.markAsRead(id);
  }

  /**
   * Clear notification history (loads advanced module on demand)
   */
  async clearHistory(): Promise<void> {
    if (!this.advancedManager) {
      this.advancedManager = await NotificationLazyLoader.createAdvancedNotificationManager(this.config);
    }
    this.advancedManager.clearHistory();
  }

  /**
   * Preload advanced features for better performance
   */
  async preloadAdvanced(): Promise<void> {
    return NotificationLazyLoader.preloadAdvanced();
  }

  /**
   * Check if advanced features are loaded
   */
  isAdvancedLoaded(): boolean {
    return NotificationLazyLoader.isAdvancedLoaded();
  }
}
