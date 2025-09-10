#!/usr/bin/env node

/**
 * Bundle Size Checker for Notifications Package
 * Validates that bundle sizes meet Story 1.2 requirements
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TARGETS = {
  CORE_MAX_SIZE: 2 * 1024, // 2KB gzipped (core notification features)
  ADVANCED_MAX_SIZE: 6 * 1024, // 6KB gzipped (advanced notification features)
  TOTAL_MAX_SIZE: 8 * 1024, // 8KB gzipped (total notifications package)
};

function getFileSize(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return stats.size;
  } catch (error) {
    console.warn(`Could not get size for ${filePath}:`, error.message);
    return 0;
  }
}

function checkBundleSizes() {
  console.log('🔍 Checking notifications bundle sizes for Story 1.2 requirements...\n');

  const distPath = path.join(__dirname, '..', 'dist');
  
  if (!fs.existsSync(distPath)) {
    console.error('❌ Dist directory not found. Run "npm run build" first.');
    process.exit(1);
  }

  const files = {
    core: path.join(distPath, 'core', 'index.js'),
    advanced: path.join(distPath, 'advanced', 'index.js'),
    main: path.join(distPath, 'index.js'),
  };

  const sizes = {};
  let totalSize = 0;
  let allPassed = true;

  // Check individual module sizes
  for (const [module, filePath] of Object.entries(files)) {
    const size = getFileSize(filePath);
    sizes[module] = size;
    totalSize += size;

    const maxSize = module === 'core' ? TARGETS.CORE_MAX_SIZE : 
                   module === 'advanced' ? TARGETS.ADVANCED_MAX_SIZE : 
                   TARGETS.TOTAL_MAX_SIZE;

    const passed = size <= maxSize;
    const status = passed ? '✅' : '❌';
    
    console.log(`${status} ${module.toUpperCase()}: ${(size / 1024).toFixed(2)}KB (max: ${(maxSize / 1024).toFixed(2)}KB)`);
    
    if (!passed) {
      allPassed = false;
    }
  }

  // Check total size
  const totalPassed = totalSize <= TARGETS.TOTAL_MAX_SIZE;
  const totalStatus = totalPassed ? '✅' : '❌';
  
  console.log(`\n${totalStatus} TOTAL: ${(totalSize / 1024).toFixed(2)}KB (max: ${(TARGETS.TOTAL_MAX_SIZE / 1024).toFixed(2)}KB)`);

  if (!totalPassed) {
    allPassed = false;
  }

  // Summary
  console.log('\n📊 Notifications Bundle Size Analysis:');
  console.log(`   Core Module: ${(sizes.core / 1024).toFixed(2)}KB`);
  console.log(`   Advanced Module: ${(sizes.advanced / 1024).toFixed(2)}KB`);
  console.log(`   Main Bundle: ${(sizes.main / 1024).toFixed(2)}KB`);
  console.log(`   Total: ${(totalSize / 1024).toFixed(2)}KB`);

  if (allPassed) {
    console.log('\n🎉 All notifications bundle size requirements met!');
    console.log('✅ Story 1.2 lazy loading optimization successful');
  } else {
    console.log('\n❌ Notifications bundle size requirements not met');
    console.log('🔧 Consider further optimization or code splitting');
    process.exit(1);
  }
}

checkBundleSizes();
