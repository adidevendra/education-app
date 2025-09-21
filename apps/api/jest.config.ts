import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/*.spec.ts', '!**/*.vitest.ts', '!**/test/security.spec.ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'json'],
  moduleNameMapper: {
    '^@app/(.*)$': '<rootDir>/src/$1',
    '^@repo/types$': '<rootDir>/../../packages/types/index.ts',
    '^@education/player$': '<rootDir>/../../packages/player/index.tsx',
  },
  setupFiles: ['<rootDir>/jest.setup.env.ts'],
  verbose: true,
};
export default config;
