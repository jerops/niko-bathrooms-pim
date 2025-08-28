# 🔧 Supabase Configuration Guide for Authentication Redirects

This guide provides step-by-step instructions to properly configure your Supabase project for the Niko Bathrooms PIM authentication system with the correct onboarding flow.

## 📋 Required Supabase Configuration

### 1. Redirect URLs Configuration

**Navigate to:** Supabase Dashboard → Authentication → URL Configuration

**Add these URLs to the "Redirect URLs" allowlist:**

#### Production URLs (Update with your actual domain)
```
https://your-domain.webflow.io/app/customer/onboarding
https://your-domain.webflow.io/app/retailer/onboarding
https://your-domain.webflow.io/confirm-email
```

#### Custom Domain URLs (if using custom domain)
```
https://your-custom-domain.com/app/customer/onboarding
https://your-custom-domain.com/app/retailer/onboarding
https://your-custom-domain.com/confirm-email
```

#### Development/Testing URLs (if needed)
```
http://localhost:3000/app/customer/onboarding
http://localhost:3000/app/retailer/onboarding
http://localhost:3000/confirm-email
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

<!-- NEW (recommended for onboarding flow) -->
<a href="{{ .RedirectTo }}/auth/confirm?token_hash={{ .TokenHash }}&type=email">Complete Registration</a>
```

**Complete email template example:**
```html
<h2>Welcome to Niko Bathrooms!</h2>
<p>Thank you for signing up. Please click the button below to confirm your email and complete your registration:</p>

<a href="{{ .RedirectTo }}/auth/confirm?token_hash={{ .TokenHash }}&type=email" 
   style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
  Complete Registration
</a>

<p>After confirming your email, you'll be taken through a quick onboarding process to set up your account.</p>

<p>If the button doesn't work, copy and paste this link into your browser:</p>
<p>{{ .RedirectTo }}/auth/confirm?token_hash={{ .TokenHash }}&type=email</p>

<p>This link will expire in 1 hour.</p>

<p>Best regards,<br>The Niko Bathrooms Team</p>
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

## 🔄 Authentication Flow Overview

The corrected flow is now:

### **Signup Flow:**
1. User fills signup form → Role detected (Customer/Retailer)
2. Account created in Supabase with role metadata
3. User redirected to `/confirm-email` page immediately 
4. Email sent with confirmation link pointing to `/app/customer/onboarding` or `/app/retailer/onboarding`
5. User clicks email link → Goes to onboarding based on role
6. After onboarding completion → User goes to appropriate dashboard

### **Login Flow:**
1. User enters credentials on login form
2. Authentication successful
3. User redirected directly to `/app/customer/dashboard` or `/app/retailer/dashboard` (skipping onboarding)

## 🧪 Testing Your Configuration

### 1. Test Customer Signup Flow

1. Go to your signup page (`/app/auth/sign-up`)
2. Select "Customer" tab
3. Fill out the form and submit
4. Verify redirect to `/confirm-email`
5. Check email for confirmation link
6. Click confirmation link
7. **Verify redirect to `/app/customer/onboarding`**

### 2. Test Retailer Signup Flow

1. Go to your signup page (`/app/auth/sign-up`)
2. Select "Retailer" tab  
3. Fill out the form and submit
4. Verify redirect to `/confirm-email`
5. Check email for confirmation link
6. Click confirmation link
7. **Verify redirect to `/app/retailer/onboarding`**

### 3. Test Login Flow (Existing Users)

1. Go to your login page (`/app/auth/log-in`)
2. Enter confirmed user credentials
3. Submit form
4. **Verify redirect to `/app/customer/dashboard` or `/app/retailer/dashboard`**

## 🔍 Debugging Common Issues

### Issue: "Invalid redirect URL" error

**Cause:** The redirect URL is not in the allowlist

**Solution:**
1. Check the exact URL being used in browser dev tools console
2. Add the exact URL to Supabase → Authentication → URL Configuration
3. Ensure URLs match: `/app/customer/onboarding` and `/app/retailer/onboarding`

### Issue: Email confirmation redirects to wrong page

**Cause:** Email template using wrong redirect URL format or old URLs

**Solution:**
1. Update email template to use `{{ .RedirectTo }}` instead of `{{ .ConfirmationURL }}`
2. Verify the redirect URLs in Supabase point to onboarding pages
3. Clear browser cache and test in incognito mode

### Issue: Users skip onboarding

**Cause:** Login redirects going to onboarding instead of dashboard

**Solution:**
1. Verify login flow redirects to dashboard URLs (`/app/customer/dashboard`)
2. Verify signup flow redirects to onboarding URLs (`/app/customer/onboarding`)
3. Check that WebflowFormHandler is using correct redirect functions

### Issue: Role detection not working

**Cause:** User metadata not properly set during registration

**Solution:**
1. Check user metadata in Supabase → Authentication → Users
2. Verify `user_type` and `role` fields are correctly set
3. Ensure tab selection is working on signup form

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
  // Initialize form handlers with correct onboarding flow
  window.initWebflowForms('your_supabase_project_url', 'your_supabase_anon_key');
});
</script>
```

## ✅ Configuration Checklist

- [ ] Redirect URLs added to Supabase allowlist (pointing to `/app/customer/onboarding` and `/app/retailer/onboarding`)
- [ ] Site URL configured in Supabase
- [ ] Email templates updated to use `{{ .RedirectTo }}` with onboarding focus
- [ ] General authentication settings configured
- [ ] Security settings reviewed
- [ ] Environment variables set
- [ ] Webflow integration code added
- [ ] Customer signup → onboarding flow tested
- [ ] Retailer signup → onboarding flow tested  
- [ ] Login → dashboard flow tested
- [ ] Email confirmation → onboarding flow tested

## 🎯 Expected Results

After following this configuration guide:

- ✅ **Signup**: User → Email confirmation page → Email link → Onboarding → Dashboard
- ✅ **Login**: User → Dashboard (skips onboarding for existing users)
- ✅ No more "Invalid redirect URL" errors
- ✅ Proper role-based routing to customer vs retailer onboarding
- ✅ Clean separation between new user onboarding and existing user login

## 🆘 Support

If you encounter issues:

1. Check browser dev tools console for redirect URL logs
2. Review Supabase authentication logs
3. Verify all URLs match exactly (case-sensitive)
4. Test in incognito mode to avoid cache issues
5. Use debugging methods available on `window.NikoFormHandler`
6. Create an issue in the GitHub repository with detailed error messages

---

**📝 Note:** Remember to update all placeholder URLs (`your-domain.webflow.io`, `your_supabase_project_url`, etc.) with your actual project values.
