# ==============================================================================
# Dockerfile for Divine Favour Backend (Node.js + Express + Prisma)
# ==============================================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Install system dependencies needed for native module compilation (Argon2)
RUN apk add --no-cache python3 make g++

# Copy package files and prisma schema first for cached layer builds
COPY package*.json ./
COPY prisma ./prisma/

# Install all dependencies (including devDependencies needed for build)
RUN npm ci

# Generate Prisma Client
RUN npx prisma generate

# Copy source code and build config
COPY tsconfig.json ./
COPY src ./src/

# Compile TypeScript to JavaScript (output in dist/)
RUN npm run build

# Prune devDependencies to keep image lean
RUN npm prune --omit=dev

# ------------------------------------------------------------------------------
# Production Runner Image
# ------------------------------------------------------------------------------
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Install runtime dependencies for Prisma and OpenSSL
RUN apk add --no-cache openssl ca-certificates

# Create non-root user for process security
USER node

# Copy production artifacts from builder stage
COPY --chown=node:node package*.json ./
COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/dist ./dist
COPY --chown=node:node --from=builder /app/prisma ./prisma

EXPOSE 5000

# Health check using the liveness endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/v1/health || exit 1

# Start the compiled Express production server
CMD ["node", "dist/server.js"]
