/**
 * Niko Onboarding Bundle - Standalone onboarding form handler
 * Handles Formly multi-step forms and syncs with Webflow CMS via Supabase Edge Function
 */

(function() {
  'use strict';

  class NikoOnboardingHandler {
    constructor() {
      this.isSubmitting = false;
      this.supabaseUrl = null;
      this.supabaseKey = null;
      
      this.init();
    }

    async init() {
      console.log('🎯 Niko Onboarding Handler initializing');
      
      // Wait for auth system
      await this.waitForAuthSystem();
      
      // Wait for DOM and Formly
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.setupHandlers());
      } else {
        this.setupHandlers();
      }
    }

    waitForAuthSystem() {
      return new Promise((resolve) => {
        const checkInterval = setInterval(() => {
          if (window.NikoAuthCore && window.NikoAuthCore.isInitialized()) {
            clearInterval(checkInterval);
            console.log('🔐 Auth system ready for onboarding');
            resolve();
          }
        }, 100);
        
        // Timeout after 10 seconds
        setTimeout(() => {
          clearInterval(checkInterval);
          console.warn('⚠️ Auth system timeout - proceeding anyway');
          resolve();
        }, 10000);
      });
    }

    setupHandlers() {
      // Check if we're on an onboarding page
      const path = window.location.pathname;
      if (!path.includes('/onboarding') && !path.includes('/profile-setup')) {
        console.log('📍 Not on onboarding page, skipping handler setup');
        return;
      }

      // Find Formly multi-step form
      const multiStepForm = document.querySelector('[data-form="multistep"]');
      
      if (!multiStepForm) {
        console.warn('⚠️ Formly multi-step form not found');
        return;
      }

      console.log('✅ Onboarding form handler initialized');

      // Method 1: Listen for Formly's submit button click
      const submitBtn = multiStepForm.querySelector('[data-form="submit-btn"]');
      if (submitBtn) {
        submitBtn.addEventListener('click', (e) => this.handleFormlySubmit(e, multiStepForm));
      }

      // Method 2: Listen for native form submission
      multiStepForm.addEventListener('submit', (e) => this.handleFormSubmit(e, multiStepForm));

      // Method 3: Listen for Webflow form success
      this.listenForWebflowSuccess(multiStepForm);
    }

    async handleFormlySubmit(event, form) {
      console.log('📝 Formly submit button clicked');
      
      // Give Formly a moment to validate
      setTimeout(() => {
        if (this.isFormValid(form)) {
          this.processOnboardingData(form);
        }
      }, 100);
    }

    async handleFormSubmit(event, form) {
      console.log('📝 Form submission detected');
      
      // Check if this is the final submission
      const currentStep = this.getCurrentStep(form);
      const totalSteps = this.getTotalSteps(form);
      
      if (currentStep === totalSteps) {
        event.preventDefault();
        await this.processOnboardingData(form);
      }
    }

    listenForWebflowSuccess(form) {
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

    async processOnboardingData(form) {
      if (this.isSubmitting) {
        console.log('⏳ Already processing submission');
        return;
      }

      this.isSubmitting = true;

      try {
        // Get current user
        const currentUser = await window.NikoAuthCore.getCurrentUser();
        if (!currentUser) {
          throw new Error('User not authenticated');
        }

        const userId = currentUser.id;
        const userRole = currentUser.user_metadata?.role || 'customer';

        console.log(`📊 Processing ${userRole} onboarding for user:`, userId);

        // Collect form data
        const formData = this.collectFormData(form);
        console.log('📋 Collected form data:', formData);

        // Prepare CMS data
        const cmsData = this.prepareCMSData(formData, userRole, currentUser);

        // Update Webflow CMS via Edge Function
        await this.updateWebflowCMS(userId, cmsData);

        // Update user metadata
        await this.markOnboardingComplete(userId);

        // Show success message
        this.showNotification('success', 'Profile setup complete! Redirecting to your dashboard...');

        // Redirect to dashboard
        setTimeout(() => {
          const dashboardUrl = userRole === 'customer' 
            ? '/app/customer/dashboard' 
            : '/app/retailer/dashboard';
          window.location.href = dashboardUrl;
        }, 2000);

      } catch (error) {
        console.error('❌ Onboarding error:', error);
        this.showNotification('error', 'Failed to complete profile setup. Please try again.');
      } finally {
        this.isSubmitting = false;
      }
    }

    collectFormData(form) {
      const data = {};

      // Get all form inputs
      const inputs = form.querySelectorAll('input, select, textarea');
      
      inputs.forEach((field) => {
        const name = field.name || field.getAttribute('data-name');
        
        if (!name) return;

        // Handle different input types
        if (field.type === 'checkbox') {
          data[name] = field.checked;
        } else if (field.type === 'radio') {
          if (field.checked) {
            data[name] = field.value;
          }
        } else if (field.tagName === 'SELECT' && field.multiple) {
          const selected = Array.from(field.selectedOptions).map(opt => opt.value);
          data[name] = selected;
        } else if (field.value) {
          data[name] = field.value;
        }
      });

      return data;
    }

    prepareCMSData(formData, role, user) {
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
          verified: false
        };
      }
    }

    async updateWebflowCMS(userId, cmsData) {
      console.log('📤 Updating Webflow CMS with onboarding data');

      const supabaseUrl = window.NikoAuthCore.getSupabaseUrl();
      const accessToken = await window.NikoAuthCore.getAccessToken();

      const response = await fetch(`${supabaseUrl}/functions/v1/update-webflow-user-onboarding`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
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

    async markOnboardingComplete(userId) {
      console.log('📌 Marking onboarding as complete');

      await window.NikoAuthCore.updateUserMetadata({
        onboarding_completed: true,
        onboarding_date: new Date().toISOString()
      });
    }

    isFormValid(form) {
      // Check HTML5 validation
      if (!form.checkValidity()) {
        return false;
      }

      // Check for Formly error classes
      const hasErrors = form.querySelector('.error, .w-form-fail');
      return !hasErrors;
    }

    getCurrentStep(form) {
      const activeStep = form.querySelector('[data-form="step"].w--tab-active');
      const allSteps = form.querySelectorAll('[data-form="step"]');
      return Array.from(allSteps).indexOf(activeStep) + 1;
    }

    getTotalSteps(form) {
      return form.querySelectorAll('[data-form="step"]').length;
    }

    showNotification(type, message) {
      if (window.NikoNotificationManager) {
        window.NikoNotificationManager.show({ type, message });
      } else {
        // Fallback to alert
        alert(message);
      }
    }
  }

  // Auto-initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      window.NikoOnboardingHandler = new NikoOnboardingHandler();
    });
  } else {
    window.NikoOnboardingHandler = new NikoOnboardingHandler();
  }

})();