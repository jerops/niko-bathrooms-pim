/**
 * Unified Wishlist Manager
 * Combines core and advanced functionality with dynamic loading
 */

import { WishlistManagerCore } from './core/wishlist-manager-core.js';
import { WishlistLazyLoader } from './lazy-loader.js';
import type { WishlistConfig, WishlistItem } from './types/index.js';

/**
 * Unified WishlistManager that provides both core and advanced functionality
 * Advanced features are loaded on demand to optimize bundle size
 */
export class WishlistManager extends WishlistManagerCore {
  private advancedManager: any = null;

  constructor(config: WishlistConfig) {
    super(config);
    console.log('Niko Unified Wishlist Manager initialized');
  }

  /**
   * Load complete wishlist (loads advanced module on demand)
   */
  async load(): Promise<WishlistItem[]> {
    console.log('Loading complete wishlist (loading advanced module on demand)...');
    return WishlistLazyLoader.loadWishlist(this.getConfig());
  }

  /**
   * Share wishlist (loads advanced module on demand)
   */
  async share(): Promise<string> {
    if (!this.advancedManager) {
      this.advancedManager = await WishlistLazyLoader.createAdvancedWishlistManager(this.getConfig());
    }
    return this.advancedManager.share();
  }

  /**
   * Sync wishlist between devices (loads advanced module on demand)
   */
  async sync(): Promise<boolean> {
    if (!this.advancedManager) {
      this.advancedManager = await WishlistLazyLoader.createAdvancedWishlistManager(this.getConfig());
    }
    return this.advancedManager.sync();
  }

  /**
   * Get wishlist analytics (loads advanced module on demand)
   */
  async getAnalytics(): Promise<{
    totalItems: number;
    categories: Record<string, number>;
    mostAdded: string[];
    lastUpdated: Date;
  }> {
    if (!this.advancedManager) {
      this.advancedManager = await WishlistLazyLoader.createAdvancedWishlistManager(this.getConfig());
    }
    return this.advancedManager.getAnalytics();
  }

  /**
   * Clear entire wishlist (loads advanced module on demand)
   */
  async clear(): Promise<boolean> {
    if (!this.advancedManager) {
      this.advancedManager = await WishlistLazyLoader.createAdvancedWishlistManager(this.getConfig());
    }
    return this.advancedManager.clear();
  }

  /**
   * Preload advanced features for better performance
   */
  async preloadAdvanced(): Promise<void> {
    return WishlistLazyLoader.preloadAdvanced();
  }

  /**
   * Check if advanced features are loaded
   */
  isAdvancedLoaded(): boolean {
    return WishlistLazyLoader.isAdvancedLoaded();
  }
}
