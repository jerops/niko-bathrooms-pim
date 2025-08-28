# 🔐 **Niko Bathrooms PIM - Authentication Flow Documentation**

## **🏗️ Architecture Overview**

The authentication system follows a **sophisticated multi-layered approach** with **5 core components**:

1. **🔑 AuthManager** - Core Supabase authentication  
2. **📝 WebflowFormHandler** - UI form integration
3. **🔗 Edge Functions** - CMS synchronization
4. **🛡️ ContentGating** - Role-based access control
5. **🔔 Notifications** - User feedback system

---

## **📊 Complete Authentication Flow**

### **Registration Process**

```
User fills form → Role detection → Password validation → Supabase signup → 
Edge Function → Webflow CMS record → Email confirmation → Success notification
```

### **Login Process**

```
User credentials → Supabase login → JWT token → Content gating applied → 
Role-based redirect → Dashboard access
```

### **Security Layers**

```
Form validation → Supabase Auth → JWT tokens → Role metadata → 
Content gating → DOM manipulation → Secure redirects
```

---

## **🔧 Component Architecture**

### **1. 🔑 AuthManager (`packages/auth/src/auth-manager.ts`)**

**Core Responsibilities:**
- Supabase authentication management
- User registration with role metadata
- Login/logout functionality
- JWT token handling
- Current user state management

**Key Methods:**
```typescript
class AuthManager {
  constructor(supabaseUrl: string, supabaseKey: string)
  
  async register(data: RegisterData): Promise<AuthResult>
  async login(data: LoginData): Promise<AuthResult>
  async logout(): Promise<AuthResult>
  async getCurrentUser()
  async isAuthenticated(): Promise<boolean>
  
  private async createWebflowRecord(userId, email, name, userType)
}
```

**Security Features:**
- JWT token management via Supabase
- Role metadata stored in user profile (`user_type`, `role`)
- Automatic email confirmation flow
- Complete storage cleanup on logout
- Role-based redirect URLs

### **2. 📝 WebflowFormHandler (`packages/webflow-forms/src/form-handler.ts`)**

**Core Responsibilities:**
- Webflow form integration
- Role detection from UI tabs
- Form validation and submission
- Button state management
- User feedback via notifications

**Intelligence Features:**
```typescript
class WebflowFormHandler {
  initLoginForm(): void
  initSignupForm(): void
  
  private setupLoginHandlers()
  private setupSignupHandlers()
  private detectRole(): 'customer' | 'retailer'
}
```

**UI Integration:**
- **Form Selectors**: `form[data-name="Login Form"]`, `form[data-name="Signup Form"]`
- **Field Targeting**: `input[name="Email"]`, `input[name="Password"]`
- **Role Detection**: Active tab analysis (`.w-tab-link.w--current`)
- **Password Validation**: Automatic confirmation matching
- **Loading States**: Button disabled with "Signing in..." text

### **3. 🔗 Supabase Edge Functions**

**`create-webflow-user` Function:**
Located: `packages/supabase-integration/supabase/functions/create-webflow-user/index.ts`

**Purpose:**
- Creates CMS record in Webflow after user registration
- Links Supabase user with Webflow CMS entry
- Ensures data consistency across systems

**API Integration:**
```typescript
// Creates Webflow CMS record
await fetch(`/v2/collections/${WEBFLOW_USERS_COLLECTION_ID}/items`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${WEBFLOW_API_TOKEN}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    fieldData: {
      name: user.user_metadata?.name,
      slug: user.id,
      'firebase-uid': user.id,  // 🔑 Key linking field
      email: user.email,
      role: role,
      'created-date': new Date().toISOString(),
      'email-confirmed': user.email_confirmed_at ? true : false
    }
  })
})
```

**Benefits:**
- **Dual Database Strategy**: Supabase Auth + Webflow CMS
- **Automatic Synchronization**: No manual intervention
- **Robust Error Handling**: Graceful fallback if CMS fails
- **Data Linking**: Firebase UID connects records

### **4. 🛡️ Content Gating System (`packages/content-gating/`)**

**Security Levels:**
```typescript
// Level 1: CSS hiding (basic)
hideMethod: 'display-none'

// Level 2: DOM removal (secure) ⭐ RECOMMENDED
hideMethod: 'remove'  

// Level 3: Redirect protection (most secure)
hideMethod: 'redirect'
```

**Implementation:**
```html
<!-- Retailer-only pricing -->
<div data-role="retailer-only">
  <p>Trade pricing: €45.99 per m²</p>
</div>

<!-- Customer pricing -->
<div data-role="customer">
  <p>Retail pricing: €65.99 per m²</p>  
</div>

<!-- Authentication required -->
<div data-auth="required">
  <p>Please log in to view this content</p>
</div>
```

