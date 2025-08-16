dev:
	docker compose up --build

db-migrate:
	docker compose exec api pnpm run db:migrate

test:
	docker compose exec api pnpm test

seed:
	docker compose exec api pnpm run db:seed
