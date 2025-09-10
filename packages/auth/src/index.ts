/**
 * @nikobathrooms/auth - Authentication system
 * Optimized for bundle size with core/advanced module splitting
 */

// Core exports (always available)
export * from './core/index.js';

// Advanced exports (loaded on demand)
export * from './advanced/index.js';

// Unified manager (combines core + advanced with dynamic loading)
export { AuthManager } from './auth-manager-unified.js';
export { AuthDynamicLoader } from './dynamic-loader.js';

// Legacy exports for backward compatibility
export type { AuthState, AuthResult, LoginData } from './core/types-core.js';
export type { RegisterData } from './advanced/types-advanced.js';

// Package info
export const PACKAGE_VERSION = '1.0.0';
export const PACKAGE_NAME = '@nikobathrooms/auth';
