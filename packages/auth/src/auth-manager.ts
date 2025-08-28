import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { AuthResult, RegisterData, LoginData } from './types.js';

export class AuthManager {
  private supabase: SupabaseClient;
  private initialized = false;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.initialized = true;
    console.log('Niko Auth Manager initialized');
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Check if a user already exists with the given email
   * This helps prevent duplicate registrations
   */
  async checkUserExists(email: string): Promise<boolean> {
    try {
      // First check if user exists in auth.users table
      const { data: { user }, error } = await this.supabase.auth.admin.getUserByEmail(email);
      
      if (error && error.message !== 'User not found') {
        console.error('Error checking user existence:', error);
        // If we can't check, allow the registration attempt - Supabase will handle duplicates
        return false;
      }

      return !!user;
    } catch (error) {
      console.error('User existence check failed:', error);
      // If check fails, allow registration attempt
      return false;
    }
  }

  /**
   * Validate email format
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate password strength
   */
  private isValidPassword(password: string): { valid: boolean; message?: string } {
    if (password.length < 8) {
      return { valid: false, message: 'Password must be at least 8 characters long' };
    }
    
    // Check for at least one letter and one number
    if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(password)) {
      return { valid: false, message: 'Password must contain at least one letter and one number' };
    }

    return { valid: true };
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

      // 5. Proceed with registration
      const baseHref = document.querySelector('base')?.href || location.origin + '/';
      const redirectUrl = data.role === 'customer'
        ? baseHref + 'dev/app/customer/dashboard'
        : baseHref + 'dev/app/retailer/dashboard';

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
          emailRedirectTo: redirectUrl,
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
