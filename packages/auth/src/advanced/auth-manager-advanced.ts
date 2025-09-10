/**
 * Advanced Authentication Manager
 * Extended authentication functionality for registration, email confirmation, and advanced features
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { AuthResult, RegisterData, PasswordValidationResult } from './types-advanced.js';
import { getSignupEmailRedirectUrl, getEmailConfirmationUrl, getOnboardingUrlForRole } from './redirects-advanced.js';

export class AdvancedAuthManager {
  protected supabase: SupabaseClient;
  protected initialized = false;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.initialized = true;
    console.log('Niko Advanced Auth Manager initialized');
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

  /**
   * Validate password strength
   */
  protected isValidPassword(password: string): PasswordValidationResult {
    if (password.length < 8) {
      return { valid: false, message: 'Password must be at least 8 characters long' };
    }
    
    // Check for at least one letter and one number
    if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(password)) {
      return { valid: false, message: 'Password must contain at least one letter and one number' };
    }

    return { valid: true };
  }

  /**
   * Check if a user already exists with the given email
   * This helps prevent duplicate registrations
   */
  async checkUserExists(email: string): Promise<boolean> {
    try {
      // Try to sign in with a dummy password to check if user exists
      // This is a workaround since getUserByEmail is not available in client
      const { error } = await this.supabase.auth.signInWithPassword({
        email: email,
        password: 'dummy-password-check'
      });
      
      // If we get "Invalid login credentials", user exists but password is wrong
      // If we get "Email not confirmed", user exists but not confirmed
      // If we get other errors, user might not exist
      if (error) {
        if (error.message.includes('Invalid login credentials') || 
            error.message.includes('Email not confirmed')) {
          return true; // User exists
        }
        return false; // User doesn't exist or other error
      }

      return true; // User exists and password was correct (unlikely with dummy password)
    } catch (error) {
      console.error('User existence check failed:', error);
      // If check fails, allow registration attempt
      return false;
    }
  }

  async register(data: RegisterData): Promise<AuthResult> {
    console.log('Registering user:', { email: data.email, role: data.role });

    try {
      // 1. Validate input data
      if (!data.email || !data.password || !data.name || !data.role) {
        return { success: false, error: 'All fields are required' };
      }

      // 2. Validate email format
      if (!this.isValidEmail(data.email)) {
        return { success: false, error: 'Please enter a valid email address' };
      }

      // 3. Validate password strength
      const passwordCheck = this.isValidPassword(data.password);
      if (!passwordCheck.valid) {
        return { success: false, error: passwordCheck.message };
      }

      // 4. Check if user already exists
      const userExists = await this.checkUserExists(data.email);
      if (userExists) {
        return { 
          success: false, 
          error: 'An account with this email address already exists. Please try logging in instead.' 
        };
      }

      // 5. Get proper redirect URL for email confirmation (to onboarding)
      const baseUrl = document.querySelector('base')?.href || window.location.origin;
      const emailRedirectUrl = getSignupEmailRedirectUrl(data.role, baseUrl);

      console.log('Email confirmation will redirect to onboarding:', emailRedirectUrl);

      const { data: result, error } = await this.supabase.auth.signUp({
        email: data.email.toLowerCase().trim(), // Normalize email
        password: data.password,
        options: {
          data: {
            name: data.name.trim(),
            user_type: data.role,
            role: data.role,
            display_name: data.name.trim(),
            email_normalized: data.email.toLowerCase().trim()
          },
          emailRedirectTo: emailRedirectUrl, // This goes to onboarding after email confirmation
        },
      });

      if (error) {
        console.error('Registration error:', error);
        
        // Handle specific Supabase errors
        if (error.message.includes('User already registered')) {
          return { 
            success: false, 
            error: 'An account with this email already exists. Please try logging in instead.' 
          };
        }
        
        if (error.message.includes('Invalid email')) {
          return { success: false, error: 'Please enter a valid email address' };
        }
        
        if (error.message.includes('Password')) {
          return { success: false, error: 'Password does not meet requirements' };
        }
        
        return { success: false, error: error.message };
      }

      // 6. Check if user was actually created (Supabase might return success even for duplicates)
      if (!result.user) {
        return { 
          success: false, 
          error: 'Registration failed. Please check your email and try again.' 
        };
      }

      console.log('Registration successful:', result.user?.email);
      
      // 7. Create Webflow CMS record
      await this.createWebflowRecord(
        result.user.id,
        data.email.toLowerCase().trim(),
        data.name.trim(),
        data.role
      );

      return { success: true, user: result.user };
    } catch (error) {
      console.error('Registration failed:', error);
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * Get appropriate onboarding URL for user role (after email confirmation)
   */
  getOnboardingUrlForRole(role: 'customer' | 'retailer'): string {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    return getOnboardingUrlForRole(role, baseUrl);
  }

  /**
   * Get email confirmation page URL (where users go immediately after signup)
   */
  getEmailConfirmationPageUrl(): string {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    return getEmailConfirmationUrl(baseUrl);
  }

  /**
   * Get current user (inherited from core functionality)
   */
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

  private async createWebflowRecord(userId: string, email: string, name: string, userType: string) {
    try {
      const { error } = await this.supabase.functions.invoke('create-webflow-user', {
          body: {
          user_id: userId,
          email: email,
          name: name,
          user_type: userType,
        },
      });

      if (error) {
        console.warn('Webflow integration error (user still created in Supabase):', error);
      } else {
        console.log('Webflow CMS record created');
      }
    } catch (error) {
      console.warn('Edge function error:', error);
    }
  }
}
