/**
 * Validation utilities for Niko Bathrooms PIM
 */
/**
 * Email validation regex
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
/**
 * Password validation regex (at least 8 chars, 1 uppercase, 1 lowercase, 1 number)
 */
//const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
/**
 * Phone number validation regex (international format)
 */
const PHONE_REGEX = /^\+?[1-9]\d{1,14}$/;
/**
 * Validate email address
 */
export function validateEmail(email) {
    const errors = [];
    if (!email) {
        errors.push('Email is required');
    }
    else if (!EMAIL_REGEX.test(email)) {
        errors.push('Please enter a valid email address');
    }
    return {
        isValid: errors.length === 0,
        errors,
    };
}
/**
 * Validate password
 */
export function validatePassword(password) {
    const errors = [];
    if (!password) {
        errors.push('Password is required');
    }
    else {
        if (password.length < 8) {
            errors.push('Password must be at least 8 characters long');
        }
        if (!/[a-z]/.test(password)) {
            errors.push('Password must contain at least one lowercase letter');
        }
        if (!/[A-Z]/.test(password)) {
            errors.push('Password must contain at least one uppercase letter');
        }
        if (!/\d/.test(password)) {
            errors.push('Password must contain at least one number');
        }
    }
    return {
        isValid: errors.length === 0,
        errors,
    };
}
/**
 * Validate phone number
 */
export function validatePhone(phone) {
    const errors = [];
    if (phone && !PHONE_REGEX.test(phone.replace(/\s/g, ''))) {
        errors.push('Please enter a valid phone number');
    }
    return {
        isValid: errors.length === 0,
        errors,
    };
}
/**
 * Validate required field
 */
export function validateRequired(value, fieldName) {
    const errors = [];
    if (!value || value.trim() === '') {
        errors.push(`${fieldName} is required`);
    }
    return {
        isValid: errors.length === 0,
        errors,
    };
}
/**
 * Validate form data
 */
export function validateForm(data, rules) {
    const allErrors = [];
    Object.entries(rules).forEach(([field, validationRules]) => {
        const value = data[field];
        validationRules.forEach(rule => {
            let result;
            switch (rule) {
                case 'required':
                    result = validateRequired(value, field);
                    break;
                case 'email':
                    result = validateEmail(value);
                    break;
                case 'password':
                    result = validatePassword(value);
                    break;
                case 'phone':
                    result = validatePhone(value);
                    break;
                default:
                    result = { isValid: true, errors: [] };
            }
            allErrors.push(...result.errors);
        });
    });
    return {
        isValid: allErrors.length === 0,
        errors: allErrors,
    };
}
//# sourceMappingURL=validation.js.map