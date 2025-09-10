/**
 * Notifications Lazy Loader
 * Provides dynamic loading capabilities for advanced notification features
 */

import type { NotificationManagerAdvanced } from './advanced/notification-manager-advanced.js';
import type { NotificationOptions, ToastConfig } from './types/index.js';

/**
 * Dynamic loader for advanced notification features
 * This allows tree shaking of unused advanced features
 */
export class NotificationLazyLoader {
  private static advancedModule: typeof import('./advanced/index.js') | null = null;
  private static loadingPromise: Promise<typeof import('./advanced/index.js')> | null = null;

  /**
   * Load advanced notification module on demand
   */
  static async loadAdvancedModule(): Promise<typeof import('./advanced/index.js')> {
    if (this.advancedModule) {
      return this.advancedModule;
    }

    if (this.loadingPromise) {
      return this.loadingPromise;
    }

    this.loadingPromise = import('./advanced/index.js');
    this.advancedModule = await this.loadingPromise;
    return this.advancedModule;
  }

  /**
   * Create an advanced notification manager instance
   */
  static async createAdvancedNotificationManager(config?: Partial<ToastConfig>): Promise<NotificationManagerAdvanced> {
    const advancedModule = await this.loadAdvancedModule();
    return new advancedModule.NotificationManagerAdvanced(config);
  }

  /**
   * Show custom notification (advanced feature)
   */
  static async showCustomNotification(
    config: Partial<ToastConfig>,
    options: NotificationOptions & { 
      customStyle?: string;
      icon?: string;
      progress?: boolean;
    }
  ): Promise<string> {
    const manager = await this.createAdvancedNotificationManager(config);
    return manager.showCustom(options);
  }

  /**
   * Show progress notification (advanced feature)
   */
  static async showProgressNotification(
    config: Partial<ToastConfig>,
    options: NotificationOptions & { 
      progress: number;
      onComplete?: () => void;
    }
  ): Promise<string> {
    const manager = await this.createAdvancedNotificationManager(config);
    return manager.showProgress(options);
  }

  /**
   * Get notification history (advanced feature)
   */
  static async getNotificationHistory(config?: Partial<ToastConfig>): Promise<{
    id: string;
    type: string;
    message: string;
    title?: string;
    timestamp: Date;
    read: boolean;
  }[]> {
    const manager = await this.createAdvancedNotificationManager(config);
    return manager.getHistory();
  }

  /**
   * Update notification preferences (advanced feature)
   */
  static async updateNotificationPreferences(
    config: Partial<ToastConfig>,
    preferences: Partial<{
      enabled: boolean;
      types: string[];
      position: string;
      duration: number;
      sound: boolean;
    }>
  ): Promise<void> {
    const manager = await this.createAdvancedNotificationManager(config);
    manager.updatePreferences(preferences);
  }

  /**
   * Check if advanced features are loaded
   */
  static isAdvancedLoaded(): boolean {
    return this.advancedModule !== null;
  }

  /**
   * Preload advanced module (useful for performance optimization)
   */
  static preloadAdvanced(): Promise<void> {
    return this.loadAdvancedModule().then(() => {
      console.log('Advanced notification module preloaded');
    });
  }
}
