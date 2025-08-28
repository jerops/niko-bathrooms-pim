/**
 * Webflow Form Handlers
 * Based on our previous working implementation from "Site Authentication Project Setup"
 * 
 * This addresses the specific button IDs and form handling that was working before
 */

import { AuthManager } from '@nikobathrooms/auth';
import { NotificationManager } from '@nikobathrooms/notifications';

export class WebflowFormHandler {
  private auth: AuthManager;
  private notifications: NotificationManager;

  constructor() {
    this.auth = new AuthManager();
    this.notifications = new NotificationManager();
  }

  /**
   * Initialize form handlers for login page
   * Based on our previous working implementation with specific element IDs
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
   * Based on our previous working implementation with role detection
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

          // Redirect based on role (from our previous implementation)
          const userRole = result.user?.role;
          if (userRole === 'retailer') {
            window.location.href = '/dev/app/retailer-dashboard';
          } else {
            window.location.href = '/dev/app/customer-dashboard';
          }
        } else {
          this.notifications.show({
            type: 'error',
            message: result.error || 'Login failed'
          });
        }
      } catch (error) {
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
        
        const result = await this.auth.register({
          name: nameInput.value,
          email: emailInput.value,
          password: passwordInput.value,
          role: userRole
        });

        if (result.success) {
          this.notifications.show({
            type: 'success',
            message: 'Account created successfully! Please check your email.'
          });

          // Redirect to email confirmation page
          window.location.href = '/dev/app/email-confirmation';
        } else {
          this.notifications.show({
            type: 'error',
            message: result.error || 'Registration failed'
          });
        }
      } catch (error) {
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
}

// Auto-initialize based on page
export function initWebflowForms(): void {
  const handler = new WebflowFormHandler();
  
  // Detect page type and initialize appropriate handler
  if (window.location.pathname.includes('log-in')) {
    handler.initLoginForm();
  } else if (window.location.pathname.includes('sign-up')) {
    handler.initSignupForm();
  }
}