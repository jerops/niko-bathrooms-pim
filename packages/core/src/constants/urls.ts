/**
 * URL constants for Niko Bathrooms PIM system
 */

export const ROUTES = {
  HOME: '/',
  PRODUCTS: '/products',
  PRODUCT_DETAIL: '/products/:slug',
  
  
  // Customer routes
  CUSTOMER: {
    DASHBOARD: '/dev/app/customer/dashboard',
    WISHLIST: '/dev/app/customer/wishlist',
    PROFILE: '/dev/app/customer/profile',
    ORDERS: '/dev/app/customer/orders',
  },
  
  // Retailer routes
  RETAILER: {
    DASHBOARD: '/dev/app/retailer/dashboard',
    WISHLIST: '/dev/app/retailer/wishlist',
    PROFILE: '/dev/app/retailer/profile',
    ORDERS: '/dev/app/retailer/orders',
    TERRITORY: '/dev/app/retailer/territory',
  },
  
  // Admin routes
  ADMIN: {
    DASHBOARD: '/dev/app/admin/dashboard',
    USERS: '/dev/app/admin/users',
    PRODUCTS: '/dev/app/admin/products',
    ANALYTICS: '/dev/app/admin/analytics',
  },
} as const;

export const API_ENDPOINTS = {
  WEBFLOW: {
    COLLECTIONS: '/collections',
    ITEMS: '/collections/:collectionId/items',
    ITEM: '/collections/:collectionId/items/:itemId',
  },
  
  SUPABASE: {
  
    FUNCTIONS: {
      CREATE_WEBFLOW_USER: '/functions/v1/create-webflow-user',
      UPDATE_WISHLIST: '/functions/v1/update-wishlist',
      GET_USER_DATA: '/functions/v1/get-user-data',
    },
  },
} as const;

export const EXTERNAL_URLS = {
  NIKO_WEBSITE: 'https://nikobathrooms.ie',
  SUPPORT_EMAIL: 'support@nikobathrooms.ie',
  PRIVACY_POLICY: 'https://nikobathrooms.ie/privacy',
  TERMS_OF_SERVICE: 'https://nikobathrooms.ie/terms',
} as const;