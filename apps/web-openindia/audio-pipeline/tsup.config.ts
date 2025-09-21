import {defineConfig} from 'tsup';

export default defineConfig({
  entry: ['src/server.ts'],
  format: ['cjs'],
  outDir: 'dist',
  dts: false,
  sourcemap: false,
  clean: true,
});