**Security Approach:**
- **DOM Removal**: Elements completely removed from page (not just hidden)
- **Redirect Protection**: Unauthorized users redirected to login
- **Role-Based Rules**: Fine-grained access control
- **Client-Side + Server-Side**: Layered security approach

### **5. 🔔 Notifications System (`packages/notifications/`)**

**User Feedback:**
- Success notifications for registration/login
- Error messages for validation failures
- Loading state indicators
- Toast-style notifications with auto-dismiss

---

## **🎯 Authentication States & User Journey**

### **User Registration Flow**

1. **Form Submission**
   - User fills signup form on Webflow page
   - Role detected from active tab (Customer/Retailer)
   - Password confirmation validated

2. **Backend Processing**
   - Data sent to AuthManager
   - Supabase user created with metadata
   - JWT token generated

3. **CMS Integration**
   - Edge Function triggered
   - Webflow CMS record created
   - Firebase UID used for linking

4. **User Feedback**
   - Success notification displayed
   - Email confirmation instructions
   - Redirect to confirmation page

### **User Login Flow**

1. **Credential Validation**
   - Form data collected
   - Sent to AuthManager
   - Supabase authentication

2. **Session Establishment**
   - JWT token received
   - User metadata loaded
   - Role information retrieved

3. **Content Personalization**
   - Content gating applied
   - Role-based elements shown/hidden
   - Dashboard access granted

4. **Navigation**
   - Success notification
   - Redirect to role-appropriate dashboard
   - Session persistence enabled

### **Authentication States**

```typescript
enum AuthState {
  UNAUTHENTICATED = 'unauthenticated',
  REGISTERING = 'registering',
  EMAIL_CONFIRMATION = 'email_confirmation', 
  AUTHENTICATING = 'authenticating',
  AUTHENTICATED = 'authenticated',
  ROLE_DETECTED = 'role_detected',
  CONTENT_GATED = 'content_gated'
}
```

---

## **🔒 Security Implementation**

### **Authentication Security**
- **JWT Tokens**: Industry-standard authentication
- **Password Hashing**: Handled by Supabase (bcrypt)
- **Email Confirmation**: Prevents fake accounts
- **Session Management**: Automatic token refresh
- **Secure Logout**: Complete storage cleanup

### **Authorization Security**
- **Role-Based Access Control (RBAC)**: Customer vs Retailer permissions
- **Content Gating**: DOM-level element removal
- **Server-Side Validation**: Edge Functions verify permissions
- **Client-Side Protection**: Immediate UI response

### **Data Security**
- **HTTPS Only**: All communications encrypted
- **Environment Variables**: Sensitive data protected
- **CORS Configuration**: Proper cross-origin setup
- **Input Sanitization**: TypeScript type validation

---

## **🚀 Performance & Scalability**

### **Bundle Optimization**
- **Tree Shaking**: Unused code eliminated
- **Code Splitting**: Packages loaded on demand  
- **CDN Distribution**: jsDelivr global delivery
- **Minification**: Production bundles compressed

### **Database Strategy**
- **Supabase**: High-performance authentication
- **Webflow CMS**: Content management flexibility
- **Edge Functions**: Server-side processing
- **Caching**: JWT tokens cached locally

### **Scalability Features**
- **Modular Architecture**: Independent package scaling
- **Stateless Design**: No server session storage
- **CDN Ready**: Global content distribution
- **Load Balancing**: Supabase handles traffic spikes

---

## **🛠️ Development & Deployment**

### **Development Setup**

1. **Environment Configuration**
```env
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key

# Webflow Configuration  
WEBFLOW_API_TOKEN=your_webflow_api_token
WEBFLOW_SITE_ID=67378d122c9df01858dd36f6
WEBFLOW_USERS_COLLECTION_ID=your_users_collection_id
```

2. **Build Commands**
```bash
# Build authentication package
pnpm --filter @nikobathrooms/auth build

# Build all packages
pnpm build:all

# Development mode
pnpm dev
```

### **Webflow Integration**

**Site-Wide Setup (in Webflow Site Settings → Custom Code → Head):**
```html
<!-- Core PIM System -->
<script src="https://cdn.jsdelivr.net/gh/jerops/niko-bathrooms-pim@main/packages/pim-bundle/dist/niko-pim-full.min.js"></script>
<link href="https://cdn.jsdelivr.net/gh/jerops/niko-bathrooms-pim@main/packages/custom-css/dist/niko-pim.min.css" rel="stylesheet">

<script>
document.addEventListener('DOMContentLoaded', function() {
  window.NikoPIM.init({
    supabaseUrl: 'your_supabase_url',
    supabaseKey: 'your_anon_key',
    webflowSiteId: '67378d122c9df01858dd36f6'
  });
});
</script>
```

