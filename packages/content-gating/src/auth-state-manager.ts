/**
 * AuthStateManager - Coordinates authentication state between components
 * Manages cookies, Supabase sessions, and state synchronization
 */

import type { User } from '@supabase/supabase-js';

export interface AuthCookies {
  token: string;
  uid: string;
  userType: 'customer' | 'retailer';
}

export interface AuthStateConfig {
  cookieOptions?: {
    domain?: string;
    path?: string;
    secure?: boolean;
    sameSite?: 'strict' | 'lax' | 'none';
    maxAge?: number; // in seconds
  };
  cookieNames?: {
    token?: string;
    uid?: string;
    userType?: string;
  };
}

export class AuthStateManager {
  private config: Required<AuthStateConfig>;
  private stateChangeCallbacks: Set<(state: AuthState) => void> = new Set();
  private currentState: AuthState | null = null;

  constructor(config: AuthStateConfig = {}) {
    this.config = {
      cookieOptions: {
        domain: config.cookieOptions?.domain || undefined,
        path: config.cookieOptions?.path || '/',
        secure: config.cookieOptions?.secure ?? true,
        sameSite: config.cookieOptions?.sameSite || 'lax',
        maxAge: config.cookieOptions?.maxAge || 7 * 24 * 60 * 60, // 7 days
        ...config.cookieOptions
      },
      cookieNames: {
        token: config.cookieNames?.token || 'c.token',
        uid: config.cookieNames?.uid || 'uid', 
        userType: config.cookieNames?.userType || 'user_type',
        ...config.cookieNames
      }
    };
  }

  /**
   * Set authentication cookies securely
   */
  setAuthenticationCookies(token: string, uid: string, userType: 'customer' | 'retailer'): void {
    console.log('AuthStateManager: Setting authentication cookies');
    
    const cookieOptions = this.buildCookieString();
    
    // Set JWT token cookie
    this.setCookie(this.config.cookieNames.token, token, cookieOptions);
    
    // Set user ID cookie
    this.setCookie(this.config.cookieNames.uid, uid, cookieOptions);
    
    // Set user type cookie
    this.setCookie(this.config.cookieNames.userType, userType, cookieOptions);
    
    // Update current state
    this.currentState = {
      isAuthenticated: true,
      token,
      uid,
      userType,
      timestamp: Date.now()
    };
    
    // Notify listeners
    this.notifyStateChange();
    
    console.log('AuthStateManager: Cookies set successfully');
  }

  /**
   * Get authentication cookies
   */
  getAuthenticationCookies(): AuthCookies | null {
    const token = this.getCookie(this.config.cookieNames.token);
    const uid = this.getCookie(this.config.cookieNames.uid);
    const userType = this.getCookie(this.config.cookieNames.userType);
    
    if (!token || !uid || !userType) {
      return null;
    }
    
    return {
      token,
      uid,
      userType: userType as 'customer' | 'retailer'
    };
  }

  /**
   * Clear all authentication cookies
   */
  clearAuthenticationCookies(): void {
    console.log('AuthStateManager: Clearing authentication cookies');
    
    // Clear each cookie
    this.clearCookie(this.config.cookieNames.token);
    this.clearCookie(this.config.cookieNames.uid);
    this.clearCookie(this.config.cookieNames.userType);
    
    // Clear local storage and session storage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('supabase.auth.token');
      sessionStorage.removeItem('supabase.auth.token');
    }
    
    // Update state
    this.currentState = {
      isAuthenticated: false,
      token: null,
      uid: null,
      userType: null,
      timestamp: Date.now()
    };
    
    // Notify listeners
    this.notifyStateChange();
    
