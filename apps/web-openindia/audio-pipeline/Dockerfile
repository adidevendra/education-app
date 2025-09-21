# Use official Node.js 20 image for Cloud Run
FROM node:20-slim

WORKDIR /usr/src/app

COPY package.json package-lock.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

CMD ["node", "dist/server.js"]
