# @nikobathrooms/core

Core utilities and types for the Niko Bathrooms PIM system.

## Features

- 🎯 **TypeScript Types** - Comprehensive type definitions for users, products, and API responses
- 🛠 **DOM Utilities** - Safe DOM manipulation helpers
- ✅ **Validation** - Email, password, and form validation utilities
- 📊 **Logging** - Structured logging with context support
- ⚙️ **Constants** - Webflow collection IDs, API endpoints, and configuration

## Installation

```bash
pnpm add @nikobathrooms/core
```

## Usage

### Types

```typescript
import { User, Product, AuthState } from '@nikobathrooms/core';

const user: User = {
  id: '123',
  email: 'user@example.com',
  name: 'John Doe',
  role: 'customer',
  supabaseUID: 'abc123',
  webflowID: 'def456',
  isActive: true,
  registrationDate: new Date(),
  wishlistProducts: [],
};
```

### Validation

```typescript
import { validateEmail, validatePassword } from '@nikobathrooms/core';

const emailResult = validateEmail('user@example.com');
if (!emailResult.isValid) {
  console.log(emailResult.errors);
}
```

### DOM Utilities

```typescript
import { querySelector, addEventListener } from '@nikobathrooms/core';

const button = querySelector<HTMLButtonElement>('.my-button');
if (button) {
  const cleanup = addEventListener(button, 'click', () => {
    console.log('Button clicked!');
  });
}
```

### Constants

```typescript
import { WEBFLOW_CONFIG, ROUTES } from '@nikobathrooms/core';

console.log(WEBFLOW_CONFIG.COLLECTIONS.PRODUCTS);
console.log(ROUTES.CUSTOMER.DASHBOARD);
```

### Logging

```typescript
import { createLogger } from '@nikobathrooms/core';

const logger = createLogger('my-module');
logger.info('Operation completed', { userId: '123' });
logger.error('Operation failed', error, { context: 'additional info' });
```

## API Reference

### Types

- `User`, `Customer`, `Retailer` - User-related types
- `Product`, `ProductFilter`, `Wishlist` - Product-related types
- `APIResponse`, `WebflowCollectionItem` - API response types

### Constants

- `WEBFLOW_CONFIG` - Webflow collection IDs and configuration
- `SUPABASE_CONFIG` - Supabase configuration
- `ROUTES` - Application route constants
- `API_ENDPOINTS` - API endpoint constants

### Utilities

- `querySelector`, `querySelectorAll` - Safe DOM querying
- `addEventListener` - Event listener with cleanup
- `validateEmail`, `validatePassword`, `validateForm` - Validation helpers
- `createLogger`, `logger` - Logging utilities

## License

MIT