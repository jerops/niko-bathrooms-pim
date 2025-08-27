/**
 * Validation utilities for Niko Bathrooms PIM
 */
export interface ValidationResult {
    isValid: boolean;
    errors: string[];
}
/**
 * Validate email address
 */
export declare function validateEmail(email: string): ValidationResult;
/**
 * Validate password
 */
export declare function validatePassword(password: string): ValidationResult;
/**
 * Validate phone number
 */
export declare function validatePhone(phone: string): ValidationResult;
/**
 * Validate required field
 */
export declare function validateRequired(value: string, fieldName: string): ValidationResult;
/**
 * Validate form data
 */
export declare function validateForm(data: Record<string, any>, rules: Record<string, string[]>): ValidationResult;
//# sourceMappingURL=validation.d.ts.map