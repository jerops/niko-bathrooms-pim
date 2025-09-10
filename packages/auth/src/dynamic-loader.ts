/**
 * Dynamic Loading Utilities
 * Provides lazy loading capabilities for advanced authentication features
 */

import type { AdvancedAuthManager } from './advanced/auth-manager-advanced.js';
import type { RegisterData, AuthResult } from './advanced/types-advanced.js';

/**
 * Dynamic loader for advanced authentication features
 * This allows tree shaking of unused advanced features
 */
export class AuthDynamicLoader {
  private static advancedModule: typeof import('./advanced/index.js') | null = null;
  private static loadingPromise: Promise<typeof import('./advanced/index.js')> | null = null;

  /**
   * Load advanced authentication module on demand
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
   * Create an advanced auth manager instance
   */
  static async createAdvancedAuthManager(supabaseUrl: string, supabaseKey: string): Promise<AdvancedAuthManager> {
    const advancedModule = await this.loadAdvancedModule();
    return new advancedModule.AdvancedAuthManager(supabaseUrl, supabaseKey);
  }

  /**
   * Register a user using advanced features (loaded on demand)
   */
  static async registerUser(
    supabaseUrl: string, 
    supabaseKey: string, 
    data: RegisterData
  ): Promise<AuthResult> {
    const authManager = await this.createAdvancedAuthManager(supabaseUrl, supabaseKey);
    return authManager.register(data);
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
      console.log('Advanced auth module preloaded');
    });
  }
}
