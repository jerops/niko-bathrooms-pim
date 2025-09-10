/**
 * Core Authentication Manager
 * Essential authentication functionality for login, logout, and user management
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { AuthResult, LoginData } from './types-core.js';
import { getDashboardUrl, getLoginUrl } from './redirects-core.js';

export class CoreAuthManager {
  protected supabase: SupabaseClient;
  protected initialized = false;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.initialized = true;
    console.log('Niko Core Auth Manager initialized');
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Validate email format
   */
  protected isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  async login(data: LoginData): Promise<AuthResult> {
    console.log('Logging in user:', { email: data.email });

    try {
      // 1. Validate input
      if (!data.email || !data.password) {
        return { success: false, error: 'Email and password are required' };
      }

      // 2. Validate email format
      if (!this.isValidEmail(data.email)) {
        return { success: false, error: 'Please enter a valid email address' };
      }

      // 3. Attempt login
      const { data: result, error } = await this.supabase.auth.signInWithPassword({
        email: data.email.toLowerCase().trim(),
        password: data.password,
      });

      if (error) {
        console.error('Login error:', error);
        
        // Handle specific login errors
        if (error.message.includes('Invalid login credentials')) {
          return { success: false, error: 'Invalid email or password. Please check your credentials and try again.' };
        }
        
        if (error.message.includes('Email not confirmed')) {
          return { success: false, error: 'Please check your email and click the confirmation link before logging in.' };
        }
        
        return { success: false, error: error.message };
      }

      console.log('Login successful:', result.user?.email);
      return { success: true, user: result.user };
    } catch (error) {
      console.error('Login failed:', error);
      return { success: false, error: (error as Error).message };
    }
  }

  async logout(): Promise<AuthResult> {
    console.log('Logging out user...');

    try {
      const { error } = await this.supabase.auth.signOut();
      
      // Clear storage like production
      localStorage.clear();
      sessionStorage.clear();

      if (error) {
        console.error('Logout error:', error);
        return { success: false, error: error.message };
      }

      console.log('Logout successful');
      return { success: true };
    } catch (error) {
      console.error('Logout failed:', error);
      return { success: false, error: (error as Error).message };
    }
  }

  async getCurrentUser() {
    if (!this.initialized) return null;

    try {
      const { data: { user }, error } = await this.supabase.auth.getUser();
      if (error) throw error;
      return user;
    } catch (error) {
      console.error('Get user failed:', error);
      return null;
    }
  }

  async isAuthenticated(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return !!user;
  }

  /**
   * Get final dashboard URL for user role (after onboarding complete)
   */
  getDashboardUrlForRole(role: 'customer' | 'retailer'): string {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    return getDashboardUrl(role, baseUrl);
  }

  /**
   * Get login URL
   */
  getLoginUrl(): string {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    return getLoginUrl(baseUrl);
  }
}
