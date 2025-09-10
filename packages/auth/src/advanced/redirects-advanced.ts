/**
 * Advanced Authentication Redirect URLs
 * Extended redirects for registration and email confirmation flows
 */

export const ADVANCED_REDIRECT_URLS = {
  // After email confirmation - users go directly to onboarding
  CUSTOMER_ONBOARDING: '/app/customer/onboarding',
  RETAILER_ONBOARDING: '/app/retailer/onboarding',
  
  // Authentication pages
  SIGNUP: '/app/auth/sign-up',
  FORGOT_PASSWORD: '/app/auth/forgot-password',
  RESET_PASSWORD: '/app/auth/reset-password',
  
  // Email confirmation page (immediately after signup)  
  EMAIL_CONFIRMATION: '/app/auth/email-confirmation',
};

/**
 * Get the appropriate redirect URL after email confirmation (directly to onboarding)
 * This is what users see after clicking the email confirmation link
 */
export function getPostConfirmationRedirectUrl(role: 'customer' | 'retailer', baseUrl?: string): string {
  const base = baseUrl || (typeof window !== 'undefined' ? window.location.origin : '');
  return role === 'customer' 
    ? `${base}${ADVANCED_REDIRECT_URLS.CUSTOMER_ONBOARDING}`
    : `${base}${ADVANCED_REDIRECT_URLS.RETAILER_ONBOARDING}`;
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
  return `${base}${ADVANCED_REDIRECT_URLS.EMAIL_CONFIRMATION}`;
}

/**
 * Get appropriate onboarding URL for user role (after email confirmation)
 */
export function getOnboardingUrlForRole(role: 'customer' | 'retailer', baseUrl?: string): string {
  return getPostConfirmationRedirectUrl(role, baseUrl);
}

// Legacy function for backward compatibility
export function getEnvironmentAwareRedirectUrl(role: 'customer' | 'retailer', baseUrl?: string): string {
  return getPostConfirmationRedirectUrl(role, baseUrl);
}
