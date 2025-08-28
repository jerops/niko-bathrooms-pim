/**
 * Unified Webflow Authentication Handler
 * Handles email confirmation and onboarding flows for Webflow pages
 * Add this script to any Webflow page that needs authentication
 */

(function(window) {
  'use strict';

  const CONFIG = {
    SUPABASE_URL: 'https://bzjoxjqfpmjhbfijthpp.supabase.co',
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6am94anFmcG1qaGJmaWp0aHBwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3NjIyMzksImV4cCI6MjA3MTMzODIzOX0.sL9omeLIgpgqYjTJM6SGQPSvUvm5z-Yr9rOzkOi2mJk',
    ROUTES: {
      CUSTOMER_ONBOARDING: '/dev/app/customer/onboarding',
      RETAILER_ONBOARDING: '/dev/app/retailer/onboarding',
      LOGIN: '/dev/app/auth/log-in'
    }
  };

  class WebflowAuthHandler {
    constructor() {
      this.supabase = null;
      this.init();
    }

    async init() {
      console.log('WebflowAuthHandler: Initializing...');

      // Load Supabase if not already loaded
      if (typeof supabase === 'undefined') {
        await this.loadSupabase();
      }
      
      this.supabase = supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
      
      // Determine what type of page this is and handle accordingly
      await this.handlePageType();
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

    async handlePageType() {
      const currentPath = window.location.pathname;
      const urlParams = new URLSearchParams(window.location.search);
      const urlHash = new URLSearchParams(window.location.hash.slice(1));
      
      // Check for Supabase auth parameters
      const accessToken = urlParams.get('access_token') || urlHash.get('access_token');
      const type = urlParams.get('type') || urlHash.get('type');

      console.log('WebflowAuthHandler: Page analysis', {
        path: currentPath,
        hasAuthToken: !!accessToken,
        authType: type
      });

      // Handle email confirmation flow
      if (accessToken && type === 'signup') {
        console.log('WebflowAuthHandler: Email confirmation detected');
        await this.handleEmailConfirmation(accessToken, urlParams.get('refresh_token') || urlHash.get('refresh_token'));
        return;
      }

      // Handle onboarding pages
      if (currentPath.includes('/onboarding')) {
        console.log('WebflowAuthHandler: Onboarding page detected');
        await this.handleOnboardingPage();
        return;
      }

      // Handle regular protected pages
      if (this.isProtectedPage()) {
        console.log('WebflowAuthHandler: Protected page detected');
        await this.handleProtectedPage();
        return;
      }

      console.log('WebflowAuthHandler: Regular page, no special handling needed');
    }

    async handleEmailConfirmation(accessToken, refreshToken) {
      try {
        // Set the session with tokens from email
        const { data: sessionData, error: sessionError } = await this.supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken
        });

        if (sessionError) {
          console.error('WebflowAuthHandler: Email confirmation session error:', sessionError);
          this.redirectToLogin();
          return;
        }

        // Get user data
        const { data: { user }, error: userError } = await this.supabase.auth.getUser();

        if (userError || !user) {
          console.error('WebflowAuthHandler: Email confirmation user error:', userError);
          this.redirectToLogin();
          return;
        }

        console.log('WebflowAuthHandler: Email confirmed successfully for:', user.email);

        // Set authentication cookies
        this.setAuthCookies(user, sessionData.session);

        // Redirect to appropriate onboarding
        const userType = user.user_metadata?.user_type || user.user_metadata?.role || 'customer';
        const onboardingUrl = userType === 'retailer' 
          ? CONFIG.ROUTES.RETAILER_ONBOARDING 
          : CONFIG.ROUTES.CUSTOMER_ONBOARDING;

        console.log('WebflowAuthHandler: Redirecting to onboarding:', onboardingUrl);
        
        // Clean URL and redirect
        this.cleanUrlAndRedirect(window.location.origin + onboardingUrl);

      } catch (error) {
        console.error('WebflowAuthHandler: Email confirmation error:', error);
        this.redirectToLogin();
      }
    }

    async handleOnboardingPage() {
      try {
        // Check if user is authenticated
        const { data: { user }, error } = await this.supabase.auth.getUser();

        if (error || !user) {
          console.log('WebflowAuthHandler: No authenticated user on onboarding page');
          this.redirectToLogin();
          return;
        }

        console.log('WebflowAuthHandler: Authenticated user on onboarding page:', user.email);

        // Verify they're on the correct onboarding page
        const userType = user.user_metadata?.user_type || user.user_metadata?.role || 'customer';
        
        if (!this.isCorrectOnboardingPage(userType)) {
          const correctUrl = userType === 'retailer' 
            ? CONFIG.ROUTES.RETAILER_ONBOARDING 
            : CONFIG.ROUTES.CUSTOMER_ONBOARDING;
          console.log('WebflowAuthHandler: Wrong onboarding page, redirecting to:', correctUrl);
          window.location.href = window.location.origin + correctUrl;
          return;
        }

        // Set up the page for authenticated user
        const { data: { session } } = await this.supabase.auth.getSession();
        if (session) {
          this.setAuthCookies(user, session);
        }

        this.initializeAuthenticatedContent(user);

      } catch (error) {
        console.error('WebflowAuthHandler: Onboarding page error:', error);
        this.redirectToLogin();
      }
    }

    async handleProtectedPage() {
      try {
        // Check authentication cookies first (faster)
        const cookies = this.getAuthCookies();
        
        if (!cookies.token || !cookies.uid || !cookies.userType) {
          console.log('WebflowAuthHandler: No auth cookies on protected page');
          this.redirectToLogin();
          return;
        }

        // Validate with Supabase
        const { data: { user }, error } = await this.supabase.auth.getUser(cookies.token);

        if (error || !user || user.id !== cookies.uid) {
          console.log('WebflowAuthHandler: Cookie validation failed');
          this.clearAuthCookies();
          this.redirectToLogin();
          return;
        }

        console.log('WebflowAuthHandler: Valid authentication on protected page');
        this.initializeAuthenticatedContent(user);

      } catch (error) {
        console.error('WebflowAuthHandler: Protected page error:', error);
        this.clearAuthCookies();
        this.redirectToLogin();
      }
    }

    isProtectedPage() {
      // Check for authentication markers
      return document.querySelector('[niko-data="auth-required"]') !== null ||
             document.querySelector('[data-auth="required"]') !== null ||
             window.location.pathname.includes('/dashboard');
    }

    isCorrectOnboardingPage(userType) {
      const currentPath = window.location.pathname;
      
      if (userType === 'retailer') {
        return currentPath.includes('/retailer/onboarding');
      } else {
        return currentPath.includes('/customer/onboarding');
      }
    }

    setAuthCookies(user, session) {
      const userType = user.user_metadata?.user_type || user.user_metadata?.role || 'customer';
      
      // Set cookies
      this.setCookie('c.token', session.access_token);
      this.setCookie('uid', user.id);
      this.setCookie('user_type', userType);

      console.log('WebflowAuthHandler: Auth cookies set for', userType);
    }

    setCookie(name, value) {
      const maxAge = 7 * 24 * 60 * 60; // 7 days
      document.cookie = `${name}=${encodeURIComponent(value)}; max-age=${maxAge}; path=/; secure; samesite=lax`;
    }

    getAuthCookies() {
      const getCookie = (name) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        return parts.length === 2 ? parts.pop().split(';').shift() : null;
      };
      
      return {
        token: getCookie('c.token'),
        uid: getCookie('uid'),
        userType: getCookie('user_type')
      };
    }

    clearAuthCookies() {
      ['c.token', 'uid', 'user_type'].forEach(name => {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      });
    }

    initializeAuthenticatedContent(user) {
      const userType = user.user_metadata?.user_type || user.user_metadata?.role || 'customer';
      const userName = user.user_metadata?.name || user.email?.split('@')[0] || 'User';

      // Set body attributes
      document.body.setAttribute('data-user-authenticated', 'true');
      document.body.setAttribute('data-user-type', userType);

      // Populate user data
      document.querySelectorAll('[niko-data="user-name"]').forEach(el => {
        el.textContent = userName;
      });

      document.querySelectorAll('[niko-data="user-email"]').forEach(el => {
        el.textContent = user.email;
      });

      document.querySelectorAll('[niko-data="user-role"]').forEach(el => {
        el.textContent = userType;
      });

      // Show authenticated content
      document.querySelectorAll('[niko-data="auth-required"]').forEach(el => {
        el.style.visibility = 'visible';
        el.style.opacity = '1';
      });

      // Hide loaders
      document.querySelectorAll('[niko-data="page-loader"]').forEach(loader => {
        loader.style.display = 'none';
      });

      // Apply role-based visibility
      this.applyRoleBasedVisibility(userType);

      // Fire ready event
      window.dispatchEvent(new CustomEvent('nikoAuthReady', {
        detail: { user, userType, authenticated: true }
      }));

      console.log('WebflowAuthHandler: Page initialized for authenticated user');
    }

    applyRoleBasedVisibility(userType) {
      document.querySelectorAll('[niko-role]').forEach(element => {
        const allowedRoles = element.getAttribute('niko-role').split(',').map(r => r.trim());
        
        if (!allowedRoles.includes(userType)) {
          // Remove from DOM for security
          element.remove();
        }
      });
    }

    cleanUrlAndRedirect(redirectUrl) {
      // Clean current URL
      const cleanUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
      
      // Redirect after short delay
      setTimeout(() => {
        window.location.href = redirectUrl;
      }, 100);
    }

    redirectToLogin() {
      this.clearAuthCookies();
      const loginUrl = window.location.origin + CONFIG.ROUTES.LOGIN;
      console.log('WebflowAuthHandler: Redirecting to login');
      window.location.href = loginUrl;
    }
  }

  // Auto-initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      new WebflowAuthHandler();
    });
  } else {
    new WebflowAuthHandler();
  }

  // Make available globally
  window.NikoWebflowAuth = WebflowAuthHandler;

})(window);