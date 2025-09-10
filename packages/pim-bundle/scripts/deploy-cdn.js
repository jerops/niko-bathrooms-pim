#!/usr/bin/env node

/**
 * CDN Deployment Script
 * Automates deployment of optimized bundles to CDN with proper versioning
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const VERSION = '5.1.0';
const CACHE_VERSION = 'v5.1.0';

/**
 * Generate CDN URLs for all bundles
 */
function generateCDNUrls() {
  const distPath = path.join(__dirname, '..', 'dist');
  const bundles = fs.readdirSync(distPath).filter(file => file.endsWith('.min.js'));
  
  const cdnUrls = {
    critical: `https://cdn.jsdelivr.net/gh/jerops/niko-bathrooms-pim@${VERSION}/packages/pim-bundle/dist/niko-pim-critical.min.js`,
    authCore: `https://cdn.jsdelivr.net/gh/jerops/niko-bathrooms-pim@${VERSION}/packages/pim-bundle/dist/niko-pim-auth-core.min.js`,
    wishlistCore: `https://cdn.jsdelivr.net/gh/jerops/niko-bathrooms-pim@${VERSION}/packages/pim-bundle/dist/niko-pim-wishlist-core.min.js`,
    notificationsCore: `https://cdn.jsdelivr.net/gh/jerops/niko-bathrooms-pim@${VERSION}/packages/pim-bundle/dist/niko-pim-notifications-core.min.js`,
    authAdvanced: `https://cdn.jsdelivr.net/gh/jerops/niko-bathrooms-pim@${VERSION}/packages/pim-bundle/dist/niko-pim-auth-advanced.min.js`,
    wishlistAdvanced: `https://cdn.jsdelivr.net/gh/jerops/niko-bathrooms-pim@${VERSION}/packages/pim-bundle/dist/niko-pim-wishlist-advanced.min.js`,
    notificationsAdvanced: `https://cdn.jsdelivr.net/gh/jerops/niko-bathrooms-pim@${VERSION}/packages/pim-bundle/dist/niko-pim-notifications-advanced.min.js`,
    full: `https://cdn.jsdelivr.net/gh/jerops/niko-bathrooms-pim@${VERSION}/packages/pim-bundle/dist/niko-pim-full.min.js`
  };

  // Add optimization parameters
  Object.keys(cdnUrls).forEach(key => {
    cdnUrls[key] += `?cache=1y&compress=auto&minify=true&v=${CACHE_VERSION}`;
  });

  return cdnUrls;
}

/**
 * Generate HTML preload tags for critical resources
 */
function generatePreloadTags() {
  const urls = generateCDNUrls();
  
  return `
<!-- Critical Path Preload -->
<link rel="preload" href="${urls.critical}" as="script" crossorigin="anonymous">
<link rel="preload" href="${urls.authCore}" as="script" crossorigin="anonymous">
<link rel="preload" href="${urls.wishlistCore}" as="script" crossorigin="anonymous">
<link rel="preload" href="${urls.notificationsCore}" as="script" crossorigin="anonymous">

<!-- DNS Prefetch for CDN -->
<link rel="dns-prefetch" href="//cdn.jsdelivr.net">
<link rel="dns-prefetch" href="//fastly.jsdelivr.net">
<link rel="dns-prefetch" href="//gcore.jsdelivr.net">
`;
}

/**
 * Generate usage examples
 */
function generateUsageExamples() {
  const urls = generateCDNUrls();
  
  return `
<!-- Critical Path Loading (Recommended) -->
<script src="${urls.critical}" crossorigin="anonymous"></script>

<!-- Individual Core Bundles -->
<script src="${urls.authCore}" crossorigin="anonymous"></script>
<script src="${urls.wishlistCore}" crossorigin="anonymous"></script>
<script src="${urls.notificationsCore}" crossorigin="anonymous"></script>

<!-- Advanced Bundles (Load on Demand) -->
<script>
// Load advanced features when needed
async function loadAdvancedFeatures() {
  const { CDNLoader } = window.NikoCDNLoader;
  
  // Load advanced auth features
  await CDNLoader.loadAdvancedBundle('niko-pim-auth-advanced.min.js');
  
  // Load advanced wishlist features
  await CDNLoader.loadAdvancedBundle('niko-pim-wishlist-advanced.min.js');
  
  // Load advanced notification features
  await CDNLoader.loadAdvancedBundle('niko-pim-notifications-advanced.min.js');
}

// Load advanced features when user interacts with advanced functionality
document.addEventListener('click', (e) => {
  if (e.target.matches('[data-advanced-feature]')) {
    loadAdvancedFeatures();
  }
});
</script>

<!-- Backward Compatibility -->
<script src="${urls.full}" crossorigin="anonymous"></script>
`;
}

