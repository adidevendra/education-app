import { defineConfig } from 'orval';

export default defineConfig({
  openindia: {
    input: 'apps/api/openapi.yaml',
    output: {
      target: 'packages/sdk/src/clients/openindia.ts',
      client: 'fetch',
      clean: true,
      override: {
        mutator: {
          path: 'packages/sdk/src/runtime.ts',
          name: 'authorizedFetcher',
        },
      },
    },
    hooks: {
      afterAllFilesWrite: ['prettier --write packages/sdk/src/clients/openindia.ts'],
    },
  },
});
