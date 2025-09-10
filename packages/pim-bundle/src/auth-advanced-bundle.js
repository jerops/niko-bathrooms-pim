/**
 * Advanced Auth Bundle - Loaded On Demand
 * Contains registration and advanced authentication features
 */

import { AdvancedAuthManager, EmailConfirmationHandler } from '@nikobathrooms/auth/advanced';

// Make available globally for advanced features
window.NikoAuthAdvanced = AdvancedAuthManager;
window.NikoEmailConfirmationHandler = EmailConfirmationHandler;

console.log('Niko Auth Advanced Bundle v1.0.0 loaded (on demand)');
