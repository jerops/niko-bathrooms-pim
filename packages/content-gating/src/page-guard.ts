/**
 * PageGuard - Secure page-load authentication with triple security check
 * Validates: JWT token (c.token), User ID (uid), and User Type (user_type)
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export interface PageGuardConfig {
  loginUrl: string;
  redirectUrls: {
    customer: string;
    retailer: string;
    default: string;
  };
  supabaseConfig: {
    url: string;
    anonKey: string;
  };
  cookieNames?: {
    token?: string;
    uid?: string;
    userType?: string;
  };
}

export interface AuthenticationState {
  isValid: boolean;
  token?: string;
  uid?: string;
  userType?: 'customer' | 'retailer';
  user?: any;
  error?: string;
}

export interface UserAccount {
  id: string;
  email: string;
  name: string;
  userType: 'customer' | 'retailer';
  metadata?: Record<string, any>;
}

export class PageGuard {
  private config: PageGuardConfig;
  private supabase: SupabaseClient;
  private authState: AuthenticationState = { isValid: false };
  
  constructor(config: PageGuardConfig) {
    this.config = {
      ...config,
      cookieNames: {
        token: config.cookieNames?.token || 'c.token',
        uid: config.cookieNames?.uid || 'uid',
        userType: config.cookieNames?.userType || 'user_type',
        ...config.cookieNames
      }
    };
    
    this.supabase = createClient(
      this.config.supabaseConfig.url,
      this.config.supabaseConfig.anonKey
    );
  }

  /**
   * Initialize page guard and validate access immediately
   */
  async initialize(): Promise<AuthenticationState> {
    console.log('PageGuard: Initializing page authentication check');
    
    // Show loader while checking
    this.showLoader();
    
    try {
      // Perform triple security check
      const isValid = await this.validatePageAccess();
      
      if (!isValid) {
        console.log('PageGuard: Authentication failed, redirecting to login');
        await this.redirectToLogin();
        return this.authState;
      }
      
      // Load user account data
      if (this.authState.uid && this.authState.userType) {
        const userAccount = await this.loadUserAccount(
          this.authState.uid, 
          this.authState.userType
        );
        
        if (userAccount) {
          await this.deliverPersonalizedContent(
            this.authState.userType, 
            userAccount
          );
        }
      }
      
      // Hide loader and show content
      this.hideLoader();
      this.revealProtectedContent();
      
      console.log('PageGuard: Authentication successful, content delivered');
      return this.authState;
      
    } catch (error) {
      console.error('PageGuard: Critical error during authentication', error);
      this.authState.error = 'Authentication system error';
      await this.redirectToLogin();
      return this.authState;
    }
  }

  /**
   * Triple security check: Validates JWT token, UID, and user_type
   */
  async validatePageAccess(): Promise<boolean> {
    console.log('PageGuard: Starting triple security validation');
    
    // 1. Check for required cookies
    const cookies = this.getAuthCookies();
    
    if (!cookies.token || !cookies.uid || !cookies.userType) {
      console.warn('PageGuard: Missing required authentication cookies');
      this.authState = {
        isValid: false,
        error: 'Missing authentication data'
      };
      return false;
    }
    
    // 2. Validate JWT token with Supabase
    try {
      const { data: { user }, error } = await this.supabase.auth.getUser(cookies.token);
      
      if (error || !user) {
        console.error('PageGuard: Invalid or expired token', error);
        this.authState = {
          isValid: false,
          error: 'Invalid authentication token'
        };
        return false;
      }
      
      // 3. Cross-reference UID
      if (user.id !== cookies.uid) {
        console.error('PageGuard: UID mismatch - potential security breach');
        this.authState = {
          isValid: false,
          error: 'Authentication mismatch'
        };
        return false;
      }
      
      // 4. Verify user type matches metadata
      const metadataUserType = user.user_metadata?.user_type || user.user_metadata?.role;
      if (metadataUserType !== cookies.userType) {
        console.error('PageGuard: User type mismatch');
        this.authState = {
          isValid: false,
          error: 'User role verification failed'
        };
        return false;
      }
      
      // All checks passed
      this.authState = {
        isValid: true,
        token: cookies.token,
        uid: cookies.uid,
        userType: cookies.userType as 'customer' | 'retailer',
        user: user
      };
      
      console.log('PageGuard: All security checks passed');
      return true;
      
    } catch (error) {
      console.error('PageGuard: Token validation error', error);
      this.authState = {
        isValid: false,
        error: 'Authentication validation failed'
      };
      return false;
    }
  }

  /**
   * Redirect unauthorized users to login
   */
  async redirectToLogin(): Promise<void> {
    // Clear invalid authentication data
    this.clearAuthCookies();
    
    // Store attempted URL for post-login redirect
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('redirectAfterLogin', window.location.href);
      window.location.href = this.config.loginUrl;
    }
  }

  /**
   * Load user account data from Supabase or Webflow CMS
   */
  async loadUserAccount(uid: string, userType: string): Promise<UserAccount | null> {
    try {
      // First try to get from Supabase auth
      const { data: { user }, error } = await this.supabase.auth.getUser();
      
      if (!error && user) {
        return {
          id: user.id,
          email: user.email || '',
          name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
          userType: userType as 'customer' | 'retailer',
          metadata: user.user_metadata
        };
      }
      
      // Fallback: Try to load from custom user table if needed
      console.warn('PageGuard: Could not load full user account data');
      return null;
      
    } catch (error) {
      console.error('PageGuard: Error loading user account', error);
      return null;
    }
  }

  /**
   * Deliver personalized content based on user type and account
   */
  async deliverPersonalizedContent(userType: string, userAccount: UserAccount): Promise<void> {
    console.log(`PageGuard: Delivering ${userType} content for ${userAccount.email}`);
    
    // Update data attributes for personalization
    document.body.setAttribute('data-user-type', userType);
    document.body.setAttribute('data-user-authenticated', 'true');
    
    // Show/hide role-specific content
    this.applyRoleBasedVisibility(userType);
    
    // Populate user data elements
    this.populateUserData(userAccount);
    
    // Trigger custom event for other components
    window.dispatchEvent(new CustomEvent('nikoAuthReady', {
      detail: {
        userType,
        userAccount,
        authenticated: true
      }
    }));
  }

  /**
   * Get authentication cookies
   */
  private getAuthCookies(): { token?: string; uid?: string; userType?: string } {
    const getCookie = (name: string): string | undefined => {
      if (typeof document === 'undefined') return undefined;
      
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      
      if (parts.length === 2) {
        return parts.pop()?.split(';').shift();
      }
      return undefined;
    };
    
    return {
      token: getCookie(this.config.cookieNames!.token!),
      uid: getCookie(this.config.cookieNames!.uid!),
      userType: getCookie(this.config.cookieNames!.userType!)
    };
  }

  /**
   * Clear authentication cookies
   */
  private clearAuthCookies(): void {
    if (typeof document === 'undefined') return;
    
    const clearCookie = (name: string) => {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    };
    
    clearCookie(this.config.cookieNames!.token!);
    clearCookie(this.config.cookieNames!.uid!);
    clearCookie(this.config.cookieNames!.userType!);
  }

  /**
   * Show loading state
   */
  private showLoader(): void {
    const loaders = document.querySelectorAll('[niko-data="page-loader"]');
    loaders.forEach(loader => {
      (loader as HTMLElement).style.display = 'flex';
    });
  }

  /**
   * Hide loading state
   */
  private hideLoader(): void {
    const loaders = document.querySelectorAll('[niko-data="page-loader"]');
    loaders.forEach(loader => {
      (loader as HTMLElement).style.display = 'none';
    });
  }

  /**
   * Reveal protected content after authentication
   */
  private revealProtectedContent(): void {
    const protectedElements = document.querySelectorAll('[niko-data="auth-required"]');
    protectedElements.forEach(element => {
      (element as HTMLElement).style.visibility = 'visible';
      (element as HTMLElement).style.opacity = '1';
    });
  }

  /**
   * Apply role-based content visibility
   */
  private applyRoleBasedVisibility(userType: string): void {
    // Hide content not for this role
    const roleElements = document.querySelectorAll('[niko-role]');
    
    roleElements.forEach(element => {
      const allowedRoles = element.getAttribute('niko-role')?.split(',').map(r => r.trim());
      
      if (allowedRoles && !allowedRoles.includes(userType)) {
        // SECURE: Remove from DOM completely
        element.remove();
      }
    });
  }

  /**
   * Populate user data in UI elements
   */
  private populateUserData(userAccount: UserAccount): void {
    // User name
    document.querySelectorAll('[niko-data="user-name"]').forEach(el => {
      el.textContent = userAccount.name;
    });
    
    // User email
    document.querySelectorAll('[niko-data="user-email"]').forEach(el => {
      el.textContent = userAccount.email;
    });
    
    // User type/role
    document.querySelectorAll('[niko-data="user-role"]').forEach(el => {
      el.textContent = userAccount.userType;
    });
  }

  /**
   * Get current authentication state
   */
  getAuthState(): AuthenticationState {
    return this.authState;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.authState.isValid;
  }

  /**
   * Get user type
   */
  getUserType(): 'customer' | 'retailer' | null {
    return this.authState.userType || null;
  }
}