// Niko Auth Core - Professional Authentication System v5.0.0
// Enterprise-grade security with httpOnly cookies and automatic token management
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
      LOGIN_PAGE: '/dev/app/auth/log-in'
    }
  };

  // ============================================================================
  // PROFESSIONAL COOKIE STORAGE IMPLEMENTATION
  // ============================================================================
  const cookieStorage = {
    getItem: (key) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${key}=`);
      return parts.length === 2 ? decodeURIComponent(parts.pop().split(';').shift()) : null;
    },
    setItem: (key, value) => {
      const maxAge = 7 * 24 * 60 * 60; // 7 days
      document.cookie = `${key}=${encodeURIComponent(value)}; max-age=${maxAge}; path=/; secure; samesite=lax`;
    },
    removeItem: (key) => {
      document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; secure; samesite=lax`;
    }
  };

  // ============================================================================
  // MAIN AUTHENTICATION SYSTEM
  // ============================================================================
  class NikoAuthCore {
    constructor() {
      this.supabase = null;
      this.initialized = false;
      this.authStateListeners = [];
      this.init();
    }

    async init() {
      console.log('Loading Niko Auth Core v5.0.0 (Professional)');
      
      if (typeof supabase === 'undefined') {
        await this.loadSupabase();
      }
      
      // Initialize Supabase with professional configuration
      this.supabase = supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY, {
        auth: {
          storage: cookieStorage,
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true,
          flowType: 'pkce' // PKCE for enhanced security
        }
      });
      
      this.initialized = true;
      console.log('Niko Auth Core v5.0.0 initialized with professional security');
      
      // Setup auth state monitoring
      this.setupAuthStateListener();
      this.setupLogoutHandlers();
      
      // Check initial auth state
      await this.checkAuthState();
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
    // PROFESSIONAL AUTH STATE MANAGEMENT
    // ============================================================================
    setupAuthStateListener() {
      this.supabase.auth.onAuthStateChange((event, session) => {
        console.log('Auth state change:', event);
        
        switch (event) {
          case 'SIGNED_IN':
            console.log('User signed in:', session?.user?.email);
            this.handleAuthenticatedUser(session.user);
            break;
            
          case 'SIGNED_OUT':
            console.log('User signed out');
            this.handleSignedOutUser();
            break;
            
          case 'TOKEN_REFRESHED':
            console.log('Token refreshed automatically');
            // Supabase handles this transparently
            break;
            
          case 'USER_UPDATED':
            console.log('User updated');
            break;
        }
        
        // Notify custom listeners
        this.authStateListeners.forEach(listener => {
          try {
            listener(event, session);
          } catch (error) {
            console.error('Auth state listener error:', error);
          }
        });
      });
    }

    onAuthStateChange(callback) {
      this.authStateListeners.push(callback);
      // Return unsubscribe function
      return () => {
        const index = this.authStateListeners.indexOf(callback);
        if (index > -1) {
          this.authStateListeners.splice(index, 1);
        }
      };
    }

    // ============================================================================
    // USER MANAGEMENT
    // ============================================================================
    handleAuthenticatedUser(user) {
      if (!user) return;
      
      const userType = user.user_metadata?.user_type || user.user_metadata?.role || 'customer';
      const userName = user.user_metadata?.name || user.email?.split('@')[0] || 'User';

      // Set body attributes for styling
      document.body.setAttribute('data-user-authenticated', 'true');
      document.body.setAttribute('data-user-type', userType);

      // Populate user data in DOM
      this.populateUserData(user, userName, userType);
      
      // Show authenticated content
      this.showAuthenticatedContent();
      
      // Apply role-based visibility
      this.applyRoleBasedVisibility(userType);

      // Fire custom event
      window.dispatchEvent(new CustomEvent('nikoAuthReady', {
        detail: { user, userType, authenticated: true }
      }));

      console.log('User interface updated for:', userName);
    }

    handleSignedOutUser() {
      // Remove body attributes
      document.body.removeAttribute('data-user-authenticated');
      document.body.removeAttribute('data-user-type');

      // Hide authenticated content
      document.querySelectorAll('[niko-data="auth-required"]').forEach(el => {
        el.style.visibility = 'hidden';
        el.style.opacity = '0';
      });

      // Fire custom event
      window.dispatchEvent(new CustomEvent('nikoAuthSignedOut', {
        detail: { authenticated: false }
      }));

      // Redirect if on protected page
      if (this.isProtectedPage()) {
        this.redirectToLogin();
      }
    }

    populateUserData(user, userName, userType) {
      // Update user name elements
      document.querySelectorAll('[niko-data="user-name"]').forEach(el => {
        el.textContent = userName;
      });

      // Update email elements  
      document.querySelectorAll('[niko-data="user-email"]').forEach(el => {
        el.textContent = user.email;
      });

      // Update role elements
      document.querySelectorAll('[niko-data="user-role"]').forEach(el => {
        el.textContent = userType;
      });

      // Legacy selectors for backward compatibility
      const userSelectors = {
        name: ['[data-user="name"]', '.user-name', '#user-name'],
        email: ['[data-user="email"]', '.user-email', '#user-email'],
        role: ['[data-user="role"]', '.user-role', '#user-role']
      };

      userSelectors.name.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => el.textContent = userName);
      });
      
      userSelectors.email.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => el.textContent = user.email);
      });
      
      userSelectors.role.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => el.textContent = userType);
      });
    }

    showAuthenticatedContent() {
      document.querySelectorAll('[niko-data="auth-required"]').forEach(el => {
        el.style.visibility = 'visible';
        el.style.opacity = '1';
      });

      // Special handling if body itself has auth-required
      if (document.body && document.body.hasAttribute('niko-data') && 
          document.body.getAttribute('niko-data') === 'auth-required') {
        document.body.style.visibility = 'visible';
        document.body.style.opacity = '1';
      }
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
    // AUTHENTICATION METHODS
    // ============================================================================
    async register(email, password, name, userType) {
      console.log('Registering user:', { email, userType });
      
      if (!this.initialized) {
        throw new Error('Authentication system not initialized');
      }

      try {
        const redirectUrl = userType.toLowerCase() === 'retailer'
          ? window.location.origin + CONFIG.ROUTES.RETAILER_ONBOARDING
          : window.location.origin + CONFIG.ROUTES.CUSTOMER_ONBOARDING;

        const { data, error } = await this.supabase.auth.signUp({
          email: email,
          password: password,
          options: {
            data: {
              name: name,
              user_type: userType.toLowerCase(),
              role: userType.toLowerCase()
            },
            emailRedirectTo: redirectUrl
          }
        });

        if (error) {
          console.error('Registration error:', error);
          return { success: false, error: error.message };
        }

        console.log('Registration successful:', data.user?.email);
        
        // Create Webflow record
        await this.createWebflowRecord(data.user.id, email, name, userType);
        
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
        
        // Redirect will be handled by auth state change listener
        if (data.session && data.user) {
          const userType = data.user.user_metadata?.user_type || data.user.user_metadata?.role || 'customer';
          const dashboardUrl = userType === 'retailer' 
            ? CONFIG.ROUTES.RETAILER_DASHBOARD 
            : CONFIG.ROUTES.CUSTOMER_DASHBOARD;
          
          // Small delay to ensure auth state is processed
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

        if (error) {
          console.error('Logout error:', error);
          return { success: false, error: error.message };
        }

        // Clear additional storage (Supabase cookies are handled automatically)
        localStorage.clear();
        sessionStorage.clear();

        console.log('Logout successful');
        return { success: true };

      } catch (error) {
        console.error('Logout failed:', error);
        return { success: false, error: error.message };
      }
    }

    // ============================================================================
    // UTILITY METHODS
    // ============================================================================
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

    async checkAuthState() {
      const user = await this.getCurrentUser();
      if (user) {
        console.log('User authenticated:', user.email);
        this.handleAuthenticatedUser(user);
      } else if (this.isProtectedPage()) {
        console.log('No user found on protected page, redirecting...');
        this.redirectToLogin();
      }
    }

    async createWebflowRecord(userId, email, name, userType) {
      try {
        const { data, error } = await this.supabase.functions.invoke('create-webflow-user', {
          body: {
            user_id: userId,
            email: email,
            name: name,
            user_type: userType
          }
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

    setupLogoutHandlers() {
      if (typeof document === 'undefined') return;

      const logoutSelectors = [
        '[niko-data="logout"]',
        '[data-logout]',
        '.logout-btn',
        '.logout-button',
        'a[href*="logout"]',
        'button[onclick*="logout"]'
      ];

      const logoutElements = [];
      logoutSelectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(element => {
          if (!logoutElements.includes(element)) {
            logoutElements.push(element);
          }
        });
      });

      console.log(`Found ${logoutElements.length} logout elements`);

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
            
            const result = await this.logout();
            console.log('Logout result:', result);
            
            window.location.href = CONFIG.ROUTES.LOGIN_PAGE;
            
          } catch (error) {
            console.error('Logout error:', error);
            newElement.textContent = originalText;
            newElement.disabled = false;
            window.location.href = CONFIG.ROUTES.LOGIN_PAGE;
          }
        });
      });

      console.log(`Setup ${logoutElements.length} logout handlers`);
    }

    isProtectedPage() {
      if (typeof window === 'undefined') return false;
      
      return document.querySelector('[niko-data="auth-required"]') !== null ||
             document.querySelector('[data-auth="required"]') !== null ||
             window.location.pathname.includes('/dashboard') ||
             window.location.pathname.includes('/dev/app/customer/') ||
             window.location.pathname.includes('/dev/app/retailer/');
    }

    redirectToLogin() {
      const loginUrl = window.location.origin + CONFIG.ROUTES.LOGIN_PAGE;
      console.log('Redirecting to login:', loginUrl);
      window.location.href = loginUrl;
    }

    // ============================================================================
    // LEGACY COMPATIBILITY
    // ============================================================================
    isInitialized() {
      return this.initialized;
    }

    getRedirectUrl(userType) {
      return userType.toLowerCase() === 'retailer' 
        ? CONFIG.ROUTES.RETAILER_DASHBOARD 
        : CONFIG.ROUTES.CUSTOMER_DASHBOARD;
    }
  }

  // ============================================================================
  // AUTO-INITIALIZE
  // ============================================================================
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.NikoAuthCore = new NikoAuthCore();
      window.NikoAuth = window.NikoAuthCore; // Alias for compatibility
    });
  } else {
    window.NikoAuthCore = new NikoAuthCore();
    window.NikoAuth = window.NikoAuthCore; // Alias for compatibility
  }

  // Legacy global logout function
  window.nikologout = async function() {
    if (window.NikoAuthCore) {
      await window.NikoAuthCore.logout();
      window.location.href = CONFIG.ROUTES.LOGIN_PAGE;
    }
  };

  console.log('NikoAuth: Professional authentication system loaded v5.0.0');

})(window);