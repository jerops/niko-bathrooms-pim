/**
 * Core Authentication Types
 * Essential types for basic authentication functionality
 */

export interface AuthState {
  user: any;
  isAuthenticated: boolean;
}

export interface AuthResult {
  success: boolean;
  user?: any;
  error?: string;
}

export interface LoginData {
  email: string;
  password: string;
}
