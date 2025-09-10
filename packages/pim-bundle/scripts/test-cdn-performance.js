#!/usr/bin/env node

/**
 * CDN Performance Testing Script
 * Tests CDN delivery performance and validates optimization targets
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const VERSION = '5.1.0';
const CACHE_VERSION = 'v5.1.0';

/**
 * Test CDN endpoint performance
 */
async function testCDNEndpoint(url, region = 'unknown') {
  const startTime = Date.now();
  
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      headers: {
        'User-Agent': 'Niko-PIM-Performance-Test/1.0'
      }
    });
    
    const endTime = Date.now();
    const loadTime = endTime - startTime;
    
    return {
      url,
      region,
      status: response.status,
      loadTime,
      success: response.ok,
      headers: {
        'cache-control': response.headers.get('cache-control'),
        'etag': response.headers.get('etag'),
        'content-encoding': response.headers.get('content-encoding'),
        'content-length': response.headers.get('content-length')
      }
    };
  } catch (error) {
    return {
      url,
      region,
      status: 0,
      loadTime: Date.now() - startTime,
      success: false,
      error: error.message
    };
  }
}

/**
 * Test all CDN endpoints
 */
async function testAllCDNEndpoints() {
  console.log('🧪 Testing CDN performance...\n');

  const cdnEndpoints = {
    'us': 'https://cdn.jsdelivr.net',
    'eu': 'https://fastly.jsdelivr.net',
    'asia': 'https://gcore.jsdelivr.net'
  };

  const bundles = [
    'niko-pim-critical.min.js',
    'niko-pim-auth-core.min.js',
    'niko-pim-wishlist-core.min.js',
    'niko-pim-notifications-core.min.js'
  ];

  const results = [];

  for (const [region, cdn] of Object.entries(cdnEndpoints)) {
    console.log(`🌍 Testing ${region.toUpperCase()} region (${cdn})...`);
    
    for (const bundle of bundles) {
      const url = `${cdn}/gh/jerops/niko-bathrooms-pim@${VERSION}/packages/pim-bundle/dist/${bundle}?cache=1y&compress=auto&minify=true&v=${CACHE_VERSION}`;
      
      const result = await testCDNEndpoint(url, region);
      results.push(result);
      
      const status = result.success ? '✅' : '❌';
      console.log(`   ${status} ${bundle}: ${result.loadTime}ms (${result.status})`);
    }
    
    console.log('');
  }

  return results;
}

/**
 * Analyze performance results
 */
function analyzeResults(results) {
  console.log('📊 Performance Analysis:\n');

  // Group by region
  const byRegion = results.reduce((acc, result) => {
    if (!acc[result.region]) acc[result.region] = [];
    acc[result.region].push(result);
    return acc;
  }, {});

  // Calculate averages
  Object.entries(byRegion).forEach(([region, regionResults]) => {
    const successful = regionResults.filter(r => r.success);
    const avgLoadTime = successful.reduce((sum, r) => sum + r.loadTime, 0) / successful.length;
    const successRate = (successful.length / regionResults.length) * 100;
    
    console.log(`🌍 ${region.toUpperCase()} Region:`);
    console.log(`   Average Load Time: ${avgLoadTime.toFixed(2)}ms`);
    console.log(`   Success Rate: ${successRate.toFixed(1)}%`);
    console.log(`   Target: <1500ms (${avgLoadTime < 1500 ? '✅' : '❌'})`);
    console.log('');
  });

  // Overall statistics
  const allSuccessful = results.filter(r => r.success);
  const overallAvgLoadTime = allSuccessful.reduce((sum, r) => sum + r.loadTime, 0) / allSuccessful.length;
  const overallSuccessRate = (allSuccessful.length / results.length) * 100;

  console.log('📈 Overall Performance:');
  console.log(`   Average Load Time: ${overallAvgLoadTime.toFixed(2)}ms`);
  console.log(`   Success Rate: ${overallSuccessRate.toFixed(1)}%`);
  console.log(`   Global Target: <1500ms (${overallAvgLoadTime < 1500 ? '✅' : '❌'})`);
  console.log(`   Success Rate Target: >95% (${overallSuccessRate > 95 ? '✅' : '❌'})`);

  // Check cache headers
  const cacheHeaders = allSuccessful.filter(r => 
    r.headers['cache-control'] && 
    r.headers['cache-control'].includes('max-age=31536000')
  );
  const cacheHeaderRate = (cacheHeaders.length / allSuccessful.length) * 100;
  
  console.log(`   Cache Headers: ${cacheHeaderRate.toFixed(1)}% (${cacheHeaderRate > 95 ? '✅' : '❌'})`);

  return {
    overallAvgLoadTime,
    overallSuccessRate,
    cacheHeaderRate,
    targets: {
      loadTime: overallAvgLoadTime < 1500,
      successRate: overallSuccessRate > 95,
      cacheHeaders: cacheHeaderRate > 95
    }
  };
}

