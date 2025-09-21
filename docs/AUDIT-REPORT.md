# Monorepo Audit Report

**Timestamp (UTC):** Sun Sep 21 08:54:44 UTC 2025

## Repository Overview

### Workspaces
- `apps/*`: api, mobile, web-openindia, web-ssu
- `packages/*`: auth, config, i18n, player, sdk, types, ui

### Root Scripts
- `dev`: turbo run dev
- `build`: turbo run build
- `typecheck`: turbo run typecheck
- `lint`: turbo run lint
- `test`: turbo run test
- `test:unit`: turbo run test (packages/*, apps/api)
- `test:e2e`: docker compose up + apps/api e2e in-memory + playwright
- `posttest:e2e`: docker compose down
- `generate:sdk`, `generate`, `check:sdk-drift`
- Demo utilities: `align:demo`, `translate:demo`, `tts:demo`

### Application Packages
- **apps/api (`education-api`)**
  - Key scripts: `dev`, `dev:inmem`, `test:jest`, `test:vitest`, `test:all`, `build`, Prisma + Drizzle helpers
- **apps/web-openindia**
  - Next.js app with `dev`, `build`, `start`, `lint`
- **apps/web-ssu**
  - Next.js app with `dev`, `build`, `start`, `lint`, `test:e2e`
- **apps/mobile**
  - (package.json missing) – likely Expo/React Native skeleton without scripts defined

### Library Packages
- **@repo/i18n**: tsup build, vitest tests; depends on i18next + ICU
- **@education/player**: tsup build, vitest/unit + Storybook; depends on hls.js
- **@repo/sdk**: tsup build, exports generated OpenAPI client
- **@repo/types**: tsup build, vitest tests; peer dep on zod
- **packages/auth/config/ui**: missing package.json (utilities under src/tsup config only)

## CI / Automation
- **ci.yml**: full install, codegen, typecheck, lint, unit + e2e tests, build artifacts; caches node_modules and turbo
- **changesets.yml**: versions packages on push to main
- **release.yml**: builds all apps on tag push, uploads artifacts, optional Vercel/GCP deploy hooks
- **deploy.yml**: (content omitted in excerpt) – environment-based deployment (review separately)
- **lhci.yml**: Lighthouse CI with optional base URL input
- **sdk-drift.yml**: regenerates SDK on PRs touching API spec/config

## Git Status
- **Branches**: `main`, `feat/test-split` (current), `origin/main`
- **Recent Commits on main**
  1. 23a2e251 test(api): remove legacy jest configs in favor of jest.config.ts
  2. 43be7030 chore: add connection-test attribution check
  3. d67bfdff fix: add tsup to devDependencies for build
  4. a533fa20 chore: remove husky from root and api
  5. 966e7b24 chore: remove husky from root
  6. 4336d34a chore: remove husky from root
  7. 834f670e chore: remove husky from root
  8. fa2c30c9 fix: convert apps/api from submodule to normal folder
  9. bd842acd feat: initial infrastructure & tests
  10. b21b236a Initial LMS monorepo setup
- **Open PRs**: not available via local git (no remote PR metadata)

## TODO / FIXME / NOTE References
- `apps/web-openindia/next-env.d.ts:5` – NOTE about file immutability
- `apps/api/test/app.e2e-spec.ts:3` – NOTE tests assume API running locally

## Test & Build Status

### `pnpm --filter education-api run test:all`
- **Result**: ❌ Failed after `test:jest`
- **Failures** (highlights):
  - Multiple specs import `vitest` in Jest environment (translate, tts worker, rag service, align worker, lti service, payments, certs) causing runtime failures
  - TypeScript duplicate identifier errors in `search.service.spec.ts` and `courses.service.extra.spec.ts`
  - Missing type declarations for `nodemailer` in notifications/lessons/courses specs
  - Module resolution failure for `@repo/types` in course controller specs (Jest config missing path alias)
  - `test/security.spec.ts` has no tests defined (now just a helper), causing Jest to error
- **Passes**: 19 suites including auth, profile, prisma modules

### `pnpm --filter web-openindia run build`
- **Result**: ✅ Success after resolving module aliasing and client-component boundaries
- **Outputs**: Next.js static build completes; page metrics summarized in build log

## Environment Variables & Suggested Defaults
- `DATABASE_URL` / `POSTGRES_URL`: required for Prisma + Drizzle; tests fall back to in-memory if `USE_IN_MEMORY_DB=1`. Suggest providing `postgresql://localhost:5432/education` for dev/test.
- `USE_IN_MEMORY_DB`: toggles mock Prisma; set `1` for local testing to avoid real DB.
- `MEILI_URL`, `MEILI_MASTER_KEY`: Search service initialization; defaulting to `http://127.0.0.1:7700` but key needed for secured instances.
- `JWT_SECRET`: required for auth token signing (default `changeme` currently in code – replace with secure secret in production).
- `REDIS_URL`: queue/worker features default to `redis://localhost:6379`.
- `SMTP_HOST/PORT/USER/PASS/FROM`: email adapter; missing leads to runtime errors. For tests, stub driver or set to Mailhog-style values.
- `NEXT_PUBLIC_API_URL` / `API_URL`: SDK runtime base URL for web clients.
- `NEXT_PUBLIC_SENTRY_DSN`, `NEXT_PUBLIC_OTLP_ENDPOINT`: optional telemetry.
- Recommendation: create `.env.example` entries with safe local defaults (Postgres docker, Redis, Mailhog).

## Security Posture
- **Implemented** (apps/api/src/main.ts):
  - `@fastify/helmet` for baseline headers
  - Custom CORS allowlist enforcement with 403 response on unapproved origins
  - Manual rate-limiting hook for `/auth` and `/jobs`
  - JWT auth guard + RBAC scaffolding
  - Zod validation pipe for DTOs
- **Present but needs attention**:
  - No formal CSP configuration (helmet CPS disabled); consider tightened policy.
  - No CSRF protection for mutating endpoints (Fastify). Evaluate double-submit tokens or same-site cookies where applicable.
  - Rate limiter uses in-memory Map; not distributed-safe (no Redis shared state).
  - Missing logging/monitoring on security toggles (Sentry optional).

## Backlog (Top 10)
- **P1** Fix Vitest-in-Jest spec imports (`src/services/translate.service.spec.ts`, workers, rag, lti, payments, certs). Convert to Jest or run under Vitest with ESM.
- **P1** Add `@types/nodemailer` or local module shim so Jest type checks succeed in notifications/lessons/courses specs.
- **P1** Update Jest moduleNameMapper to resolve `@repo/types` (and other workspaces) to source; unblock course controller tests.
- **P1** Repair `search.service.spec.ts` and `courses.service.extra.spec.ts` duplicate imports & constructor args;
  ensure mocks align with `CoursesService` dependencies.
- **P1** Reinstate meaningful assertions in `test/security.spec.ts` or skip from Jest to avoid empty-suite failure.
- **P2** Provide Docker-compose or scripts for Meilisearch/Redis/Postgres to streamline local setup; document env defaults.
- **P2** Harden security middleware: restore full CSP via helmet, evaluate CSRF mitigation, and persist rate limiting via Redis.
- **P2** Add package manifests for `apps/mobile`, `packages/auth/config/ui` or document rationale to avoid tooling gaps.
- **P3** Automate nodemailer adapter tests with mocks rather than live SMTP expectations.
- **P3** Create infrastructure docs for new SDK generator flow (root scripts, CI drift guard) and align `pnpm generate` usage across teams.
- **P3** Expand TODO tracking (currently sparse) by converting implicit tech debt (e.g., jest/vitest mix) into explicit issues.

## Appendices

### TODO / NOTE Inventory
- `apps/web-openindia/next-env.d.ts:5`
- `apps/api/test/app.e2e-spec.ts:3`

### Build/Test Logs
- `education-api test:all`: FAILED (see above failures)
- `web-openindia build`: PASSED (Next.js static build summary)

---
_Report prepared by automated audit script._
