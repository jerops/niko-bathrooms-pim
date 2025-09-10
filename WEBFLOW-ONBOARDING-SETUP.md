# Webflow Onboarding Setup Guide

## Collection IDs
- **Customer Collection ID**: `68a6dc21ddfb81569ba773a4`
- **Project Site ID**: `67378d122c9df01858dd36f6`
- **Onboarding Page**: https://nikobathrooms.webflow.io/dev/app/customer/onboarding

## CDN Scripts to Add

Add these scripts to your Webflow page custom code (before </body>):

### 1. Auth Core (Required)
```html
<script src="https://cdn.jsdelivr.net/gh/jerops/niko-bathrooms-pim@feature/onboarding/packages/pim-bundle/dist/niko-pim-auth-v5-final.min.js"></script>
```

### 2. Preloader (Required) - Updated for /dev/ paths
```html
<script src="https://cdn.jsdelivr.net/gh/jerops/niko-bathrooms-pim@feature/onboarding/packages/pim-bundle/dist/niko-preloader.min.js"></script>
```

### 3. Onboarding Handler (On onboarding pages)
```html
<script src="https://cdn.jsdelivr.net/gh/jerops/niko-bathrooms-pim@feature/onboarding/packages/pim-bundle/dist/niko-onboarding-handler.min.js"></script>
```

## Development vs Production Paths

Currently configured for **development** with `/dev/` paths:
- Login redirect: `/dev/app/auth/log-in` 
- Protected paths: `/dev/app/customer/`, `/dev/app/retailer/`
- Dashboard redirects: `/dev/app/customer/dashboard`, `/dev/app/retailer/dashboard`

This prevents accidentally affecting production URLs while testing.

## Formly Form Setup

Your Formly multi-step form should have these attributes:
- Form element: `data-form="multistep"`
- Submit button: `data-form="submit-btn"`
- Step indicators: `data-form="step"`

## Field Mapping

### Customer Fields (from form → CMS)
- `companyName` → `company-name`
- `vatNumber` → `vat-number`
- `phoneNumber` → `phone-number`
- `addressLine1` → `address-line-1`
- `addressLine2` → `address-line-2`
- `city` → `address-city`
- `postalCode` → `address-postal-code`
- `country` → `address-country`
- `preferredCategories` → `preferred-categories`
- `newsletter` → `newsletter-subscribed`
- `marketingConsent` → `marketing-consent`

### Retailer Fields (from form → CMS)
- `businessName` → `business-name`
- `businessType` → `business-type`
- `registrationNumber` → `registration-number`
- `businessPhone` → `business-phone`
- `businessAddress` → `business-address-street`
- `businessCity` → `business-address-city`
- `businessPostalCode` → `business-address-postal`
- `businessCountry` → `business-address-country`
- `showroomAddress` → `showroom-address`
- `yearsInBusiness` → `years-in-business`
- `brandsCarried` → `brands-carried`

## Environment Variables Required

Set these in your Supabase project settings:
- `WEBFLOW_API_TOKEN`: Your Webflow API v2 token
- `WEBFLOW_USERS_COLLECTION_ID`: `68a6dc21ddfb81569ba773a4`

## Testing the Integration

1. **Check Console Logs**: Open browser console to see handler initialization
   - Should see: "🎯 Niko Onboarding Handler initializing"
   - Should see: "✅ Onboarding form handler initialized"

2. **Fill Out Form**: Complete all steps of the Formly form

3. **Submit**: Click the submit button on the final step

4. **Verify**:
   - Check console for "📊 Processing customer onboarding"
   - Check Webflow CMS for new/updated user record
   - User should be redirected to dashboard after success

## Troubleshooting

### Form Not Detected
- Ensure `data-form="multistep"` attribute is on the form
- Check that scripts are loaded in correct order (auth → preloader → onboarding)

### Submission Not Working
- Check browser console for errors
- Verify user is authenticated before accessing onboarding page
- Ensure Edge Function is deployed and accessible

### CMS Not Updating
- Verify environment variables are set in Supabase
- Check Edge Function logs in Supabase dashboard
- Ensure Webflow API token has write permissions

## Edge Function URL
```
https://bzjoxjqfpmjhbfijthpp.supabase.co/functions/v1/update-webflow-user-onboarding
```

## Support
For issues, check:
1. Browser console logs
2. Supabase Edge Function logs
3. Webflow API activity logs