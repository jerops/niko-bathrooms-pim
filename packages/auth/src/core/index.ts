/**
 * Core Authentication Module
 * Essential authentication functionality for login, logout, and user management
 */

export { CoreAuthManager } from './auth-manager-core.js';
export type { AuthState, AuthResult, LoginData } from './types-core.js';
export { getDashboardUrl, getLoginUrl, CORE_REDIRECT_URLS } from './redirects-core.js';

// Package info
export const CORE_VERSION = '1.0.0';
export const CORE_MODULE_NAME = '@nikobathrooms/auth/core';
