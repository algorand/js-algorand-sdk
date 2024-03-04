import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    algosdk: 'src/index.ts',
  },
  format: ['esm', 'cjs', 'iife'],
  target: 'es2020',
  sourcemap: true,
  dts: true,
  minify: true,
});
