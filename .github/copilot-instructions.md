<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->
Project Setup and Operations Checklist

- [x] Verify Copilot instructions file exists
  - Present at .github/copilot-instructions.md (verified 2025-09-02).

- [x] Clarify Project Requirements
  - TypeScript-first Turborepo for LMSaaS with apps/api (NestJS), apps/web-openindia & apps/web-ssu (Next.js + Tailwind), apps/mobile (Expo), and packages {sdk, ui, auth, player, i18n, types, config}. Tooling: pnpm, ESLint/Prettier, Changesets, Vitest, CI.

- [x] Scaffold the Project
  - Monorepo structure created with apps and packages, CI workflows, Docker/devcontainer, Makefile, and docs.

- [x] Customize the Project
  - Google Cloud TTS audio pipeline under apps/web-openindia/audio-pipeline; Tailwind added to web-openindia with course catalog UI; .env.example and env inventory; Vercel deploy workflow.

- [x] Install Required Extensions
  - None required via automated setup tool; skipped per policy.

- [ ] Compile the Project
  - Pending. Notes: Validate turbo pipeline and per-app scripts; install Tailwind/PostCSS deps for web-openindia.

- [ ] Create and Run Task
  - Pending. Will generate tasks.json after compile step if needed.

- [ ] Launch the Project
  - Pending. Will prompt for debug mode once compile succeeds.

- [x] Ensure Documentation is Complete
  - README.md exists and reflects the project. This file now cleaned and aligned.

Execution Guidelines (concise)
- Work through each checklist item systematically.
- Keep communication concise; skip verbose outputs.
- Use current directory as project root; avoid unnecessary folders.
- Only install extensions specified by the setup tool (none at present).
- Prefer typed, secure, multi-tenant-safe changes; keep secrets server-only.

Next Actions
- Add per-app package.json for apps/web-openindia; install Tailwind/PostCSS and verify Next.js dev build.
- Validate or add turbo.json and per-app package.json scripts for turbo run dev/build.
- Optionally add a tasks.json to streamline dev commands.
