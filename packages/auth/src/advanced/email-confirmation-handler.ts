/**
 * Email Confirmation Handler
 * Handles the confirmation flow and modal interactions
 */

export class EmailConfirmationHandler {
  constructor() {
    this.init();
  }

  private init(): void {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setupHandlers());
    } else {
      this.setupHandlers();
    }
  }

  private setupHandlers(): void {
    // Handle close modal button
    this.setupCloseModalHandler();
    
    // Check if user came from email confirmation link
    this.checkEmailConfirmationFlow();
  }

  private setupCloseModalHandler(): void {
    // Look for close modal button with niko attribute (note the typo "confimation" from your original question)
    const closeButton = document.querySelector('[niko="close-confimation-mail-modal"]');
    
    if (closeButton) {
      closeButton.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Show alert to confirm email
        alert('Please check your email and click the confirmation link to complete your account setup.');
      });
    }

    // Also check for common modal close selectors as fallback
    const fallbackSelectors = [
      '[data-modal="close"]',
      '.modal-close',
      '.close-modal',
      '[aria-label="Close"]'
    ];

    fallbackSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        // Only add handler if it's on the email confirmation page
        if (window.location.pathname.includes('email-confirmation')) {
          element.addEventListener('click', (e) => {
            e.preventDefault();
            alert('Please check your email and click the confirmation link to complete your account setup.');
          });
        }
      });
    });
  }

  private checkEmailConfirmationFlow(): void {
    // Check if user arrived via email confirmation
    const urlParams = new URLSearchParams(window.location.search);
    const hasConfirmationParams = urlParams.has('type') && urlParams.has('access_token');
    
    if (hasConfirmationParams) {
      // User clicked email confirmation link
      this.handleEmailConfirmation();
    }
  }

  private async handleEmailConfirmation(): Promise<void> {
    try {
      // Import auth manager to check user role
      const { AdvancedAuthManager } = await import('./auth-manager-advanced.js');
      const authManager = new AdvancedAuthManager(
        'https://bzjoxjqfpmjhbfijthpp.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6am94anFmcG1qaGJmaWp0aHBwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3NjIyMzksImV4cCI6MjA3MTMzODIzOX0.sL9omeLIgpgqYjTJM6SGQPSvUvm5z-Yr9rOzkOi2mJk'
      );
      
      const user = await authManager.getCurrentUser();
      
      if (user) {
        const userRole = user.user_metadata?.role || user.user_metadata?.user_type;
        
        // Only redirect customers to onboarding, retailers go to dashboard
        if (userRole === 'customer') {
          window.location.href = '/dev/app/customer/onboarding';
        } else {
          window.location.href = '/dev/app/retailer/dashboard';
        }
      }
    } catch (error) {
      console.error('Error handling email confirmation:', error);
    }
  }
}

// Auto-initialize if on confirmation page
if (window.location.pathname.includes('email-confirmation')) {
  new EmailConfirmationHandler();
}
