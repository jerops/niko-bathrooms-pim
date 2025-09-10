/**
 * CDN Loader - Intelligent CDN Management
 * Provides optimal CDN selection, fallback mechanisms, and cache optimization
 */

export class CDNLoader {
  static VERSION = '5.1.0';
  static CACHE_VERSION = 'v5.1.0';
  
  // Regional CDN endpoints for optimal performance
  static CDN_ENDPOINTS = {
    'us': 'https://cdn.jsdelivr.net',
    'eu': 'https://fastly.jsdelivr.net', 
    'asia': 'https://gcore.jsdelivr.net',
    'default': 'https://cdn.jsdelivr.net'
  };

  // Fallback endpoints
  static FALLBACK_ENDPOINTS = [
    'https://unpkg.com',
    'https://cdnjs.cloudflare.com'
  ];

  /**
   * Detect user region for optimal CDN selection
   */
  static detectUserRegion() {
    // Try to detect region from various sources
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const language = navigator.language;
    
    // Simple region detection based on timezone
    if (timezone.includes('America/') || timezone.includes('US/') || timezone.includes('Canada/')) {
      return 'us';
    } else if (timezone.includes('Europe/') || timezone.includes('Africa/')) {
      return 'eu';
    } else if (timezone.includes('Asia/') || timezone.includes('Australia/') || timezone.includes('Pacific/')) {
      return 'asia';
    }
    
    // Fallback to language detection
    if (language.startsWith('en-US') || language.startsWith('en-CA')) {
      return 'us';
    } else if (language.startsWith('en-GB') || language.startsWith('en-AU')) {
      return 'eu';
    } else if (language.startsWith('zh') || language.startsWith('ja') || language.startsWith('ko')) {
      return 'asia';
    }
    
    return 'default';
  }

  /**
   * Get optimal CDN endpoint for user's region
   */
  static getOptimalCDN() {
    const region = this.detectUserRegion();
    return this.CDN_ENDPOINTS[region] || this.CDN_ENDPOINTS.default;
  }

  /**
   * Generate CDN URL with optimization parameters
   */
  static generateCDNUrl(bundleName, options = {}) {
    const cdn = options.cdn || this.getOptimalCDN();
    const version = options.version || this.VERSION;
    const cacheVersion = options.cacheVersion || this.CACHE_VERSION;
    
    // Base URL structure
    const baseUrl = `${cdn}/gh/jerops/niko-bathrooms-pim@${version}/packages/pim-bundle/dist/${bundleName}`;
    
    // Add optimization parameters
    const params = new URLSearchParams({
      cache: '1y',           // 1 year cache
      compress: 'auto',      // Automatic compression
      minify: 'true',        // Minification
      v: cacheVersion        // Version for cache busting
    });
    
    return `${baseUrl}?${params.toString()}`;
  }

  /**
   * Load script with CDN optimization and fallback
   */
  static async loadScript(bundleName, options = {}) {
    const primaryUrl = this.generateCDNUrl(bundleName, options);
    
    try {
      console.log(`🌐 Loading ${bundleName} from CDN: ${primaryUrl}`);
      return await this.loadScriptFromUrl(primaryUrl);
    } catch (error) {
      console.warn(`⚠️ Primary CDN failed for ${bundleName}:`, error);
      
      // Try fallback CDNs
      for (const fallbackCdn of this.FALLBACK_ENDPOINTS) {
        try {
          const fallbackUrl = this.generateCDNUrl(bundleName, { ...options, cdn: fallbackCdn });
          console.log(`🔄 Trying fallback CDN: ${fallbackUrl}`);
          return await this.loadScriptFromUrl(fallbackUrl);
        } catch (fallbackError) {
          console.warn(`⚠️ Fallback CDN failed:`, fallbackError);
        }
      }
      
      throw new Error(`All CDN endpoints failed for ${bundleName}`);
    }
  }

