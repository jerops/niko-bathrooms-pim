// Niko Auth Core - Main Authentication System v3.0.0 (Modular)
(function(window){'use strict';

  const CONFIG = {
    SUPABASE_URL: 'https://bzjoxjqfpmjhbfijthpp.supabase.co',
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6am94anFmcG1qaGJmaWp0aHBwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3NjIyMzksImV4cCI6MjA3MTMzODIzOX0.sL9omeLIgpgqYjTJM6SGQPSvUvm5z-Yr9rOzkOi2mJk',
    ROUTES: {
      CUSTOMER_DASHBOARD: '/dev/app/customer/dashboard',
      RETAILER_DASHBOARD: '/dev/app/retailer/dashboard',
      LOGIN_PAGE: '/dev/app/auth/log-in'
    }
  };
  
  class NikoAuthCore {
    constructor() {
      this.supabase = null;
      this.initialized = false;
      this.init();
    }
  
    async init() {
      console.log('Loading Niko Auth Core v3.0.0 (Modular)');
      if (typeof supabase === 'undefined') {
        await this.loadSupabase();
      }
      this.supabase = supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
      this.initialized = true;
      console.log('Niko Auth Core initialized successfully');
      this.setupLogoutHandlers();
      this.checkAuthState();
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
  
    isInitialized() {
      return this.initialized;
    }
  
    // Copy all the other methods from your working production code...
    async register(email, password, name, userType) {
      console.log('Registering user:', {email, userType});
      if (!this.initialized) {
        throw new Error('Authentication system not initialized');
      }
      try {
        const baseHref = document.querySelector('base')?.href || location.origin + '/';
        const redirectUrl = userType === 'Customer' 
          ? baseHref + 'dev/app/customer/dashboard'
          : baseHref + 'dev/app/retailer/dashboard';
  
        const { data, error } = await this.supabase.auth.signUp({
          email: email,
          password: password,
          options: {
            data: {
              name: name,
              user_type: userType,
              role: userType,
            },
            emailRedirectTo: redirectUrl,
          },
        });
  
        if (error) {
          console.error('Registration error:', error);
          return { success: false, error: error.message };
        }
  
        console.log('Registration successful:', data.user?.email);
        await this.createWebflowRecord(data.user.id, email, name, userType);
        return { success: true, user: data.user };
      } catch (error) {
        console.error('Registration failed:', error);
        return { success: false, error: error.message };
      }
    }
  
    async login(email, password) {
      console.log('Logging in user:', {email});
      if (!this.initialized) {
        throw new Error('Authentication system not initialized');
      }
      try {
        const { data, error } = await this.supabase.auth.signInWithPassword({
          email: email,
          password: password,
        });
  
        if (error) {
          console.error('Login error:', error);
          return { success: false, error: error.message };
        }
  
        console.log('Login successful:', data.user?.email);
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
        localStorage.clear();
        sessionStorage.clear();
        
        if (error) {
          console.error('Logout error:', error);
          return { success: false, error: error.message };
        }
  
        console.log('Logout successful');
        return { success: true };
      } catch (error) {
        console.error('Logout failed:', error);
        return { success: false, error: error.message };
      }
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
  
    async createWebflowRecord(userId, email, name, userType) {
      try {
        const { error } = await this.supabase.functions.invoke('create-webflow-user', {
          body: {
            user_id: userId,
            email: email,
            name: name,
            user_type: userType,
          },
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
      // Copy the logout setup logic from production
    }
  
    async checkAuthState() {
      // Copy the auth state checking from production
    }
  }
  
  window.NikoAuthCore = new NikoAuthCore();
  
  })(window);