# Dockerfile for NestJS API
FROM node:20-alpine
WORKDIR /app

# Copy package files first for better layer caching
COPY package.json package-lock.json* ./

# Install dependencies using npm ci (reliable for CI/production)
RUN npm ci --only=production

# Copy application source and PM2 ecosystem into the image
COPY . .

# Build the app (assumes a build script exists)
RUN npm run build

# Expose the application port
EXPOSE 3000

# Default command to run the built app
CMD ["npm", "run", "start"]
