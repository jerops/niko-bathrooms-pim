/**
 * Preloader Handler for Webflow
 * Shows loading screen until authentication is verified and page is ready
 */

export class PreloaderHandler {
  private preloaderElement: HTMLElement | null = null;
  private authChecked = false;
  private pageLoaded = false;
  private minimumShowTime = 800; // Minimum time to show preloader (prevents flash)
  private startTime = Date.now();

  constructor() {
    this.init();
  }

  /**
   * Initialize preloader handler
   */
  private init(): void {
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

  /**
   * Show preloader
   */
  private showPreloader(): void {
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

  /**
   * Hide preloader with smooth transition
   */
  private hidePreloader(): void {
    if (!this.preloaderElement) return;

    // Calculate elapsed time
    const elapsedTime = Date.now() - this.startTime;
    const remainingTime = Math.max(0, this.minimumShowTime - elapsedTime);

    // Ensure minimum show time, then hide
    setTimeout(() => {
      if (this.preloaderElement) {
        console.log('🎬 Hiding preloader');
        
        this.preloaderElement.style.opacity = '0';
        
        // Remove from DOM after transition
        setTimeout(() => {
          if (this.preloaderElement) {
            this.preloaderElement.style.display = 'none';
            console.log('✅ Preloader hidden');
          }
        }, 300); // Match transition duration
      }
    }, remainingTime);
  }

  /**
   * Check authentication status and page readiness
   */
  private async checkAuthAndPageReady(): Promise<void> {
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

  /**
   * Wait for NikoAuthCore to be available
   */
  private waitForAuthSystem(): Promise<void> {
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if ((window as any).NikoAuthCore && (window as any).NikoAuthCore.isInitialized()) {
          clearInterval(checkInterval);
          console.log('🔐 Auth system ready');
          resolve();
        }
      }, 50);
      
      // Timeout after 5 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        console.warn('⚠️ Auth system timeout - proceeding without auth check');
        resolve();
      }, 5000);
    });
  }

  /**
   * Perform authentication check
   */
  private async performAuthCheck(): Promise<void> {
    try {
      // Check if we're on a protected page
      if (this.isProtectedPage()) {
        console.log('🔒 Checking authentication for protected page');
        
        if ((window as any).NikoAuthCore) {
          const user = await (window as any).NikoAuthCore.getCurrentUser();
          
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

  /**
   * Check if current page requires authentication
   */
  private isProtectedPage(): boolean {
    const path = window.location.pathname;
    const protectedPaths = [
      '/app/customer/',
      '/app/retailer/',
      '/dashboard',
      '/profile',
      '/onboarding'
    ];
    
    return protectedPaths.some(protectedPath => path.includes(protectedPath));
  }

  /**
   * Redirect to login page
   */
  private redirectToLogin(): void {
    const loginUrl = '/app/auth/log-in'; // Adjust this to your login page URL
    console.log('🚀 Redirecting to login:', loginUrl);
    window.location.href = loginUrl;
  }

  /**
   * Check if ready to hide preloader
   */
  private checkIfReadyToHide(): void {
    console.log('🔍 Checking if ready to hide:', { 
      authChecked: this.authChecked, 
      pageLoaded: this.pageLoaded 
    });
    
    if (this.authChecked && this.pageLoaded) {
      this.hidePreloader();
    }
  }

  /**
   * Force hide preloader (emergency fallback)
   */
  public forceHide(): void {
    console.log('🚨 Force hiding preloader');
    this.hidePreloader();
  }

  /**
   * Update preloader text (optional)
   */
  public updateText(text: string): void {
    if (this.preloaderElement) {
      let textElement = this.preloaderElement.querySelector('.preloader-text') as HTMLElement;
      
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

/**
 * Auto-initialize preloader on all pages
 */
export function initPreloader(): PreloaderHandler {
  const handler = new PreloaderHandler();
  
  // Make available globally for debugging
  (window as any).NikoPreloader = handler;
  
  // Emergency fallback - force hide after 10 seconds
  setTimeout(() => {
    console.log('🚨 Emergency preloader timeout');
    handler.forceHide();
  }, 10000);
  
  return handler;
}