**Form Structure:**
```html
<!-- Login Form -->
<form data-name="Login Form">
  <input name="Email" type="email" required>
  <input name="Password" type="password" required>
  <input type="submit" value="Sign In">
</form>

<!-- Signup Form with Role Tabs -->
<div class="w-tabs">
  <div class="w-tab-link">Customer</div>
  <div class="w-tab-link">Retailer</div>
</div>
<form data-name="Signup Form">
  <input name="Name" type="text" required>
  <input name="Email" type="email" required>
  <input name="Password" type="password" required>
  <input name="Confirm-Password" type="password">
  <input type="submit" value="Create Account">
</form>
```

### **Deployment Process**

1. **Edge Functions Deployment**
```bash
# Deploy to Supabase
supabase functions deploy create-webflow-user
```

2. **CDN Bundle Update**
```bash
# Build and commit
pnpm build:all
git add -A
git commit -m "Update authentication bundles"
git push origin main

# Auto-deployed to jsDelivr CDN
```

---

## **📊 Monitoring & Analytics**

### **Authentication Metrics**
- Registration success/failure rates
- Login attempt monitoring
- Email confirmation rates
- Role distribution (Customer vs Retailer)

### **Error Tracking**
- Supabase authentication errors
- Webflow CMS sync failures
- Edge Function performance
- Form validation issues

### **Performance Monitoring**
- Bundle load times
- Authentication response times
- CDN cache hit rates
- Database query performance

---

## **🔧 Troubleshooting Guide**

### **Common Issues**

**1. Registration Fails**
- Check Supabase project configuration
- Verify email templates are enabled
- Confirm Webflow API token permissions

**2. Login Issues**
- Verify user email confirmation status
- Check Supabase Auth policies
- Confirm password requirements

**3. Content Gating Not Working**
- Verify user role metadata
- Check content gating rules syntax
- Confirm JavaScript initialization

**4. CMS Sync Failures**
- Verify Webflow collection structure
- Check Edge Function environment variables
- Confirm API rate limits

### **Debug Tools**

**Browser Console:**
```javascript
// Check authentication state
const user = await window.NikoPIM.auth.getCurrentUser();
console.log('Current user:', user);

// Test content gating
window.NikoPIM.contentGating.applyGating();
```

**Supabase Dashboard:**
- Monitor authentication attempts
- Check user metadata
- Review Edge Function logs

---

## **🎯 Best Practices**

### **Security**
1. Always use HTTPS in production
2. Implement proper CORS policies
3. Validate user input on both client and server
4. Use DOM removal for sensitive content gating
5. Implement proper error handling without exposing system details

### **Performance**
1. Load authentication packages only when needed
2. Cache user state appropriately
3. Implement proper loading states
4. Use CDN for static assets
5. Monitor bundle sizes regularly

### **User Experience**
1. Provide clear feedback during authentication
2. Implement proper form validation
3. Use appropriate redirects based on user role
4. Handle edge cases gracefully
5. Maintain consistent UI states

### **Development**
1. Use TypeScript for type safety
2. Implement comprehensive error handling
3. Write tests for critical authentication flows
4. Document API endpoints and data structures
5. Follow consistent coding standards

---

## **📈 Future Enhancements**

### **Short Term**
- [ ] Social login integration (Google, Facebook)
- [ ] Two-factor authentication (2FA)
- [ ] Password reset flow
- [ ] Account verification emails

### **Medium Term**
- [ ] Advanced role permissions system
- [ ] API rate limiting
- [ ] Audit logging
- [ ] User activity tracking

### **Long Term**
- [ ] Single Sign-On (SSO) integration
- [ ] Advanced security policies
- [ ] Mobile app authentication
- [ ] Enterprise user management

---

## **🔗 Related Documentation**

- [README.md](./README.md) - Project overview
- [LATEST-FEATURES-STATUS.md](./LATEST-FEATURES-STATUS.md) - Feature implementation status
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Development guidelines
- [CHANGELOG.md](./CHANGELOG.md) - Version history

---

## **💬 Support**

- **🐛 Issues**: [GitHub Issues](https://github.com/jerops/niko-bathrooms-pim/issues)
- **💡 Feature Requests**: [GitHub Discussions](https://github.com/jerops/niko-bathrooms-pim/discussions)  
- **📧 Commercial Support**: support@nikobathrooms.ie

---

<div align="center">
  <p><strong>🛁 Built with ❤️ for Niko Bathrooms</strong></p>
  <p><em>Enterprise-grade authentication for the modern bathroom industry</em></p>
</div>
