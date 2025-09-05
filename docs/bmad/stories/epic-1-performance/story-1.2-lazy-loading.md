# Story 1.2: Lazy Loading Implementation
**Epic**: Performance Optimization (v5.1)  
**Story ID**: PERF-1.2  
**Priority**: High  
**Effort**: 8 points  
**Sprint**: Performance Sprint 1

---

## 📋 Description

Implement lazy loading for non-critical packages and features to improve initial page load time. Focus on loading only essential functionality first, then load additional features on-demand.

## 🎯 Acceptance Criteria

- [ ] **Core Features**: Essential auth and basic wishlist load immediately
- [ ] **Advanced Features**: User management, notifications load on-demand
- [ ] **Load Time**: Initial page load time reduced by 25%
- [ ] **Progressive Enhancement**: Site works with core features, enhances with advanced
- [ ] **Error Handling**: Graceful fallbacks when lazy loading fails
- [ ] **User Experience**: No visible delays or broken functionality
- [ ] **Bundle Analysis**: Clear separation between critical and non-critical code
- [ ] **Cache Strategy**: Lazy-loaded modules properly cached

## 🔧 Technical Requirements

### **Lazy Loading Strategy**
```typescript
// Critical Path (Load Immediately)
- Core authentication (login/logout)
- Basic wishlist (add/remove)
- Content gating (role-based display)
- Error handling and notifications

// Lazy Loaded (On Demand)
- User dashboard and profile management
- Advanced wishlist features (sharing, sync)
- Advanced notifications (preferences, history)
- Analytics and tracking
- Admin features
```

### **Implementation Approach**
1. **Code Splitting**: Split packages into critical vs non-critical modules
2. **Dynamic Imports**: Use dynamic imports for lazy-loaded features
3. **Loading States**: Implement loading indicators for async modules
4. **Error Boundaries**: Handle lazy loading failures gracefully
5. **Preloading**: Intelligently preload likely-needed modules

### **Technical Changes**
```typescript
// Before: Everything loads immediately
import { UserManagement } from '@nikobathrooms/user-management';
import { AdvancedNotifications } from '@nikobathrooms/notifications/advanced';

// After: Lazy loading with dynamic imports
const loadUserManagement = () => import('@nikobathrooms/user-management');
const loadAdvancedNotifications = () => import('@nikobathrooms/notifications/advanced');

// Usage
async function showUserDashboard() {
  const { UserManagement } = await loadUserManagement();
  UserManagement.init();
}
```

## 🧪 Testing Requirements

### **Performance Testing**
- [ ] Initial load time measurement (target: 25% improvement)
- [ ] Time to First Contentful Paint (FCP)
- [ ] Time to Interactive (TTI) measurement
- [ ] Lazy loading speed testing

### **Functional Testing**
- [ ] Core features work immediately after load
- [ ] Lazy-loaded features work correctly when triggered
- [ ] Error handling when lazy loading fails
- [ ] Progressive enhancement validation

### **User Experience Testing**
- [ ] No broken functionality during lazy loading
- [ ] Appropriate loading states shown
- [ ] Smooth transitions between loading states
- [ ] Fallback functionality when modules fail to load

## 📊 Success Metrics

### **Performance Targets**
- **Initial Load Time**: 25% reduction (from ~2s to ~1.5s)
- **Critical Path Bundle**: <25KB gzipped
- **Time to Interactive**: <2.5 seconds
- **Lazy Load Time**: <500ms for on-demand modules

### **User Experience Metrics**
- **Bounce Rate**: Reduced due to faster initial load
- **Feature Usage**: No decrease in advanced feature usage
- **Error Rate**: <1% lazy loading failures
- **User Satisfaction**: No negative feedback on loading experience

## 🔗 Dependencies

### **Blocked By**
- Story 1.1: Bundle Size Optimization (provides code splitting foundation)

### **Blocks**
- Story 1.3: CDN Optimization (benefits from lazy loading structure)
- Story 2.1: Mobile Experience (mobile benefits significantly from lazy loading)

## 📝 Implementation Notes

### **Module Categorization**

#### **Critical Path Modules (Load Immediately)**
```typescript
// Essential for basic site functionality
- @nikobathrooms/core
- @nikobathrooms/auth/core
- @nikobathrooms/wishlist/basic
- @nikobathrooms/content-gating
- @nikobathrooms/notifications/core
```

#### **Lazy Loaded Modules (On Demand)**
```typescript
// Load when needed
- @nikobathrooms/user-management
- @nikobathrooms/auth/advanced
- @nikobathrooms/wishlist/advanced
- @nikobathrooms/notifications/advanced
- @nikobathrooms/webflow-forms/advanced
```

### **Loading Triggers**
```typescript
// User Management: Load when user clicks profile/dashboard
document.addEventListener('click', async (e) => {
  if (e.target.matches('[data-trigger="user-dashboard"]')) {
    const { UserManagement } = await import('@nikobathrooms/user-management');
    UserManagement.showDashboard();
  }
});

// Advanced Wishlist: Load when user tries to share wishlist
async function shareWishlist() {
  const { WishlistSharing } = await import('@nikobathrooms/wishlist/sharing');
  return WishlistSharing.generateShareUrl();
}
```

### **Loading States Implementation**
```typescript
class LazyLoader {
  static async loadModule(moduleName: string, loadingElement?: HTMLElement) {
    if (loadingElement) {
      loadingElement.classList.add('loading');
      loadingElement.innerHTML = '<div class="spinner">Loading...</div>';
    }
    
    try {
      const module = await import(moduleName);
      if (loadingElement) {
        loadingElement.classList.remove('loading');
        loadingElement.innerHTML = '';
      }
      return module;
    } catch (error) {
      if (loadingElement) {
        loadingElement.classList.add('error');
        loadingElement.innerHTML = '<div class="error">Failed to load feature</div>';
      }
      console.error(`Failed to load module ${moduleName}:`, error);
      throw error;
    }
  }
}
```

## ✅ Definition of Done

### **Performance**
- [ ] 25% reduction in initial load time achieved
- [ ] Critical path bundle <25KB gzipped
- [ ] All lazy loading performance targets met
- [ ] No performance regression in any metrics

### **Functionality**
- [ ] All core features work immediately after page load
- [ ] All lazy-loaded features work correctly when triggered
- [ ] Error handling works for all failure scenarios
- [ ] Loading states provide good user experience

### **Code Quality**
- [ ] Clean separation between critical and non-critical code
- [ ] Proper error boundaries and fallback mechanisms
- [ ] TypeScript types maintained for all dynamic imports
- [ ] Code follows established patterns and standards

### **Testing**
- [ ] Comprehensive test coverage for lazy loading logic
- [ ] Performance tests validate improvements
- [ ] Error scenario testing completed
- [ ] Cross-browser testing completed

---

**Dependencies**: Requires completion of Story 1.1 (Bundle Size Optimization)  
**Effort**: 8 story points (5-8 days)  
**Risk**: Medium (complexity of maintaining functionality during lazy loading)
