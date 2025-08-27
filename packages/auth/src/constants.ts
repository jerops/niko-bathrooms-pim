export const AUTH_ROUTES = {
  LOGIN: '/dev/app/auth/log-in',
  SIGN_UP: '/dev/app/auth/sign-up', 
  FORGOT_PASSWORD: '/dev/app/auth/forgot-password',
  RESET_PASSWORD: '/dev/app/auth/reset-password',
  LOGOUT: '/dev/app/auth/log-in', // redirect after logout
};

export const SUPABASE_ROUTES = {
  SIGN_UP: '/auth/v1/signup',
  SIGN_IN: '/auth/v1/token?grant_type=password', 
  SIGN_OUT: '/auth/v1/logout',
  REFRESH: '/auth/v1/token?grant_type=refresh_token',
  USER: '/auth/v1/user',
};
