# Multi-stage Dockerfile for both development and production

# Development stage
FROM node:22-alpine AS development

# Set working directory inside the container
WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm@latest

# Install curl for health checks
RUN apk add --no-cache curl

# Copy package.json and pnpm-lock.yaml for dependency installation
COPY package.json pnpm-lock.yaml ./

# Install dependencies using pnpm (including dev dependencies for development)
RUN pnpm install --frozen-lockfile

# Create a non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S trellin -u 1001

# Change ownership of the app directory to the nodejs user
RUN chown -R trellin:nodejs /app
USER trellin

# Copy the rest of the application code
COPY --chown=trellin:nodejs . .

# Expose the port the app runs on (based on config.js analysis)
EXPOSE 3001

# Set environment to development
ENV NODE_ENV=development

# Health check to ensure the service is running
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

# Start the application in development mode with nodemon for hot reload
CMD ["pnpm", "dev"]

# Production stage
FROM node:22-alpine AS production

# Set working directory inside the container
WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm@latest

# Install curl for health checks
RUN apk add --no-cache curl

# Copy package.json and pnpm-lock.yaml for dependency installation
COPY package.json pnpm-lock.yaml ./

# Install only production dependencies
RUN pnpm install --frozen-lockfile --prod

# Create a non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S trellin -u 1001

# Copy the rest of the application code
COPY --chown=trellin:nodejs . .

# Change ownership and switch to non-root user
RUN chown -R trellin:nodejs /app
USER trellin

# Expose the port the app runs on
EXPOSE 3001

# Set environment to production
ENV NODE_ENV=production

# Health check to ensure the service is running
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

# Start the application in production mode
CMD ["pnpm", "start"]
