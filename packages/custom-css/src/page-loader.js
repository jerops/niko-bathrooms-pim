/**
 * Niko Page Loader - JavaScript utilities for Webflow integration
 * Simple functions to show/hide loaders without full TypeScript dependencies
 */

(function(window) {
  'use strict';

  // Global namespace
  window.NikoPageLoader = window.NikoPageLoader || {};

  /**
   * Show page loader
   */
  function showLoader(message = 'Authenticating...') {
    const loaders = document.querySelectorAll('[niko-data="page-loader"]');
    
    // Create default loader if none exists
    if (loaders.length === 0) {
      createDefaultLoader();
    }
    
    // Show all loader elements
    document.querySelectorAll('[niko-data="page-loader"]').forEach(loader => {
      loader.style.display = 'flex';
      loader.style.visibility = 'visible';
      loader.style.opacity = '1';
      loader.classList.add('niko-loading-active');
      
      // Update message if provided
      const textElement = loader.querySelector('.niko-loader-text, [niko-data="loader-text"]');
      if (textElement && message) {
        textElement.textContent = message;
      }
    });
    
    // Hide protected content
    document.querySelectorAll('[niko-data="auth-required"]').forEach(element => {
      element.style.visibility = 'hidden';
      element.style.opacity = '0';
    });
    
    console.log('NikoPageLoader: Loading state activated');
  }

  /**
   * Hide page loader and reveal content
   */
  function hideLoader(fadeTime = 300) {
    document.querySelectorAll('[niko-data="page-loader"]').forEach(loader => {
      loader.style.opacity = '0';
      loader.classList.remove('niko-loading-active');
      
      // Remove from DOM after fade
      setTimeout(() => {
        loader.style.display = 'none';
      }, fadeTime);
    });
    
    // Show protected content
    setTimeout(() => {
      document.querySelectorAll('[niko-data="auth-required"]').forEach(element => {
        element.style.visibility = 'visible';
        element.style.opacity = '1';
      });
    }, 100);
    
    console.log('NikoPageLoader: Content revealed');
  }

  /**
   * Show error state
   */
  function showError(message = 'Authentication required', loginUrl = '/app/auth/log-in') {
    document.querySelectorAll('[niko-data="page-loader"]').forEach(loader => {
      // Replace loader content with error message
      loader.innerHTML = `
        <div class="niko-loader-container">
          <div class="niko-auth-error">
            <svg class="niko-error-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <p class="niko-error-message">${message}</p>
            <a href="${loginUrl}" class="niko-error-login-btn">Go to Login</a>
          </div>
        </div>
      `;
      
      loader.classList.remove('niko-loading-active');
      loader.classList.add('niko-loading-error');
      loader.style.display = 'flex';
      loader.style.opacity = '1';
    });
  }

  /**
   * Update loader message
   */
  function updateMessage(message) {
    document.querySelectorAll('[niko-data="page-loader"]').forEach(loader => {
      const textElement = loader.querySelector('.niko-loader-text, [niko-data="loader-text"]');
      if (textElement) {
        textElement.textContent = message;
      }
    });
  }

  /**
   * Show progress (0-100)
   */
  function showProgress(percent) {
    document.querySelectorAll('[niko-data="page-loader"]').forEach(loader => {
      let progressBar = loader.querySelector('.niko-progress-bar');
      
      if (!progressBar) {
        // Create progress bar if it doesn't exist
        const container = loader.querySelector('.niko-loader-container');
        if (container) {
          const progressWrapper = document.createElement('div');
          progressWrapper.className = 'niko-progress-wrapper';
          progressWrapper.innerHTML = `
            <div class="niko-progress-track">
              <div class="niko-progress-bar" style="width: 0%"></div>
            </div>
          `;
          container.appendChild(progressWrapper);
          progressBar = progressWrapper.querySelector('.niko-progress-bar');
        }
      }
      
      if (progressBar) {
        progressBar.style.width = `${Math.min(100, Math.max(0, percent))}%`;
      }
    });
  }

  /**
   * Create default loader if none exists in DOM
   * Uses a simple fallback since users will create their own Webflow loaders
   */
  function createDefaultLoader() {
    const loader = document.createElement('div');
    loader.setAttribute('niko-data', 'page-loader');
    loader.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
      color: white;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;
    loader.innerHTML = `
      <div style="text-align: center;">
        <div style="margin-bottom: 1rem; font-size: 1.2rem;">🔐</div>
        <div>Authenticating...</div>
      </div>
    `;
    
    document.body.appendChild(loader);
  }

  /**
   * Quick authentication wrapper
   * Shows loader, runs async function, then hides loader
   */
  async function withLoader(asyncFn, loadingMessage = 'Loading...') {
    try {
      showLoader(loadingMessage);
      const result = await asyncFn();
      hideLoader();
      return result;
    } catch (error) {
      showError('An error occurred. Please try again.');
      throw error;
    }
  }

  /**
   * Set user authentication state in DOM
   */
  function setAuthState(authenticated, userType = null) {
    document.body.setAttribute('data-user-authenticated', authenticated.toString());
    
    if (userType) {
      document.body.setAttribute('data-user-type', userType);
    }
    
    // Trigger custom event
    window.dispatchEvent(new CustomEvent('nikoAuthStateChanged', {
      detail: { authenticated, userType }
    }));
  }

  /**
   * Apply role-based content visibility
   */
  function applyRoleVisibility(userType) {
    // Hide content not for this role
    const roleElements = document.querySelectorAll('[niko-role]');
    
    roleElements.forEach(element => {
      const allowedRoles = element.getAttribute('niko-role')?.split(',').map(r => r.trim());
      
      if (allowedRoles && !allowedRoles.includes(userType)) {
        // SECURE: Remove from DOM completely
        element.remove();
      }
    });
  }

  /**
   * Populate user data in UI elements
   */
  function populateUserData(userData) {
    // User name
    document.querySelectorAll('[niko-data="user-name"]').forEach(el => {
      el.textContent = userData.name || 'User';
    });
    
    // User email
    document.querySelectorAll('[niko-data="user-email"]').forEach(el => {
      el.textContent = userData.email || '';
    });
    
    // User type/role
    document.querySelectorAll('[niko-data="user-role"]').forEach(el => {
      el.textContent = userData.userType || 'customer';
    });
  }

  /**
   * Initialize page authentication check
   */
  function initPageAuth(config = {}) {
    const defaultConfig = {
      loginUrl: '/app/auth/log-in',
      checkCookies: true,
      cookieNames: {
        token: 'c.token',
        uid: 'uid',
        userType: 'user_type'
      },
      onAuthenticated: null,
      onUnauthenticated: null
    };
    
    const finalConfig = { ...defaultConfig, ...config };
    
    // Show loader immediately
    showLoader('Checking authentication...');
    
    // Check for authentication cookies
    if (finalConfig.checkCookies) {
      const cookies = getCookies(finalConfig.cookieNames);
      
      if (!cookies.token || !cookies.uid || !cookies.userType) {
        console.warn('NikoPageLoader: Missing authentication cookies');
        
        if (finalConfig.onUnauthenticated) {
          finalConfig.onUnauthenticated();
        } else {
          showError('Authentication required', finalConfig.loginUrl);
        }
        return false;
      }
      
      // Basic validation passed
      setAuthState(true, cookies.userType);
      applyRoleVisibility(cookies.userType);
      hideLoader();
      
      if (finalConfig.onAuthenticated) {
        finalConfig.onAuthenticated({
          token: cookies.token,
          uid: cookies.uid,
          userType: cookies.userType
        });
      }
      
      return true;
    }
    
    // If not checking cookies, just hide loader
    hideLoader();
    return true;
  }

  /**
   * Get cookies by names
   */
  function getCookies(cookieNames) {
    const getCookie = (name) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      
      if (parts.length === 2) {
        return parts.pop().split(';').shift();
      }
      return null;
    };
    
    return {
      token: getCookie(cookieNames.token),
      uid: getCookie(cookieNames.uid),
      userType: getCookie(cookieNames.userType)
    };
  }

  // Export functions to global namespace
  window.NikoPageLoader = {
    show: showLoader,
    hide: hideLoader,
    showError: showError,
    updateMessage: updateMessage,
    showProgress: showProgress,
    withLoader: withLoader,
    setAuthState: setAuthState,
    applyRoleVisibility: applyRoleVisibility,
    populateUserData: populateUserData,
    initPageAuth: initPageAuth,
    getCookies: getCookies
  };

  // Auto-initialize if data attribute present
  document.addEventListener('DOMContentLoaded', function() {
    const autoInit = document.querySelector('[niko-data="auto-init-page-auth"]');
    if (autoInit) {
      const config = {};
      
      // Read config from data attributes
      const loginUrl = autoInit.getAttribute('niko-login-url');
      if (loginUrl) config.loginUrl = loginUrl;
      
      window.NikoPageLoader.initPageAuth(config);
    }
  });

  console.log('NikoPageLoader: JavaScript utilities loaded');

})(window);