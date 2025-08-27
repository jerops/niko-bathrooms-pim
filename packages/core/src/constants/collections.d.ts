/**
 * Webflow collection IDs and configuration constants
 */
export declare const WEBFLOW_CONFIG: {
    readonly SITE_ID: "67378d122c9df01858dd36f6";
    readonly BASE_URL: "https://api.webflow.com/v2";
    readonly COLLECTIONS: {
        readonly PRODUCTS: "67378d122c9df01858dd3747";
        readonly CUSTOMERS: "68a6dc21ddfb81569ba773a4";
        readonly RETAILERS: "6738c46e5f48be10cf90c694";
    };
    readonly FIELD_IDS: {
        readonly CUSTOMERS: {
            readonly NAME: "name";
            readonly EMAIL: "45f05f7b683bcbf2eb664e629bcba523";
            readonly FIREBASE_UID: "90388f1ee37d47e1cfac72cb39d8068a";
            readonly COMPANY: "86087c270b1ab0e9295285ead40008c8";
            readonly PHONE: "8108caefe65ea645c82d809848bc8bab";
            readonly USER_TYPE: "5512e8d73632a5f630d8d1113556528c";
            readonly WISHLIST_PRODUCTS: "01c3a0f036b55a7772ae4218136bde38";
            readonly IS_ACTIVE: "ce8be99d17d2acd286840f6f8e7a76f7";
            readonly REGISTRATION_DATE: "e078a5a1dfea88833ec2d9097cd8960d";
            readonly LAST_LOGIN: "6f0deb02fa8c13141be7b4bd98b56326";
        };
        readonly RETAILERS: {
            readonly NAME: "name";
            readonly EMAIL: "email";
            readonly FIREBASE_UID: "1fe3d15a806292d76c8277ea24f9e704";
            readonly WISHLIST_PRODUCTS: "5a20bc1409d080285aa41dd2516b2d5c";
            readonly USER_TYPE: "d367ebf85ae0e7c7910e67c64783c335";
            readonly IS_ACTIVE: "c6144db9451186640a515a6b5c3df451";
            readonly LAST_LOGIN: "974450ec837c0efb5abe65ad00c7b0ca";
        };
    };
};
export declare const SUPABASE_CONFIG: {
    readonly URL: string;
    readonly ANON_KEY: string;
    readonly SERVICE_KEY: string;
};
export declare const API_RATE_LIMITS: {
    readonly WEBFLOW: {
        readonly REQUESTS_PER_MINUTE: 60;
        readonly BURST_LIMIT: 10;
    };
    readonly SUPABASE: {
        readonly REQUESTS_PER_SECOND: 100;
        readonly CONCURRENT_CONNECTIONS: 60;
    };
};
//# sourceMappingURL=collections.d.ts.map