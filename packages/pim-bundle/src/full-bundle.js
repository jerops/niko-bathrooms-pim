import './auth-bundle.js';
import '../../../custom-css/src/page-loader.js';

// Auto-initialize page authentication system
document.addEventListener('DOMContentLoaded', function() {
  // Initialize Niko PIM with enhanced authentication
  if (typeof window.NikoPIM === 'undefined') {
    window.NikoPIM = {};
  }
  
  // Add page authentication utilities
  window.NikoPIM.PageLoader = window.NikoPageLoader;
  
  // Enhanced authentication check for protected pages
  const protectedPageMarkers = [
    '[niko-data="auth-required"]',
    '[niko-data="page-guard"]',
    '[data-page-auth="required"]'
  ];
  
  // Check if this page requires authentication
  const requiresAuth = protectedPageMarkers.some(selector => 
    document.querySelector(selector) !== null
  );
  
  if (requiresAuth) {
    console.log('NikoPIM: Protected page detected, initializing authentication');
    
    // Initialize page authentication with default config
    window.NikoPageLoader.initPageAuth({
      loginUrl: '/app/auth/log-in',
      onAuthenticated: (authData) => {
        console.log('NikoPIM: User authenticated successfully');
        
        // Trigger PIM-wide authentication event
        window.dispatchEvent(new CustomEvent('nikoPimAuthReady', {
          detail: authData
        }));
      },
      onUnauthenticated: () => {
        console.warn('NikoPIM: User not authenticated, showing error');
        window.NikoPageLoader.showError(
          'Please log in to access this page',
          '/app/auth/log-in'
        );
      }
    });
  }
  
  console.log('NikoPIM Full Bundle: Enhanced authentication system loaded');
});

console.log('Full bundle loaded with enhanced authentication');
