/**
 * Niko Content Gating - Main exports
 * Enhanced with secure page-load authentication system
 */

// Core content gating
export * from './types';
export * from './content-gating-manager';

// New secure page authentication
export { PageGuard, type PageGuardConfig, type AuthenticationState, type UserAccount } from './page-guard.js';
export { WebflowPageLoader, type LoaderConfig } from './webflow-page-loader.js';
export { AuthStateManager, type AuthStateConfig, type AuthState, type AuthCookies } from './auth-state-manager.js';

// Re-export for convenience
export type { UserAccountData, UserFetchOptions } from '../../supabase-integration/src/user-account-service.js';