import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';

export default [
  // Core bundle
  {
    input: 'src/core/index.ts',
    external: ['@supabase/supabase-js', '@nikobathrooms/core'],
    output: [
      {
        file: 'dist/core/index.js',
        format: 'es',
        sourcemap: true
      },
      {
        file: 'dist/core/index.min.js',
        format: 'iife',
        name: 'NikoWishlistCore',
        sourcemap: true,
        globals: {
          '@supabase/supabase-js': 'supabase',
          '@nikobathrooms/core': 'NikoCore'
        },
        plugins: [terser()]
      }
    ],
    plugins: [
      resolve(),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false,
        declarationMap: false
      })
    ]
  },
  // Advanced bundle
  {
    input: 'src/advanced/index.ts',
    external: ['@supabase/supabase-js', '@nikobathrooms/core'],
    output: [
      {
        file: 'dist/advanced/index.js',
        format: 'es',
        sourcemap: true
      },
      {
        file: 'dist/advanced/index.min.js',
        format: 'iife',
        name: 'NikoWishlistAdvanced',
        sourcemap: true,
        globals: {
          '@supabase/supabase-js': 'supabase',
          '@nikobathrooms/core': 'NikoCore'
        },
        plugins: [terser()]
      }
    ],
    plugins: [
      resolve(),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false,
        declarationMap: false
      })
    ]
  },
  // Main bundle
  {
    input: 'src/index.ts',
    external: ['@supabase/supabase-js', '@nikobathrooms/core'],
    output: [
      {
        file: 'dist/index.js',
        format: 'es',
        sourcemap: true
      },
      {
        file: 'dist/index.min.js',
        format: 'iife',
        name: 'NikoWishlist',
        sourcemap: true,
        globals: {
          '@supabase/supabase-js': 'supabase',
          '@nikobathrooms/core': 'NikoCore'
        },
        plugins: [terser()]
      }
    ],
    plugins: [
      resolve(),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false,
        declarationMap: false
      })
    ]
  }
];