    console.log('AuthStateManager: Cookies cleared');
  }

  /**
   * Validate current authentication state
   */
  async validateAuthenticationState(supabaseValidation?: (token: string) => Promise<User | null>): Promise<boolean> {
    const cookies = this.getAuthenticationCookies();
    
    if (!cookies) {
      console.warn('AuthStateManager: No authentication cookies found');
      return false;
    }
    
    // If Supabase validation function provided, use it
    if (supabaseValidation) {
      try {
        const user = await supabaseValidation(cookies.token);
        
        if (!user) {
          console.error('AuthStateManager: Token validation failed');
          this.clearAuthenticationCookies();
          return false;
        }
        
        // Verify UID matches
        if (user.id !== cookies.uid) {
          console.error('AuthStateManager: UID mismatch detected');
          this.clearAuthenticationCookies();
          return false;
        }
        
        // Verify user type matches
        const userType = user.user_metadata?.user_type || user.user_metadata?.role;
        if (userType !== cookies.userType) {
          console.error('AuthStateManager: User type mismatch detected');
          this.clearAuthenticationCookies();
          return false;
        }
        
        console.log('AuthStateManager: Authentication state validated successfully');
        return true;
        
      } catch (error) {
        console.error('AuthStateManager: Validation error', error);
        this.clearAuthenticationCookies();
        return false;
      }
    }
    
    // Basic validation without Supabase
    return true;
  }

  /**
   * Synchronize state with Supabase session
   */
  syncWithSupabaseSession(user: User | null): void {
    if (user) {
      const userType = (user.user_metadata?.user_type || 
                       user.user_metadata?.role || 
                       'customer') as 'customer' | 'retailer';
      
      // Get the session token (this would come from Supabase auth)
      const token = this.extractTokenFromSupabase();
      
      if (token) {
        this.setAuthenticationCookies(token, user.id, userType);
      }
    } else {
      this.clearAuthenticationCookies();
    }
  }

  /**
   * Register state change callback
   */
  onStateChange(callback: (state: AuthState) => void): () => void {
    this.stateChangeCallbacks.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.stateChangeCallbacks.delete(callback);
    };
  }

  /**
   * Get current authentication state
   */
  getCurrentState(): AuthState | null {
    return this.currentState;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const cookies = this.getAuthenticationCookies();
    return cookies !== null;
  }

  /**
   * Get user type from cookies
   */
  getUserType(): 'customer' | 'retailer' | null {
    const cookies = this.getAuthenticationCookies();
    return cookies?.userType || null;
  }

  // Private helper methods

  private setCookie(name: string, value: string, options: string): void {
    if (typeof document === 'undefined') return;
    document.cookie = `${name}=${encodeURIComponent(value)}${options}`;
  }

  private getCookie(name: string): string | null {
    if (typeof document === 'undefined') return null;
    
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    
    if (parts.length === 2) {
      const cookieValue = parts.pop()?.split(';').shift();
      return cookieValue ? decodeURIComponent(cookieValue) : null;
    }
    
    return null;
  }

  private clearCookie(name: string): void {
    if (typeof document === 'undefined') return;
    
    // Clear with various path combinations to ensure removal
    const paths = ['/', '', window.location.pathname];
    const domains = ['', window.location.hostname, `.${window.location.hostname}`];
    
    paths.forEach(path => {
      domains.forEach(domain => {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}; domain=${domain};`;
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path};`;
      });
    });
  }

  private buildCookieString(): string {
    const opts = this.config.cookieOptions;
    let cookieString = '';
    
    if (opts.path) cookieString += `; path=${opts.path}`;
    if (opts.domain) cookieString += `; domain=${opts.domain}`;
    if (opts.maxAge) cookieString += `; max-age=${opts.maxAge}`;
    if (opts.secure) cookieString += '; secure';
    if (opts.sameSite) cookieString += `; samesite=${opts.sameSite}`;
    
    return cookieString;
  }

  private extractTokenFromSupabase(): string | null {
    // Try to get token from localStorage (where Supabase stores it)
    if (typeof window !== 'undefined') {
      try {
        const storageKey = localStorage.getItem('supabase.auth.token');
        if (storageKey) {
          const parsed = JSON.parse(storageKey);
          return parsed?.access_token || null;
        }
      } catch {
        // Ignore parse errors
      }
    }
    return null;
  }

  private notifyStateChange(): void {
    if (this.currentState) {
      this.stateChangeCallbacks.forEach(callback => {
        try {
          callback(this.currentState!);
        } catch (error) {
          console.error('AuthStateManager: Error in state change callback', error);
        }
      });
    }
  }
}

// Auth state interface
export interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  uid: string | null;
  userType: 'customer' | 'retailer' | null;
  timestamp: number;
}