/**
 * Advanced Authentication Types
 * Extended types for registration and advanced authentication features
 */

export interface AuthResult {
  success: boolean;
  user?: any;
  error?: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role: 'customer' | 'retailer';
}

export interface PasswordValidationResult {
  valid: boolean;
  message?: string;
}