/**
 * Generate performance report
 */
function generatePerformanceReport(results, analysis) {
  const report = `
# CDN Performance Test Report

## Test Configuration
- Version: ${VERSION}
- Cache Version: ${CACHE_VERSION}
- Test Date: ${new Date().toISOString()}
- Total Tests: ${results.length}

## Performance Results

### Overall Performance
- Average Load Time: ${analysis.overallAvgLoadTime.toFixed(2)}ms
- Success Rate: ${analysis.overallSuccessRate.toFixed(1)}%
- Cache Headers: ${analysis.cacheHeaderRate.toFixed(1)}%

### Targets Status
- Load Time <1.5s: ${analysis.targets.loadTime ? '✅ PASS' : '❌ FAIL'}
- Success Rate >95%: ${analysis.targets.successRate ? '✅ PASS' : '❌ FAIL'}
- Cache Headers >95%: ${analysis.targets.cacheHeaders ? '✅ PASS' : '❌ FAIL'}

### Regional Performance
${Object.entries(results.reduce((acc, result) => {
  if (!acc[result.region]) acc[result.region] = [];
  acc[result.region].push(result);
  return acc;
}, {})).map(([region, regionResults]) => {
  const successful = regionResults.filter(r => r.success);
  const avgLoadTime = successful.reduce((sum, r) => sum + r.loadTime, 0) / successful.length;
  const successRate = (successful.length / regionResults.length) * 100;
  
  return `
#### ${region.toUpperCase()}
- Average Load Time: ${avgLoadTime.toFixed(2)}ms
- Success Rate: ${successRate.toFixed(1)}%
- Target: <1500ms (${avgLoadTime < 1500 ? '✅' : '❌'})`;
}).join('')}

### Detailed Results
${results.map(result => `
- **${result.region.toUpperCase()}** - ${result.url.split('/').pop()}
  - Status: ${result.status}
  - Load Time: ${result.loadTime}ms
  - Success: ${result.success ? '✅' : '❌'}
  - Cache Control: ${result.headers['cache-control'] || 'N/A'}
  - ETag: ${result.headers['etag'] || 'N/A'}
`).join('')}

## Recommendations
${!analysis.targets.loadTime ? '- Optimize CDN configuration for faster load times\n' : ''}
${!analysis.targets.successRate ? '- Investigate failed requests and improve reliability\n' : ''}
${!analysis.targets.cacheHeaders ? '- Ensure proper cache headers are set on all bundles\n' : ''}
${analysis.targets.loadTime && analysis.targets.successRate && analysis.targets.cacheHeaders ? '- All performance targets met! ✅\n' : ''}
`;

  return report;
}

/**
 * Main testing function
 */
async function testCDNPerformance() {
  console.log('🚀 Starting CDN performance testing...\n');

  try {
    // Test all CDN endpoints
    const results = await testAllCDNEndpoints();
    
    // Analyze results
    const analysis = analyzeResults(results);
    
    // Generate report
    const report = generatePerformanceReport(results, analysis);
    
    // Save report
    const reportPath = path.join(__dirname, '..', 'deploy', 'performance-report.md');
    fs.writeFileSync(reportPath, report);
    
    console.log('📊 Performance test completed!');
    console.log(`📁 Report saved to: ${reportPath}`);
    
    // Summary
    const allTargetsMet = Object.values(analysis.targets).every(target => target);
    console.log(`\n🎯 All Performance Targets: ${allTargetsMet ? '✅ MET' : '❌ NOT MET'}`);
    
    if (allTargetsMet) {
      console.log('🎉 CDN optimization successful!');
    } else {
      console.log('⚠️ Some performance targets not met. Check report for details.');
    }
    
  } catch (error) {
    console.error('❌ Performance testing failed:', error);
    process.exit(1);
  }
}

// Run performance test
testCDNPerformance();
