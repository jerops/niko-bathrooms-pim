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

  async register(data: RegisterData): Promise<AuthResult> {
    console.log('Registering user:', { email: data.email, role: data.role });

    try {
      const baseHref = document.querySelector('base')?.href || location.origin + '/';
      const redirectUrl = data.role === 'customer'
        ? baseHref + 'dev/app/customer/dashboard'
        : baseHref + 'dev/app/retailer/dashboard';

      const { data: result, error } = await this.supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
            user_type: data.role,
            role: data.role,
          },
          emailRedirectTo: redirectUrl,
        },
      });

      if (error) {
        console.error('Registration error:', error);
        return { success: false, error: error.message };
      }

      console.log('Registration successful:', result.user?.email);
      
      // Create Webflow CMS record
      await this.createWebflowRecord(
        result.user!.id,
        data.email,
        data.name,
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
      const { data: result, error } = await this.supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        console.error('Login error:', error);
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

