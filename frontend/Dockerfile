# Multi-stage Dockerfile for both development and production

# Development stage
FROM node:22-alpine AS development

# Set working directory
WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm@latest

# Install curl for health checks
RUN apk add --no-cache curl

# Copy package.json and pnpm-lock.yaml for dependency installation
COPY package.json pnpm-lock.yaml ./

# Install dependencies using pnpm (including dev dependencies)
RUN pnpm install --frozen-lockfile

# Create a non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S trellin -u 1001

# Change ownership of the app directory to the nodejs user
RUN chown -R trellin:nodejs /app
USER trellin

# Copy the rest of the application code
COPY --chown=trellin:nodejs . .

# Expose the port the Vite dev server runs on
EXPOSE 5173

# Set environment to development
ENV NODE_ENV=development

# Health check to ensure the service is running
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5173 || exit 1

# Start the Vite development server with hot reload
# The --host 0.0.0.0 flag allows external connections (required for Docker)
CMD ["pnpm", "dev", "--host", "0.0.0.0", "--port", "5173"]

# Builder stage for production
FROM node:22-alpine AS builder

# Set working directory
WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm@latest

# Copy package.json and pnpm-lock.yaml for dependency installation
COPY package.json pnpm-lock.yaml ./

# Install dependencies using pnpm
RUN pnpm install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Build the application for production
RUN pnpm build

# Production stage
FROM node:22-alpine AS production

# Set working directory
WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm@latest

# Install serve to serve the built application
RUN pnpm add -g serve

# Install curl for health checks
RUN apk add --no-cache curl

# Create a non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S trellin -u 1001

# Copy the built application from builder stage
COPY --from=builder --chown=trellin:nodejs /app/dist /app/dist

# Change to non-root user
USER trellin

# Expose the port the app runs on
EXPOSE 3000

# Set environment to production
ENV NODE_ENV=production

# Health check to ensure the service is running
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000 || exit 1

# Serve the built application
# The -s flag serves the app in single-page application mode (for React Router)
# Change the port if needed by modifying the -l flag
CMD ["serve", "-s", "dist", "-l", "3000"]
