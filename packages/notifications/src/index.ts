/**
 * @nikobathrooms/notifications - Notification system
 * Optimized for bundle size with core/advanced module splitting
 */

// Core exports (always available)
export * from './core/index.js';

// Advanced exports (loaded on demand)
export * from './advanced/index.js';

// Unified manager (combines core + advanced with dynamic loading)
export { NotificationManager } from './notification-manager-unified.js';
export { NotificationLazyLoader } from './lazy-loader.js';

// Legacy exports for backward compatibility
export type { NotificationOptions, ToastConfig, NotificationType } from './types/index.js';

// Package info
export const PACKAGE_VERSION = '1.0.0';
export const PACKAGE_NAME = '@nikobathrooms/notifications';