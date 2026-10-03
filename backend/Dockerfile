# backend/Dockerfile
# Production image for the Express API (health-finance-backend).
FROM node:20-alpine

# tini handles signals properly so `docker stop` / `docker compose down`
# shut the Node process down cleanly instead of killing it after a timeout.
RUN apk add --no-cache tini curl

WORKDIR /app

# Install deps first so this layer is cached unless package*.json changes.
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Now copy the actual source.
COPY src ./src

# Don't run as root inside the container.
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

ENV NODE_ENV=production
EXPOSE 5000

# Matches the real /health route already defined in src/server.js.
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:5000/health || exit 1

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "src/server.js"]
