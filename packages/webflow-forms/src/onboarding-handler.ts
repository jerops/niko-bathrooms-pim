/**
 * Onboarding Form Handler for Formly Multi-Step Forms
 * Handles form submission and syncs with Webflow CMS
 */

import { AuthManager } from '@nikobathrooms/auth';
import { NotificationManager } from '@nikobathrooms/notifications';
import { getDashboardUrl } from '@nikobathrooms/auth/src/redirects.js';

interface OnboardingData {
  // Customer fields
  companyName?: string;
  vatNumber?: string;
  phoneNumber?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  preferredCategories?: string[];
  
  // Retailer fields
  businessName?: string;
  businessType?: string;
  registrationNumber?: string;
  businessPhone?: string;
  businessAddress?: string;
  businessCity?: string;
  businessPostalCode?: string;
  businessCountry?: string;
  showroomAddress?: string;
  yearsInBusiness?: string;
  brandsCarried?: string[];
  
  // Common fields
  newsletter?: boolean;
  marketingConsent?: boolean;
  termsAccepted?: boolean;
}

export class OnboardingFormHandler {
  private auth: AuthManager;
  private notifications: NotificationManager;
  private isSubmitting: boolean = false;

  constructor(supabaseUrl?: string, supabaseKey?: string) {
    this.auth = new AuthManager(
      supabaseUrl || process.env.SUPABASE_URL || '', 
      supabaseKey || process.env.SUPABASE_ANON_KEY || ''
    );
    this.notifications = new NotificationManager();
  }

