/**
 * Niko Login Bundle - Standalone login form handler
 * Can be used independently via CDN for cleaner Webflow integration
 */

(function() {
  'use strict';

  // Login Form Handler Class
  class NikoLoginHandler {
    constructor() {
      this.config = {
        customerForm: {
          formId: '#wf-form-Log-In-Customer',
          emailField: '[name="customer-email-input"]',
          passwordField: '[name="customer-password-input"]',
          submitButton: '#customer-login-btn'
        },
        retailerForm: {
          formId: '#wf-form-Log-In-Retailer',
          emailField: '[name="retailer-email-input"]',
          passwordField: '[name="retailer-password-input"]',
          submitButton: '#retailer-login-btn'
        }
      };
      this.authCore = null;
    }

    init() {
      console.log('🔐 Niko Login Handler v1.0.0 initializing');
      
      // Setup password visibility toggles
      this.setupPasswordToggles();
      
      // Wait for NikoAuthCore to be ready
      this.waitForAuth().then(() => {
        this.setupLoginForms();
      });
    }

    setupPasswordToggles() {
      document.querySelectorAll('.input-visibility-toggle').forEach(toggle => {
        const showIcon = toggle.querySelector('[wized="icon_show_password"]');
        const hideIcon = toggle.querySelector('[wized="icon_hide_password"]');
        
        if (hideIcon) hideIcon.style.display = 'none';
        if (showIcon) showIcon.style.display = 'block';
        
        toggle.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          
          const passwordInput = toggle.previousElementSibling || 
                              toggle.parentElement.querySelector('input[type="password"], input[type="text"]');
          
          if (passwordInput) {
            if (passwordInput.type === 'password') {
              passwordInput.type = 'text';
              if (showIcon) showIcon.style.display = 'none';
              if (hideIcon) hideIcon.style.display = 'block';
            } else {
              passwordInput.type = 'password';
              if (showIcon) showIcon.style.display = 'block';
              if (hideIcon) hideIcon.style.display = 'none';
            }
          }
        });
      });
    }

    waitForAuth() {
      return new Promise((resolve) => {
        const checkInterval = setInterval(() => {
          if (window.NikoAuthCore && window.NikoAuthCore.isInitialized()) {
            clearInterval(checkInterval);
            this.authCore = window.NikoAuthCore;
            console.log('✅ NikoAuthCore is ready');
            resolve();
          }
        }, 100);
        
        // Timeout after 10 seconds
        setTimeout(() => {
          clearInterval(checkInterval);
          console.error('❌ NikoAuthCore initialization timeout');
          resolve();
        }, 10000);
      });
    }

    setupLoginForms() {
      // Setup customer form
      const customerForm = document.querySelector(this.config.customerForm.formId);
      
      if (customerForm) {
        console.log('📝 Customer login form found');
        
        // Hide error messages initially
        const errorDiv = customerForm.querySelector('.form_message-error-wrapper');
        if (errorDiv) errorDiv.style.display = 'none';
        
        customerForm.addEventListener('submit', async (e) => {
          e.preventDefault();
          e.stopImmediatePropagation();
          
          const emailInput = customerForm.querySelector(this.config.customerForm.emailField);
          const passwordInput = customerForm.querySelector(this.config.customerForm.passwordField);
          const submitButton = customerForm.querySelector(this.config.customerForm.submitButton);
          
          if (emailInput && passwordInput) {
            await this.handleLogin(
              emailInput.value,
              passwordInput.value,
              submitButton,
              'Customer'
            );
          }
        });
      }
      
      // Setup retailer form
      const retailerForm = document.querySelector(this.config.retailerForm.formId);
      
      if (retailerForm) {
        console.log('📝 Retailer login form found');
        
        // Hide error messages initially
        const errorDiv = retailerForm.querySelector('.form_message-error-wrapper');
        if (errorDiv) errorDiv.style.display = 'none';
        
        retailerForm.addEventListener('submit', async (e) => {
          e.preventDefault();
          e.stopImmediatePropagation();
          
          const emailInput = retailerForm.querySelector(this.config.retailerForm.emailField);
          const passwordInput = retailerForm.querySelector(this.config.retailerForm.passwordField);
          const submitButton = retailerForm.querySelector(this.config.retailerForm.submitButton);
          
          if (emailInput && passwordInput) {
            await this.handleLogin(
              emailInput.value,
              passwordInput.value,
              submitButton,
              'Retailer'
            );
          }
        });
      }
    }

    async handleLogin(email, password, submitButton, userType) {
      // Validate inputs
      if (!email || !password) {
        this.showError('Please enter both email and password');
        return;
      }
      
      console.log(`🔑 Attempting ${userType} login for:`, email);
      
      // Show loading state
      const originalText = submitButton.value;
      submitButton.value = 'Logging in...';
      submitButton.disabled = true;
      
      try {
        // Attempt login
        const result = await this.authCore.login(email, password);
        console.log('Login result:', result);
        
        if (result.success) {
          // Success - get user data for redirect
          let actualUserType = userType;
          
          try {
            const user = await this.authCore.getCurrentUser();
            
            // Safely access user metadata with null checks
            if (user && user.user_metadata) {
              actualUserType = user.user_metadata.user_type || user.user_metadata.role || userType;
            }
          } catch (userError) {
            console.warn('Could not get user metadata, using form type:', userType);
          }
          
          const redirectUrl = actualUserType === 'Customer' 
            ? '/dev/app/customer/dashboard' 
            : '/dev/app/retailer/dashboard';
          
          console.log('✅ Login successful, redirecting to:', redirectUrl);
          
          // Show success message briefly if notification manager available
          if (window.NikoNotificationManager) {
            window.NikoNotificationManager.show({
              type: 'success',
              message: 'Login successful! Redirecting...'
            });
          }
          
          // Redirect after a short delay
          setTimeout(() => {
            window.location.href = redirectUrl;
          }, 500);
          
        } else {
          // Login failed - show appropriate error message
          const errorMessage = this.getErrorMessage(result.error);
          console.error('Login failed:', result.error);
          this.showError(errorMessage);
          
          // Reset button
          submitButton.value = originalText;
          submitButton.disabled = false;
        }
        
      } catch (error) {
        console.error('Login error:', error);
        this.showError('An unexpected error occurred. Please try again.');
        
        // Reset button
        submitButton.value = originalText;
        submitButton.disabled = false;
      }
    }

    getErrorMessage(error) {
      if (!error) return 'Login failed. Please try again.';
      
      // Email not confirmed
      if (error.includes('Email not confirmed')) {
        return 'Please confirm your email address before logging in.';
      }
      
      // Invalid credentials
      if (error.includes('Invalid login credentials') || 
          error.includes('User not found')) {
        return 'Invalid email or password.';
      }
      
      // Rate limiting
      if (error.includes('Too many requests')) {
        return 'Too many login attempts. Please try again later.';
      }
      
      // Password specific
      if (error.includes('Password')) {
        return 'Incorrect password.';
      }
      
      // Email specific
      if (error.includes('Email') || error.includes('email')) {
        return 'Email address not found.';
      }
      
      // Network errors
      if (error.includes('network') || error.includes('Network')) {
        return 'Network error. Please check your connection.';
      }
      
      // Default
      return error.length > 100 ? 'Login failed. Please try again.' : error;
    }

    showError(message) {
      // Check if we have a notification manager
      if (window.NikoNotificationManager) {
        window.NikoNotificationManager.show({
          type: 'error',
          message: message
        });
      } else {
        // Fallback to alert
        alert(message);
      }
    }
  }

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      window.NikoLoginHandler = new NikoLoginHandler();
      window.NikoLoginHandler.init();
    });
  } else {
    window.NikoLoginHandler = new NikoLoginHandler();
    window.NikoLoginHandler.init();
  }

})();