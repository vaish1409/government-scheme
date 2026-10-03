# frontend/Dockerfile
# Multi-stage build: compile the Vite app, then serve the static output with
# nginx (nginx also reverse-proxies /api/* to the backend container, so the
# browser only ever talks to one origin and CORS never comes into play).

FROM node:20-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Left unset on purpose: client.js (see the small patch in this folder)
# falls back to a relative "/api" base URL when VITE_API_URL is empty, which
# is exactly what we want behind the nginx proxy below. Pass
#   --build-arg VITE_API_URL=https://api.example.com
# only if you ever point this frontend at a backend on a *different* origin.
ARG VITE_API_URL=""
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

FROM nginx:1.27-alpine
RUN apk add --no-cache curl
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
