# Dockerfile for Next.js app
FROM node:20-alpine
WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm build
EXPOSE 3000
CMD ["pnpm", "start"]
