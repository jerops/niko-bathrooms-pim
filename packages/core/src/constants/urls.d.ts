/**
 * URL constants for Niko Bathrooms PIM system
 */
export declare const ROUTES: {
    readonly HOME: "/";
    readonly PRODUCTS: "/products";
    readonly PRODUCT_DETAIL: "/products/:slug";
    readonly AUTH: {
        readonly LOGIN: "/dev/app/auth/login";
        readonly REGISTER: "/dev/app/auth/register";
        readonly LOGOUT: "/dev/app/auth/logout";
        readonly FORGOT_PASSWORD: "/dev/app/auth/forgot-password";
        readonly RESET_PASSWORD: "/dev/app/auth/reset-password";
    };
    readonly CUSTOMER: {
        readonly DASHBOARD: "/dev/app/customer/dashboard";
        readonly WISHLIST: "/dev/app/customer/wishlist";
        readonly PROFILE: "/dev/app/customer/profile";
        readonly ORDERS: "/dev/app/customer/orders";
    };
    readonly RETAILER: {
        readonly DASHBOARD: "/dev/app/retailer/dashboard";
        readonly WISHLIST: "/dev/app/retailer/wishlist";
        readonly PROFILE: "/dev/app/retailer/profile";
        readonly ORDERS: "/dev/app/retailer/orders";
        readonly TERRITORY: "/dev/app/retailer/territory";
    };
    readonly ADMIN: {
        readonly DASHBOARD: "/dev/app/admin/dashboard";
        readonly USERS: "/dev/app/admin/users";
        readonly PRODUCTS: "/dev/app/admin/products";
        readonly ANALYTICS: "/dev/app/admin/analytics";
    };
};
export declare const API_ENDPOINTS: {
    readonly WEBFLOW: {
        readonly COLLECTIONS: "/collections";
        readonly ITEMS: "/collections/:collectionId/items";
        readonly ITEM: "/collections/:collectionId/items/:itemId";
    };
    readonly SUPABASE: {
        readonly AUTH: {
            readonly SIGN_UP: "/auth/v1/signup";
            readonly SIGN_IN: "/auth/v1/token?grant_type=password";
            readonly SIGN_OUT: "/auth/v1/logout";
            readonly REFRESH: "/auth/v1/token?grant_type=refresh_token";
            readonly USER: "/auth/v1/user";
        };
        readonly FUNCTIONS: {
            readonly CREATE_WEBFLOW_USER: "/functions/v1/create-webflow-user";
            readonly UPDATE_WISHLIST: "/functions/v1/update-wishlist";
            readonly GET_USER_DATA: "/functions/v1/get-user-data";
        };
    };
};
export declare const EXTERNAL_URLS: {
    readonly NIKO_WEBSITE: "https://nikobathrooms.ie";
    readonly SUPPORT_EMAIL: "support@nikobathrooms.ie";
    readonly PRIVACY_POLICY: "https://nikobathrooms.ie/privacy";
    readonly TERMS_OF_SERVICE: "https://nikobathrooms.ie/terms";
};
//# sourceMappingURL=urls.d.ts.map