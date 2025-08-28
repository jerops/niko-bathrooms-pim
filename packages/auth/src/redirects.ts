/**
 * Authentication Redirect URLs Configuration
 * Updated to match actual Niko Bathrooms site structure
 */

export const REDIRECT_URLS = {
  // Post-signup confirmation - users go to onboarding first
  EMAIL_CONFIRMATION: '/confirm-email',
  
  // After email confirmation - redirect to onboarding based on role
  CUSTOMER_ONBOARDING: '/app/customer/onboarding',
  RETAILER_ONBOARDING: '/app/retailer/onboarding',
  
  // Final dashboards (after onboarding is complete)
  CUSTOMER_DASHBOARD: '/app/customer/dashboard',
  RETAILER_DASHBOARD: '/app/retailer/dashboard',
  
  // Authentication pages
  LOGIN: '/app/auth/log-in',
  SIGNUP: '/app/auth/sign-up',
  FORGOT_PASSWORD: '/app/auth/forgot-password',
  RESET_PASSWORD: '/app/auth/reset-password',
  
  // Error/fallback
  DEFAULT: '/'
};

/**
 * Get the appropriate redirect URL after email confirmation (to onboarding)
 * This is what users see after clicking the email confirmation link
 */
export function getPostConfirmationRedirectUrl(role: 'customer' | 'retailer', baseUrl?: string): string {
  const base = baseUrl || (typeof window !== 'undefined' ? window.location.origin : '');
  return role === 'customer' 
    ? `${base}${REDIRECT_URLS.CUSTOMER_ONBOARDING}`
    : `${base}${REDIRECT_URLS.RETAILER_ONBOARDING}`;
}

/**
 * Get email confirmation page URL (where users go immediately after signup)
 */
export function getEmailConfirmationUrl(baseUrl?: string): string {
  const base = baseUrl || (typeof window !== 'undefined' ? window.location.origin : '');
  return `${base}${REDIRECT_URLS.EMAIL_CONFIRMATION}`;
}

/**
 * Get final dashboard URL (after onboarding is complete)
 */
export function getDashboardUrl(role: 'customer' | 'retailer', baseUrl?: string): string {
  const base = baseUrl || (typeof window !== 'undefined' ? window.location.origin : '');
  return role === 'customer' 
    ? `${base}${REDIRECT_URLS.CUSTOMER_DASHBOARD}`
    : `${base}${REDIRECT_URLS.RETAILER_DASHBOARD}`;
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
 * MAIN FUNCTION: Get redirect URL for email confirmation links
 * This should be used in the emailRedirectTo parameter during signup
 */
export function getSignupEmailRedirectUrl(role: 'customer' | 'retailer', baseUrl?: string): string {
  return getPostConfirmationRedirectUrl(role, baseUrl);
}

// Legacy function for backward compatibility - now redirects to onboarding
export function getEnvironmentAwareRedirectUrl(role: 'customer' | 'retailer', baseUrl?: string): string {
  return getPostConfirmationRedirectUrl(role, baseUrl);
}
