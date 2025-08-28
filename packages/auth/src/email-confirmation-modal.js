/**
 * Simple Email Confirmation Modal Handler
 * Add this script to your email confirmation page to handle close modal interactions
 */
(function() {
  'use strict';
  
  function setupEmailConfirmationModal() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
    
    function init() {
      // Only run on email confirmation pages
      if (!window.location.pathname.includes('email-confirmation')) {
        return;
      }
      
      console.log('Setting up email confirmation modal handlers');
      
      // Primary selector for the close button (with typo as specified)
      const closeButton = document.querySelector('[niko="close-confimation-mail-modal"]');
      
      if (closeButton) {
        console.log('Found close confirmation modal button');
        closeButton.addEventListener('click', handleCloseModal);
      }
      
      // Fallback selectors for common modal close patterns
      const fallbackSelectors = [
        '[data-modal="close"]',
        '.modal-close',
        '.close-modal',
        '[aria-label="Close"]',
        '.modal [data-dismiss="modal"]'
      ];
      
      fallbackSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
          element.addEventListener('click', handleCloseModal);
        });
      });
      
      console.log('Email confirmation modal handlers setup complete');
    }
    
    function handleCloseModal(e) {
      e.preventDefault();
      e.stopPropagation();
      
      // Show alert to remind user to check email
      alert('Please check your email and click the confirmation link to complete your account setup.');
      
      console.log('Close modal clicked - user alerted to check email');
    }
  }
  
  // Initialize immediately
  setupEmailConfirmationModal();
  
  // Make available globally if needed
  window.NikoEmailConfirmationModal = {
    setup: setupEmailConfirmationModal,
    handleClose: function() {
      alert('Please check your email and click the confirmation link to complete your account setup.');
    }
  };
  
})();