import { AuthManager } from '@nikobathrooms/auth';
import { WEBFLOW_CONFIG, SUPABASE_CONFIG } from '@nikobathrooms/core';

// Create global auth system like your production
class NikoAuthCore {
  constructor() {
    this.authManager = null;
    this.initialized = false;
    this.init();
  }

  async init() {
    console.log('Loading Niko Auth Core v3.0.0 (Modular)');
    
    // Initialize with your production config
    this.authManager = new AuthManager(
      'https://bzjoxjqfpmjhbfijthpp.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6am94anFmcG1qaGJmaWp0aHBwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3NjIyMzksImV4cCI6MjA3MTMzODIzOX0.sL9omeLIgpgqYjTJM6SGQPSvUvm5z-Yr9rOzkOi2mJk'
    );
    
    this.initialized = true;
    console.log('Niko Auth Core initialized successfully');
  }

  isInitialized() {
    return this.initialized;
  }

  async register(email, password, name, userType) {
    if (!this.authManager) throw new Error('Auth not initialized');
    
    return await this.authManager.register({
      email,
      password, 
      name,
      role: userType.toLowerCase()
    });
  }

  async login(email, password) {
    if (!this.authManager) throw new Error('Auth not initialized');
    
    return await this.authManager.login({
      email,
      password
    });
  }

  async logout() {
    if (!this.authManager) throw new Error('Auth not initialized');
    
    const result = await this.authManager.logout();
    if (result.success) {
      window.location.href = '/dev/app/auth/log-in';
    }
    return result;
  }

  async getCurrentUser() {
    if (!this.authManager) return null;
    return await this.authManager.getCurrentUser();
  }

  async isAuthenticated() {
    if (!this.authManager) return false;
    return await this.authManager.isAuthenticated();
  }
}

// Expose globally like production
window.NikoAuthCore = new NikoAuthCore();
