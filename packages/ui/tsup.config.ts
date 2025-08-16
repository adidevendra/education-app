import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['index.tsx'],
  format: ['cjs', 'esm'],
  dts: true,
  sourcemap: true,
  clean: true,
});
