# Local Development Setup

## Prerequisites
- Docker & Docker Compose
- VS Code (recommended)
- Node.js 20 (in devcontainer)
- pnpm (in devcontainer)

## Quick Start

1. **Clone the repo**
2. **Start all services:**
   ```sh
   make dev
   ```
   This runs all apps and services (NestJS API, Next.js apps, PostgreSQL, Redis, Meilisearch) via Docker Compose.

3. **Database Migrations:**
   ```sh
   make db-migrate
   ```
   Runs migrations in the API container.

4. **Seed Database:**
   ```sh
   make seed
   ```
   Seeds the database in the API container.

5. **Run Tests:**
   ```sh
   make test
   ```
   Runs tests in the API container.

## DevContainer
- Open in VS Code and "Reopen in Container" for a pre-configured environment (Node 20, pnpm, Docker-in-Docker).
- Includes recommended extensions and settings for TypeScript, Prettier, ESLint.

## Services
- **api**: NestJS API (port 3001)
- **web-openindia**: Next.js app (port 3002)
- **web-ssu**: Next.js app (port 3003)
- **db**: PostgreSQL (port 5432)
- **redis**: Redis (port 6379)
- **meilisearch**: Meilisearch (port 7700)

## Environment Variables
- Add your `.env` file at the project root for local secrets/config.

---

For more details, see each app/package README or ask for help!
