# 🔧 Supabase Configuration Guide for Authentication Redirects

This guide provides step-by-step instructions to properly configure your Supabase project for the Niko Bathrooms PIM authentication system.

## 📋 Required Supabase Configuration

### 1. Redirect URLs Configuration

**Navigate to:** Supabase Dashboard → Authentication → URL Configuration

**Add these URLs to the "Redirect URLs" allowlist:**

#### Production URLs (Update with your actual domain)
```
https://your-domain.webflow.io/customer-dashboard
https://your-domain.webflow.io/retailer-dashboard
https://your-domain.webflow.io/email-confirmation
```

#### Custom Domain URLs (if using custom domain)
```
https://your-custom-domain.com/customer-dashboard
https://your-custom-domain.com/retailer-dashboard
https://your-custom-domain.com/email-confirmation
```

#### Development URLs (for testing)
```
http://localhost:3000/dev/app/customer/dashboard
http://localhost:3000/dev/app/retailer/dashboard
http://localhost:3000/email-confirmation
https://webflow.io/design/your-site/dev/app/customer/dashboard
https://webflow.io/design/your-site/dev/app/retailer/dashboard
```

### 2. Site URL Configuration

**Set your Site URL to:**
- **Production**: `https://your-domain.webflow.io` or `https://your-custom-domain.com`
- **Development**: `http://localhost:3000` or your development URL

### 3. Email Templates Configuration

**Navigate to:** Supabase Dashboard → Authentication → Email Templates

#### Update "Confirm signup" template:

**Replace the confirmation link:**
```html
<!-- OLD (default) -->
<a href="{{ .ConfirmationURL }}">Confirm your email</a>

<!-- NEW (recommended) -->
<a href="{{ .RedirectTo }}/auth/confirm?token_hash={{ .TokenHash }}&type=email">Confirm your email</a>
```

**Complete email template example:**
```html
<h2>Welcome to Niko Bathrooms!</h2>
<p>Thank you for signing up. Please click the button below to confirm your email address:</p>

<a href="{{ .RedirectTo }}/auth/confirm?token_hash={{ .TokenHash }}&type=email" 
   style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
  Confirm Email Address
</a>

<p>If the button doesn't work, copy and paste this link into your browser:</p>
<p>{{ .RedirectTo }}/auth/confirm?token_hash={{ .TokenHash }}&type=email</p>

<p>This link will expire in 1 hour.</p>

<p>Best regards,<br>The Niko Bathrooms Team</p>
```

#### Optional: Update "Magic Link" template (if using passwordless login):
```html
<h2>Sign in to Niko Bathrooms</h2>
<p>Click the link below to sign in:</p>

<a href="{{ .RedirectTo }}/auth/confirm?token_hash={{ .TokenHash }}&type=magiclink"
   style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
  Sign In
</a>

<p>This link will expire in 1 hour.</p>
```

### 4. General Settings

**Navigate to:** Supabase Dashboard → Authentication → Settings

Ensure these settings are configured:

- ✅ **Enable email confirmations**: ON
- ✅ **Enable email change confirmations**: ON  
- ✅ **Enable phone confirmations**: OFF (unless using phone auth)
- ✅ **Double confirm email changes**: ON (recommended for security)

### 5. Security Settings

**Navigate to:** Supabase Dashboard → Authentication → Settings

**Rate Limiting:** (adjust based on your needs)
- Email signup: `30 emails per hour per IP`
- Password reset: `30 emails per hour per IP`
- Email OTP: `30 emails per hour per IP`

## 🧪 Testing Your Configuration

### 1. Test Customer Signup Flow

1. Go to your signup page
2. Select "Customer" tab
3. Fill out the form and submit
4. Check email for confirmation link
5. Click confirmation link
6. Verify redirect to `/customer-dashboard`

### 2. Test Retailer Signup Flow

1. Go to your signup page
2. Select "Retailer" tab  
3. Fill out the form and submit
4. Check email for confirmation link
5. Click confirmation link
6. Verify redirect to `/retailer-dashboard`

### 3. Test Login Flow

1. Go to your login page
2. Enter confirmed user credentials
3. Submit form
4. Verify redirect to appropriate dashboard based on role

## 🔍 Debugging Common Issues

### Issue: "Invalid redirect URL" error

**Cause:** The redirect URL is not in the allowlist

**Solution:**
1. Check the exact URL being used in browser dev tools
2. Add the exact URL to Supabase → Authentication → URL Configuration
3. Include trailing slashes if they appear in the actual URL

### Issue: Email confirmation link doesn't work

**Cause:** Email template using wrong URL format

**Solution:**
1. Update email template to use `{{ .RedirectTo }}` instead of `{{ .ConfirmationURL }}`
2. Ensure the link format matches: `/auth/confirm?token_hash={{ .TokenHash }}&type=email`

### Issue: User redirected to wrong dashboard after confirmation

**Cause:** Role metadata not properly set during registration

**Solution:**
1. Check user metadata in Supabase → Authentication → Users
2. Verify `user_type` and `role` fields are correctly set
3. Ensure AuthManager is setting metadata properly during registration

### Issue: Development URLs not working

**Cause:** Development URLs not in allowlist or incorrect localhost URL

**Solution:**
1. Add all development URLs to redirect allowlist
2. Use exact localhost port (e.g., `http://localhost:3000`)
3. Check if Webflow Designer URLs need to be added

## 📚 Environment Variables

Make sure your application has these environment variables configured:

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Site Configuration
SITE_URL=https://your-domain.webflow.io
```

## 🚀 Webflow Integration

Add this to your Webflow site's custom code (in Site Settings → Custom Code → Head):

```html
<!-- Niko PIM Authentication System -->
<script src="https://cdn.jsdelivr.net/gh/jerops/niko-bathrooms-pim@main/packages/pim-bundle/dist/niko-pim-full.min.js"></script>
<link href="https://cdn.jsdelivr.net/gh/jerops/niko-bathrooms-pim@main/packages/custom-css/dist/niko-pim.min.css" rel="stylesheet">

<script>
document.addEventListener('DOMContentLoaded', function() {
  // Initialize the PIM system with your Supabase credentials
  window.NikoPIM.init({
    supabaseUrl: 'your_supabase_project_url',
    supabaseKey: 'your_supabase_anon_key',
    webflowSiteId: 'your_webflow_site_id'
  });
  
  // Initialize form handlers
  window.initWebflowForms('your_supabase_project_url', 'your_supabase_anon_key');
});
</script>
```

## ✅ Configuration Checklist

- [ ] Redirect URLs added to Supabase allowlist
- [ ] Site URL configured in Supabase
- [ ] Email templates updated to use `{{ .RedirectTo }}`
- [ ] General authentication settings configured
- [ ] Security settings reviewed
- [ ] Environment variables set
- [ ] Webflow integration code added
- [ ] Customer signup flow tested
- [ ] Retailer signup flow tested
- [ ] Login flow tested
- [ ] Email confirmation tested

## 🆘 Support

If you encounter issues:

1. Check browser dev tools console for errors
2. Review Supabase authentication logs
3. Verify all URLs match exactly (including trailing slashes)
4. Test in incognito mode to avoid cache issues
5. Create an issue in the GitHub repository with detailed error messages

---

**📝 Note:** Remember to update all placeholder URLs (`your-domain.webflow.io`, `your_supabase_project_url`, etc.) with your actual project values.
