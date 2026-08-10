# docker/Dockerfile
# Multi-stage production Dockerfile for ScholarFlow Express.js REST API Backend

# Stage 1: Dependency Installation
FROM node:20-alpine AS deps
WORKDIR /app
RUN apk add --no-libc-dev python3 make g++

COPY package.json package-lock.json ./
RUN npm ci --only=production

# Stage 2: Production Runner Image
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Create non-root system user for container security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 expressjs

COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./

# Copy backend source files
COPY . .

# Set container ownership
RUN chown -R expressjs:nodejs /app

USER expressjs

EXPOSE 5000

# Health check endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/health || exit 1

CMD ["node", "server.js"]
