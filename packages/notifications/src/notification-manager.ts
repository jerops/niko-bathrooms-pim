import { NotificationOptions, ToastConfig, NotificationType } from './types';

export class NotificationManager {
  private config: ToastConfig;
  private container: HTMLElement;
  private notifications: Map<string, HTMLElement> = new Map();

  constructor(config?: Partial<ToastConfig>) {
    this.config = {
      position: 'top-right',
      maxToasts: 5,
      defaultDuration: 5000,
      ...config
    };
    
    this.container = this.createContainer();
  }

  /**
   * Show notification
   */
  show(options: NotificationOptions): string {
    const id = this.generateId();
    const element = this.createNotificationElement(id, options);
    
    this.container.appendChild(element);
    this.notifications.set(id, element);
    
    // Auto-remove after duration
    if (options.duration !== 0) {
      setTimeout(() => {
        this.remove(id);
      }, options.duration || this.config.defaultDuration);
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
      ${this.getPositionStyles()}
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

  private getPositionStyles(): string {
    switch (this.config.position) {
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

  private generateId(): string {
    return `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}