/**
 * API-related type definitions for Niko Bathrooms PIM
 */
export interface APIResponse<T = any> {
    data: T;
    success: boolean;
    message?: string;
    errors?: string[];
}
export interface APIError {
    code: string;
    message: string;
    details?: Record<string, any>;
}
export interface PaginatedResponse<T> {
    items: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}
export interface WebflowCollectionItem {
    id: string;
    cmsLocaleId?: string;
    createdOn: string;
    lastUpdated: string;
    lastPublished?: string;
    fieldData: Record<string, any>;
    isArchived: boolean;
    isDraft: boolean;
}
export interface WebflowCollection {
    id: string;
    displayName: string;
    singularName: string;
    slug: string;
    createdOn: string;
    lastUpdated: string;
}
export interface SupabaseUser {
    id: string;
    email: string;
    user_metadata: Record<string, any>;
    app_metadata: Record<string, any>;
    created_at: string;
    updated_at: string;
    email_confirmed_at?: string;
    last_sign_in_at?: string;
}
export type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
export interface RequestConfig {
    method?: HTTPMethod;
    headers?: Record<string, string>;
    body?: any;
    timeout?: number;
}
//# sourceMappingURL=api.types.d.ts.map