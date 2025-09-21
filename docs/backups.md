Daily backups
-------------

This repository includes a simple Postgres backup script using pg_dump.

Requirements:
- PostgreSQL client tools installed (pg_dump).
- DATABASE_URL environment variable set.

Run manual backup:

```
./scripts/backup.sh
```

By default, dumps are written to ./backups/db-YYYY-MM-DD.sql. Customize with BACKUP_DIR env var.

Cron example (daily at 02:00):

```
0 2 * * * cd /path/to/education-app && BACKUP_DIR=/var/backups/education-app DATABASE_URL=postgres://user:pass@host:5432/db ./scripts/backup.sh >> /var/log/education-app-backups.log 2>&1
```

Restore example:

```
psql "$DATABASE_URL" < backups/db-YYYY-MM-DD.sql
```

Retention: Use system tools (logrotate/cron) to prune old files, e.g., keep 14 days.
