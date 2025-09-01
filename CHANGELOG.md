# Changelog

All notable changes to the Niko Bathrooms PIM system will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [5.0.0] - 2025-09-01

### 🎉 Major Authentication System Upgrade

#### Added
- **Professional Authentication System v5.0.0**
  - Cookie-based session storage (replacing localStorage for enhanced security)
  - Implicit OAuth flow for seamless email confirmation
  - Comprehensive debugging logs with emoji indicators
  - Auto-retry logout handlers for dynamically loaded content
  - User-friendly error messages for login failures
  - Custom event system (`nikoAuthReady`, `nikoRegistrationComplete`, `nikoAuthSignedOut`)
  - Global utility functions: `window.nikoRedirectToLogin()`, `window.nikologout()`

- **Enhanced Security Features**
  - httpOnly-compatible cookie storage implementation
  - Automatic JWT token refresh handling  
  - Session persistence across browser tabs and windows
  - Professional error handling with actionable user feedback
  - Email confirmation validation before dashboard access

- **Advanced Webflow Integration**
  - Automatic CMS user record creation via Supabase Edge Functions
  - Role-based content visibility with `[niko-role="customer|retailer"]` attributes
  - Content gating using `[niko-data="auth-required"]` elements
  - Dynamic user data population in DOM elements (`[niko-data="user-name"]`, `[niko-data="user-email"]`)
  - Seamless form integration with Webflow native forms

- **Complete Authentication Flow**
  - Registration → Email confirmation → Onboarding → Dashboard redirect
  - Cross-browser/tab email confirmation support
  - Automatic role-based redirects (customer vs retailer dashboards)
  - Modal integration with post-registration redirect functionality
  - Protected page detection and automatic login redirects

#### Changed
- **Breaking Change**: Upgraded from v3.0.0 to v5.0.0 authentication architecture
- Migrated from localStorage to secure cookie-based session storage
- Enhanced logout detection with comprehensive selector patterns and text-based search
- Improved error messaging system for better user experience
- Removed unnecessary DOM attribute manipulation (delegated to Webflow styling)
- Updated CDN structure with versioned deployments for better cache management

#### Fixed
- Document.body null reference errors during page initialization
- Dual initialization conflicts between v3.0.0 and v5.0.0 systems
- CDN caching issues with strategic versioned deployments
- Email confirmation token handling in URL hash parameters
- Session establishment timing issues on page load
- Supabase Edge Function 500 errors for Webflow CMS integration
- Logout button detection for dynamically loaded dashboard content

#### Technical Implementation
- **CDN Architecture**: Multiple versioned builds for strategic cache-busting
- **Build System**: Webpack production optimization with advanced minification
- **Environment Detection**: Automatic development/production path resolution
- **Session Management**: Professional cookie storage with 7-day secure expiration
- **Error Handling**: Comprehensive user-friendly error message mapping
- **Performance**: Reduced bundle size while adding more features

#### Migration Guide
- **New CDN URL**: `https://cdn.jsdelivr.net/gh/jerops/niko-bathrooms-pim@main/packages/pim-bundle/dist/niko-pim-auth-v5-errors.min.js`
- **Backward Compatibility**: All existing `[niko-data]` attributes remain fully compatible
- **No Breaking Changes**: Existing Webflow implementations work without modification
- **Enhanced Features**: Automatic upgrade to improved error handling and session management

## [1.0.0] - 2025-08-28

### Added
- 🎉 **Initial modular architecture** following Finsweet attributes pattern
- 🔐 **Authentication package** - Supabase Auth with Webflow CMS sync
- 🛒 **Wishlist package** - Local storage + cloud persistence hybrid
- 🛡️ **Content gating package** - Secure role-based content visibility
- 📝 **Webflow forms package** - Login/signup form handlers
- 🔔 **Notifications package** - Toast notification system
- 👥 **User management package** - User profiles and dashboard features
- 🔗 **Supabase integration package** - Edge Functions and database schema
- 🎨 **Custom CSS package** - Design system and animations
- ⚙️ **Core package** - Shared utilities and TypeScript definitions
- 📦 **PIM bundle package** - Bundle orchestrator for CDN delivery

### Security Improvements
- **DOM-level content gating** - Elements removed from DOM instead of CSS hiding
- **Redirect protection** - Unauthorized access redirected to login page
- **Three security levels** - display-none, remove, redirect methods
- **Input validation** - Comprehensive form validation
- **JWT token management** - Secure session handling

### Performance Features
- **Tree-shaking** - Eliminates unused code from bundles
- **Code splitting** - Load features on demand
- **Local storage optimization** - Immediate wishlist feedback
- **CDN deployment** - GitHub + jsDelivr integration
- **Bundle size optimization** - Core: 8KB, Full system: 45KB (gzipped)

### Developer Experience
- **TypeScript strict mode** - Full type safety across all packages
- **pnpm workspaces** - Efficient package management
- **ESLint + Prettier** - Code quality and formatting
- **Vitest testing** - Unit testing framework
- **Hot reload development** - Fast development iteration

### Documentation
- **Professional README** - Comprehensive setup and usage guide
- **Package documentation** - Individual README for each package
- **Latest features status** - Tracking document for feature implementation
- **Contributing guidelines** - Development workflow documentation
- **License and support** - MIT license with commercial support options

### Webflow Integration
- **Form handlers** - Automatic detection and handling of login/signup forms
- **Role detection** - Customer vs Retailer tab detection
- **Element ID mapping** - Standard Webflow form field mapping
- **CMS synchronization** - User data sync between Supabase and Webflow CMS
- **Edge Function deployment** - Supabase Edge Functions for CMS operations

### Business Features
- **Customer wishlist management** - Product saving and sharing
- **Retailer tools** - Access to customer wishlists for quote generation
- **Role-based pricing** - Different pricing display for customers vs retailers
- **User dashboard** - Profile management and settings
- **Product sharing** - Wishlist sharing functionality

## [Unreleased] - Future Versions

### Planned Features
- **Advanced search and filtering** - Multi-criteria product search
- **Product comparison tools** - Side-by-side product comparisons
- **Analytics dashboard** - Business intelligence and reporting
- **Bulk operations** - Batch wishlist and user operations
- **AI-powered recommendations** - Machine learning product suggestions
- **Enterprise SSO** - Single sign-on integration
- **Mobile app components** - React Native/Flutter components
- **Advanced caching** - Performance optimization
- **Real-time notifications** - WebSocket-based live updates

### Technical Improvements
- **Automated testing suite** - E2E testing with Playwright
- **Error monitoring** - Sentry integration for production monitoring
- **Performance metrics** - Core Web Vitals tracking
- **CI/CD pipeline** - GitHub Actions for automated deployment
- **Documentation site** - Dedicated docs website

---

## Version History

- **v1.0.0** - Initial release with modular architecture
- **v0.x.x** - Pre-modular development versions (legacy nikobathrooms repo)