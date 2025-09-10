/**
 * Core Auth Bundle - Optimized for Size
 * Contains only essential authentication functionality
 */

import { CoreAuthManager } from '@nikobathrooms/auth/core';

// Make available globally for backward compatibility
window.NikoAuthCore = CoreAuthManager;
window.NikoAuth = CoreAuthManager;

console.log('Niko Auth Core Bundle v1.0.0 loaded (optimized for size)');