/**
 * Generate cache headers configuration
 */
function generateCacheHeaders() {
  return `
# CDN Cache Headers Configuration

## JavaScript Bundles
Cache-Control: public, max-age=31536000, immutable
ETag: "${CACHE_VERSION}"
Vary: Accept-Encoding
Content-Encoding: gzip

## CSS Files
Cache-Control: public, max-age=31536000, immutable
ETag: "${CACHE_VERSION}"
Vary: Accept-Encoding
Content-Encoding: gzip

## Version Management
- Version: ${VERSION}
- Cache Version: ${CACHE_VERSION}
- Cache Duration: 1 year
- Compression: Automatic
- Minification: Enabled
`;
}

/**
 * Generate performance monitoring configuration
 */
function generatePerformanceConfig() {
  return `
// Performance Monitoring Configuration
const performanceConfig = {
  version: '${VERSION}',
  cacheVersion: '${CACHE_VERSION}',
  cdnEndpoints: {
    primary: 'https://cdn.jsdelivr.net',
    fallback: 'https://fastly.jsdelivr.net',
    regional: {
      us: 'https://cdn.jsdelivr.net',
      eu: 'https://fastly.jsdelivr.net',
      asia: 'https://gcore.jsdelivr.net'
    }
  },
  monitoring: {
    cacheHitRate: '>95%',
    loadTimeTarget: '<1.5s',
    bandwidthReduction: '30%',
    edgeCacheCoverage: '>90%'
  }
};
`;
}

/**
 * Main deployment function
 */
function deployCDN() {
  console.log('🚀 Starting CDN deployment for Niko PIM v5.1.0...\n');

  // Generate all configurations
  const cdnUrls = generateCDNUrls();
  const preloadTags = generatePreloadTags();
  const usageExamples = generateUsageExamples();
  const cacheHeaders = generateCacheHeaders();
  const performanceConfig = generatePerformanceConfig();

  // Create deployment directory
  const deployDir = path.join(__dirname, '..', 'deploy');
  if (!fs.existsSync(deployDir)) {
    fs.mkdirSync(deployDir, { recursive: true });
  }

  // Write configuration files
  fs.writeFileSync(path.join(deployDir, 'cdn-urls.json'), JSON.stringify(cdnUrls, null, 2));
  fs.writeFileSync(path.join(deployDir, 'preload-tags.html'), preloadTags);
  fs.writeFileSync(path.join(deployDir, 'usage-examples.html'), usageExamples);
  fs.writeFileSync(path.join(deployDir, 'cache-headers.txt'), cacheHeaders);
  fs.writeFileSync(path.join(deployDir, 'performance-config.js'), performanceConfig);

  // Generate deployment summary
  const summary = `
# CDN Deployment Summary

## Version Information
- Version: ${VERSION}
- Cache Version: ${CACHE_VERSION}
- Deployment Date: ${new Date().toISOString()}

## Bundle URLs
${Object.entries(cdnUrls).map(([key, url]) => `- ${key}: ${url}`).join('\n')}

## Performance Targets
- Cache Hit Rate: >95%
- Global Load Time: <1.5s
- Bandwidth Reduction: 30%
- Edge Cache Coverage: >90%

## Regional Performance
- Americas: <1.2s average load time
- Europe: <1.0s average load time
- Asia-Pacific: <1.8s average load time
- Mobile Networks: <2.0s on 3G

## Files Generated
- cdn-urls.json: All CDN URLs with optimization parameters
- preload-tags.html: HTML preload tags for critical resources
- usage-examples.html: Implementation examples
- cache-headers.txt: Cache configuration
- performance-config.js: Performance monitoring setup

## Next Steps
1. Deploy bundles to GitHub repository
2. Configure CDN cache headers
3. Set up performance monitoring
4. Test CDN delivery from different regions
5. Validate performance targets
`;

  fs.writeFileSync(path.join(deployDir, 'deployment-summary.md'), summary);

  console.log('✅ CDN deployment configuration generated successfully!');
  console.log(`📁 Files created in: ${deployDir}`);
  console.log('\n📊 CDN URLs Generated:');
  Object.entries(cdnUrls).forEach(([key, url]) => {
    console.log(`   ${key}: ${url}`);
  });
  
  console.log('\n🎯 Performance Targets:');
  console.log('   Cache Hit Rate: >95%');
  console.log('   Global Load Time: <1.5s');
  console.log('   Bandwidth Reduction: 30%');
  console.log('   Edge Cache Coverage: >90%');
  
  console.log('\n🚀 Ready for deployment!');
}

// Run deployment
deployCDN();
