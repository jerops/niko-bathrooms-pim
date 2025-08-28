/**
 * Onboarding Page Handler
 * Specifically for handling users arriving on onboarding pages
 * Detects email confirmation completions and sets up authentication
 */

(function(window) {
  'use strict';

  const CONFIG = {
    SUPABASE_URL: 'https://bzjoxjqfpmjhbfijthpp.supabase.co',
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6am94anFmcG1qaGJmaWp0aHBwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3NjIyMzksImV4cCI6MjA3MTMzODIzOX0.sL9omeLIgpgqYjTJM6SGQPSvUvm5z-Yr9rOzkOi2mJk'
  };

  class OnboardingPageHandler {
    constructor() {
      this.supabase = null;
      this.init();
    }

    async init() {
      // Only run on onboarding pages
      if (!this.isOnboardingPage()) {
        return;
      }

      console.log('OnboardingPageHandler: Initializing on onboarding page');

      // Load Supabase if not already loaded
      if (typeof supabase === 'undefined') {
        await this.loadSupabase();
      }
      
      this.supabase = supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
      
      // Handle the onboarding page logic
      await this.handleOnboardingPage();
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

    isOnboardingPage() {
      return window.location.pathname.includes('/onboarding');
    }

    async handleOnboardingPage() {
      // Check if user just came from email confirmation
      const urlParams = new URLSearchParams(window.location.search);
      const urlHash = new URLSearchParams(window.location.hash.slice(1));
      
      // Check for Supabase auth tokens in URL
      const accessToken = urlParams.get('access_token') || urlHash.get('access_token');
      const refreshToken = urlParams.get('refresh_token') || urlHash.get('refresh_token');
      const type = urlParams.get('type') || urlHash.get('type');

      if (accessToken && (type === 'signup' || type === 'recovery')) {
        console.log('OnboardingPageHandler: Processing email confirmation tokens');
        await this.processConfirmationTokens(accessToken, refreshToken);
      } else {
        // Check existing authentication
        await this.checkExistingAuth();
      }
    }

    async processConfirmationTokens(accessToken, refreshToken) {
      try {
        // Set the session with tokens
        const { data: sessionData, error: sessionError } = await this.supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken
        });

        if (sessionError) {
          console.error('OnboardingPageHandler: Session error:', sessionError);
          this.redirectToLogin();
          return;
        }

        // Get user info
        const { data: { user }, error: userError } = await this.supabase.auth.getUser();

        if (userError || !user) {
          console.error('OnboardingPageHandler: User error:', userError);
          this.redirectToLogin();
          return;
        }

        console.log('OnboardingPageHandler: User confirmed and authenticated:', user.email);

        // Set authentication cookies
        this.setAuthenticationCookies(user, sessionData.session);

        // Clean the URL of auth parameters
        this.cleanUrl();

        // Initialize page content for authenticated user
        this.initializeOnboardingContent(user);

      } catch (error) {
        console.error('OnboardingPageHandler: Error processing tokens:', error);
        this.redirectToLogin();
      }
    }

    async checkExistingAuth() {
      try {
        // Check if user is already authenticated via cookies or session
        const { data: { user }, error } = await this.supabase.auth.getUser();

        if (error || !user) {
          console.log('OnboardingPageHandler: No authenticated user found, redirecting to login');
          this.redirectToLogin();
          return;
        }

        console.log('OnboardingPageHandler: Existing authenticated user found:', user.email);
        
        // Verify user has the right role for this onboarding page
        const userType = user.user_metadata?.user_type || user.user_metadata?.role || 'customer';
        
        if (!this.isCorrectOnboardingPage(userType)) {
          console.log('OnboardingPageHandler: Wrong onboarding page for user type, redirecting');
          this.redirectToCorrectOnboarding(userType);
          return;
        }

        // Set/update authentication cookies
        const { data: { session } } = await this.supabase.auth.getSession();
        if (session) {
          this.setAuthenticationCookies(user, session);
        }

        // Initialize content
        this.initializeOnboardingContent(user);

      } catch (error) {
        console.error('OnboardingPageHandler: Auth check error:', error);
        this.redirectToLogin();
      }
    }

    setAuthenticationCookies(user, session) {
      const userType = user.user_metadata?.user_type || user.user_metadata?.role || 'customer';
      
      // Set cookies for the page guard system
      this.setCookie('c.token', session.access_token);
      this.setCookie('uid', user.id);
      this.setCookie('user_type', userType);

      // Set body attributes for styling
      document.body.setAttribute('data-user-authenticated', 'true');
      document.body.setAttribute('data-user-type', userType);

      console.log('OnboardingPageHandler: Authentication cookies set', {
        uid: user.id,
        userType: userType,
        email: user.email
      });
    }

    setCookie(name, value) {
      const maxAge = 7 * 24 * 60 * 60; // 7 days
      document.cookie = `${name}=${encodeURIComponent(value)}; max-age=${maxAge}; path=/; secure; samesite=lax`;
    }

    isCorrectOnboardingPage(userType) {
      const currentPath = window.location.pathname;
      
      if (userType === 'retailer') {
        return currentPath.includes('/retailer/onboarding');
      } else {
        return currentPath.includes('/customer/onboarding');
      }
    }

    redirectToCorrectOnboarding(userType) {
      const baseUrl = window.location.origin;
      const correctUrl = userType === 'retailer' 
        ? `${baseUrl}/dev/app/retailer/onboarding`
        : `${baseUrl}/dev/app/customer/onboarding`;
      
      window.location.href = correctUrl;
    }

    cleanUrl() {
      // Remove auth parameters from URL
      const url = new URL(window.location);
      const paramsToRemove = ['access_token', 'refresh_token', 'token_type', 'type'];
      
      paramsToRemove.forEach(param => {
        url.searchParams.delete(param);
      });
      
      // Also clean hash parameters
      url.hash = '';
      
      // Replace current URL without page reload
      window.history.replaceState({}, document.title, url.toString());
    }

    initializeOnboardingContent(user) {
      // Populate user data in the page
      const userType = user.user_metadata?.user_type || user.user_metadata?.role || 'customer';
      const userName = user.user_metadata?.name || user.email?.split('@')[0] || 'User';

      // Update user name elements
      document.querySelectorAll('[niko-data="user-name"]').forEach(el => {
        el.textContent = userName;
      });

      // Update user email elements
      document.querySelectorAll('[niko-data="user-email"]').forEach(el => {
        el.textContent = user.email;
      });

      // Update user role elements
      document.querySelectorAll('[niko-data="user-role"]').forEach(el => {
        el.textContent = userType;
      });

      // Show authenticated content
      document.querySelectorAll('[niko-data="auth-required"]').forEach(el => {
        el.style.visibility = 'visible';
        el.style.opacity = '1';
      });

      // Hide any loaders
      document.querySelectorAll('[niko-data="page-loader"]').forEach(loader => {
        loader.style.display = 'none';
      });

      // Fire custom event
      window.dispatchEvent(new CustomEvent('nikoOnboardingReady', {
        detail: {
          user: user,
          userType: userType,
          authenticated: true
        }
      }));

      console.log('OnboardingPageHandler: Onboarding content initialized for', userType);
    }

    redirectToLogin() {
      const loginUrl = `${window.location.origin}/dev/app/auth/log-in`;
      console.log('OnboardingPageHandler: Redirecting to login:', loginUrl);
      window.location.href = loginUrl;
    }
  }

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      new OnboardingPageHandler();
    });
  } else {
    new OnboardingPageHandler();
  }

  // Make available globally
  window.NikoOnboardingHandler = OnboardingPageHandler;

})(window);