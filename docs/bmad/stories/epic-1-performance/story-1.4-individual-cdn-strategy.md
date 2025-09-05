# Story 1.4: Individual Package CDN Strategy
**Epic**: Performance Optimization (v5.1)  
**Story ID**: PERF-1.4  
**Priority**: High  
**Effort**: 5 points  
**Sprint**: Performance Sprint 1

---

## 📋 Description

Implement individual CDN deployment strategy for each package to enable modular, safe deployments and granular performance optimization. This maintains your excellent modular architecture while adding BMAD Method benefits.

## 🎯 Acceptance Criteria

- [ ] **Individual CDNs**: Each package deployed to separate CDN endpoint
- [ ] **Version Control**: Independent versioning for each package
- [ ] **Rollback Safety**: Individual package rollbacks without affecting others
- [ ] **Load Optimization**: Customers load only needed packages
- [ ] **Cache Strategy**: Package-specific cache optimization
- [ ] **Bundle Analysis**: Per-package size and performance tracking
- [ ] **Deployment Pipeline**: Automated individual package deployment
- [ ] **Monitoring**: Individual package performance metrics

## 🔧 Technical Requirements

### **Individual Package CDN Structure**
```javascript
// Core packages (always loaded)
https://cdn.jsdelivr.net/npm/@nikobathrooms/core@1.2.0/dist/index.js
https://cdn.jsdelivr.net/npm/@nikobathrooms/auth@5.1.0/dist/index.js

// Feature packages (loaded on demand)
https://cdn.jsdelivr.net/npm/@nikobathrooms/wishlist@2.1.0/dist/index.js
https://cdn.jsdelivr.net/npm/@nikobathrooms/content-gating@1.3.0/dist/index.js
https://cdn.jsdelivr.net/npm/@nikobathrooms/notifications@1.1.0/dist/index.js
https://cdn.jsdelivr.net/npm/@nikobathrooms/user-management@1.4.0/dist/index.js

// CSS packages (optimized separately)
https://cdn.jsdelivr.net/npm/@nikobathrooms/custom-css@1.2.0/dist/core.css
https://cdn.jsdelivr.net/npm/@nikobathrooms/custom-css@1.2.0/dist/auth.css
https://cdn.jsdelivr.net/npm/@nikobathrooms/custom-css@1.2.0/dist/wishlist.css
```

### **Smart Loading Strategy**
```javascript
// BMAD Method Enhanced Package Loader
class ModularPackageLoader {
  constructor() {
    this.loadedPackages = new Set();
    this.packageVersions = {
      core: '1.2.0',
      auth: '5.1.0',
      wishlist: '2.1.0',
      'content-gating': '1.3.0',
      notifications: '1.1.0',
      'user-management': '1.4.0'
    };
  }

  async loadPackage(packageName, force = false) {
    if (this.loadedPackages.has(packageName) && !force) {
      return; // Already loaded
    }

    const version = this.packageVersions[packageName];
    const url = `https://cdn.jsdelivr.net/npm/@nikobathrooms/${packageName}@${version}/dist/index.js`;
    
    try {
      const module = await import(url);
      this.loadedPackages.add(packageName);
      console.log(`📦 Loaded package: ${packageName}@${version}`);
      return module;
    } catch (error) {
      console.error(`❌ Failed to load package: ${packageName}`, error);
      throw error;
    }
  }

  // Load only what's needed for current page
  async loadForPage(pageType) {
    const packages = {
      'home': ['core', 'auth', 'content-gating'],
      'products': ['core', 'auth', 'wishlist', 'content-gating'],
      'dashboard': ['core', 'auth', 'user-management', 'notifications'],
      'checkout': ['core', 'auth', 'wishlist', 'notifications']
    };

    const required = packages[pageType] || ['core', 'auth'];
    
    for (const pkg of required) {
      await this.loadPackage(pkg);
    }
  }
}

