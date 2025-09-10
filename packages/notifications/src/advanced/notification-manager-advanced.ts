/**
 * Advanced Notification Manager
 * Extended notification functionality loaded on demand
 */

import { NotificationOptions, ToastConfig, NotificationType } from '../types';

export interface NotificationPreferences {
  enabled: boolean;
  types: NotificationType[];
  position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'center';
  duration: number;
  sound: boolean;
}

export interface NotificationHistory {
  id: string;
  type: NotificationType;
  message: string;
  title?: string;
  timestamp: Date;
  read: boolean;
}

export class NotificationManagerAdvanced {
  private config: ToastConfig;
  private container: HTMLElement;
  private notifications: Map<string, HTMLElement> = new Map();
  private history: NotificationHistory[] = [];
  private preferences: NotificationPreferences;

  constructor(config?: Partial<ToastConfig>) {
    this.config = {
      position: 'top-right',
      maxToasts: 5,
      defaultDuration: 5000,
      ...config
    };
    
    this.container = this.createContainer();
    this.preferences = this.loadPreferences();
  }

  /**
   * Show notification with advanced features
   */
  show(options: NotificationOptions): string {
    // Check preferences
    if (!this.preferences.enabled || !this.preferences.types.includes(options.type)) {
      return '';
    }

    const id = this.generateId();
    const element = this.createNotificationElement(id, options);
    
    this.container.appendChild(element);
    this.notifications.set(id, element);
    
    // Add to history
    this.addToHistory({
      id,
      type: options.type,
      message: options.message,
      title: options.title,
      timestamp: new Date(),
      read: false
    });
    
    // Auto-remove after duration
    if (options.duration !== 0) {
      setTimeout(() => {
        this.remove(id);
      }, options.duration || this.preferences.duration);
    }

    // Play sound if enabled
    if (this.preferences.sound) {
      this.playNotificationSound(options.type);
    }
    
    return id;
  }

  /**
   * Remove specific notification
   */
  remove(id: string): void {
    const element = this.notifications.get(id);
    if (element) {
      element.style.transform = 'translateX(400px)';
      element.style.opacity = '0';
      
      setTimeout(() => {
        element.remove();
        this.notifications.delete(id);
      }, 300);
    }
  }

  /**
   * Clear all notifications
   */
  clear(): void {
    this.notifications.forEach((_, id) => this.remove(id));
  }

