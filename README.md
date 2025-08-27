# Niko Bathrooms PIM System

**Professional modular architecture for Product Information Management with Supabase authentication and Webflow CMS integration.**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![pnpm](https://img.shields.io/badge/pnpm-workspace-orange)](https://pnpm.io/workspaces)

## 🎨 Overview

A comprehensive, modular PIM system built for **Plytix-scale functionality** with enterprise-grade architecture. Features authentication-gated wishlist functionality, advanced product management, and seamless Webflow integration.

## 🏗️ Architecture

### **Core Philosophy**
- 🧩 **Modular Design** - Each feature is an independent package
- 🚀 **Performance First** - Optimized bundles for different use cases
- 🔐 **Type Safe** - Full TypeScript coverage
- ⚙️ **Developer Experience** - Hot reload, linting, testing
- 📊 **Scalable** - Ready for enterprise-level growth

### **Package Structure**

```
📚 JavaScript Packages
├── core/                     # Shared utilities & types
├── auth/                     # Authentication system  
├── webflow-api/             # Webflow API integration
├── supabase-integration/    # Supabase integration
├── wishlist/                # Wishlist functionality
├── user-management/         # User management dashboard
├── product-search/          # Advanced search & filtering
├── product-comparison/      # Product comparison tools
├── analytics-dashboard/     # Business intelligence
└── ... (20+ more packages)

🎨 CSS Packages
├── custom-css/              # Design tokens & utilities
├── view-transitions/        # Page transitions
├── menu-animations/         # Navigation animations
├── loading-states/          # Loading indicators
├── form-animations/         # Form feedback
└── button-effects/          # Interactive elements

📦 Bundle Package
└── pim-bundle/              # Bundle orchestrator
```

## 🚀 Quick Start

### **Prerequisites**
- Node.js 18+
- pnpm 8+

### **Installation**

```bash
# Clone the repository
git clone https://github.com/jerops/niko-bathrooms-pim.git
cd niko-bathrooms-pim

# Install dependencies
pnpm install

# Build all packages
pnpm build:all

# Start development
pnpm dev
```

### **Environment Setup**

Create `.env` file with:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key
WEBFLOW_API_TOKEN=your_webflow_api_token
WEBFLOW_SITE_ID=67378d122c9df01858dd36f6
```

## 📦 Bundle Outputs

### **Optimized Builds**

```javascript
// Authentication only (~15KB JS + ~5KB CSS)
import '@nikobathrooms/pim-auth.min.js';
import '@nikobathrooms/pim-auth.min.css';

// Wishlist functionality (~25KB JS + ~8KB CSS)
import '@nikobathrooms/pim-wishlist.min.js';
import '@nikobathrooms/pim-wishlist.min.css';

// Complete PIM system (~200KB JS + ~15KB CSS)
import '@nikobathrooms/pim-full.min.js';
import '@nikobathrooms/pim-full.min.css';
```

### **CDN Ready**

```html
<!-- Authentication Bundle -->
<script src="https://cdn.jsdelivr.net/npm/@nikobathrooms/pim-auth@latest/dist/niko-pim-auth.min.js"></script>
<link href="https://cdn.jsdelivr.net/npm/@nikobathrooms/pim-auth@latest/dist/niko-pim-auth.min.css" rel="stylesheet">

<!-- Complete System -->
<script src="https://cdn.jsdelivr.net/npm/@nikobathrooms/pim-full@latest/dist/niko-pim-full.min.js"></script>
<link href="https://cdn.jsdelivr.net/npm/@nikobathrooms/pim-full@latest/dist/niko-pim-full.min.css" rel="stylesheet">
```

## 🗺️ Implementation Roadmap

### **Phase 1: Foundation** (Weeks 1-2) ✅
- [x] Core infrastructure setup
- [x] Design system and CSS foundation
- [ ] Authentication package
- [ ] Webflow API integration

### **Phase 2: Essential Features** (Weeks 3-4)
- [ ] User management system
- [ ] Wishlist functionality
- [ ] Page transitions and animations
- [ ] Content gating logic

### **Phase 3: Product Features** (Weeks 5-6)
- [ ] Advanced search and filtering
- [ ] Product comparison tools
- [ ] Product sharing capabilities
- [ ] Shopping behavior tracking

### **Phase 4: Advanced Features** (Weeks 7-8)
- [ ] Bulk operations
- [ ] Wishlist collaboration
- [ ] ML-based recommendations
- [ ] Advanced caching

### **Phase 5+: Enterprise Scale** (Weeks 9+)
- [ ] Analytics dashboard
- [ ] Admin tools
- [ ] Performance monitoring
- [ ] Enterprise integrations

## 🛠️ Development

### **Working with Packages**

```bash
# Build specific package
pnpm --filter @nikobathrooms/core build

# Test specific package
pnpm --filter @nikobathrooms/auth test

# Run linting
pnpm lint

# Type checking
pnpm type-check
```

### **Creating New Packages**

```bash
# Copy template structure
cp -r packages/core packages/my-new-package

# Update package.json name
# Update imports and exports
# Add to workspace
```

### **Bundle Development**

```bash
# Build all bundles
pnpm --filter @nikobathrooms/pim-bundle build

# Watch mode for development
pnpm --filter @nikobathrooms/pim-bundle dev
```

## 🎨 Design System

### **CSS Custom Properties**

```css
/* Colors */
--niko-primary-500: #3b82f6;
--niko-success-500: #10b981;
--niko-error-500: #ef4444;

/* Spacing */
--niko-space-4: 1rem;
--niko-space-6: 1.5rem;

/* Transitions */
--niko-transition-normal: 0.3s ease-in-out;
```

### **Utility Classes**

```html
<div class="niko-container niko-py-8">
  <div class="niko-bg-white niko-rounded-lg niko-shadow-md niko-p-6">
    <h2 class="niko-text-2xl niko-font-semibold niko-text-gray-900">
      Component Title
    </h2>
  </div>
</div>
```

## 📊 Usage Examples

### **Authentication**

```typescript
import { AuthManager } from '@nikobathrooms/auth';

const auth = new AuthManager();

// Register user
const result = await auth.register({
  email: 'user@example.com',
  password: 'securepassword',
  name: 'John Doe',
  role: 'customer'
});

// Listen for auth changes
auth.onAuthStateChange((user) => {
  if (user) {
    // User logged in
    console.log('Welcome', user.name);
  }
});
```

### **Wishlist Management**

```typescript
import { WishlistManager } from '@nikobathrooms/wishlist';

const wishlist = new WishlistManager();

// Add product to wishlist
await wishlist.addProduct('product-id-123');

// Load user's wishlist
const items = await wishlist.loadWishlist();
```

### **Product Search**

```typescript
import { ProductSearch } from '@nikobathrooms/product-search';

const search = new ProductSearch();

// Search with filters
const results = await search.query({
  search: 'bathroom tiles',
  category: 'tiles',
  priceMax: 100
});
```

## 🏗️ Technical Stack

- **Frontend:** TypeScript, Modern ES Modules
- **Authentication:** Supabase Auth
- **Database:** Webflow CMS
- **Build:** Webpack, Rollup
- **Testing:** Vitest
- **Linting:** ESLint, Prettier
- **CSS:** Modern CSS with custom properties
- **Package Manager:** pnpm workspaces

## 📊 Performance

### **Bundle Sizes**
- **Auth Only:** ~15KB JS + ~5KB CSS (gzipped)
- **Wishlist:** ~25KB JS + ~8KB CSS (gzipped) 
- **Full System:** ~200KB JS + ~15KB CSS (gzipped)

### **Performance Features**
- Tree-shaking for minimal bundles
- Code splitting by feature
- Lazy loading for non-critical features
- Optimized CSS with utility classes
- Modern build targets (ES2022)

## 🔐 Security

- **Authentication:** Supabase Auth with JWT tokens
- **API Security:** Rate limiting and validation
- **Input Validation:** Comprehensive form validation
- **Content Security:** Role-based content gating
- **Environment:** Secure environment variable handling

## 📋 License

MIT License - see [LICENSE.md](LICENSE.md)

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## 📞 Support

- **Issues:** [GitHub Issues](https://github.com/jerops/niko-bathrooms-pim/issues)
- **Documentation:** [docs/](docs/)
- **Email:** support@nikobathrooms.ie

---

**Built with ❤️ for Niko Bathrooms**