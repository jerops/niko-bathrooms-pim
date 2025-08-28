/**
 * WebflowPageLoader - Manages loading states during authentication checks
 * Integrates with Webflow's visual elements for smooth UX
 */

export interface LoaderConfig {
  loaderSelector?: string;
  contentSelector?: string;
  fadeInDuration?: number;
  minLoadTime?: number;
  customStyles?: {
    loader?: Partial<CSSStyleDeclaration>;
    content?: Partial<CSSStyleDeclaration>;
  };
}

export class WebflowPageLoader {
  private config: Required<LoaderConfig>;
  private loadStartTime: number = 0;
  private loaderElements: HTMLElement[] = [];
  private contentElements: HTMLElement[] = [];
  private isLoading: boolean = false;

  constructor(config: LoaderConfig = {}) {
    this.config = {
      loaderSelector: config.loaderSelector || '[niko-data="page-loader"]',
      contentSelector: config.contentSelector || '[niko-data="auth-required"]',
      fadeInDuration: config.fadeInDuration || 300,
      minLoadTime: config.minLoadTime || 500, // Minimum time to show loader
      customStyles: config.customStyles || {}
    };
    
    this.initialize();
  }

  /**
   * Initialize loader elements and set initial states
   */
  private initialize(): void {
    // Find all loader elements
    this.loaderElements = Array.from(
      document.querySelectorAll<HTMLElement>(this.config.loaderSelector)
    );
    
    // Find all content elements that need authentication
    this.contentElements = Array.from(
      document.querySelectorAll<HTMLElement>(this.config.contentSelector)
    );
    
    // Set initial styles for protected content (hidden)
    this.contentElements.forEach(element => {
      element.style.visibility = 'hidden';
      element.style.opacity = '0';
      element.style.transition = `opacity ${this.config.fadeInDuration}ms ease-in-out`;
    });
    
    // Apply custom loader styles if provided
    if (this.config.customStyles.loader) {
      this.loaderElements.forEach(loader => {
        Object.assign(loader.style, this.config.customStyles.loader);
      });
    }
    
    console.log('WebflowPageLoader: Initialized with', {
      loaders: this.loaderElements.length,
      protectedContent: this.contentElements.length
    });
  }

  /**
   * Show loading state
   * Force override existing CSS that might hide loader immediately
   */
  async show(): Promise<void> {
    if (this.isLoading) return;
    
    this.isLoading = true;
    this.loadStartTime = Date.now();
    
    // Create loader HTML if elements don't exist
    if (this.loaderElements.length === 0) {
      this.createDefaultLoader();
    }
    
    // Show all loader elements - force override existing CSS
    this.loaderElements.forEach(loader => {
      // Use !important to override existing CSS like opacity: 0
      loader.style.setProperty('display', 'flex', 'important');
      loader.style.setProperty('visibility', 'visible', 'important');
      loader.style.setProperty('opacity', '1', 'important');
      loader.style.setProperty('pointer-events', 'auto', 'important');
      loader.style.transition = 'opacity 0.3s ease-out';
      
      // Add loading class for animations
      loader.classList.add('niko-loading-active');
    });
    
    // Hide content during loading
    this.contentElements.forEach(element => {
      element.style.visibility = 'hidden';
      element.style.opacity = '0';
    });
    
    console.log('WebflowPageLoader: Loading state activated (existing CSS overridden)');
  }

  /**
   * Hide loading state and reveal content
   * Remove our CSS overrides to restore original Webflow styling
   */
  async hide(): Promise<void> {
    if (!this.isLoading) return;
    
    // Ensure minimum load time for smooth UX
    const elapsedTime = Date.now() - this.loadStartTime;
    const remainingTime = Math.max(0, this.config.minLoadTime - elapsedTime);
    
    if (remainingTime > 0) {
      await this.delay(remainingTime);
    }
    
    // Remove our CSS overrides and let existing CSS take over
    this.loaderElements.forEach(loader => {
      // Remove our important declarations
      loader.style.removeProperty('display');
      loader.style.removeProperty('visibility');
      loader.style.removeProperty('opacity');
      loader.style.removeProperty('pointer-events');
      loader.style.removeProperty('transition');
      
      loader.classList.remove('niko-loading-active');
    });
    
    // Reveal authenticated content with fade-in
    setTimeout(() => {
      this.contentElements.forEach(element => {
        element.style.visibility = 'visible';
        element.style.opacity = '1';
      });
    }, 100); // Small delay for smooth transition
    
    this.isLoading = false;
    console.log('WebflowPageLoader: Content revealed (CSS overrides removed)');
  }

  /**
   * Show error state
   */
  showError(message: string = 'Authentication required'): void {
    this.loaderElements.forEach(loader => {
      // Replace loader content with error message
      loader.innerHTML = `
        <div class="niko-auth-error">
          <svg class="niko-error-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <p class="niko-error-message">${message}</p>
          <a href="/app/auth/log-in" class="niko-error-login-btn">Go to Login</a>
        </div>
      `;
      
      loader.classList.remove('niko-loading-active');
      loader.classList.add('niko-loading-error');
    });
  }

  /**
   * Create default loader if none exists
   */
  private createDefaultLoader(): void {
    const loader = document.createElement('div');
    loader.setAttribute('niko-data', 'page-loader');
    loader.className = 'niko-page-loader';
    loader.innerHTML = `
      <div class="niko-loader-container">
        <div class="niko-loader-spinner">
          <div class="niko-spinner-ring"></div>
          <div class="niko-spinner-ring"></div>
          <div class="niko-spinner-ring"></div>
        </div>
        <p class="niko-loader-text">Authenticating...</p>
      </div>
    `;
    
    // Add styles
    loader.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(255, 255, 255, 0.98);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
    `;
    
    document.body.appendChild(loader);
    this.loaderElements = [loader];
  }

  /**
   * Update loader message
   */
  updateMessage(message: string): void {
    this.loaderElements.forEach(loader => {
      const textElement = loader.querySelector('.niko-loader-text, [niko-data="loader-text"]');
      if (textElement) {
        textElement.textContent = message;
      }
    });
  }

  /**
   * Add progress indicator
   */
  showProgress(percent: number): void {
    this.loaderElements.forEach(loader => {
      let progressBar = loader.querySelector<HTMLElement>('.niko-progress-bar');
      
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
   * Utility delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Check if loader is currently active
   */
  isActive(): boolean {
    return this.isLoading;
  }

  /**
   * Destroy loader and cleanup
   */
  destroy(): void {
    this.loaderElements.forEach(loader => {
      loader.remove();
    });
    
    this.contentElements.forEach(element => {
      element.style.visibility = '';
      element.style.opacity = '';
      element.style.transition = '';
    });
    
    this.loaderElements = [];
    this.contentElements = [];
    this.isLoading = false;
  }

  /**
   * Static method to quickly show/hide loader
   */
  static async quickLoad(asyncFn: () => Promise<any>, config?: LoaderConfig): Promise<any> {
    const loader = new WebflowPageLoader(config);
    
    try {
      await loader.show();
      const result = await asyncFn();
      await loader.hide();
      return result;
    } catch (error) {
      loader.showError('An error occurred. Please try again.');
      throw error;
    }
  }
}