/**
 * Debug Auth Helper
 * Provides better error messages and debugging for authentication issues
 */

(function(window) {
  'use strict';

  const CONFIG = {
    SUPABASE_URL: 'https://bzjoxjqfpmjhbfijthpp.supabase.co',
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6am94anFmcG1qaGJmaWp0aHBwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3NjIyMzksImV4cCI6MjA3MTMzODIzOX0.sL9omeLIgpgqYjTJM6SGQPSvUvm5z-Yr9rOzkOi2mJk'
  };

  class DebugAuthHelper {
    constructor() {
      this.supabase = null;
      this.init();
    }

    async init() {
      if (typeof supabase === 'undefined') {
        await this.loadSupabase();
      }
      
      this.supabase = supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
      console.log('DebugAuthHelper: Initialized');
    }

    loadSupabase() {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    }

    /**
     * Enhanced login with better error messages
     */
    async debugLogin(email, password) {
      console.log('DebugAuthHelper: Starting enhanced login for:', email);

      try {
        // First try the login
        const { data, error } = await this.supabase.auth.signInWithPassword({
          email: email.toLowerCase().trim(),
          password: password
        });

        if (error) {
          // Provide specific error messages based on error type
          const friendlyError = this.getFriendlyErrorMessage(error);
          
          console.error('DebugAuthHelper: Login failed:', {
            originalError: error.message,
            friendlyError: friendlyError,
            errorCode: error.status
          });

          return {
            success: false,
            error: friendlyError,
            originalError: error.message,
            needsEmailConfirmation: this.isEmailConfirmationError(error)
          };
        }

        if (data.user) {
          console.log('DebugAuthHelper: Login successful:', {
            email: data.user.email,
            confirmed: !!data.user.email_confirmed_at,
            userType: data.user.user_metadata?.user_type || data.user.user_metadata?.role
          });

          return {
            success: true,
            user: data.user,
            session: data.session
          };
        }

        return {
          success: false,
          error: 'Login failed for unknown reason'
        };

      } catch (error) {
        console.error('DebugAuthHelper: Login exception:', error);
        return {
          success: false,
          error: 'Login system error: ' + error.message
        };
      }
    }

    /**
     * Check if user exists and their confirmation status
     */
    async checkUserStatus(email) {
      console.log('DebugAuthHelper: Checking user status for:', email);

      try {
        // Try to trigger a password reset to see if user exists
        const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin + '/dev/app/auth/reset-password'
        });

        if (error) {
          if (error.message.includes('User not found')) {
            return {
              exists: false,
              message: 'User does not exist. Please sign up first.'
            };
          } else {
            return {
              exists: true,
              message: 'User exists but may need email confirmation.',
              note: 'If you just signed up, check your email for a confirmation link.'
            };
          }
        }

        return {
          exists: true,
          message: 'User exists. Password reset email sent (if user is confirmed).',
          note: 'Check your email for reset instructions.'
        };

      } catch (error) {
        console.error('DebugAuthHelper: User status check failed:', error);
        return {
          exists: 'unknown',
          message: 'Could not check user status',
          error: error.message
        };
      }
    }

    /**
     * Resend confirmation email
     */
    async resendConfirmation(email) {
      console.log('DebugAuthHelper: Resending confirmation for:', email);

      try {
        const { error } = await this.supabase.auth.resend({
          type: 'signup',
          email: email,
          options: {
            emailRedirectTo: window.location.origin + '/dev/app/customer/onboarding'
          }
        });

        if (error) {
          console.error('DebugAuthHelper: Resend confirmation failed:', error);
          return {
            success: false,
            error: 'Could not resend confirmation: ' + error.message
          };
        }

        return {
          success: true,
          message: 'Confirmation email resent! Check your inbox.'
        };

      } catch (error) {
        console.error('DebugAuthHelper: Resend confirmation exception:', error);
        return {
          success: false,
          error: 'Resend system error: ' + error.message
        };
      }
    }

    getFriendlyErrorMessage(error) {
      const message = error.message.toLowerCase();

      if (message.includes('invalid login credentials')) {
        return 'Invalid email or password. If you just signed up, please check your email for a confirmation link first.';
      }

      if (message.includes('email not confirmed')) {
        return 'Please check your email and click the confirmation link before logging in.';
      }

      if (message.includes('user not found')) {
        return 'No account found with this email address. Please sign up first.';
      }

      if (message.includes('invalid password')) {
        return 'Incorrect password. Please check your password and try again.';
      }

      if (message.includes('too many requests')) {
        return 'Too many login attempts. Please wait a few minutes before trying again.';
      }

      // Default fallback
      return error.message;
    }

    isEmailConfirmationError(error) {
      const message = error.message.toLowerCase();
      return message.includes('invalid login credentials') || 
             message.includes('email not confirmed');
    }

    /**
     * Get current authentication state with debugging info
     */
    async getAuthState() {
      try {
        const { data: { session }, error: sessionError } = await this.supabase.auth.getSession();
        const { data: { user }, error: userError } = await this.supabase.auth.getUser();

        return {
          hasSession: !!session,
          hasUser: !!user,
          sessionError: sessionError?.message,
          userError: userError?.message,
          user: user ? {
            id: user.id,
            email: user.email,
            confirmed: !!user.email_confirmed_at,
            userType: user.user_metadata?.user_type || user.user_metadata?.role,
            createdAt: user.created_at
          } : null
        };

      } catch (error) {
        return {
          error: error.message,
          hasSession: false,
          hasUser: false
        };
      }
    }
  }

  // Make available globally for debugging
  window.NikoDebugAuth = new DebugAuthHelper();

  // Add debugging functions to console
  window.debugLogin = async (email, password) => {
    const result = await window.NikoDebugAuth.debugLogin(email, password);
    console.log('Debug Login Result:', result);
    return result;
  };

  window.checkUserStatus = async (email) => {
    const result = await window.NikoDebugAuth.checkUserStatus(email);
    console.log('User Status:', result);
    return result;
  };

  window.resendConfirmation = async (email) => {
    const result = await window.NikoDebugAuth.resendConfirmation(email);
    console.log('Resend Confirmation Result:', result);
    return result;
  };

  window.getAuthState = async () => {
    const result = await window.NikoDebugAuth.getAuthState();
    console.log('Current Auth State:', result);
    return result;
  };

  console.log('DebugAuthHelper: Available functions:');
  console.log('- debugLogin(email, password)');
  console.log('- checkUserStatus(email)');  
  console.log('- resendConfirmation(email)');
  console.log('- getAuthState()');

})(window);