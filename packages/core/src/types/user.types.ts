/**
 * User-related type definitions for Niko Bathrooms PIM
 */

export type UserRole = 'customer' | 'retailer';

export interface BaseUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  supabaseUID: string;
  webflowID: string;
  isActive: boolean;
  registrationDate: Date;
  lastLogin?: Date;
}

export interface Customer extends BaseUser {
  role: 'customer';
  company?: string;
  phone?: string;
  wishlistProducts: string[];
}

export interface Retailer extends BaseUser {
  role: 'retailer';
  companyName: string;
  businessPhone: string;
  businessAddress?: string;
  wishlistProducts: string[];
  territory?: string;
}

export type User = Customer | Retailer;

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  company?: string;
  phone?: string;
}