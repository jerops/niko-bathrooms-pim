/**
 * Authentication Redirect URLs Configuration
 * Centralized configuration for all authentication redirects
 */

export const REDIRECT_URLS = {
  // Post-signup confirmation
  EMAIL_CONFIRMATION: '/email-confirmation',
  
  // Role-based dashboards  
  CUSTOMER_DASHBOARD: '/customer-dashboard',
  RETAILER_DASHBOARD: '/retailer-dashboard',
  
  // Authentication pages
  LOGIN: '/log-in',
  SIGNUP: '/sign-up',
  
  // Error/fallback
  DEFAULT: '/',
  
  // Development URLs (for testing)
  DEV_CUSTOMER_DASHBOARD: '/dev/app/customer/dashboard',
  DEV_RETAILER_DASHBOARD: '/dev/app/retailer/dashboard'
};

/**
 * Get the appropriate redirect URL based on user role
 */
export function getRedirectUrl(role: 'customer' | 'retailer', baseUrl?: string, isDev = false): string {
  const base = baseUrl || (typeof window !== 'undefined' ? window.location.origin : '');
  
  if (isDev) {
    return role === 'customer' 
      ? `${base}${REDIRECT_URLS.DEV_CUSTOMER_DASHBOARD}`
      : `${base}${REDIRECT_URLS.DEV_RETAILER_DASHBOARD}`;
  }
  
  return role === 'customer' 
    ? `${base}${REDIRECT_URLS.CUSTOMER_DASHBOARD}`
    : `${base}${REDIRECT_URLS.RETAILER_DASHBOARD}`;
}

/**
 * Get email confirmation redirect URL
 */
export function getEmailConfirmationUrl(baseUrl?: string): string {
  const base = baseUrl || (typeof window !== 'undefined' ? window.location.origin : '');
  return `${base}${REDIRECT_URLS.EMAIL_CONFIRMATION}`;
}

/**
 * Get login redirect URL
 */
export function getLoginUrl(baseUrl?: string): string {
  const base = baseUrl || (typeof window !== 'undefined' ? window.location.origin : '');
  return `${base}${REDIRECT_URLS.LOGIN}`;
}

/**
 * Detect if we're in development environment
 */
export function isDevelopmentEnvironment(): boolean {
  if (typeof window === 'undefined') return false;
  
  return window.location.hostname === 'localhost' || 
         window.location.hostname.includes('127.0.0.1') ||
         window.location.pathname.includes('/dev/');
}

/**
 * Get appropriate redirect URL with environment detection
 */
export function getEnvironmentAwareRedirectUrl(role: 'customer' | 'retailer', baseUrl?: string): string {
  const isDev = isDevelopmentEnvironment();
  return getRedirectUrl(role, baseUrl, isDev);
}
