/**
 * Email Confirmation Flow Handler
 * Handles the flow when user clicks confirmation link from email
 * Works specifically with Webflow and Supabase redirect flow
 */

(function(window) {
  'use strict';

  const CONFIG = {
    SUPABASE_URL: 'https://bzjoxjqfpmjhbfijthpp.supabase.co',
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6am94anFmcG1qaGJmaWp0aHBwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3NjIyMzksImV4cCI6MjA3MTMzODIzOX0.sL9omeLIgpgqYjTJM6SGQPSvUvm5z-Yr9rOzkOi2mJk'
  };

  class EmailConfirmationHandler {
    constructor() {
      this.supabase = null;
      this.init();
    }

    async init() {
      // Load Supabase if not already loaded
      if (typeof supabase === 'undefined') {
        await this.loadSupabase();
      }
      
      this.supabase = supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
      
      // Check if this is a confirmation redirect
      this.handleEmailConfirmation();
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

    async handleEmailConfirmation() {
      // Check URL parameters for confirmation
      const urlParams = new URLSearchParams(window.location.search);
      const urlHash = new URLSearchParams(window.location.hash.slice(1));
      
      // Check for Supabase auth parameters (can be in query or hash)
      const accessToken = urlParams.get('access_token') || urlHash.get('access_token');
      const refreshToken = urlParams.get('refresh_token') || urlHash.get('refresh_token');
      const tokenType = urlParams.get('token_type') || urlHash.get('token_type');
      const type = urlParams.get('type') || urlHash.get('type');
      
      console.log('EmailConfirmationHandler: Checking for auth parameters', {
        accessToken: !!accessToken,
        refreshToken: !!refreshToken,
        type: type,
        url: window.location.href
      });

      if (accessToken && type === 'signup') {
        console.log('EmailConfirmationHandler: Email confirmation detected, processing...');
        await this.processEmailConfirmation(accessToken, refreshToken);
      } else {
        console.log('EmailConfirmationHandler: No email confirmation parameters found');
      }
    }

    async processEmailConfirmation(accessToken, refreshToken) {
      try {
        // Set the session with the tokens from URL
        const { data: sessionData, error: sessionError } = await this.supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken
        });

        if (sessionError) {
          console.error('EmailConfirmationHandler: Session error:', sessionError);
          this.redirectToLogin('Session error occurred');
          return;
        }

        // Get user data
        const { data: { user }, error: userError } = await this.supabase.auth.getUser();

        if (userError || !user) {
          console.error('EmailConfirmationHandler: User error:', userError);
          this.redirectToLogin('User validation failed');
          return;
        }

        console.log('EmailConfirmationHandler: User confirmed successfully:', user.email);

        // Set authentication cookies for the page guard system
        this.setAuthCookies(user, sessionData.session);

        // Determine redirect based on user type
        const userType = user.user_metadata?.user_type || user.user_metadata?.role || 'customer';
        const redirectUrl = this.getOnboardingUrl(userType);

        console.log('EmailConfirmationHandler: Redirecting to onboarding:', redirectUrl);

        // Clean URL and redirect
        this.cleanUrlAndRedirect(redirectUrl);

      } catch (error) {
        console.error('EmailConfirmationHandler: Processing error:', error);
        this.redirectToLogin('Confirmation processing failed');
      }
    }

    setAuthCookies(user, session) {
      const userType = user.user_metadata?.user_type || user.user_metadata?.role || 'customer';
      
      // Set cookies that match the PageGuard expectations
      this.setCookie('c.token', session.access_token);
      this.setCookie('uid', user.id);
      this.setCookie('user_type', userType);

      console.log('EmailConfirmationHandler: Auth cookies set', {
        uid: user.id,
        userType: userType,
        email: user.email
      });
    }

    setCookie(name, value) {
      const maxAge = 7 * 24 * 60 * 60; // 7 days
      document.cookie = `${name}=${encodeURIComponent(value)}; max-age=${maxAge}; path=/; secure; samesite=lax`;
    }

    getOnboardingUrl(userType) {
      const baseUrl = window.location.origin;
      
      if (userType === 'retailer') {
        return `${baseUrl}/dev/app/retailer/onboarding`;
      } else {
        return `${baseUrl}/dev/app/customer/onboarding`;
      }
    }

    cleanUrlAndRedirect(redirectUrl) {
      // Remove auth parameters from URL and redirect
      const cleanUrl = window.location.origin + window.location.pathname;
      
      // Use replace to avoid back button issues
      window.history.replaceState({}, document.title, cleanUrl);
      
      // Short delay to ensure cookies are set
      setTimeout(() => {
        window.location.href = redirectUrl;
      }, 100);
    }

    redirectToLogin(errorMessage) {
      console.error('EmailConfirmationHandler: Redirecting to login:', errorMessage);
      const loginUrl = `${window.location.origin}/dev/app/auth/log-in`;
      
      // Clear any partial auth state
      this.clearAuthCookies();
      
      // Add error parameter if needed
      const urlWithError = `${loginUrl}?error=confirmation_failed`;
      window.location.href = urlWithError;
    }

    clearAuthCookies() {
      ['c.token', 'uid', 'user_type'].forEach(name => {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      });
    }
  }

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      new EmailConfirmationHandler();
    });
  } else {
    new EmailConfirmationHandler();
  }

  // Make available globally for debugging
  window.NikoEmailConfirmation = EmailConfirmationHandler;

})(window);