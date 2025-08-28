import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';

export default {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/index.js',
      format: 'es',
      sourcemap: true
    },
    {
      file: 'dist/index.min.js',
      format: 'iife',
      name: 'NikoContentGating',
      sourcemap: true,
      plugins: [terser()]
    }
  ],
  plugins: [
    resolve(),
    commonjs(),
    typescript({
      tsconfig: './tsconfig.json'
    })
  ]
};