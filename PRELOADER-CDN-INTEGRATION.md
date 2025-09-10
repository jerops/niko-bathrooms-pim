# Preloader CDN Integration Guide

## Overview

The Niko Preloader provides seamless page loading and authentication checking across all Webflow pages. It automatically shows/hides your loading screen based on user authentication status and page readiness.

## Quick Start

**Add this single line to your Webflow project** (Project Settings > Custom Code > Head Code):

```html
<script src="https://cdn.jsdelivr.net/gh/jerops/niko-bathrooms-pim@bmad-method-integration/packages/pim-bundle/dist/niko-preloader.min.js"></script>
```

## Required HTML Element

Your Webflow page must have this preloader element:

```html
<div niko-data="page-loader" class="page-loader-wrapper w-embed">
  <span class="loader"></span>
  <!-- Your existing CSS styles -->
</div>
```

## How It Works

### Page Types

**Protected Pages** (requires authentication):
- `/app/customer/` - Customer dashboard and related pages
- `/app/retailer/` - Retailer dashboard and related pages  
- `/dashboard` - Any dashboard page
- `/profile` - User profile pages
- `/onboarding` - User onboarding flow

**Public Pages** (no authentication required):
- Login, signup, home, about, contact, etc.

### Behavior

**On Protected Pages:**
1. 🎬 **Shows preloader** immediately
2. 🔐 **Checks authentication** via NikoAuthCore
3. ✅ **If authenticated**: Waits for page load, then hides preloader
4. ❌ **If not authenticated**: Redirects to `/app/auth/log-in`

**On Public Pages:**
1. 🎬 **Shows preloader** briefly
2. 📄 **Waits for page load**
3. ✅ **Hides preloader** when ready

### Safety Features

- **Minimum show time**: 800ms (prevents flash)
- **Emergency timeout**: 10 seconds maximum
- **Graceful fallbacks**: Works even if auth system fails
- **Smooth transitions**: 300ms fade out

## Console Messages

The preloader provides helpful debugging information:

```
🎬 Preloader handler initializing
👁️ Preloader shown
🔐 Auth system ready
🔒 Checking authentication for protected page
✅ User authenticated
🎬 Hiding preloader
✅ Preloader hidden
```

## Customization

### Update Loading Text

```javascript
// Add dynamic loading text
if (window.NikoPreloader) {
  window.NikoPreloader.updateText('Loading your dashboard...');
}
```

### Force Hide (Emergency)

```javascript
// Force hide preloader if needed
if (window.NikoPreloader) {
  window.NikoPreloader.forceHide();
}
```

### Modify Protected Paths

To change which pages are protected, you'll need to customize the source code in `preloader-handler.ts`:

```typescript
private isProtectedPage(): boolean {
  const path = window.location.pathname;
  const protectedPaths = [
    '/app/customer/',
    '/app/retailer/',
    '/dashboard',
    '/profile',
    '/onboarding',
    // Add your custom paths here
  ];
  
  return protectedPaths.some(protectedPath => path.includes(protectedPath));
}
```

## Integration with Other Scripts

**Load order doesn't matter** - the preloader automatically waits for NikoAuthCore to be ready.

**Complete setup example:**
```html
<!-- In Webflow Head Code -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="https://cdn.jsdelivr.net/gh/jerops/niko-bathrooms-pim@main/packages/auth/src/niko-auth-core.js"></script>
<script src="https://cdn.jsdelivr.net/gh/jerops/niko-bathrooms-pim@bmad-method-integration/packages/pim-bundle/dist/niko-preloader.min.js"></script>

<!-- On login page only -->
<script src="https://cdn.jsdelivr.net/gh/jerops/niko-bathrooms-pim@bmad-method-integration/packages/pim-bundle/dist/niko-login-handler.min.js"></script>
```

## CSS Requirements

Your preloader element should be styled to cover the full screen initially. The script will automatically position it as a fixed overlay:

```css
.page-loader-wrapper {
  /* Your existing styles for the loader animation */
  /* Position will be set automatically by the script */
}
```

## Troubleshooting

### Preloader Not Showing
1. Check console for: `🎬 Preloader handler initializing`
2. Verify element exists: `[niko-data="page-loader"]`
3. Check CSS isn't hiding the element

### Preloader Not Hiding
1. Check console for authentication messages
2. Verify NikoAuthCore is loading properly
3. Check for JavaScript errors blocking execution

### Wrong Redirects
1. Verify page paths in `isProtectedPage()` method
2. Check login URL is correct: `/app/auth/log-in`
3. Ensure user has proper authentication state

### Performance Issues
1. Preloader adds minimal overhead (4KB)
2. Emergency timeout ensures it never blocks indefinitely
3. Check network tab for CDN loading issues

## File Structure

```
packages/
├── webflow-forms/src/
│   └── preloader-handler.ts      # TypeScript source
└── pim-bundle/
    ├── src/
    │   └── preloader-bundle.js    # Standalone JavaScript
    └── dist/
        └── niko-preloader.min.js  # Minified CDN version
```

## CDN Information

- **URL**: `https://cdn.jsdelivr.net/gh/jerops/niko-bathrooms-pim@bmad-method-integration/packages/pim-bundle/dist/niko-preloader.min.js`
- **Size**: ~4KB minified
- **Cache**: 7 days browser cache, 12 hours CDN cache
- **Availability**: Global CDN with 99.9% uptime

## Version History

- **v1.0.0** - Initial release
  - Authentication-aware preloader
  - Protected page detection
  - Smooth transitions and emergency timeouts
  - Integration with NikoAuthCore

## Related Documentation

- [Login Handler CDN Integration](./LOGIN-HANDLER-CDN.md)
- [Authentication Flow](./AUTHENTICATION-FLOW.md)
- [Onboarding Deployment](./ONBOARDING-DEPLOYMENT.md)
- [CDN Optimization Guide](./packages/pim-bundle/CDN-OPTIMIZATION.md)