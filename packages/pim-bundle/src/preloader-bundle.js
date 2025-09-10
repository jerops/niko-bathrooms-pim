/**
 * Niko Preloader Bundle - Standalone preloader handler
 * Shows loading screen until authentication is verified and page is ready
 */

(function() {
  'use strict';

  class NikoPreloader {
    constructor() {
      this.preloaderElement = null;
      this.authChecked = false;
      this.pageLoaded = false;
      this.minimumShowTime = 800;
      this.startTime = Date.now();
      
      this.init();
    }

    init() {
      console.log('🎬 Preloader handler initializing');
      
      // Find preloader element
      this.preloaderElement = document.querySelector('[niko-data="page-loader"]');
      
      if (!this.preloaderElement) {
        console.warn('⚠️ Preloader element not found: [niko-data="page-loader"]');
        return;
      }

      // Ensure preloader is visible initially
      this.showPreloader();
      
      // Wait for auth system and page to be ready
      this.checkAuthAndPageReady();
    }

    showPreloader() {
      if (this.preloaderElement) {
        this.preloaderElement.style.display = 'flex';
        this.preloaderElement.style.position = 'fixed';
        this.preloaderElement.style.top = '0';
        this.preloaderElement.style.left = '0';
        this.preloaderElement.style.width = '100%';
        this.preloaderElement.style.height = '100%';
        this.preloaderElement.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
        this.preloaderElement.style.zIndex = '9999';
        this.preloaderElement.style.justifyContent = 'center';
        this.preloaderElement.style.alignItems = 'center';
        this.preloaderElement.style.opacity = '1';
        this.preloaderElement.style.transition = 'opacity 0.3s ease-out';
        
        console.log('👁️ Preloader shown');
      }
    }

    hidePreloader() {
      if (!this.preloaderElement) return;

      const elapsedTime = Date.now() - this.startTime;
      const remainingTime = Math.max(0, this.minimumShowTime - elapsedTime);

      setTimeout(() => {
        if (this.preloaderElement) {
          console.log('🎬 Hiding preloader');
          
          this.preloaderElement.style.opacity = '0';
          
          setTimeout(() => {
            if (this.preloaderElement) {
              this.preloaderElement.style.display = 'none';
              console.log('✅ Preloader hidden');
            }
          }, 300);
        }
      }, remainingTime);
    }

    async checkAuthAndPageReady() {
      // Wait for DOM to be ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
          this.pageLoaded = true;
          this.checkIfReadyToHide();
        });
      } else {
        this.pageLoaded = true;
      }

      // Wait for auth system to be ready
      this.waitForAuthSystem().then(() => {
        this.performAuthCheck();
      });
    }

    waitForAuthSystem() {
      return new Promise((resolve) => {
        const checkInterval = setInterval(() => {
          if (window.NikoAuthCore && window.NikoAuthCore.isInitialized()) {
            clearInterval(checkInterval);
            console.log('🔐 Auth system ready');
            resolve();
          }
        }, 50);
        
        setTimeout(() => {
          clearInterval(checkInterval);
          console.warn('⚠️ Auth system timeout - proceeding without auth check');
          resolve();
        }, 5000);
      });
    }

    async performAuthCheck() {
      try {
        if (this.isProtectedPage()) {
          console.log('🔒 Checking authentication for protected page');
          
          if (window.NikoAuthCore) {
            const user = await window.NikoAuthCore.getCurrentUser();
            
            if (user) {
              console.log('✅ User authenticated');
              this.authChecked = true;
              this.checkIfReadyToHide();
            } else {
              console.log('❌ User not authenticated - redirecting to login');
              this.redirectToLogin();
              return;
            }
          } else {
            console.warn('⚠️ Auth system not available');
            this.authChecked = true;
            this.checkIfReadyToHide();
          }
        } else {
          console.log('📄 Public page - no auth check needed');
          this.authChecked = true;
          this.checkIfReadyToHide();
        }
      } catch (error) {
        console.error('❌ Auth check error:', error);
        this.authChecked = true;
        this.checkIfReadyToHide();
      }
    }

    isProtectedPage() {
      const path = window.location.pathname;
      const protectedPaths = [
        '/dev/app/customer/',
        '/dev/app/retailer/',
        '/app/customer/',
        '/app/retailer/', 
        '/dashboard',
        '/profile',
        '/onboarding'
      ];
      
      return protectedPaths.some(protectedPath => path.includes(protectedPath));
    }

    redirectToLogin() {
      const loginUrl = '/dev/app/auth/log-in';
      console.log('🚀 Redirecting to login:', loginUrl);
      window.location.href = loginUrl;
    }

    checkIfReadyToHide() {
      console.log('🔍 Checking if ready to hide:', { 
        authChecked: this.authChecked, 
        pageLoaded: this.pageLoaded 
      });
      
      if (this.authChecked && this.pageLoaded) {
        this.hidePreloader();
      }
    }

    forceHide() {
      console.log('🚨 Force hiding preloader');
      this.hidePreloader();
    }

    updateText(text) {
      if (this.preloaderElement) {
        let textElement = this.preloaderElement.querySelector('.preloader-text');
        
        if (!textElement) {
          textElement = document.createElement('div');
          textElement.className = 'preloader-text';
          textElement.style.cssText = `
            position: absolute;
            bottom: 2rem;
            left: 50%;
            transform: translateX(-50%);
            color: #666;
            font-size: 0.9rem;
            text-align: center;
          `;
          this.preloaderElement.appendChild(textElement);
        }
        
        textElement.textContent = text;
      }
    }
  }

  // Auto-initialize preloader
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      window.NikoPreloader = new NikoPreloader();
      
      // Emergency fallback - force hide after 10 seconds
      setTimeout(() => {
        console.log('🚨 Emergency preloader timeout');
        if (window.NikoPreloader) {
          window.NikoPreloader.forceHide();
        }
      }, 10000);
    });
  } else {
    window.NikoPreloader = new NikoPreloader();
    
    // Emergency fallback
    setTimeout(() => {
      console.log('🚨 Emergency preloader timeout');
      if (window.NikoPreloader) {
        window.NikoPreloader.forceHide();
      }
    }, 10000);
  }

})();