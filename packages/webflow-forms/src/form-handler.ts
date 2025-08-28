/**
 * Webflow Form Handlers
 * Updated to handle correct signup → onboarding → dashboard flow
 */

import { AuthManager } from '@nikobathrooms/auth';
import { NotificationManager } from '@nikobathrooms/notifications';
import { getDashboardUrl, getEmailConfirmationUrl } from '@nikobathrooms/auth/src/redirects.js';

export class WebflowFormHandler {
  private auth: AuthManager;
  private notifications: NotificationManager;

  constructor(supabaseUrl?: string, supabaseKey?: string) {
    // Allow passing Supabase credentials or use from environment
    this.auth = new AuthManager(
      supabaseUrl || process.env.SUPABASE_URL || '', 
      supabaseKey || process.env.SUPABASE_ANON_KEY || ''
    );
    this.notifications = new NotificationManager();
  }

  /**
   * Initialize form handlers for login page
   */
  initLoginForm(): void {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setupLoginHandlers());
    } else {
      this.setupLoginHandlers();
    }
  }

  /**
   * Initialize form handlers for signup page  
   */
  initSignupForm(): void {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setupSignupHandlers());
    } else {
      this.setupSignupHandlers();
    }
  }

  private setupLoginHandlers(): void {
    // Find login form (standard Webflow form)
    const loginForm = document.querySelector('form[data-name="Login Form"]') as HTMLFormElement;
    if (!loginForm) {
      console.error('Login form not found');
      return;
    }

    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const emailInput = loginForm.querySelector('input[name="Email"]') as HTMLInputElement;
      const passwordInput = loginForm.querySelector('input[name="Password"]') as HTMLInputElement;
      const submitButton = loginForm.querySelector('input[type="submit"]') as HTMLInputElement;

      if (!emailInput || !passwordInput) {
        this.notifications.show({
          type: 'error',
          message: 'Form fields not found'
        });
        return;
      }

      // Disable button during login
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.value = 'Signing in...';
      }

      try {
        const result = await this.auth.login({
          email: emailInput.value,
          password: passwordInput.value
        });

        if (result.success) {
          this.notifications.show({
            type: 'success',
            message: 'Login successful! Redirecting...'
          });

          // Get user role from metadata and redirect to DASHBOARD (not onboarding)
          const userRole = (result.user?.user_metadata?.role || 
                           result.user?.user_metadata?.user_type || 
                           'customer') as 'customer' | 'retailer';
          
          console.log('Login: Redirecting user with role to dashboard:', userRole);
          
          // For login, go directly to dashboard (onboarding already completed)
          const dashboardUrl = getDashboardUrl(userRole);
          window.location.href = dashboardUrl;
          
        } else {
          this.notifications.show({
            type: 'error',
            message: result.error || 'Login failed'
          });
        }
      } catch (error) {
        console.error('Login error:', error);
        this.notifications.show({
          type: 'error',
          message: 'Login error occurred'
        });
      } finally {
        // Re-enable button
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.value = 'Sign In';
        }
      }
    });
  }

  private setupSignupHandlers(): void {
    // Find signup form
    const signupForm = document.querySelector('form[data-name="Signup Form"]') as HTMLFormElement;
    if (!signupForm) {
      console.error('Signup form not found');
      return;
    }

    // Role detection (from our previous chat about Customer vs Retailer tabs)
    const detectRole = (): 'customer' | 'retailer' => {
      const activeTab = document.querySelector('.w-tab-link.w--current');
      if (activeTab?.textContent?.toLowerCase().includes('retailer')) {
        return 'retailer';
      }
      return 'customer'; // Default to customer
    };

    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const nameInput = signupForm.querySelector('input[name="Name"]') as HTMLInputElement;
      const emailInput = signupForm.querySelector('input[name="Email"]') as HTMLInputElement;
      const passwordInput = signupForm.querySelector('input[name="Password"]') as HTMLInputElement;
      const confirmPasswordInput = signupForm.querySelector('input[name="Confirm-Password"]') as HTMLInputElement;
      const submitButton = signupForm.querySelector('input[type="submit"]') as HTMLInputElement;

      if (!nameInput || !emailInput || !passwordInput) {
        this.notifications.show({
          type: 'error',
          message: 'Required form fields not found'
        });
        return;
      }

      // Validate password confirmation
      if (confirmPasswordInput && passwordInput.value !== confirmPasswordInput.value) {
        this.notifications.show({
          type: 'error',
          message: 'Passwords do not match'
        });
        return;
      }

      // Disable button during signup
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.value = 'Creating account...';
      }

      try {
        const userRole = detectRole();
        console.log('Signing up user with role (email will redirect to onboarding):', userRole);
        
        const result = await this.auth.register({
          name: nameInput.value,
          email: emailInput.value,
          password: passwordInput.value,
          role: userRole
        });

        if (result.success) {
          this.notifications.show({
            type: 'success',
            message: 'Account created successfully! Please check your email to complete registration.'
          });

          // Redirect to email confirmation page immediately after signup
          // Note: The email confirmation link will redirect to onboarding (handled by AuthManager)
          const confirmationUrl = getEmailConfirmationUrl();
          console.log('Signup: Redirecting to email confirmation page:', confirmationUrl);
          window.location.href = confirmationUrl;
          
        } else {
          this.notifications.show({
            type: 'error',
            message: result.error || 'Registration failed'
          });
        }
      } catch (error) {
        console.error('Registration error:', error);
        this.notifications.show({
          type: 'error',
          message: 'Registration error occurred'
        });
      } finally {
        // Re-enable button
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.value = 'Create Account';
        }
      }
    });
  }

  /**
   * Get appropriate dashboard URL for a user role (for login)
   */
  getDashboardUrl(role: 'customer' | 'retailer'): string {
    return getDashboardUrl(role);
  }

  /**
   * Get onboarding URL for a user role (for new signups)
   */
  getOnboardingUrl(role: 'customer' | 'retailer'): string {
    return this.auth.getOnboardingUrlForRole(role);
  }

  /**
   * Get email confirmation page URL
   */
  getEmailConfirmationUrl(): string {
    return getEmailConfirmationUrl();
  }
}

// Auto-initialize based on page
export function initWebflowForms(supabaseUrl?: string, supabaseKey?: string): void {
  const handler = new WebflowFormHandler(supabaseUrl, supabaseKey);
  
  // Detect page type and initialize appropriate handler
  if (window.location.pathname.includes('log-in')) {
    handler.initLoginForm();
  } else if (window.location.pathname.includes('sign-up')) {
    handler.initSignupForm();
  }
  
  // Make handler available globally for debugging
  (window as any).NikoFormHandler = handler;
}
