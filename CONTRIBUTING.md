# Contributing to Niko Bathrooms PIM

Thank you for your interest in contributing to the Niko Bathrooms PIM system! This guide will help you get started with contributing to our modular architecture.

## 🎨 Architecture Overview

This project uses a **monorepo architecture** with independent packages. Each package has a specific responsibility and can be developed, tested, and deployed independently.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- pnpm 8+ (required for workspace management)
- Git

### Setup Development Environment

```bash
# Clone the repository
git clone https://github.com/jerops/niko-bathrooms-pim.git
cd niko-bathrooms-pim

# Install dependencies for all packages
pnpm install

# Build all packages
pnpm build:all

# Run tests
pnpm test

# Run linting
pnpm lint
```

### Environment Configuration

Copy `.env.example` to `.env` and configure:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
WEBFLOW_API_TOKEN=your_webflow_api_token
WEBFLOW_SITE_ID=67378d122c9df01858dd36f6
```

## 📦 Package Development

### Working with Individual Packages

```bash
# Build specific package
pnpm --filter @nikobathrooms/core build

# Test specific package
pnpm --filter @nikobathrooms/auth test

# Develop with watch mode
pnpm --filter @nikobathrooms/auth dev
```

### Creating a New Package

1. **Create Package Structure:**

```bash
# Create package directory
mkdir packages/my-new-package
cd packages/my-new-package

# Create basic structure
mkdir -p src/{actions,utils,types}
touch src/index.ts
touch package.json
touch README.md
```

2. **Package.json Template:**

```json
{
  "name": "@nikobathrooms/my-new-package",
  "version": "1.0.0",
  "description": "Description of package functionality",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
  },
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "test": "vitest",
    "lint": "eslint src/",
    "type-check": "tsc --noEmit",
    "clean": "rm -rf dist"
  },
  "dependencies": {
    "@nikobathrooms/core": "workspace:*"
  },
  "devDependencies": {
    "typescript": "^5.4.2",
    "vitest": "^1.4.0"
  },
  "keywords": ["pim", "nikobathrooms"],
  "author": "Niko Bathrooms",
  "license": "MIT"
}
```

3. **TypeScript Configuration:**

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "noEmit": false
  },
  "include": ["src/**/*"],
  "exclude": ["dist", "**/*.test.ts"]
}
```

### Package Naming Convention

- **JavaScript packages:** `@nikobathrooms/feature-name`
- **CSS packages:** `@nikobathrooms/css-feature-name`
- **Examples:** `@nikobathrooms/auth`, `@nikobathrooms/custom-css`

## 🎨 CSS Package Development

### CSS Package Structure

```
packages/my-css-package/
├── src/
│   ├── components/
│   ├── utilities/
│   └── index.css
├── package.json
└── README.md
```

### CSS Naming Convention

- **Prefix all classes:** `.niko-*`
- **Use CSS custom properties:** `var(--niko-*)`
- **BEM methodology:** `.niko-component__element--modifier`

**Examples:**
```css
/* Good */
.niko-button {
  background-color: var(--niko-primary-500);
  padding: var(--niko-space-2) var(--niko-space-4);
}

.niko-button--large {
  padding: var(--niko-space-3) var(--niko-space-6);
}

/* Avoid */
.button { /* No prefix */ }
.btn-primary { /* Not following convention */ }
```

## 🧪 Testing Guidelines

### Unit Tests

```typescript
// src/utils/validation.test.ts
import { describe, it, expect } from 'vitest';
import { validateEmail } from './validation.js';

describe('validateEmail', () => {
  it('should validate correct email addresses', () => {
    const result = validateEmail('user@example.com');
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
  
  it('should reject invalid email addresses', () => {
    const result = validateEmail('invalid-email');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Please enter a valid email address');
  });
});
```

### Integration Tests

```typescript
// src/auth/auth.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { AuthManager } from './auth.js';

describe('AuthManager Integration', () => {
  let authManager: AuthManager;
  
  beforeEach(() => {
    authManager = new AuthManager();
  });
  
  it('should register and login user', async () => {
    const registerResult = await authManager.register({
      email: 'test@example.com',
      password: 'SecurePass123',
      name: 'Test User',
      role: 'customer'
    });
    
    expect(registerResult.success).toBe(true);
  });
});
```

## 📝 Code Style Guidelines

### TypeScript

- **Use strict TypeScript:** Enable all strict options
- **Explicit types:** Prefer explicit return types for public functions
- **Async/await:** Use async/await over Promises
- **Error handling:** Always handle errors gracefully

