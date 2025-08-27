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

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role: 'customer' | 'retailer';
}