  /**
   * Get notification history
   */
  getHistory(): NotificationHistory[] {
    return [...this.history].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Mark notification as read
   */
  markAsRead(id: string): void {
    const notification = this.history.find(n => n.id === id);
    if (notification) {
      notification.read = true;
      this.saveHistory();
    }
  }

  /**
   * Clear notification history
   */
  clearHistory(): void {
    this.history = [];
    this.saveHistory();
  }

  /**
   * Update notification preferences
   */
  updatePreferences(preferences: Partial<NotificationPreferences>): void {
    this.preferences = { ...this.preferences, ...preferences };
    this.savePreferences();
    
    // Update container position if changed
    if (preferences.position) {
      this.container.className = `niko-notifications-${preferences.position}`;
      this.container.style.cssText = `
        position: fixed;
        z-index: 9999;
        pointer-events: none;
        ${this.getPositionStyles(preferences.position)}
      `;
    }
  }

  /**
   * Get current preferences
   */
  getPreferences(): NotificationPreferences {
    return { ...this.preferences };
  }

  /**
   * Show notification with custom styling
   */
  showCustom(options: NotificationOptions & { 
    customStyle?: string;
    icon?: string;
    progress?: boolean;
  }): string {
    const id = this.generateId();
    const element = this.createCustomNotificationElement(id, options);
    
    this.container.appendChild(element);
    this.notifications.set(id, element);
    
    // Add to history
    this.addToHistory({
      id,
      type: options.type,
      message: options.message,
      title: options.title,
      timestamp: new Date(),
      read: false
    });
    
    return id;
  }

  /**
   * Show notification with progress bar
   */
  showProgress(options: NotificationOptions & { 
    progress: number; // 0-100
    onComplete?: () => void;
  }): string {
    const id = this.showCustom({
      ...options,
      progress: true,
      customStyle: `
        background: linear-gradient(90deg, #3b82f6 ${options.progress}%, #e5e7eb ${options.progress}%);
        color: white;
      `
    });

    // Simulate progress completion
    if (options.progress >= 100 && options.onComplete) {
      setTimeout(() => {
        options.onComplete();
        this.remove(id);
      }, 1000);
    }

    return id;
  }

  private createContainer(): HTMLElement {
    const existing = document.getElementById('niko-notifications-container');
    if (existing) return existing;

    const container = document.createElement('div');
    container.id = 'niko-notifications-container';
    container.className = `niko-notifications-${this.config.position}`;
    container.style.cssText = `
      position: fixed;
      z-index: 9999;
      pointer-events: none;
      ${this.getPositionStyles(this.config.position)}
    `;
    
    document.body.appendChild(container);
    return container;
  }

  private createNotificationElement(id: string, options: NotificationOptions): HTMLElement {
    const element = document.createElement('div');
    element.className = `niko-notification niko-notification-${options.type}`;
    element.style.cssText = `
      pointer-events: auto;
      margin-bottom: 12px;
      padding: 16px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      transform: translateX(400px);
      opacity: 0;
      transition: all 0.3s ease;
      max-width: 400px;
      ${this.getTypeStyles(options.type)}
    `;

    element.innerHTML = `
      <div class="niko-notification-content">
        ${options.title ? `<div class="niko-notification-title">${options.title}</div>` : ''}
        <div class="niko-notification-message">${options.message}</div>
        ${options.action ? `<button class="niko-notification-action">${options.action.label}</button>` : ''}
      </div>
      <button class="niko-notification-close">×</button>
    `;

    // Add event listeners
    const closeBtn = element.querySelector('.niko-notification-close');
    closeBtn?.addEventListener('click', () => this.remove(id));

    const actionBtn = element.querySelector('.niko-notification-action');
    if (actionBtn && options.action) {
      actionBtn.addEventListener('click', options.action.onClick);
    }

    // Trigger animation
    setTimeout(() => {
      element.style.transform = 'translateX(0)';
      element.style.opacity = '1';
    }, 10);

    return element;
  }

  private createCustomNotificationElement(id: string, options: NotificationOptions & { 
    customStyle?: string;
    icon?: string;
    progress?: boolean;
  }): HTMLElement {
    const element = document.createElement('div');
    element.className = `niko-notification niko-notification-${options.type}`;
    element.style.cssText = `
      pointer-events: auto;
      margin-bottom: 12px;
      padding: 16px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      transform: translateX(400px);
      opacity: 0;
      transition: all 0.3s ease;
      max-width: 400px;
      ${options.customStyle || this.getTypeStyles(options.type)}
    `;

    element.innerHTML = `
      <div class="niko-notification-content">
        ${options.icon ? `<div class="niko-notification-icon">${options.icon}</div>` : ''}
        ${options.title ? `<div class="niko-notification-title">${options.title}</div>` : ''}
        <div class="niko-notification-message">${options.message}</div>
        ${options.progress ? `<div class="niko-notification-progress"><div class="niko-notification-progress-bar"></div></div>` : ''}
        ${options.action ? `<button class="niko-notification-action">${options.action.label}</button>` : ''}
      </div>
      <button class="niko-notification-close">×</button>
    `;

    // Add event listeners
    const closeBtn = element.querySelector('.niko-notification-close');
    closeBtn?.addEventListener('click', () => this.remove(id));

    const actionBtn = element.querySelector('.niko-notification-action');
    if (actionBtn && options.action) {
      actionBtn.addEventListener('click', options.action.onClick);
    }

    // Trigger animation
    setTimeout(() => {
      element.style.transform = 'translateX(0)';
      element.style.opacity = '1';
    }, 10);

    return element;
  }

  private getPositionStyles(position: string): string {
    switch (position) {
      case 'top-right':
        return 'top: 20px; right: 20px;';
      case 'top-left':
        return 'top: 20px; left: 20px;';
      case 'bottom-right':
        return 'bottom: 20px; right: 20px;';
      case 'bottom-left':
        return 'bottom: 20px; left: 20px;';
      case 'center':
        return 'top: 50%; left: 50%; transform: translate(-50%, -50%);';
      default:
        return 'top: 20px; right: 20px;';
    }
  }

  private getTypeStyles(type: NotificationType): string {
    const styles = {
      success: 'background: #10b981; color: white;',
      error: 'background: #ef4444; color: white;',
      warning: 'background: #f59e0b; color: white;',
      info: 'background: #3b82f6; color: white;'
    };
    return styles[type];
  }

  private addToHistory(notification: NotificationHistory): void {
    this.history.unshift(notification);
    
    // Keep only last 100 notifications
    if (this.history.length > 100) {
      this.history = this.history.slice(0, 100);
    }
    
    this.saveHistory();
  }

  private loadPreferences(): NotificationPreferences {
    try {
      const stored = localStorage.getItem('niko-notification-preferences');
      return stored ? JSON.parse(stored) : {
        enabled: true,
        types: ['success', 'error', 'warning', 'info'],
        position: 'top-right',
        duration: 5000,
        sound: false
      };
    } catch {
      return {
        enabled: true,
        types: ['success', 'error', 'warning', 'info'],
        position: 'top-right',
        duration: 5000,
        sound: false
      };
    }
  }

  private savePreferences(): void {
    try {
      localStorage.setItem('niko-notification-preferences', JSON.stringify(this.preferences));
    } catch (error) {
      console.error('Error saving notification preferences:', error);
    }
  }

  private loadHistory(): void {
    try {
      const stored = localStorage.getItem('niko-notification-history');
      if (stored) {
        this.history = JSON.parse(stored).map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        }));
      }
    } catch (error) {
      console.error('Error loading notification history:', error);
    }
  }

  private saveHistory(): void {
    try {
      localStorage.setItem('niko-notification-history', JSON.stringify(this.history));
    } catch (error) {
      console.error('Error saving notification history:', error);
    }
  }

  private playNotificationSound(type: NotificationType): void {
    // Simple beep sound - in a real implementation, you'd use audio files
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Different frequencies for different types
    const frequencies = {
      success: 800,
      error: 400,
      warning: 600,
      info: 500
    };
    
    oscillator.frequency.setValueAtTime(frequencies[type], audioContext.currentTime);
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);
  }

  private generateId(): string {
    return `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
