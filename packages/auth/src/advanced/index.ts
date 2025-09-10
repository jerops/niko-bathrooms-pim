/**
 * Advanced Authentication Module
 * Extended authentication functionality for registration, email confirmation, and advanced features
 */

export { AdvancedAuthManager } from './auth-manager-advanced.js';
export { EmailConfirmationHandler } from './email-confirmation-handler.js';
export type { RegisterData, PasswordValidationResult } from './types-advanced.js';
export { 
  getSignupEmailRedirectUrl, 
  getEmailConfirmationUrl, 
  getOnboardingUrlForRole,
  getPostConfirmationRedirectUrl,
  getEnvironmentAwareRedirectUrl,
  ADVANCED_REDIRECT_URLS 
} from './redirects-advanced.js';

// Package info
export const ADVANCED_VERSION = '1.0.0';
export const ADVANCED_MODULE_NAME = '@nikobathrooms/auth/advanced';
