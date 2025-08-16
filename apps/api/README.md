[![codecov](https://codecov.io/gh/adidevendra/education-app/branch/main/graph/badge.svg)](https://codecov.io/gh/adidevendra/education-app)

# Education API (scaffold)

This repository contains a scaffold for a NestJS API with Prisma, Redis, Meilisearch, Zod validation, Pino logging, OAuth2/JWT/SAML hooks, and e2e tests with Jest.
Rebooting the VM and restoring PM2-managed processes:
 - pm2 status — show running process states

## Git workflow for infra files (ecosystem, smoke tests, etc.)

Keep infra files (for example `ecosystem.config.js`, `SMOKE_TESTS.md`, `smoke-test.sh`) in the repository so the Oracle VM setup is reproducible. Follow these steps when adding or changing infra files:

1. Create a feature branch locally

```bash
git checkout -b feat/infra/pm2-ecosystem
```

## Quick developer guide

Run locally using the in-memory DB (fast, no external services):

```bash
cd apps/api
USE_IN_MEMORY_DB=1 npm run dev
```

## Quick Smoke Tests

When to use: run these quick checks after any code change and before pushing or deploying to catch regressions early.

Start the API in a fast in-memory mode and run the smoke test runner:

```bash
cd apps/api
USE_IN_MEMORY_DB=1 PORT=3000 npm run dev
./tests/smoke_test.sh
```

Requirements: `curl` is required. `jq` is optional (used to extract returned `id` values automatically).

Manual reference: detailed copy-paste commands are available at `docs/smoke-tests.md`.


Deploy to Oracle VM with PM2 (repo contains `ecosystem.config.js`):

```bash
# on your Oracle VM
cd /home/ubuntu/education-app/apps/api
pm2 start ecosystem.config.js --update-env
pm2 save
pm2 status
```

Run smoke tests (manual or scripted):

```bash
cd apps/api
# Manual: run individual curl commands documented in SMOKE_TESTS.md
./smoke-test.sh            # convenience script
./run_smoke_tests.sh      # strict runner that exits non-zero on failures
```

Run CI locally (GitHub Actions):

You can run the same checks locally by installing Node 20 and running the commands the CI uses:

```bash
cd apps/api
USE_IN_MEMORY_DB=1 npm ci
npm run build
# run lint if configured
npm run lint || true
```

This keeps CI simple by using `USE_IN_MEMORY_DB=1` so tests don't require an external DB.

## Nginx <-> PM2 proxying and restart sequence

Nginx (fronting the public IP) proxies incoming HTTP requests to the locally-running API managed by PM2 (the process name in this repo is `education-api`). The provided `nginx.conf` routes traffic to `http://127.0.0.1:3000` and sets `X-Forwarded-*` headers so the app can observe the original client IP and protocol.

Typical commands

- Check PM2 status:

```bash
pm2 status
```

- Restart the API (graceful reload if supported):

```bash
# graceful reload (zero-downtime when code supports it)
pm2 reload education-api

# or full restart
pm2 restart education-api
```

- Test Nginx config and reload (after changing Nginx config):

```bash
sudo nginx -t
sudo systemctl reload nginx
```

Recommended restart sequence

- If you change application code or PM2 ecosystem settings: first reload/restart the PM2 process, confirm it is healthy, then reload Nginx if needed.

```bash
# 1) reload the app
pm2 reload education-api

# 2) confirm the app is healthy (example health endpoint)
curl -I http://127.0.0.1:3000/api/health

# 3) if you also changed Nginx config, test and reload nginx
sudo nginx -t && sudo systemctl reload nginx
```

- If you only changed Nginx configuration (no app changes), validate the Nginx config first and reload Nginx. This avoids unnecessary app restarts.

Rationale

- Reloading the app first ensures the backend being proxied is updated and ready before Nginx starts routing new traffic to it.
- `pm2 reload` attempts a graceful reload (zero-downtime) for processes that support it; `pm2 restart` is a hard restart.
- Always run `nginx -t` before reloading to avoid bringing down the proxy due to a bad config.

## PM2: fork vs cluster mode

The provided `ecosystem.config.js` starts the app in fork mode by default (single process). For production workloads you may want to run multiple instances in cluster mode to utilize multiple CPU cores.

To start in cluster mode (auto-scale to available CPU cores):

```bash
cd /home/ubuntu/education-app/apps/api
pm2 start ecosystem.config.js --instances max --exec_mode cluster
pm2 save
```

To start in fork (single process) mode explicitly:

```bash
pm2 start ecosystem.config.js --instances 1 --exec_mode fork
pm2 save
```

Notes:
- Cluster mode uses the Node.js cluster module to spawn multiple worker processes. Use `pm2 reload` for zero-downtime reloads when using cluster mode.
- Monitor CPU/memory with `pm2 monit` and adjust `--instances` if you need to limit the number of workers.

## Enabling HTTPS with Certbot (Nginx, Oracle VM)

1. Install Certbot and the Nginx plugin on Ubuntu:

```bash
sudo apt update
sudo apt install -y certbot python3-certbot-nginx
```

2. Obtain and install a certificate (replace example.com):

```bash
sudo certbot --nginx -d example.com -d www.example.com
```

3. Certbot will update your Nginx config and reload the service. Test Nginx config and reload if needed:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

4. Auto-renewal: Certbot installs a systemd timer or cron job to renew certificates automatically. To test the renewal process manually:

```bash
sudo certbot renew --dry-run
```

5. Verify HTTPS and certificate details from any machine:

```bash
curl -vI https://example.com
# or check the certificate expiry
echo | openssl s_client -servername example.com -connect example.com:443 2>/dev/null | openssl x509 -noout -dates
```

Notes:
- Make sure your DNS A records point to your Oracle VM public IP before running Certbot.
- If Certbot cannot modify your Nginx config automatically, it will provide instructions to add the certificate block manually; follow them and then reload Nginx.

## Environment files

An example env file is provided at `.env.example`. Copy it to create a local or production env file and fill in secrets:

```bash
cp .env.example .env.local        # local/dev
cp .env.example .env.production   # production on the server
```

Make sure you never commit real secret values to the repository.

## PM2 log rotation

To prevent PM2 logs from growing indefinitely, install and configure the `pm2-logrotate` module on the server.

From the `apps/api` folder on the server run:

```bash
./setup-pm2-logrotate.sh
```

This script installs the module (if missing) and applies a conservative rotation policy (10MB max per file, keep 14 rotated files, compress rotated files).

To inspect the module status:

```bash
pm2 show pm2-logrotate
```

Rotated logs are stored alongside PM2 logs (commonly `~/.pm2/logs`). To list rotated files for `education-api`:

```bash
ls -lh ~/.pm2/logs | grep education-api
```

Or to tail the latest rotated log file:

```bash
tail -n 200 ~/.pm2/logs/education-api-out-*.log
```


2. Add the files you changed or created

```bash
git add apps/api/ecosystem.config.js apps/api/SMOKE_TESTS.md apps/api/smoke-test.sh
```

3. Commit with a descriptive message

```bash
git commit -m "chore(infra): add pm2 ecosystem and smoke tests"
```

4. Push the branch and open a Pull Request

```bash
git push -u origin feat/infra/pm2-ecosystem
# open a PR on your Git host (GitHub/GitLab)...
```

5. After review, merge into `main` and deploy to the Oracle VM (example server steps below).

Notes to keep the infra reproducible
- Make sure these files are NOT listed in `.gitignore` so they stay tracked.
- Keep an up-to-date `SMOKE_TESTS.md` and any helper scripts with the repo so a developer or the server can run the same checks.
- Consider adding `env` sample files (e.g. `.env.example`) and documenting required environment variables in the README.
- Tag releases or add release notes when infra changes need coordinated rollout on the server.

Example server update steps (on the Oracle VM)

```bash
# SSH to your Oracle VM
ssh ubuntu@YOUR_SERVER_IP

# Go to the repo and update from main
cd /home/ubuntu/education-app
git fetch origin
git checkout main
git pull origin main

# Start or restart the API with PM2 using the committed ecosystem file
cd apps/api
pm2 start ecosystem.config.js --update-env
pm2 save

# Verify
pm2 status
pm2 logs education-api --lines 200
```

Why this works / reproducibility
- The `ecosystem.config.js` in the repo defines how PM2 should start the app (cwd, script, env). By tracking it in Git you can reproduce the exact PM2 configuration on the server by pulling the same commit.
- `pm2 save` persists the current PM2 process list to disk. After a reboot you can use `pm2 resurrect` (or `pm2 startup` + saved dump) to restore the same process list and environment, ensuring the API comes back up with the same settings.
- Keeping smoke tests and helper scripts in the repo gives an automated, documented way to validate the deployment immediately after updating the server.
# Education API (scaffold)

This repository contains a scaffold for a NestJS API with Prisma, Redis, Meilisearch, Zod validation, Pino logging, OAuth2/JWT/SAML hooks, and e2e tests with Jest.

Quick start:

1. Copy `.env.example` to `.env` and update values.
2. Install dependencies: `npm install`
3. Generate Prisma client: `npm run prisma:generate`
4. Create a migration: `npm run prisma:migrate`
5. Start dev server: `npm run dev`

Docker dev stack:

1. Create the network if needed: `docker network create edu-net`
2. Start services: `docker-compose -f docker-compose.dev.yml up -d`
3. Run migration against the dev DB: `DATABASE_URL=postgresql://user:pass@localhost:5433/education npx prisma migrate dev`
4. Start the API (it will connect to the containers): `npm run dev`