  /**
   * Initialize onboarding form handler
   * Works with Formly multi-step forms
   */
  async init(): Promise<void> {
    // Wait for DOM and Formly to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setupHandlers());
    } else {
      this.setupHandlers();
    }
  }

  private setupHandlers(): void {
    // Find Formly multi-step form
    const multiStepForm = document.querySelector('[data-form="multistep"]') as HTMLFormElement;
    
    if (!multiStepForm) {
      console.warn('Formly multi-step form not found on this page');
      return;
    }

    console.log('🎯 Onboarding form handler initialized');

    // Method 1: Listen for Formly's submit button click
    const submitBtn = multiStepForm.querySelector('[data-form="submit-btn"]');
    if (submitBtn) {
      submitBtn.addEventListener('click', (e) => this.handleFormlySubmit(e, multiStepForm));
    }

    // Method 2: Listen for native form submission (as fallback)
    multiStepForm.addEventListener('submit', (e) => this.handleFormSubmit(e, multiStepForm));

    // Method 3: Listen for Webflow form success (if Formly triggers it)
    this.listenForWebflowSuccess(multiStepForm);
  }

  /**
   * Handle Formly submit button click
   */
  private async handleFormlySubmit(event: Event, form: HTMLFormElement): Promise<void> {
    console.log('📝 Formly submit button clicked');
    
    // Don't prevent default yet - let Formly validate first
    // We'll capture the data and process it
    
    // Give Formly a moment to validate
    setTimeout(() => {
      if (this.isFormValid(form)) {
        this.processOnboardingData(form);
      }
    }, 100);
  }

  /**
   * Handle native form submission
   */
  private async handleFormSubmit(event: Event, form: HTMLFormElement): Promise<void> {
    console.log('📝 Form submission detected');
    
    // Check if this is the final submission (all steps completed)
    const currentStep = this.getCurrentStep(form);
    const totalSteps = this.getTotalSteps(form);
    
    if (currentStep === totalSteps) {
      event.preventDefault();
      await this.processOnboardingData(form);
    }
  }

  /**
   * Listen for Webflow form success state
   */
  private listenForWebflowSuccess(form: HTMLFormElement): void {
    // Webflow adds a success message div when form submits successfully
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'childList') {
          const successMessage = form.querySelector('.w-form-done');
          if (successMessage && successMessage.style.display !== 'none') {
            console.log('✅ Webflow form success detected');
            this.processOnboardingData(form);
            observer.disconnect();
          }
        }
      }
    });

    observer.observe(form.parentElement || form, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class']
    });
  }

  /**
   * Process the onboarding form data
   */
  private async processOnboardingData(form: HTMLFormElement): Promise<void> {
    if (this.isSubmitting) {
      console.log('⏳ Already processing submission');
      return;
    }

    this.isSubmitting = true;

    try {
      // Get current user
      const currentUser = await this.auth.getCurrentUser();
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      const userId = currentUser.id;
      const userRole = currentUser.user_metadata?.role || 'customer';

      console.log(`📊 Processing ${userRole} onboarding for user:`, userId);

      // Collect form data
      const formData = this.collectFormData(form);
      console.log('📋 Collected form data:', formData);

      // Prepare CMS data based on role
      const cmsData = this.prepareCMSData(formData, userRole, currentUser);

      // Update Webflow CMS via Supabase Edge Function
      await this.updateWebflowCMS(userId, cmsData);

      // Update user metadata to mark onboarding as complete
      await this.markOnboardingComplete(userId);

      // Show success message
      this.notifications.show({
        type: 'success',
        message: 'Profile setup complete! Redirecting to your dashboard...'
      });

      // Redirect to dashboard
      setTimeout(() => {
        const dashboardUrl = getDashboardUrl(userRole as 'customer' | 'retailer');
        window.location.href = dashboardUrl;
      }, 2000);

    } catch (error) {
      console.error('❌ Onboarding error:', error);
      this.notifications.show({
        type: 'error',
        message: 'Failed to complete profile setup. Please try again.'
      });
    } finally {
      this.isSubmitting = false;
    }
  }

  /**
   * Collect all form data from multi-step form
   */
  private collectFormData(form: HTMLFormElement): OnboardingData {
    const data: OnboardingData = {};

    // Get all form inputs (including from hidden steps)
    const inputs = form.querySelectorAll('input, select, textarea');
    
    inputs.forEach((input: Element) => {
      const field = input as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
      const name = field.name || field.getAttribute('data-name');
      
      if (!name) return;

      // Handle different input types
      if (field.type === 'checkbox') {
        data[name as keyof OnboardingData] = (field as HTMLInputElement).checked as any;
      } else if (field.type === 'radio') {
        if ((field as HTMLInputElement).checked) {
          data[name as keyof OnboardingData] = field.value as any;
        }
      } else if (field.tagName === 'SELECT' && (field as HTMLSelectElement).multiple) {
        const selected = Array.from((field as HTMLSelectElement).selectedOptions).map(opt => opt.value);
        data[name as keyof OnboardingData] = selected as any;
      } else if (field.value) {
        data[name as keyof OnboardingData] = field.value as any;
      }
    });

    return data;
  }

  /**
   * Prepare data for Webflow CMS based on role
   */
  private prepareCMSData(formData: OnboardingData, role: string, user: any): any {
    const baseData = {
      name: user.user_metadata?.name || user.email,
      email: user.email,
      role: role,
      firebaseUid: user.id,
      onboardingCompleted: true,
      onboardingDate: new Date().toISOString(),
      newsletterSubscribed: formData.newsletter || false,
      marketingConsent: formData.marketingConsent || false,
    };

    if (role === 'customer') {
      return {
        ...baseData,
        companyName: formData.companyName || '',
        vatNumber: formData.vatNumber || '',
        phoneNumber: formData.phoneNumber || '',
        address: {
          line1: formData.addressLine1 || '',
          line2: formData.addressLine2 || '',
          city: formData.city || '',
          postalCode: formData.postalCode || '',
          country: formData.country || ''
        },
        preferences: {
          categories: formData.preferredCategories || []
        }
      };
    } else {
      // Retailer data
      return {
        ...baseData,
        businessName: formData.businessName || '',
        businessType: formData.businessType || '',
        registrationNumber: formData.registrationNumber || '',
        businessPhone: formData.businessPhone || '',
        businessAddress: {
          street: formData.businessAddress || '',
          city: formData.businessCity || '',
          postalCode: formData.businessPostalCode || '',
          country: formData.businessCountry || ''
        },
        showroomAddress: formData.showroomAddress || '',
        yearsInBusiness: formData.yearsInBusiness || '',
        brandsCarried: formData.brandsCarried || [],
        verified: false // Will be verified by admin
      };
    }
  }

  /**
   * Update Webflow CMS via Supabase Edge Function
   */
  private async updateWebflowCMS(userId: string, cmsData: any): Promise<void> {
    console.log('📤 Updating Webflow CMS with onboarding data');

    const response = await fetch(`${this.auth.getSupabaseUrl()}/functions/v1/update-webflow-user-onboarding`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await this.auth.getAccessToken()}`
      },
      body: JSON.stringify({
        userId,
        onboardingData: cmsData
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`CMS update failed: ${error}`);
    }

    console.log('✅ Webflow CMS updated successfully');
  }

  /**
   * Mark onboarding as complete in user metadata
   */
  private async markOnboardingComplete(userId: string): Promise<void> {
    console.log('📌 Marking onboarding as complete');

    await this.auth.updateUserMetadata({
      onboarding_completed: true,
      onboarding_date: new Date().toISOString()
    });
  }

  /**
   * Helper: Check if form is valid
   */
  private isFormValid(form: HTMLFormElement): boolean {
    // Check HTML5 validation
    if (!form.checkValidity()) {
      return false;
    }

    // Check for Formly error classes
    const hasErrors = form.querySelector('.error, .w-form-fail');
    return !hasErrors;
  }

  /**
   * Helper: Get current step number
   */
  private getCurrentStep(form: HTMLFormElement): number {
    const activeStep = form.querySelector('[data-form="step"].w--tab-active');
    const allSteps = form.querySelectorAll('[data-form="step"]');
    return Array.from(allSteps).indexOf(activeStep as Element) + 1;
  }

  /**
   * Helper: Get total number of steps
   */
  private getTotalSteps(form: HTMLFormElement): number {
    return form.querySelectorAll('[data-form="step"]').length;
  }
}

/**
 * Auto-initialize on onboarding pages
 */
export function initOnboardingForm(supabaseUrl?: string, supabaseKey?: string): void {
  // Check if we're on an onboarding page
  const path = window.location.pathname;
  if (path.includes('/onboarding') || path.includes('/profile-setup')) {
    const handler = new OnboardingFormHandler(supabaseUrl, supabaseKey);
    handler.init();
    
    // Make available globally for debugging
    (window as any).NikoOnboardingHandler = handler;
  }
}