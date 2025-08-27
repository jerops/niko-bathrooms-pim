/**
 * Webflow collection IDs and configuration constants
 */
export const WEBFLOW_CONFIG = {
    SITE_ID: '67378d122c9df01858dd36f6',
    BASE_URL: 'https://api.webflow.com/v2',
    COLLECTIONS: {
        PRODUCTS: '67378d122c9df01858dd3747',
        CUSTOMERS: '68a6dc21ddfb81569ba773a4',
        RETAILERS: '6738c46e5f48be10cf90c694',
    },
    FIELD_IDS: {
        CUSTOMERS: {
            NAME: 'name',
            EMAIL: '45f05f7b683bcbf2eb664e629bcba523',
            FIREBASE_UID: '90388f1ee37d47e1cfac72cb39d8068a',
            COMPANY: '86087c270b1ab0e9295285ead40008c8',
            PHONE: '8108caefe65ea645c82d809848bc8bab',
            USER_TYPE: '5512e8d73632a5f630d8d1113556528c',
            WISHLIST_PRODUCTS: '01c3a0f036b55a7772ae4218136bde38',
            IS_ACTIVE: 'ce8be99d17d2acd286840f6f8e7a76f7',
            REGISTRATION_DATE: 'e078a5a1dfea88833ec2d9097cd8960d',
            LAST_LOGIN: '6f0deb02fa8c13141be7b4bd98b56326',
        },
        RETAILERS: {
            NAME: 'name',
            EMAIL: 'email',
            FIREBASE_UID: '1fe3d15a806292d76c8277ea24f9e704',
            WISHLIST_PRODUCTS: '5a20bc1409d080285aa41dd2516b2d5c',
            USER_TYPE: 'd367ebf85ae0e7c7910e67c64783c335',
            IS_ACTIVE: 'c6144db9451186640a515a6b5c3df451',
            LAST_LOGIN: '974450ec837c0efb5abe65ad00c7b0ca',
        },
    },
};
export const SUPABASE_CONFIG = {
    URL: process.env.SUPABASE_URL || '',
    ANON_KEY: process.env.SUPABASE_ANON_KEY || '',
    SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY || '',
};
export const API_RATE_LIMITS = {
    WEBFLOW: {
        REQUESTS_PER_MINUTE: 60,
        BURST_LIMIT: 10,
    },
    SUPABASE: {
        REQUESTS_PER_SECOND: 100,
        CONCURRENT_CONNECTIONS: 60,
    },
};
//# sourceMappingURL=collections.js.map