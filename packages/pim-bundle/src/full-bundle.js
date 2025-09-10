/**
 * Full Bundle - Backward Compatibility
 * Loads both core and advanced features
 */

import { AuthManager } from '@nikobathrooms/auth';
import { initWebflowForms, initOnboardingForm, initLoginForms } from '@nikobathrooms/webflow-forms';
import { WishlistManager } from '@nikobathrooms/wishlist';
import { NotificationManager } from '@nikobathrooms/notifications';

// Make available globally for backward compatibility
window.NikoAuthManager = AuthManager;
window.NikoAuth = AuthManager;
window.NikoWishlistManager = WishlistManager;
window.NikoNotificationManager = NotificationManager;

// Auto-initialize forms based on page type
document.addEventListener('DOMContentLoaded', () => {
  // Initialize login forms (handles password toggles and login)
  initLoginForms();
  
  // Initialize authentication/signup forms
  initWebflowForms();
  
  // Initialize onboarding forms if on onboarding page
  initOnboardingForm();
});

console.log('Niko PIM Full Bundle v1.0.0 loaded (with login & onboarding support)');
