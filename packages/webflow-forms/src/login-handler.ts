/**
 * Login Form Handler for Webflow
 * Handles customer and retailer login forms with proper error handling
 */

interface LoginFormConfig {
  customerForm?: {
    formId: string;
    emailField: string;
    passwordField: string;
    submitButton: string;
  };
  retailerForm?: {
    formId: string;
    emailField: string;
    passwordField: string;
    submitButton: string;
  };
}

export class LoginFormHandler {
  private config: LoginFormConfig;
  private authCore: any; // NikoAuthCore instance

  constructor(config?: LoginFormConfig) {
    // Default configuration based on your Webflow setup
    this.config = config || {
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
  }

  /**
   * Initialize login form handlers
   */
  init(): void {
    console.log('🔐 Initializing login form handler');
    
    // Setup password visibility toggles
    this.setupPasswordToggles();
    
    // Wait for NikoAuthCore to be ready
    this.waitForAuth().then(() => {
      this.setupLoginForms();
    });
  }

  /**
   * Setup password visibility toggle functionality
   */
  private setupPasswordToggles(): void {
    document.querySelectorAll('.input-visibility-toggle').forEach(toggle => {
      const showIcon = toggle.querySelector('[wized="icon_show_password"]') as HTMLElement;
      const hideIcon = toggle.querySelector('[wized="icon_hide_password"]') as HTMLElement;
      
      if (hideIcon) hideIcon.style.display = 'none';
      if (showIcon) showIcon.style.display = 'block';
      
      toggle.addEventListener('click', (e: Event) => {
        e.preventDefault();
        e.stopPropagation();
        
        const passwordInput = (toggle as HTMLElement).previousElementSibling as HTMLInputElement || 
                            (toggle.parentElement?.querySelector('input[type="password"], input[type="text"]') as HTMLInputElement);
        
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

  /**
   * Wait for NikoAuthCore to initialize
   */
  private waitForAuth(): Promise<void> {
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if ((window as any).NikoAuthCore && (window as any).NikoAuthCore.isInitialized()) {
          clearInterval(checkInterval);
          this.authCore = (window as any).NikoAuthCore;
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

  /**
   * Setup login forms
   */
  private setupLoginForms(): void {
    // Setup customer form
    if (this.config.customerForm) {
      const customerForm = document.querySelector(this.config.customerForm.formId) as HTMLFormElement;
      
      if (customerForm) {
        console.log('📝 Customer login form found');
        
        // Hide error messages initially
        const errorDiv = customerForm.querySelector('.form_message-error-wrapper') as HTMLElement;
        if (errorDiv) errorDiv.style.display = 'none';
        
        customerForm.addEventListener('submit', async (e) => {
          e.preventDefault();
          e.stopImmediatePropagation();
          
          const emailInput = customerForm.querySelector(this.config.customerForm!.emailField) as HTMLInputElement;
          const passwordInput = customerForm.querySelector(this.config.customerForm!.passwordField) as HTMLInputElement;
          const submitButton = customerForm.querySelector(this.config.customerForm!.submitButton) as HTMLInputElement;
          
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
    }
    
    // Setup retailer form
    if (this.config.retailerForm) {
      const retailerForm = document.querySelector(this.config.retailerForm.formId) as HTMLFormElement;
      
      if (retailerForm) {
        console.log('📝 Retailer login form found');
        
        // Hide error messages initially
        const errorDiv = retailerForm.querySelector('.form_message-error-wrapper') as HTMLElement;
        if (errorDiv) errorDiv.style.display = 'none';
        
        retailerForm.addEventListener('submit', async (e) => {
          e.preventDefault();
          e.stopImmediatePropagation();
          
          const emailInput = retailerForm.querySelector(this.config.retailerForm!.emailField) as HTMLInputElement;
          const passwordInput = retailerForm.querySelector(this.config.retailerForm!.passwordField) as HTMLInputElement;
          const submitButton = retailerForm.querySelector(this.config.retailerForm!.submitButton) as HTMLInputElement;
          
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
  }

  /**
   * Handle login submission
   */
  private async handleLogin(
    email: string,
    password: string,
    submitButton: HTMLInputElement,
    userType: 'Customer' | 'Retailer'
  ): Promise<void> {
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
        try {
          const user = await this.authCore.getCurrentUser();
          
          // Safely access user metadata with null checks
          let actualUserType = userType;
          if (user && user.user_metadata) {
            actualUserType = user.user_metadata.user_type || user.user_metadata.role || userType;
          }
          
          const redirectUrl = actualUserType === 'Customer' 
            ? '/dev/app/customer/dashboard' 
            : '/dev/app/retailer/dashboard';
          
          console.log('✅ Login successful, redirecting to:', redirectUrl);
          
          // Show success message briefly
          this.showSuccess('Login successful! Redirecting...');
          
          // Redirect after a short delay
          setTimeout(() => {
            window.location.href = redirectUrl;
          }, 500);
          
        } catch (userError) {
          console.error('Error getting user data:', userError);
          // Default redirect based on form type
          const defaultUrl = userType === 'Customer' 
            ? '/dev/app/customer/dashboard' 
            : '/dev/app/retailer/dashboard';
          window.location.href = defaultUrl;
        }
        
      } else {
        // Login failed - show appropriate error message
        const errorMessage = this.getErrorMessage(result.error);
        console.error('Login failed:', result.error);
        this.showError(errorMessage);
        
        // Reset button
        submitButton.value = originalText;
        submitButton.disabled = false;
      }
      
    } catch (error: any) {
      console.error('Login error:', error);
      this.showError('An unexpected error occurred. Please try again.');
      
      // Reset button
      submitButton.value = originalText;
      submitButton.disabled = false;
    }
  }

  /**
   * Get user-friendly error message
   */
  private getErrorMessage(error: string): string {
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

  /**
   * Show error message
   */
  private showError(message: string): void {
    // Check if we have a notification manager
    if ((window as any).NikoNotificationManager) {
      (window as any).NikoNotificationManager.show({
        type: 'error',
        message: message
      });
    } else {
      // Fallback to alert
      alert(message);
    }
  }

  /**
   * Show success message
   */
  private showSuccess(message: string): void {
    // Check if we have a notification manager
    if ((window as any).NikoNotificationManager) {
      (window as any).NikoNotificationManager.show({
        type: 'success',
        message: message
      });
    }
    // No fallback needed for success messages
  }
}

/**
 * Auto-initialize login forms on DOMContentLoaded
 */
export function initLoginForms(config?: LoginFormConfig): void {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      const handler = new LoginFormHandler(config);
      handler.init();
      
      // Make available globally for debugging
      (window as any).NikoLoginHandler = handler;
    });
  } else {
    const handler = new LoginFormHandler(config);
    handler.init();
    
    // Make available globally for debugging
    (window as any).NikoLoginHandler = handler;
  }
}