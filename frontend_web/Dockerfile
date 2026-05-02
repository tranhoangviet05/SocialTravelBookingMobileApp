# ============================================================
# Dockerfile — React Frontend (Vite)
# Multi-stage: build stage + serve stage (Nginx)
# ============================================================

# ── Stage 1: Build ───────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files trước để tận dụng Docker layer cache
COPY package*.json ./

RUN npm ci

# Copy toàn bộ source code
COPY . .

# Build production bundle
RUN npm run build

# ── Stage 2: Serve với Nginx ─────────────────────────────────
FROM nginx:alpine AS runner

# Copy file cấu hình Nginx tùy chỉnh
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy static files từ build stage
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
