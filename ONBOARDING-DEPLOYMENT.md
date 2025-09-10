# Onboarding Feature Deployment Guide

## Overview

This guide covers the deployment of the onboarding feature that integrates Formly multi-step forms in Webflow with Supabase and Webflow CMS synchronization.

## Architecture

```
User Journey:
1. Signup → 2. Email Confirmation → 3. Onboarding (Formly) → 4. Dashboard

Components:
- Webflow: Formly multi-step forms (UI)
- JavaScript: Form submission handler
- Supabase: Edge Function for CMS sync
- Webflow CMS: User data storage
```

## Files Created/Modified

### New Files
1. `/packages/webflow-forms/src/onboarding-handler.ts` - Formly form handler
2. `/packages/supabase-integration/supabase/functions/update-webflow-user-onboarding/` - Edge Function

### Modified Files
1. `/packages/webflow-forms/src/index.ts` - Export onboarding handler
2. `/packages/pim-bundle/src/full-bundle.js` - Auto-initialize onboarding
3. `/packages/auth/src/auth-manager.ts` - Added helper methods

## Deployment Steps

### 1. Deploy Supabase Edge Function

```bash
# Navigate to supabase integration package
cd packages/supabase-integration

# Deploy the new edge function
supabase functions deploy update-webflow-user-onboarding

# Set environment variables for the function
supabase secrets set WEBFLOW_API_TOKEN=your_webflow_api_token
supabase secrets set WEBFLOW_USERS_COLLECTION_ID=your_collection_id
```

### 2. Build and Deploy JavaScript Bundle

```bash
# Build the bundle with onboarding support
pnpm build

# The bundle will be at:
# packages/pim-bundle/dist/niko-pim-full.min.js

# Deploy to CDN (GitHub)
git add .
git commit -m "Add onboarding form handler for Formly integration"
git push origin bmad-method-integration
```

### 3. Webflow Setup

#### A. Create Onboarding Pages

Create two pages in Webflow:
- `/app/customer/onboarding` - Customer onboarding form
- `/app/retailer/onboarding` - Retailer onboarding form

#### B. Add Formly Attributes

```html
<!-- Multi-step form container -->
<form data-form="multistep">
  
  <!-- Step 1: Basic Info -->
  <div data-form="step">
    <input type="text" name="companyName" placeholder="Company Name">
    <input type="text" name="vatNumber" placeholder="VAT Number">
    <button data-form="next-btn">Next</button>
  </div>
  
  <!-- Step 2: Address -->
  <div data-form="step">
    <input type="text" name="addressLine1" placeholder="Address Line 1">
    <input type="text" name="city" placeholder="City">
    <input type="text" name="postalCode" placeholder="Postal Code">
    <button data-form="back-btn">Back</button>
    <button data-form="next-btn">Next</button>
  </div>
  
  <!-- Step 3: Preferences -->
  <div data-form="step">
    <label>
      <input type="checkbox" name="newsletter"> Subscribe to newsletter
    </label>
    <label>
      <input type="checkbox" name="marketingConsent"> Marketing communications
    </label>
    <button data-form="back-btn">Back</button>
    <button data-form="submit-btn">Complete Setup</button>
  </div>
  
</form>
```

#### C. Add Scripts to Onboarding Pages

In the page settings, add before `</body>`:

```html
<!-- Formly Script -->
<script src="https://cdn.jsdelivr.net/npm/@formlyjs/core@latest/dist/formly.min.js"></script>

<!-- Niko PIM Bundle with Onboarding Support -->
<script src="https://cdn.jsdelivr.net/gh/jerops/niko-bathrooms-pim@main/packages/pim-bundle/dist/niko-pim-full.min.js"></script>

<!-- Initialize with your Supabase credentials -->
<script>
  // The bundle auto-initializes onboarding on /onboarding pages
  // No additional configuration needed
</script>
```

### 4. Webflow CMS Fields Setup

Ensure your Users collection has these fields:

#### Common Fields
- `name` (Text)
- `email` (Email)
- `firebase-uid` (Text)
- `role` (Option: customer/retailer)
- `onboarding-completed` (Switch)
- `onboarding-date` (Date)
- `newsletter-subscribed` (Switch)
- `marketing-consent` (Switch)

#### Customer Fields
- `company-name` (Text)
- `vat-number` (Text)
- `phone-number` (Phone)
- `address-line-1` (Text)
- `address-line-2` (Text)
- `address-city` (Text)
- `address-postal-code` (Text)
- `address-country` (Text)
- `preferred-categories` (Multi-reference or Text)

#### Retailer Fields
- `business-name` (Text)
- `business-type` (Option)
- `registration-number` (Text)
- `business-phone` (Phone)
- `business-address-street` (Text)
- `business-address-city` (Text)
- `business-address-postal` (Text)
- `business-address-country` (Text)
- `showroom-address` (Text)
- `years-in-business` (Number)
- `brands-carried` (Multi-reference or Text)
- `verified` (Switch)

## Testing

### 1. Test Registration Flow

1. Go to signup page
2. Register a new user
3. Confirm email
4. Should redirect to `/app/{role}/onboarding`

### 2. Test Onboarding Form

1. Fill out multi-step form
2. Submit final step
3. Check console for success messages
4. Should redirect to dashboard

### 3. Verify CMS Sync

1. Check Webflow CMS Users collection
2. Verify user record has onboarding data
3. Check `onboarding-completed` is true

## Debugging

### Check Console Logs

```javascript
// The handler logs these events:
"🎯 Onboarding form handler initialized"
"📝 Formly submit button clicked"
"📊 Processing {role} onboarding for user: {id}"
"📋 Collected form data: {data}"
"📤 Updating Webflow CMS with onboarding data"
"✅ Webflow CMS updated successfully"
```

### Common Issues

1. **Form not submitting**: Check Formly attributes are correct
2. **CMS not updating**: Verify Edge Function environment variables
3. **Redirect not working**: Check dashboard URLs in redirects configuration

## Environment Variables

### Supabase Edge Function
- `WEBFLOW_API_TOKEN` - Your Webflow API token
- `WEBFLOW_USERS_COLLECTION_ID` - Users collection ID
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key

### JavaScript (Optional)
If not using default values, pass to handler:
```javascript
const handler = new OnboardingFormHandler(
  'your-supabase-url',
  'your-supabase-anon-key'
);
```

## Next Steps

1. **Customize form fields** based on business requirements
2. **Add validation** for specific fields (business registration, VAT)
3. **Implement progress indicator** for multi-step form
4. **Add field dependencies** (show/hide based on selections)
5. **Create admin dashboard** to review/approve retailer registrations

## Support

For issues or questions:
- Check browser console for error messages
- Review Supabase Edge Function logs
- Verify Webflow CMS field mappings
- Test with a simple form first, then add complexity