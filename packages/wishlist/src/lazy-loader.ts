/**
 * Wishlist Lazy Loader
 * Provides dynamic loading capabilities for advanced wishlist features
 */

import type { AdvancedWishlistManager } from './advanced/wishlist-manager-advanced.js';
import type { WishlistConfig, WishlistItem } from './types/index.js';

/**
 * Dynamic loader for advanced wishlist features
 * This allows tree shaking of unused advanced features
 */
export class WishlistLazyLoader {
  private static advancedModule: typeof import('./advanced/index.js') | null = null;
  private static loadingPromise: Promise<typeof import('./advanced/index.js')> | null = null;

  /**
   * Load advanced wishlist module on demand
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
   * Create an advanced wishlist manager instance
   */
  static async createAdvancedWishlistManager(config: WishlistConfig): Promise<AdvancedWishlistManager> {
    const advancedModule = await this.loadAdvancedModule();
    return new advancedModule.AdvancedWishlistManager(config);
  }

  /**
   * Load complete wishlist (advanced feature)
   */
  static async loadWishlist(config: WishlistConfig): Promise<WishlistItem[]> {
    const manager = await this.createAdvancedWishlistManager(config);
    return manager.load();
  }

  /**
   * Share wishlist (advanced feature)
   */
  static async shareWishlist(config: WishlistConfig): Promise<string> {
    const manager = await this.createAdvancedWishlistManager(config);
    return manager.share();
  }

  /**
   * Sync wishlist (advanced feature)
   */
  static async syncWishlist(config: WishlistConfig): Promise<boolean> {
    const manager = await this.createAdvancedWishlistManager(config);
    return manager.sync();
  }

  /**
   * Get wishlist analytics (advanced feature)
   */
  static async getWishlistAnalytics(config: WishlistConfig): Promise<{
    totalItems: number;
    categories: Record<string, number>;
    mostAdded: string[];
    lastUpdated: Date;
  }> {
    const manager = await this.createAdvancedWishlistManager(config);
    return manager.getAnalytics();
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
      console.log('Advanced wishlist module preloaded');
    });
  }
}
