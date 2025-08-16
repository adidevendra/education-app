import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['pages/index.tsx'],
  format: ['cjs', 'esm'],
  dts: true,
  sourcemap: true,
  clean: true,
});
