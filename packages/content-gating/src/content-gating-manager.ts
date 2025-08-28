import { ContentGatingConfig, GatingRule, SecureContentConfig } from '../types';

export class ContentGatingManager {
  private config: ContentGatingConfig;
  private rules: GatingRule[] = [];
  private secureConfig: SecureContentConfig;

  constructor(config: ContentGatingConfig, secureConfig: SecureContentConfig) {
    this.config = config;
    this.secureConfig = secureConfig;
  }

  /**
   * Add gating rule for specific content
   * IMPORTANT: This addresses your security concern from our previous chat.
   * Instead of just hiding with CSS, we REMOVE elements from DOM completely
   * and redirect unauthorized users to login page for sensitive content.
   */
  addRule(rule: GatingRule): void {
    this.rules.push(rule);
  }

  /**
   * Apply all content gating rules
   * Runs on page load and auth state changes
   */
  applyGating(): void {
    this.rules.forEach(rule => {
      const elements = document.querySelectorAll(rule.selector);
      
      elements.forEach(element => {
        const hasAccess = this.checkAccess(rule);
        
        if (!hasAccess) {
          switch (rule.hideMethod) {
            case 'remove':
              // SECURE: Completely remove from DOM (can't inspect to see)
              element.remove();
              break;
              
            case 'redirect':
              // MOST SECURE: Redirect to login for sensitive content
              if (rule.requiresAuth && !this.config.isAuthenticated) {
                window.location.href = this.secureConfig.loginUrl;
                return;
              }
              break;
              
            case 'display-none':
            default:
              // BASIC: Hide with CSS (user mentioned this is insecure)
              (element as HTMLElement).style.display = 'none';
              break;
          }
        }
      });
    });
  }

  /**
   * Check if user has access to content based on rule
   */
  private checkAccess(rule: GatingRule): boolean {
    // Check authentication requirement
    if (rule.requiresAuth && !this.config.isAuthenticated) {
      return false;
    }

    // Check role requirement
    if (!rule.allowedRoles.includes(this.config.userRole)) {
      return false;
    }

    return true;
  }

  /**
   * Initialize common gating rules based on our previous discussions
   */
  initializeStandardRules(): void {
    // Retailer-only content (from our previous chat about roles)
    this.addRule({
      selector: '[data-role="retailer-only"]',
      allowedRoles: ['retailer'],
      requiresAuth: true,
      hideMethod: 'remove' // SECURE: Remove from DOM
    });

    // Customer wishlist buttons (from our previous discussions)
    this.addRule({
      selector: '[data-auth="wishlist-button"]',
      allowedRoles: ['customer', 'retailer'],
      requiresAuth: true,
      hideMethod: 'display-none' // Show login prompt instead
    });

    // Sensitive pricing (trade prices for retailers)
    this.addRule({
      selector: '[data-sensitive="trade-pricing"]',
      allowedRoles: ['retailer'],
      requiresAuth: true,
      hideMethod: 'redirect' // MOST SECURE: Redirect unauthorized access
    });

    // Guest content (everyone can see)
    this.addRule({
      selector: '[data-role="public"]',
      allowedRoles: ['guest', 'customer', 'retailer'],
      requiresAuth: false,
      hideMethod: 'display-none'
    });
  }

  /**
   * Update user context (call when auth state changes)
   */
  updateUserContext(config: ContentGatingConfig): void {
    this.config = config;
    this.applyGating(); // Re-apply rules with new context
  }
}