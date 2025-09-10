# Login Handler CDN Integration Guide

## Overview

The Login Handler provides a clean, CDN-based solution for handling login forms in Webflow, with proper error handling and no `user_metadata` null reference errors.

## Quick Start

Replace your current login script in Webflow with this simple CDN include:

```html
<!-- Add this AFTER the NikoAuthCore script -->
<script src="https://cdn.jsdelivr.net/gh/jerops/niko-bathrooms-pim@main/packages/pim-bundle/dist/niko-login-handler.min.js"></script>
```

That's it! The script will automatically:
- ✅ Handle password visibility toggles
- ✅ Wait for NikoAuthCore to initialize
- ✅ Setup customer and retailer login forms
- ✅ Provide proper error messages
- ✅ Handle null user metadata safely
- ✅ Redirect to appropriate dashboards

## Full Webflow Setup

### 1. Remove Old Login Script

Remove the entire `<script>` block that starts with:
```html
<!-- Updated Login Script with Specific Error Messages -->
<script>
document.addEventListener('DOMContentLoaded', function() {
    console.log('Login script loaded');
    ...
</script>
```

### 2. Add CDN Scripts

In your login page, add these scripts before `</body>`:

```html
<!-- Supabase (if not already included) -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

<!-- Niko Auth Core -->
<script src="https://cdn.jsdelivr.net/gh/jerops/niko-bathrooms-pim@main/packages/auth/src/niko-auth-core.js"></script>

<!-- Niko Login Handler (NEW) -->
<script src="https://cdn.jsdelivr.net/gh/jerops/niko-bathrooms-pim@main/packages/pim-bundle/dist/niko-login-handler.min.js"></script>
```

### 3. Required HTML Structure

The login handler expects these form IDs and field names:

#### Customer Login Form
```html
<form id="wf-form-Log-In-Customer">
  <input name="customer-email-input" type="email" required>
  <input name="customer-password-input" type="password" required>
  <input id="customer-login-btn" type="submit" value="Log In">
  
  <!-- Optional: Password visibility toggle -->
  <div class="input-visibility-toggle">
    <div wized="icon_show_password">👁️</div>
    <div wized="icon_hide_password">👁️‍🗨️</div>
  </div>
</form>
```

#### Retailer Login Form
```html
<form id="wf-form-Log-In-Retailer">
  <input name="retailer-email-input" type="email" required>
  <input name="retailer-password-input" type="password" required>
  <input id="retailer-login-btn" type="submit" value="Log In">
  
  <!-- Optional: Password visibility toggle -->
  <div class="input-visibility-toggle">
    <div wized="icon_show_password">👁️</div>
    <div wized="icon_hide_password">👁️‍🗨️</div>
  </div>
</form>
```

## Features

### Automatic Password Toggle
The handler automatically sets up password visibility toggles for any element with class `input-visibility-toggle`.

### Smart Error Messages
Instead of generic errors, users see helpful messages:
- "Please confirm your email address before logging in."
- "Invalid email or password."
- "Too many login attempts. Please try again later."
- "Network error. Please check your connection."

### Safe User Metadata Access
The handler safely checks for null values before accessing `user_metadata`, preventing the error you experienced.

### Debug Console Logs
The handler provides helpful console logs:
```
🔐 Niko Login Handler v1.0.0 initializing
✅ NikoAuthCore is ready
📝 Customer login form found
📝 Retailer login form found
🔑 Attempting Customer login for: user@example.com
✅ Login successful, redirecting to: /dev/app/customer/dashboard
```

## Customization

If you need different form IDs or field names, you can configure them:

```html
<script>
// Wait for the handler to load
window.addEventListener('load', function() {
  if (window.NikoLoginHandler) {
    // The handler is already initialized with default config
    // To use custom config, you'd need to modify the source
    console.log('Login handler loaded with default configuration');
  }
});
</script>
```

## Testing

1. **Test successful login**: Use valid credentials
2. **Test wrong password**: Should show "Invalid email or password"
3. **Test unconfirmed email**: Should show "Please confirm your email"
4. **Test network offline**: Should show "Network error"

## Troubleshooting

### Forms not being detected
Check console for:
- "📝 Customer login form found" 
- "📝 Retailer login form found"

If not found, verify your form IDs match exactly.

### NikoAuthCore not ready
The handler waits up to 10 seconds for NikoAuthCore. Check that:
1. NikoAuthCore script is loaded before the login handler
2. Supabase credentials are correct

### Still getting null reference errors
The login handler includes multiple safety checks. If errors persist:
1. Check browser console for specific error location
2. Verify NikoAuthCore version compatibility

## Benefits Over Inline Script

1. **Cleaner Webflow project** - No large script blocks in page settings
2. **Easier updates** - Update the CDN version without touching Webflow
3. **Better error handling** - Comprehensive null checks and fallbacks
4. **Consistent behavior** - Same login logic across all pages
5. **Reduced maintenance** - One source of truth for login logic

## Version History

- **v1.0.0** - Initial release with null safety and error handling
  - Fixed `Cannot read properties of null (reading 'user_metadata')` error
  - Added comprehensive error messages
  - Password visibility toggle support
  - Auto-initialization on DOM ready

## Support

For issues or customization needs:
1. Check browser console for error messages
2. Verify form structure matches requirements
3. Ensure scripts load in correct order