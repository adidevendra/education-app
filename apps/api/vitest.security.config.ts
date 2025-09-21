import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['test/security.spec.ts'],
    environment: 'node',
    globals: true,
  },
});
