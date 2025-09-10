/**
 * Core Authentication Redirect URLs
 * Essential redirects for basic authentication flow
 */

export const CORE_REDIRECT_URLS = {
  // Final dashboards (after onboarding is complete)
  CUSTOMER_DASHBOARD: '/app/customer/dashboard',
  RETAILER_DASHBOARD: '/app/retailer/dashboard',
  
  // Authentication pages
  LOGIN: '/app/auth/log-in',
  
  // Error/fallback
  DEFAULT: '/'
};

/**
 * Get final dashboard URL (after onboarding is complete)
 */
export function getDashboardUrl(role: 'customer' | 'retailer', baseUrl?: string): string {
  const base = baseUrl || (typeof window !== 'undefined' ? window.location.origin : '');
  return role === 'customer' 
    ? `${base}${CORE_REDIRECT_URLS.CUSTOMER_DASHBOARD}`
    : `${base}${CORE_REDIRECT_URLS.RETAILER_DASHBOARD}`;
}

/**
 * Get login redirect URL
 */
export function getLoginUrl(baseUrl?: string): string {
  const base = baseUrl || (typeof window !== 'undefined' ? window.location.origin : '');
  return `${base}${CORE_REDIRECT_URLS.LOGIN}`;
}
