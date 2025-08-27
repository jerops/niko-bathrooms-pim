# @nikobathrooms/custom-css

Core CSS utilities and design tokens for the Niko Bathrooms PIM system.

## Features

- 🎨 **Design Tokens** - Comprehensive CSS custom properties for colors, spacing, typography
- 📱 **Modern Reset** - Clean, modern CSS reset based on modern-normalize
- 🏗️ **Base Styles** - Sensible defaults for HTML elements
- ⚡ **Utility Classes** - Comprehensive utility classes for rapid development
- 📐 **Consistent Spacing** - Systematic spacing scale
- 🎯 **Component Ready** - Designed to work with component packages

## Installation

```bash
pnpm add @nikobathrooms/custom-css
```

## Usage

### Import All Styles

```css
@import '@nikobathrooms/custom-css';
```

### Import Specific Parts

```css
/* Just the design tokens */
@import '@nikobathrooms/custom-css/src/variables.css';

/* Just the reset */
@import '@nikobathrooms/custom-css/src/reset.css';

/* Just the utilities */
@import '@nikobathrooms/custom-css/src/utilities.css';
```

### Using Design Tokens

```css
.my-component {
  color: var(--niko-primary-600);
  background-color: var(--niko-gray-50);
  padding: var(--niko-space-4);
  border-radius: var(--niko-radius-lg);
  box-shadow: var(--niko-shadow-md);
  transition: all var(--niko-transition-normal);
}

.my-component:hover {
  background-color: var(--niko-primary-50);
  transform: translateY(-2px);
}
```

### Using Utility Classes

```html
<div class="niko-container niko-py-8">
  <div class="niko-bg-white niko-rounded-lg niko-shadow-md niko-p-6">
    <h2 class="niko-text-2xl niko-font-semibold niko-text-gray-900 niko-mb-4">
      Product Card
    </h2>
    <p class="niko-text-gray-600 niko-mb-6">
      Beautiful product description here.
    </p>
    <button class="niko-bg-primary-500 niko-text-white niko-px-6 niko-py-3 niko-rounded-md niko-transition-colors hover:niko-bg-primary-600">
      Add to Wishlist
    </button>
  </div>
</div>
```

## Design Tokens

### Colors

**Brand Colors:**
- `--niko-primary-*` (50-900) - Primary blue colors
- `--niko-success-*` - Green colors for success states
- `--niko-warning-*` - Orange colors for warnings
- `--niko-error-*` - Red colors for errors
- `--niko-gray-*` (50-900) - Neutral gray colors

**Functional Colors:**
- `--niko-wishlist-add` - Color for add to wishlist actions
- `--niko-wishlist-remove` - Color for remove from wishlist
- `--niko-auth-primary` - Primary color for auth components

### Typography

**Font Sizes:**
- `--niko-text-xs` to `--niko-text-4xl` - Systematic font size scale

**Font Weights:**
- `--niko-font-light` (300) to `--niko-font-bold` (700)

**Line Heights:**
- `--niko-leading-tight` to `--niko-leading-loose`

### Spacing

**Scale:**
- `--niko-space-0` (0) to `--niko-space-24` (96px)
- Consistent 4px-based scale

### Other Tokens

- **Border Radius:** `--niko-radius-*`
- **Shadows:** `--niko-shadow-*`
- **Transitions:** `--niko-transition-*`
- **Z-Index:** `--niko-z-*`

## Utility Classes

### Layout
- `.niko-container` - Max-width container with padding
- `.niko-flex`, `.niko-grid` - Display utilities
- `.niko-items-*`, `.niko-justify-*` - Flexbox utilities

### Spacing
- `.niko-m-*`, `.niko-p-*` - Margin and padding
- `.niko-mt-*`, `.niko-px-*` - Directional spacing

### Typography
- `.niko-text-*` - Font sizes and colors
- `.niko-font-*` - Font weights
- `.niko-text-center` - Text alignment

### Colors
- `.niko-bg-*` - Background colors
- `.niko-text-*` - Text colors
- `.niko-border-*` - Border colors

### Effects
- `.niko-shadow-*` - Box shadows
- `.niko-rounded-*` - Border radius
- `.niko-transition-*` - Transitions

## Responsive Design

Utilities include responsive variants:

```html
<!-- Hidden on mobile, visible on tablet+ -->
<div class="niko-hidden niko-md:block">
  Desktop content
</div>
```

**Breakpoints:**
- `sm`: 640px+
- `md`: 768px+
- `lg`: 1024px+

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## License

MIT