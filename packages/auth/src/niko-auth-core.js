/**
 * Niko Auth Core - Complete Authentication System v4.0.0
 * Triple Security + Webflow Integration + Loader Management + Email Confirmation
 */
(function(window) {
  'use strict';

  const CONFIG = {
    SUPABASE_URL: 'https://bzjoxjqfpmjhbfijthpp.supabase.co',
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6am94anFmcG1qaGJmaWp0aHBwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3NjIyMzksImV4cCI6MjA3MTMzODIzOX0.sL9omeLIgpgqYjTJM6SGQPSvUvm5z-Yr9rOzkOi2mJk',
    ROUTES: {
      CUSTOMER_ONBOARDING: '/dev/app/customer/onboarding',
      RETAILER_ONBOARDING: '/dev/app/retailer/onboarding',
      CUSTOMER_DASHBOARD: '/dev/app/customer/dashboard',
      RETAILER_DASHBOARD: '/dev/app/retailer/dashboard',
      LOGIN: '/dev/app/auth/log-in'
    }
  };

  // ============================================================================
  // WEBFLOW PAGE LOADER
  // ============================================================================
  class WebflowPageLoader {
    constructor() {
      this.isLoading = false;
      this.loadStartTime = 0;
      this.minLoadTime = 500;
    }

    async show() {
      if (this.isLoading) return;
      
      this.isLoading = true;
      this.loadStartTime = Date.now();
      
      // Force show loader - override existing CSS
      const loaders = document.querySelectorAll('[niko-data="page-loader"]');
      loaders.forEach(loader => {
        loader.style.setProperty('display', 'flex', 'important');
        loader.style.setProperty('visibility', 'visible', 'important');
        loader.style.setProperty('opacity', '1', 'important');
        loader.style.setProperty('pointer-events', 'auto', 'important');
        loader.style.transition = 'opacity 0.3s ease-out';
      });
      
      console.log('NikoAuth: Loader shown during authentication check');
    }

    async hide() {
      if (!this.isLoading) return;
      
      // Ensure minimum load time
      const elapsedTime = Date.now() - this.loadStartTime;
      const remainingTime = Math.max(0, this.minLoadTime - elapsedTime);
      
      if (remainingTime > 0) {
        await new Promise(resolve => setTimeout(resolve, remainingTime));
      }
      
      // Remove our overrides to restore original CSS
      const loaders = document.querySelectorAll('[niko-data="page-loader"]');
      loaders.forEach(loader => {
        loader.style.removeProperty('display');
        loader.style.removeProperty('visibility');
        loader.style.removeProperty('opacity');
        loader.style.removeProperty('pointer-events');
        loader.style.removeProperty('transition');
      });
      
      this.isLoading = false;
      console.log('NikoAuth: Loader hidden - authentication complete');
    }
  }

  // ============================================================================
  // MAIN AUTHENTICATION SYSTEM
  // ============================================================================
  class NikoAuthCore {
    constructor() {
      this.supabase = null;
      this.initialized = false;
      this.loader = new WebflowPageLoader();
      this.init();
    }

    async init() {
      console.log('Loading Niko Auth Core v4.0.0 (Complete System)');
      
      if (typeof supabase === 'undefined') {
        await this.loadSupabase();
      }
      
      this.supabase = supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
      this.initialized = true;
      
      console.log('Niko Auth Core initialized successfully');
      
      // Handle different page types
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

    // ============================================================================
    // PAGE TYPE HANDLER
    // ============================================================================
    async handlePageType() {
      const currentPath = window.location.pathname;
      const urlParams = new URLSearchParams(window.location.search);
      const urlHash = new URLSearchParams(window.location.hash.slice(1));
      
      // Check for email confirmation tokens
      const accessToken = urlParams.get('access_token') || urlHash.get('access_token');
      const type = urlParams.get('type') || urlHash.get('type');

      if (accessToken && type === 'signup') {
        console.log('NikoAuth: Email confirmation detected');
        await this.handleEmailConfirmation(accessToken, urlParams.get('refresh_token') || urlHash.get('refresh_token'));
        return;
      }

      // Handle onboarding pages
      if (currentPath.includes('/onboarding')) {
        console.log('NikoAuth: Onboarding page detected');
        await this.handleOnboardingPage();
        return;
      }

      // Handle protected pages
      if (this.isProtectedPage()) {
        console.log('NikoAuth: Protected page detected');
        await this.handleProtectedPage();
        return;
      }

      // Setup logout handlers for all pages
      this.setupLogoutHandlers();
      console.log('NikoAuth: Public page - no authentication required');
    }

    // ============================================================================
    // EMAIL CONFIRMATION FLOW
    // ============================================================================
    async handleEmailConfirmation(accessToken, refreshToken) {
      await this.loader.show();
      
      try {
        // Set session with tokens
        const { data: sessionData, error: sessionError } = await this.supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken
        });

        if (sessionError) {
          console.error('NikoAuth: Email confirmation session error:', sessionError);
          await this.loader.hide();
          this.redirectToLogin();
          return;
        }

        // Get user data
        const { data: { user }, error: userError } = await this.supabase.auth.getUser();

        if (userError || !user) {
          console.error('NikoAuth: Email confirmation user error:', userError);
          await this.loader.hide();
          this.redirectToLogin();
          return;
        }

        console.log('NikoAuth: Email confirmed successfully for:', user.email);

        // Set authentication cookies (triple security)
        this.setAuthCookies(user, sessionData.session);

        // Redirect to onboarding
        const userType = user.user_metadata?.user_type || user.user_metadata?.role || 'customer';
        const onboardingUrl = userType === 'retailer' 
          ? CONFIG.ROUTES.RETAILER_ONBOARDING 
          : CONFIG.ROUTES.CUSTOMER_ONBOARDING;

        await this.loader.hide();
        this.cleanUrlAndRedirect(window.location.origin + onboardingUrl);

      } catch (error) {
        console.error('NikoAuth: Email confirmation error:', error);
        await this.loader.hide();
        this.redirectToLogin();
      }
    }

    // ============================================================================
    // ONBOARDING PAGE HANDLING
    // ============================================================================
    async handleOnboardingPage() {
      await this.loader.show();
      
      try {
        // Check authentication
        const { data: { user }, error } = await this.supabase.auth.getUser();

        if (error || !user) {
          console.log('NikoAuth: No authenticated user on onboarding page');
          await this.loader.hide();
          this.redirectToLogin();
          return;
        }

        console.log('NikoAuth: Authenticated user on onboarding page:', user.email);

        // Verify correct onboarding page
        const userType = user.user_metadata?.user_type || user.user_metadata?.role || 'customer';
        
        if (!this.isCorrectOnboardingPage(userType)) {
          const correctUrl = userType === 'retailer' 
            ? CONFIG.ROUTES.RETAILER_ONBOARDING 
            : CONFIG.ROUTES.CUSTOMER_ONBOARDING;
          console.log('NikoAuth: Wrong onboarding page, redirecting to:', correctUrl);
          window.location.href = window.location.origin + correctUrl;
          return;
        }

        // Set authentication cookies
        const { data: { session } } = await this.supabase.auth.getSession();
        if (session) {
          this.setAuthCookies(user, session);
        }

        await this.loader.hide();
        this.initializeAuthenticatedContent(user);
        this.setupLogoutHandlers();

      } catch (error) {
        console.error('NikoAuth: Onboarding page error:', error);
        await this.loader.hide();
        this.redirectToLogin();
      }
    }

    // ============================================================================
    // PROTECTED PAGE HANDLING (TRIPLE SECURITY)
    // ============================================================================
    async handleProtectedPage() {
      await this.loader.show();
      
      try {
        // SECURITY CHECK 1: Validate cookies
        const cookies = this.getAuthCookies();
        
        if (!cookies.token || !cookies.uid || !cookies.userType) {
          console.log('NikoAuth: Missing authentication cookies');
          await this.loader.hide();
          this.redirectToLogin();
          return;
        }

        // SECURITY CHECK 2: Validate JWT token with Supabase
        const { data: { user }, error } = await this.supabase.auth.getUser();

        if (error || !user) {
          console.log('NikoAuth: JWT validation failed');
          this.clearAuthCookies();
          await this.loader.hide();
          this.redirectToLogin();
          return;
        }

        // SECURITY CHECK 3: Cross-reference user data
        if (user.id !== cookies.uid) {
          console.log('NikoAuth: User ID mismatch');
          this.clearAuthCookies();
          await this.loader.hide();
          this.redirectToLogin();
          return;
        }

        const actualUserType = user.user_metadata?.user_type || user.user_metadata?.role || 'customer';
        if (actualUserType !== cookies.userType) {
          console.log('NikoAuth: User type mismatch');
          this.clearAuthCookies();
          await this.loader.hide();
          this.redirectToLogin();
          return;
        }

        console.log('NikoAuth: Triple security validation passed');
        
        await this.loader.hide();
        this.initializeAuthenticatedContent(user);
        this.setupLogoutHandlers();

      } catch (error) {
        console.error('NikoAuth: Protected page error:', error);
        this.clearAuthCookies();
        await this.loader.hide();
        this.redirectToLogin();
      }
    }

    // ============================================================================
    // AUTHENTICATION HELPERS
    // ============================================================================
    setAuthCookies(user, session) {
      const userType = user.user_metadata?.user_type || user.user_metadata?.role || 'customer';
      
      this.setCookie('c.token', session.access_token);
      this.setCookie('uid', user.id);
      this.setCookie('user_type', userType);

      console.log('NikoAuth: Authentication cookies set for', userType);
    }

    setCookie(name, value) {
      const maxAge = 7 * 24 * 60 * 60; // 7 days
      document.cookie = `${name}=${encodeURIComponent(value)}; max-age=${maxAge}; path=/; secure; samesite=lax`;
    }

    getAuthCookies() {
      const getCookie = (name) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        return parts.length === 2 ? decodeURIComponent(parts.pop().split(';').shift()) : null;
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

    // ============================================================================
    // PAGE CONTENT INITIALIZATION
    // ============================================================================
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

      // Special handling if body itself has auth-required
      if (document.body && document.body.hasAttribute('niko-data') && document.body.getAttribute('niko-data') === 'auth-required') {
        document.body.style.visibility = 'visible';
        document.body.style.opacity = '1';
      }

      // Apply role-based visibility
      this.applyRoleBasedVisibility(userType);

      // Fire ready event
      window.dispatchEvent(new CustomEvent('nikoAuthReady', {
        detail: { user, userType, authenticated: true }
      }));

      console.log('NikoAuth: Page initialized for authenticated user');
    }

    applyRoleBasedVisibility(userType) {
      document.querySelectorAll('[niko-role]').forEach(element => {
        const allowedRoles = element.getAttribute('niko-role').split(',').map(r => r.trim());
        
        if (!allowedRoles.includes(userType)) {
          element.remove();
        }
      });
    }

    // ============================================================================
    // REGISTRATION & LOGIN METHODS
    // ============================================================================
    async register(email, password, name, userType) {
      console.log('Registering user:', { email, userType });
      
      if (!this.initialized) {
        throw new Error('Authentication system not initialized');
      }

      try {
        const redirectUrl = userType === 'retailer' 
          ? window.location.origin + CONFIG.ROUTES.RETAILER_ONBOARDING
          : window.location.origin + CONFIG.ROUTES.CUSTOMER_ONBOARDING;

        const { data, error } = await this.supabase.auth.signUp({
          email: email,
          password: password,
          options: {
            data: {
              name: name,
              user_type: userType,
              role: userType
            },
            emailRedirectTo: redirectUrl
          }
        });

        if (error) {
          console.error('Registration error:', error);
          return { success: false, error: error.message };
        }

        console.log('Registration successful:', data.user?.email);
        return { success: true, user: data.user };

      } catch (error) {
        console.error('Registration failed:', error);
        return { success: false, error: error.message };
      }
    }

    async login(email, password) {
      console.log('Logging in user:', { email });
      
      if (!this.initialized) {
        throw new Error('Authentication system not initialized');
      }

      try {
        const { data, error } = await this.supabase.auth.signInWithPassword({
          email: email,
          password: password
        });

        if (error) {
          console.error('Login error:', error);
          return { success: false, error: error.message };
        }

        console.log('Login successful:', data.user?.email);
        
        // Set cookies and redirect
        if (data.session && data.user) {
          this.setAuthCookies(data.user, data.session);
          
          // Redirect to appropriate dashboard
          const userType = data.user.user_metadata?.user_type || data.user.user_metadata?.role || 'customer';
          const dashboardUrl = userType === 'retailer' 
            ? CONFIG.ROUTES.RETAILER_DASHBOARD 
            : CONFIG.ROUTES.CUSTOMER_DASHBOARD;
          
          setTimeout(() => {
            window.location.href = window.location.origin + dashboardUrl;
          }, 100);
        }

        return { success: true, user: data.user };

      } catch (error) {
        console.error('Login failed:', error);
        return { success: false, error: error.message };
      }
    }

    async logout() {
      console.log('Logging out user...');
      
      if (!this.initialized) {
        throw new Error('Authentication system not initialized');
      }

      try {
        const { error } = await this.supabase.auth.signOut();
        
        // Clear cookies and storage
        this.clearAuthCookies();
        localStorage.clear();
        sessionStorage.clear();

        if (error) {
          console.error('Logout error:', error);
        }

        console.log('Logout successful');
        return { success: true };

      } catch (error) {
        console.error('Logout failed:', error);
        return { success: false, error: error.message };
      }
    }

    // ============================================================================
    // UTILITY FUNCTIONS
    // ============================================================================
    setupLogoutHandlers() {
      if (typeof document === 'undefined') return;

      const logoutSelectors = [
        '[niko-data="logout"]',
        '[data-logout]',
        '.logout-btn',
        '.logout-button'
      ];

      const logoutElements = [];
      logoutSelectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(element => {
          if (!logoutElements.includes(element)) {
            logoutElements.push(element);
          }
        });
      });

      logoutElements.forEach(element => {
        const newElement = element.cloneNode(true);
        element.parentNode.replaceChild(newElement, element);
        
        newElement.addEventListener('click', async (e) => {
          e.preventDefault();
          e.stopPropagation();
          
          console.log('Logout button clicked');
          const originalText = newElement.textContent;
          
          try {
            newElement.textContent = 'Logging out...';
            newElement.disabled = true;
            
            await this.logout();
            window.location.href = CONFIG.ROUTES.LOGIN;
            
          } catch (error) {
            console.error('Logout error:', error);
            newElement.textContent = originalText;
            newElement.disabled = false;
            window.location.href = CONFIG.ROUTES.LOGIN;
          }
        });
      });

      console.log(`Setup ${logoutElements.length} logout handlers`);
    }

    isProtectedPage() {
      return document.querySelector('[niko-data="auth-required"]') !== null ||
             document.querySelector('[data-auth="required"]') !== null ||
             window.location.pathname.includes('/dashboard') ||
             window.location.pathname.includes('/dev/app/customer/') ||
             window.location.pathname.includes('/dev/app/retailer/');
    }

    isCorrectOnboardingPage(userType) {
      const currentPath = window.location.pathname;
      
      if (userType === 'retailer') {
        return currentPath.includes('/retailer/onboarding');
      } else {
        return currentPath.includes('/customer/onboarding');
      }
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
      console.log('NikoAuth: Redirecting to login');
      window.location.href = loginUrl;
    }

    // Legacy methods for backward compatibility
    isInitialized() {
      return this.initialized;
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

    async isAuthenticated() {
      const user = await this.getCurrentUser();
      return !!user;
    }
  }

  // ============================================================================
  // AUTO-INITIALIZE
  // ============================================================================
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.NikoAuthCore = new NikoAuthCore();
    });
  } else {
    window.NikoAuthCore = new NikoAuthCore();
  }

  // Legacy global logout function
  window.nikologout = async function() {
    if (window.NikoAuthCore) {
      await window.NikoAuthCore.logout();
      window.location.href = CONFIG.ROUTES.LOGIN;
    }
  };

  // Debug function
  window.checkAuthState = () => {
    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
      const [name, value] = cookie.trim().split('=');
      if (['c.token', 'uid', 'user_type'].includes(name)) {
        acc[name] = decodeURIComponent(value || '');
      }
      return acc;
    }, {});
    
    console.log('Current Auth State:', {
      cookies,
      bodyAuth: document.body.getAttribute('data-user-authenticated'),
      userType: document.body.getAttribute('data-user-type'),
      protectedContent: document.querySelectorAll('[niko-data="auth-required"]').length,
      loaderElements: document.querySelectorAll('[niko-data="page-loader"]').length
    });
  };

  console.log('NikoAuth: Complete authentication system loaded v4.0.0');
  console.log('NikoAuth: Available debug function: checkAuthState()');

})(window);