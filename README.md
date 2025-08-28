# Niko Bathrooms PIM System

**Enterprise-grade modular Product Information Management system with authentication-gated features and seamless Webflow integration.**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178c6)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-2.45-00d562)](https://supabase.com)
[![Webflow](https://img.shields.io/badge/Webflow-API-4353ff)](https://webflow.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![pnpm](https://img.shields.io/badge/pnpm-workspace-f69220)](https://pnpm.io/workspaces)

## 🏢 Overview

A comprehensive, **production-ready PIM system** designed for bathroom product retailers and customers. Built with enterprise-grade architecture featuring role-based authentication, wishlist management, content gating, and seamless CMS integration.

### **Key Capabilities**
- 🔐 **Secure Authentication** - Supabase Auth with Webflow CMS sync
- 📝 **Wishlist System** - Local storage + cloud persistence hybrid approach  
- 🛡️ **Content Gating** - Role-based access control with DOM-level security
- 📱 **Responsive Design** - Modern CSS with smooth animations
- ⚡ **Performance Optimized** - Tree-shaken bundles, lazy loading
- 🎯 **Developer Experience** - TypeScript, testing, hot reload

## 🏗️ Architecture

### **Package Structure**

```
packages/
├── 🔐 auth/                    # Supabase authentication system
├── 🛒 wishlist/                # Product wishlist with local storage
├── 🛡️ content-gating/          # Role-based content visibility
├── 📝 webflow-forms/           # Webflow form integration handlers
├── 🔔 notifications/           # Toast notification system
├── 👥 user-management/         # User profiles and dashboard
├── 🔗 supabase-integration/    # Edge Functions and DB schema
├── 🎨 custom-css/              # Design system and animations
├── ⚙️ core/                    # Shared utilities and types
└── 📦 pim-bundle/              # Bundle orchestrator
```

### **Technology Stack**
- **Frontend:** TypeScript 5.5, Modern ES Modules
- **Authentication:** Supabase Auth with JWT tokens
- **Database:** Webflow CMS + Supabase hybrid
- **Build Tools:** Rollup, Webpack, Babel transpilation
- **Testing:** Vitest with coverage
- **Code Quality:** ESLint, Prettier, TypeScript strict mode
- **Package Management:** pnpm workspaces
- **Deployment:** GitHub CDN via jsDelivr

## 🚀 Quick Start

### **Prerequisites**
```bash
node -v    # Requires Node.js 18+
pnpm -v    # Requires pnpm 8+
```

### **Installation**

```bash
git clone https://github.com/jerops/niko-bathrooms-pim.git
cd niko-bathrooms-pim
pnpm install
```

### **Environment Configuration**

Create `.env` file:
```env
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key

# Webflow Configuration  
WEBFLOW_API_TOKEN=your_webflow_api_token
WEBFLOW_SITE_ID=67378d122c9df01858dd36f6
WEBFLOW_USERS_COLLECTION_ID=your_users_collection_id

# Environment
NODE_ENV=development
```

### **Development Commands**

```bash
# Build all packages
pnpm build:all

# Development mode with hot reload
pnpm dev

# Run tests
pnpm test

# Type checking
pnpm type-check

# Linting
pnpm lint
```

## 📦 Package Usage

### **🔐 Authentication Package**

```typescript
import { AuthManager } from '@nikobathrooms/auth';

const auth = new AuthManager({
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_ANON_KEY
});

// User registration with role detection
const result = await auth.register({
  email: 'customer@example.com',
  password: 'secure123',
  name: 'John Doe',
  role: 'customer' // or 'retailer'
});

// Authentication state management
auth.onAuthStateChange((user) => {
  if (user) {
    console.log(`Welcome ${user.name} (${user.role})`);
  }
});
```

### **🛒 Wishlist Package** 

```typescript
import { WishlistManager } from '@nikobathrooms/wishlist';

const wishlist = new WishlistManager({
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_ANON_KEY,
  webflowSiteId: process.env.WEBFLOW_SITE_ID
});

// Add product (works for anonymous + authenticated users)
await wishlist.add('bathroom-tile-123');

// Load user's complete wishlist
const items = await wishlist.load();

// Generate shareable wishlist link
const shareUrl = await wishlist.share();
```

### **🛡️ Content Gating Package**

```typescript
import { ContentGatingManager } from '@nikobathrooms/content-gating';

const gating = new ContentGatingManager(
  { userRole: 'customer', isAuthenticated: true },
  { redirectUrl: '/unauthorized', loginUrl: '/dev/app/log-in' }
);

// Apply role-based content rules
gating.addRule({
  selector: '[data-role="retailer-pricing"]', 
  allowedRoles: ['retailer'],
  requiresAuth: true,
  hideMethod: 'remove' // Removes from DOM (secure)
});

gating.applyGating();
```

## 🌐 Webflow Integration

### **Site-Wide Integration**

Add to Webflow **Site Settings → Custom Code → Head Code:**

```html
<!-- Core PIM System -->
<script src="https://cdn.jsdelivr.net/gh/jerops/niko-bathrooms-pim@main/packages/pim-bundle/dist/niko-pim-full.min.js"></script>
<link href="https://cdn.jsdelivr.net/gh/jerops/niko-bathrooms-pim@main/packages/custom-css/dist/niko-pim.min.css" rel="stylesheet">

<script>
// Initialize system
document.addEventListener('DOMContentLoaded', function() {
  window.NikoPIM.init({
    supabaseUrl: 'your_supabase_url',
    supabaseKey: 'your_anon_key',
    webflowSiteId: '67378d122c9df01858dd36f6'
  });
});
</script>
```

### **Page-Specific Features**

```html
<!-- Wishlist Button -->
<button data-product-id="bathroom-tile-123" class="wishlist-btn">
  Add to Wishlist
</button>

<!-- Content Gating -->
<div data-role="retailer-only">
  <p>Trade pricing: €45.99 per m²</p>
</div>

<div data-role="customer">
  <p>Retail pricing: €65.99 per m²</p>  
</div>
```

## 📊 Performance & Monitoring

### **Bundle Sizes (Gzipped)**
- **Core:** 8KB
- **Authentication:** 15KB  
- **Wishlist:** 12KB
- **Content Gating:** 6KB
- **Notifications:** 4KB
- **Complete System:** 45KB

### **Performance Features**
- Tree-shaking eliminates unused code
- Code splitting by feature
- CDN edge caching (jsDelivr)
- Lazy loading for non-critical features
- Modern ES2022 build targets

## 🎯 Business Impact

### **For Niko Bathrooms**
- **Customer Engagement:** Wishlist system increases return visits
- **Sales Efficiency:** Retailers access customer wishlists for quotes
- **User Experience:** Role-based content improves relevance
- **Scalability:** Modular architecture supports business growth

### **For Users**
- **Customers:** Easy product discovery and wishlist management
- **Retailers:** Access to trade information and customer data
- **Seamless Experience:** Fast loading, intuitive interfaces

## 📞 Support

- **🐛 Issues:** [GitHub Issues](https://github.com/jerops/niko-bathrooms-pim/issues)
- **💡 Feature Requests:** [GitHub Discussions](https://github.com/jerops/niko-bathrooms-pim/discussions)  
- **📧 Commercial Support:** support@nikobathrooms.ie
- **📖 Documentation:** [LATEST-FEATURES-STATUS.md](LATEST-FEATURES-STATUS.md)

## 📋 License

MIT License - see [LICENSE.md](LICENSE.md) for details.

---

<div align="center">
  <p><strong>🛁 Built with ❤️ for Niko Bathrooms</strong></p>
  <p><em>Professional PIM solution for the modern bathroom industry</em></p>
  
  [![GitHub stars](https://img.shields.io/github/stars/jerops/niko-bathrooms-pim)](https://github.com/jerops/niko-bathrooms-pim/stargazers)
  [![GitHub issues](https://img.shields.io/github/issues/jerops/niko-bathrooms-pim)](https://github.com/jerops/niko-bathrooms-pim/issues)
  [![GitHub forks](https://img.shields.io/github/forks/jerops/niko-bathrooms-pim)](https://github.com/jerops/niko-bathrooms-pim/network)
</div>