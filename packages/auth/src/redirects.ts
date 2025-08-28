/**
 * Authentication Redirect URLs Configuration
 * Updated for nikobathrooms.ie domain and actual site structure
 */

export const REDIRECT_URLS = {
  // After email confirmation - users go directly to onboarding
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
  
  // Email confirmation page (immediately after signup)  
  EMAIL_CONFIRMATION: '/app/auth/email-confirmation',
  
  // Error/fallback
  DEFAULT: '/'
};

/**
 * Get the appropriate redirect URL after email confirmation (directly to onboarding)
 * This is what users see after clicking the email confirmation link
 */
export function getPostConfirmationRedirectUrl(role: 'customer' | 'retailer', baseUrl?: string): string {
  const base = baseUrl || (typeof window !== 'undefined' ? window.location.origin : '');
  return role === 'customer' 
    ? `${base}${REDIRECT_URLS.CUSTOMER_ONBOARDING}`
    : `${base}${REDIRECT_URLS.RETAILER_ONBOARDING}`;
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
 * MAIN FUNCTION: Get redirect URL for email confirmation links
 * This should be used in the emailRedirectTo parameter during signup
 * Users go directly to onboarding after email confirmation
 */
export function getSignupEmailRedirectUrl(role: 'customer' | 'retailer', baseUrl?: string): string {
  return getPostConfirmationRedirectUrl(role, baseUrl);
}

/**
 * Get email confirmation page URL (where users go immediately after signup)
 */
export function getEmailConfirmationUrl(baseUrl?: string): string {
  const base = baseUrl || (typeof window !== 'undefined' ? window.location.origin : '');
  return `${base}${REDIRECT_URLS.EMAIL_CONFIRMATION}`;
}

// Legacy function for backward compatibility
export function getEnvironmentAwareRedirectUrl(role: 'customer' | 'retailer', baseUrl?: string): string {
  return getPostConfirmationRedirectUrl(role, baseUrl);
}