// Initialize modular loading
window.NikoLoader = new ModularPackageLoader();
```

## 📊 Success Metrics

### **Performance Targets**
- **Individual Package Size**: Each <15KB gzipped
- **Load Time**: Only needed packages loaded per page
- **Cache Hit Rate**: >95% for individual packages
- **Deployment Speed**: Individual package deployment <30 seconds

### **Safety Targets**
- **Rollback Time**: <5 minutes for individual package rollback
- **Zero Downtime**: Other packages unaffected by individual deployments
- **Error Isolation**: Package failures don't cascade
- **Version Compatibility**: Backward compatibility maintained

## 🔗 Dependencies

### **Blocked By**
- Story 1.1: Bundle Size Optimization (optimizes individual packages)
- Story 1.2: Lazy Loading Implementation (enables on-demand loading)

### **Enables**
- Story 2.1: Mobile Experience (benefits from modular loading)
- Story 3.1: Advanced Features (enables safe feature rollouts)

## 📝 Implementation Notes

### **Individual Package Deployment Pipeline**
```yaml
# .github/workflows/deploy-package.yml
name: Deploy Individual Package
on:
  push:
    paths:
      - 'packages/*/src/**'
      - 'packages/*/package.json'

jobs:
  deploy-changed-packages:
    runs-on: ubuntu-latest
    steps:
      - name: Detect Changed Packages
        id: changes
        run: |
          # Detect which packages changed
          changed_packages=$(git diff --name-only HEAD~1 | grep -E '^packages/[^/]+/' | cut -d'/' -f2 | sort -u)
          echo "packages=$changed_packages" >> $GITHUB_OUTPUT
      
      - name: Build and Deploy Each Package
        run: |
          for package in ${{ steps.changes.outputs.packages }}; do
            cd packages/$package
            npm run build
            npm publish
            echo "✅ Deployed $package independently"
          done
```

### **Version Management Strategy**
```javascript
// Individual package versioning
const packageVersions = {
  core: '1.2.0',           // Stable, rarely changes
  auth: '5.1.0',           // Active development
  wishlist: '2.1.0',       // Feature updates
  'content-gating': '1.3.0', // Stable
  notifications: '1.1.0',  // Minor updates
  'user-management': '1.4.0' // Active development
};

// Compatibility matrix
const compatibility = {
  'auth@5.1.0': ['core@1.2.0', 'content-gating@1.3.0'],
  'wishlist@2.1.0': ['core@1.2.0', 'auth@5.1.0'],
  'user-management@1.4.0': ['core@1.2.0', 'auth@5.1.0', 'notifications@1.1.0']
};
```

### **Safety Mechanisms**
```javascript
// Package health check before loading
async function loadPackageWithHealthCheck(packageName, version) {
  const healthUrl = `https://cdn.jsdelivr.net/npm/@nikobathrooms/${packageName}@${version}/health.json`;
  
  try {
    const health = await fetch(healthUrl).then(r => r.json());
    if (health.status !== 'healthy') {
      throw new Error(`Package ${packageName}@${version} is not healthy`);
    }
    
    return await import(`https://cdn.jsdelivr.net/npm/@nikobathrooms/${packageName}@${version}/dist/index.js`);
  } catch (error) {
    // Fallback to previous version
    const fallbackVersion = getFallbackVersion(packageName, version);
    console.warn(`⚠️ Falling back to ${packageName}@${fallbackVersion}`);
    return await import(`https://cdn.jsdelivr.net/npm/@nikobathrooms/${packageName}@${fallbackVersion}/dist/index.js`);
  }
}
```

## ✅ Definition of Done

### **Individual Deployment**
- [ ] Each package deployable independently
- [ ] Individual package versioning working
- [ ] Rollback capability for each package
- [ ] Health checks for each package

### **Performance**
- [ ] Only required packages loaded per page
- [ ] Individual package size optimized
- [ ] Cache strategy optimized per package
- [ ] Load time improvements measured

### **Safety**
- [ ] Package failure isolation tested
- [ ] Compatibility matrix validated
- [ ] Fallback mechanisms working
- [ ] Zero-downtime deployments confirmed

---

**This story enhances your excellent modular architecture with BMAD Method benefits while maintaining your individual CDN deployment strategy.**
