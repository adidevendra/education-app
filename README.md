# LMSaaS Turborepo Monorepo

This repository is a TypeScript-first Turborepo monorepo for a Learning Management System as a Service (LMSaaS).

## Structure

- **apps/api**: NestJS API
- **apps/web-openindia**: Next.js web app
- **apps/web-ssu**: Next.js web app
- **apps/mobile**: Expo/React Native app
- **packages/ui**: Shared React UI kit (Tailwind + Radix)
- **packages/config**: Shared config (tsconfig, eslint, prettier)
- **packages/types**: Zod schemas + TypeScript types
- **packages/player**: Web player components
- **packages/sdk**: Typed client for API
- **packages/i18n**: i18next + ICU
- **packages/auth**: Auth helpers

## Tooling

- **pnpm** for package management
- **TypeScript** strict mode
- **eslint + prettier** for linting/formatting
- **commitlint + husky** for pre-commit lint + test
- **Changesets** for versioning
- **Vitest** for tests
- **GitHub Actions** for CI (build, lint, test on PRs)

## Getting Started

1. Install dependencies:
   ```sh
   pnpm install
   ```
2. Run dev scripts for each app:
   ```sh
   pnpm dev --filter <app>
   ```
3. Lint, test, and build:
   ```sh
   pnpm lint
   pnpm test
   pnpm build
   ```

## Contributing

- All code must pass lint and tests before commit (enforced by husky)
- Use Changesets for versioning

---

Replace placeholder code in each package/app with your implementation.
