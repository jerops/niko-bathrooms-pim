export interface WebflowUser {
  id: string;
  email: string;
  name: string;
  role: 'customer' | 'retailer';
  firebaseUid: string;
  createdDate: string;
  emailConfirmed: boolean;
}

export interface EdgeFunctionResponse {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
}