  /**
   * Load script from specific URL
   */
  static loadScriptFromUrl(url) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = url;
      script.async = true;
      script.crossOrigin = 'anonymous';
      
      // Add cache optimization attributes
      script.setAttribute('data-cache-version', this.CACHE_VERSION);
      script.setAttribute('data-cdn-optimized', 'true');
      
      script.onload = () => {
        console.log(`✅ Successfully loaded: ${url}`);
        resolve(script);
      };
      
      script.onerror = (error) => {
        console.error(`❌ Failed to load: ${url}`, error);
        reject(error);
      };
      
      document.head.appendChild(script);
    });
  }

  /**
   * Preload critical resources
   */
  static preloadCriticalResources() {
    const criticalBundles = [
      'niko-pim-auth-core.min.js',
      'niko-pim-wishlist-core.min.js',
      'niko-pim-notifications-core.min.js'
    ];

    criticalBundles.forEach(bundleName => {
      const url = this.generateCDNUrl(bundleName);
      
      // Create preload link
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = url;
      link.as = 'script';
      link.crossOrigin = 'anonymous';
      
      document.head.appendChild(link);
      console.log(`🚀 Preloaded critical resource: ${bundleName}`);
    });
  }

  /**
   * Setup DNS prefetch for CDN domains
   */
  static setupDNSPrefetch() {
    const cdnDomains = [
      'cdn.jsdelivr.net',
      'fastly.jsdelivr.net',
      'gcore.jsdelivr.net',
      'unpkg.com',
      'cdnjs.cloudflare.com'
    ];

    cdnDomains.forEach(domain => {
      const link = document.createElement('link');
      link.rel = 'dns-prefetch';
      link.href = `//${domain}`;
      document.head.appendChild(link);
    });

    console.log('🌐 DNS prefetch setup for CDN domains');
  }

  /**
   * Load advanced bundle on demand
   */
  static async loadAdvancedBundle(bundleName, options = {}) {
    const advancedBundles = [
      'niko-pim-auth-advanced.min.js',
      'niko-pim-wishlist-advanced.min.js',
      'niko-pim-notifications-advanced.min.js'
    ];

    if (!advancedBundles.includes(bundleName)) {
      throw new Error(`Unknown advanced bundle: ${bundleName}`);
    }

    console.log(`🔄 Loading advanced bundle on demand: ${bundleName}`);
    return await this.loadScript(bundleName, options);
  }

  /**
   * Check cache version and invalidate if needed
   */
  static checkCacheVersion() {
    const storedVersion = localStorage.getItem('niko-pim-cache-version');
    
    if (storedVersion !== this.CACHE_VERSION) {
      console.log(`🔄 Cache version changed: ${storedVersion} -> ${this.CACHE_VERSION}`);
      
      // Clear any cached resources
      if ('caches' in window) {
        caches.delete('niko-pim-cache').catch(console.warn);
      }
      
      // Update stored version
      localStorage.setItem('niko-pim-cache-version', this.CACHE_VERSION);
      
      return true; // Cache was invalidated
    }
    
    return false; // Cache is current
  }

  /**
   * Initialize CDN optimization
   */
  static init() {
    console.log('🚀 Initializing CDN optimization...');
    
    // Setup DNS prefetch
    this.setupDNSPrefetch();
    
    // Check cache version
    this.checkCacheVersion();
    
    // Preload critical resources
    this.preloadCriticalResources();
    
    console.log('✅ CDN optimization initialized');
  }

  /**
   * Get performance metrics
   */
  static getPerformanceMetrics() {
    return {
      version: this.VERSION,
      cacheVersion: this.CACHE_VERSION,
      optimalCDN: this.getOptimalCDN(),
      userRegion: this.detectUserRegion(),
      cacheInvalidated: this.checkCacheVersion()
    };
  }
}

// Auto-initialize when loaded
if (typeof window !== 'undefined') {
  CDNLoader.init();
}
