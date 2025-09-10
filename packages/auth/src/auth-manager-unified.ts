/**
 * Unified Authentication Manager
 * Combines core and advanced functionality with dynamic loading
 */

import { CoreAuthManager } from './core/auth-manager-core.js';
import { AuthDynamicLoader } from './dynamic-loader.js';
import type { AuthResult } from './core/types-core.js';
import type { RegisterData } from './advanced/types-advanced.js';

/**
 * Unified AuthManager that provides both core and advanced functionality
 * Advanced features are loaded on demand to optimize bundle size
 */
export class AuthManager extends CoreAuthManager {
  private advancedManager: any = null;
  private supabaseUrl: string;
  private supabaseKey: string;

  constructor(supabaseUrl: string, supabaseKey: string) {
    super(supabaseUrl, supabaseKey);
    this.supabaseUrl = supabaseUrl;
    this.supabaseKey = supabaseKey;
    console.log('Niko Unified Auth Manager initialized');
  }

  /**
   * Register a user (loads advanced module on demand)
   */
  async register(data: RegisterData): Promise<AuthResult> {
    console.log('Registering user (loading advanced module on demand)...');
    return AuthDynamicLoader.registerUser(
      this.supabaseUrl,
      this.supabaseKey,
      data
    );
  }

  /**
   * Check if a user already exists (loads advanced module on demand)
   */
  async checkUserExists(email: string): Promise<boolean> {
    if (!this.advancedManager) {
      this.advancedManager = await AuthDynamicLoader.createAdvancedAuthManager(
        this.supabaseUrl,
        this.supabaseKey
      );
    }
    return this.advancedManager.checkUserExists(email);
  }

  /**
   * Get onboarding URL for role (loads advanced module on demand)
   */
  async getOnboardingUrlForRole(role: 'customer' | 'retailer'): Promise<string> {
    if (!this.advancedManager) {
      this.advancedManager = await AuthDynamicLoader.createAdvancedAuthManager(
        this.supabaseUrl,
        this.supabaseKey
      );
    }
    return this.advancedManager.getOnboardingUrlForRole(role);
  }

  /**
   * Get email confirmation page URL (loads advanced module on demand)
   */
  async getEmailConfirmationPageUrl(): Promise<string> {
    if (!this.advancedManager) {
      this.advancedManager = await AuthDynamicLoader.createAdvancedAuthManager(
        this.supabaseUrl,
        this.supabaseKey
      );
    }
    return this.advancedManager.getEmailConfirmationPageUrl();
  }

  /**
   * Preload advanced features for better performance
   */
  async preloadAdvanced(): Promise<void> {
    return AuthDynamicLoader.preloadAdvanced();
  }

  /**
   * Check if advanced features are loaded
   */
  isAdvancedLoaded(): boolean {
    return AuthDynamicLoader.isAdvancedLoaded();
  }
}