```typescript
// Good
export async function getUserById(id: string): Promise<User | null> {
  try {
    const response = await api.get(`/users/${id}`);
    return response.data;
  } catch (error) {
    logger.error('Failed to fetch user', error);
    return null;
  }
}

// Avoid
export function getUserById(id) { // No types
  return api.get(`/users/${id}`).then(response => response.data); // Promise chains
}
```

### Import/Export

- **Named exports:** Prefer named exports over default exports
- **Explicit imports:** Import only what you need
- **File extensions:** Always use `.js` extension in imports (for ESM compatibility)

```typescript
// Good
import { validateEmail, validatePassword } from './validation.js';
export { AuthManager } from './auth-manager.js';

// Avoid
import * as validation from './validation'; // Wildcard imports
export default AuthManager; // Default exports
```

### CSS

- **Mobile-first:** Write CSS mobile-first with min-width media queries
- **Custom properties:** Use CSS custom properties for theming
- **Logical properties:** Use logical properties when possible

```css
/* Good */
.niko-card {
  padding-block: var(--niko-space-4);
  padding-inline: var(--niko-space-6);
  border-radius: var(--niko-radius-lg);
}

@media (min-width: 768px) {
  .niko-card {
    padding-block: var(--niko-space-6);
  }
}

/* Avoid */
.niko-card {
  padding-top: 16px; /* Hard-coded values */
  padding-bottom: 16px;
  padding-left: 24px;
  padding-right: 24px;
}
```

## 🔄 Git Workflow

### Branch Naming

- **Features:** `feat/package-name/feature-description`
- **Fixes:** `fix/package-name/issue-description`
- **Docs:** `docs/package-name/update-description`

**Examples:**
- `feat/auth/social-login`
- `fix/wishlist/duplicate-items`
- `docs/core/api-reference`

### Commit Messages

Use [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Format
<type>(scope): <description>

# Examples
feat(auth): add social media login support
fix(wishlist): prevent duplicate product additions
docs(core): update API documentation
style(custom-css): improve button hover animations
test(product-search): add integration tests
```

### Pull Request Process

1. **Create feature branch** from `main`
2. **Make changes** following code style guidelines
3. **Add tests** for new functionality
4. **Update documentation** if needed
5. **Run checks:** `pnpm lint && pnpm type-check && pnpm test`
6. **Create pull request** with descriptive title and description
7. **Request review** from maintainers
8. **Address feedback** and make necessary changes
9. **Merge** after approval

### Pull Request Template

```markdown
## 🎨 Description

Brief description of changes and motivation.

## 📋 Type of Change

- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## 🧪 Testing

- [ ] Tests pass locally
- [ ] Added tests for new functionality
- [ ] Manual testing completed

## 📋 Checklist

- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes (or properly documented)
```

## 📊 Release Process

We use [Changesets](https://github.com/changesets/changesets) for version management:

```bash
# Add changeset for your changes
pnpm changeset

# Version packages (maintainers only)
pnpm changeset version

# Publish to npm (maintainers only)
pnpm release
```

## 🐛 Issue Reporting

### Bug Reports

**Use the bug report template:**

```markdown
## 🐛 Bug Description

A clear and concise description of the bug.

## 🔄 Steps to Reproduce

1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

## ✅ Expected Behavior

What you expected to happen.

## 📱 Environment

- Package version:
- Browser:
- OS:
- Node.js version:
```

### Feature Requests

**Use the feature request template:**

```markdown
## 🎨 Feature Description

Clear description of the feature you'd like to see.

## 🤔 Motivation

Why would this feature be useful? What problem does it solve?

## 📝 Proposed Solution

Describe how you envision this feature working.

## 🗺️ Additional Context

Any other context, screenshots, or examples.
```

## 🤝 Community Guidelines

- **Be respectful** and constructive in all interactions
- **Follow the code of conduct**
- **Help others** by answering questions and reviewing PRs
- **Keep discussions focused** on the project
- **Use appropriate labels** for issues and PRs

## 📋 Resources

- **Architecture Documentation:** [docs/architecture.md](docs/architecture.md)
- **API Documentation:** [docs/api/](docs/api/)
- **Design System:** [docs/design-system.md](docs/design-system.md)
- **Deployment Guide:** [docs/deployment.md](docs/deployment.md)

## 📞 Getting Help

- **GitHub Discussions:** For questions and general discussion
- **GitHub Issues:** For bug reports and feature requests
- **Email:** support@nikobathrooms.ie

---

**Thank you for contributing to Niko Bathrooms PIM!** 🚀