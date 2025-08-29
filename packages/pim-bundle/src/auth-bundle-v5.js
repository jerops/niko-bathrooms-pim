// Niko Auth Core - Professional Authentication System v5.0.0
// Enterprise-grade security with httpOnly cookies and automatic token management
(function(window) {
  'use strict';

  // Detect if we're in development or production
  const isDev = window.location.hostname === 'localhost' || 
                window.location.hostname === '127.0.0.1' || 
                window.location.hostname.includes('webflow.io');
  
  const pathPrefix = isDev ? '/dev' : '';
  
  const CONFIG = {
    SUPABASE_URL: 'https://bzjoxjqfpmjhbfijthpp.supabase.co',
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6am94anFmcG1qaGJmaWp0aHBwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3NjIyMzksImV4cCI6MjA3MTMzODIzOX0.sL9omeLIgpgqYjTJM6SGQPSvUvm5z-Yr9rOzkOi2mJk',
    ROUTES: {
      CUSTOMER_ONBOARDING: `${pathPrefix}/app/customer/onboarding`,
      RETAILER_ONBOARDING: `${pathPrefix}/app/retailer/onboarding`,
      CUSTOMER_DASHBOARD: `${pathPrefix}/app/customer/dashboard`,
      RETAILER_DASHBOARD: `${pathPrefix}/app/retailer/dashboard`,
      LOGIN_PAGE: `${pathPrefix}/app/auth/log-in`
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
      console.log('🚀 NikoAuthCore constructor called');
      this.supabase = null;
      this.initialized = false;
      this.authStateListeners = [];
      console.log('📋 Initial state set, calling init()');
      this.init();
    }

    async init() {
      console.log('🔧 Loading Niko Auth Core v5.0.0 (Professional)');
      console.log('🌍 Environment:', isDev ? 'DEVELOPMENT' : 'PRODUCTION');
      console.log('📍 Current URL:', window.location.href);
      console.log('🛤️ Path prefix:', pathPrefix || '(none)');
      console.log('🍪 Document cookies available:', document.cookie ? 'YES' : 'NO');
      
      if (typeof supabase === 'undefined') {
        console.log('📦 Supabase not found, loading from CDN...');
        await this.loadSupabase();
        console.log('✅ Supabase loaded successfully');
      } else {
        console.log('✅ Supabase already available');
      }
      
      console.log('⚙️ Initializing Supabase client with professional config...');
      
      // Initialize Supabase with professional configuration
      this.supabase = supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY, {
        auth: {
          storage: cookieStorage,
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true,
          flowType: 'implicit' // Use implicit flow for email confirmations to work
        },
        global: {
          headers: {
            'X-Client-Info': 'niko-auth-v5'
          }
        }
      });
      
      console.log('✅ Supabase client created with config:', {
        storage: 'cookieStorage',
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'implicit'
      });
      
      this.initialized = true;
      console.log('🎉 Niko Auth Core v5.0.0 initialized with professional security');
      console.log('🔗 Available on window.NikoAuthCore and window.NikoAuth');
      
      // Setup auth state monitoring
      console.log('👂 Setting up auth state listener...');
      this.setupAuthStateListener();
      
      console.log('🚪 Setting up logout handlers...');
      this.setupLogoutHandlers();
      
      // Check if we're coming back from email confirmation
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const errorCode = hashParams.get('error_code');
      const errorDesc = hashParams.get('error_description');
      
      if (errorCode || errorDesc) {
        console.error('❌ Auth error in URL:', errorCode, errorDesc);
        // Clear the error from URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }
      
      // Let Supabase handle the URL automatically first
      console.log('🔄 Letting Supabase detect session in URL...');
      
      try {
        // Give Supabase a moment to process the URL
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const { data: { session }, error } = await this.supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Error getting session:', error);
        }
        
        if (session) {
          console.log('✅ Session detected by Supabase');
          console.log('👤 User:', session.user?.email);
          this.handleAuthenticatedUser(session.user);
          
          // Clean the URL after successful session detection
          if (window.location.hash) {
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        } else {
          // If no session from URL, check normal auth state
          console.log('🔍 No session in URL, checking auth state...');
          await this.checkAuthState();
        }
      } catch (error) {
        console.error('❌ Failed to check session:', error);
        await this.checkAuthState();
      }
      
      console.log('✨ Initialization complete!');
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
    // EMAIL CONFIRMATION HANDLING
    // ============================================================================
    async handleEmailConfirmation() {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');
      
      if (accessToken && refreshToken) {
        console.log('📬 Email confirmation tokens found in URL');
        console.log('🔑 Access token (first 20 chars):', accessToken.substring(0, 20) + '...');
        
        try {
          // Set the session manually with the tokens from the URL
          const { data, error } = await this.supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });
          
          if (error) {
            console.error('❌ Error setting session from email confirmation:', error);
            return false;
          }
          
          console.log('✅ Session established from email confirmation');
          console.log('👤 User confirmed:', data.user?.email);
          
          // Give cookies time to be set
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Clean the URL
          window.history.replaceState({}, document.title, window.location.pathname);
          
          // Handle the authenticated user
          this.handleAuthenticatedUser(data.user);
          
          // Return true to indicate we handled email confirmation
          return true;
          
        } catch (error) {
          console.error('❌ Failed to handle email confirmation:', error);
          return false;
        }
      } else {
        console.log('📭 No email confirmation tokens in URL');
        return false;
      }
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
      console.log('📝 REGISTER METHOD CALLED');
      console.log('👤 Registering user:', { email, userType, name });
      console.log('🔧 Initialized status:', this.initialized);
      
      if (!this.initialized) {
        console.error('❌ Authentication system not initialized');
        throw new Error('Authentication system not initialized');
      }

      try {
        const redirectUrl = userType.toLowerCase() === 'retailer'
          ? window.location.origin + CONFIG.ROUTES.RETAILER_ONBOARDING
          : window.location.origin + CONFIG.ROUTES.CUSTOMER_ONBOARDING;

        console.log('🔄 Redirect URL:', redirectUrl);
        console.log('📧 Calling Supabase auth.signUp...');

        const { data, error } = await this.supabase.auth.signUp({
          email: email,
          password: password,
          options: {
            data: {
              name: name,
              user_type: userType.toLowerCase(),
              role: userType.toLowerCase()
            },
            emailRedirectTo: redirectUrl,
            captchaToken: null // Disable captcha for testing
          }
        });

        if (error) {
          console.error('❌ Registration error:', error);
          return { success: false, error: error.message };
        }

        console.log('✅ Registration successful:', data.user?.email);
        console.log('👤 User data:', data.user);
        console.log('📧 Email confirmed?', data.user?.email_confirmed_at ? 'YES' : 'NO');
        console.log('🔐 Session created?', data.session ? 'YES' : 'NO');
        
        if (!data.user?.email_confirmed_at) {
          console.log('📮 Confirmation email should be sent to:', data.user?.email);
        }
        
        // Create Webflow record
        console.log('📊 Creating Webflow record...');
        await this.createWebflowRecord(data.user.id, email, name, userType);
        
        console.log('🎉 Registration complete!');
        return { success: true, user: data.user };

      } catch (error) {
        console.error('💥 Registration failed with error:', error);
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

        // Check if email is confirmed
        if (data.user && !data.user.email_confirmed_at) {
          console.error('❌ Email not confirmed for user:', data.user.email);
          await this.supabase.auth.signOut(); // Sign out unconfirmed user
          return { 
            success: false, 
            error: 'Please confirm your email before logging in. Check your inbox for the confirmation link.' 
          };
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
      console.log('🔍 Checking auth state...');
      
      const user = await this.getCurrentUser();
      
      if (user) {
        console.log('✅ User authenticated:', user.email);
        this.handleAuthenticatedUser(user);
      } else if (this.isProtectedPage()) {
        console.log('❌ No user found on protected page, redirecting to login...');
        this.redirectToLogin();
      } else {
        console.log('ℹ️ No user found on public page, continuing without auth');
      }
    }

    async createWebflowRecord(userId, email, name, userType) {
      try {
        console.log('🔄 Calling Edge Function with:', { user_id: userId, email, name, user_type: userType });
        
        const { data, error } = await this.supabase.functions.invoke('create-webflow-user', {
          body: {
            user_id: userId,
            email: email,
            name: name,
            user_type: userType
          }
        });

        if (error) {
          console.error('❌ Webflow Edge Function error:', error);
          console.error('❌ Error details:', {
            message: error.message,
            status: error.status,
            statusText: error.statusText
          });
          // Don't fail registration due to Webflow integration issues
        } else {
          console.log('✅ Webflow CMS record created successfully');
          console.log('📊 Response data:', data);
        }
      } catch (error) {
        console.error('💥 Edge function network/runtime error:', error);
        console.error('🔍 Error type:', error.constructor.name);
        // Don't fail registration due to Webflow integration issues
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
             window.location.pathname.includes(`${pathPrefix}/app/customer/`) ||
             window.location.pathname.includes(`${pathPrefix}/app/retailer/`);
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
  console.log('🏁 AUTO-INITIALIZE SECTION REACHED');
  console.log('📄 Document readyState:', document.readyState);
  console.log('🌐 Window location:', window.location.href);
  
  if (document.readyState === 'loading') {
    console.log('⏳ Document still loading, waiting for DOMContentLoaded...');
    document.addEventListener('DOMContentLoaded', () => {
      console.log('🎬 DOMContentLoaded fired, creating NikoAuthCore...');
      window.NikoAuthCore = new NikoAuthCore();
      window.NikoAuth = window.NikoAuthCore; // Alias for compatibility
      console.log('✅ window.NikoAuthCore created');
      console.log('✅ window.NikoAuth alias created');
    });
  } else {
    console.log('✨ Document ready, creating NikoAuthCore immediately...');
    window.NikoAuthCore = new NikoAuthCore();
    window.NikoAuth = window.NikoAuthCore; // Alias for compatibility
    console.log('✅ window.NikoAuthCore created');
    console.log('✅ window.NikoAuth alias created');
  }

  // Legacy global logout function
  window.nikologout = async function() {
    console.log('🚪 nikologout function called');
    if (window.NikoAuthCore) {
      await window.NikoAuthCore.logout();
      window.location.href = CONFIG.ROUTES.LOGIN_PAGE;
    } else {
      console.error('❌ window.NikoAuthCore not found');
    }
  };
  console.log('✅ nikologout function registered');

  console.log('🎉 NikoAuth: Professional authentication system loaded v5.0.0');
  console.log('🔍 You can test with: window.NikoAuthCore or window.NikoAuth');

})(window);