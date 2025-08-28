export interface ContentGatingConfig {
  userRole: 'customer' | 'retailer' | 'guest';
  isAuthenticated: boolean;
}

export interface GatingRule {
  selector: string;
  allowedRoles: ('customer' | 'retailer' | 'guest')[];
  requiresAuth: boolean;
  hideMethod: 'display-none' | 'remove' | 'redirect';
}

export interface SecureContentConfig {
  redirectUrl: string;
  unauthorizedMessage: string;
  loginUrl: string;
}