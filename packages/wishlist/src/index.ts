/**
 * @nikobathrooms/wishlist - Wishlist system
 * Optimized for bundle size with core/advanced module splitting
 */

// Core exports (always available)
export * from './core/index.js';

// Advanced exports (loaded on demand)
export * from './advanced/index.js';

// Unified manager (combines core + advanced with dynamic loading)
export { WishlistManager } from './wishlist-manager-unified.js';
export { WishlistLazyLoader } from './lazy-loader.js';

// Legacy exports for backward compatibility
export type { WishlistConfig, WishlistItem } from './types/index.js';

// Package info
export const PACKAGE_VERSION = '1.0.0';
export const PACKAGE_NAME = '@nikobathrooms/wishlist';