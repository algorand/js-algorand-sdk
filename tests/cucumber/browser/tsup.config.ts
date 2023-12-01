import { defineConfig } from 'tsup';
import path from 'path';

export default defineConfig({
  entry: [path.resolve(__dirname, 'test.js')],
  format: ['esm', 'cjs', 'iife'],
  target: 'es2020',
  sourcemap: true,
  dts: true,
  minify: true,
  platform: 'browser',
  outDir: path.resolve(__dirname, 'build'),
});
