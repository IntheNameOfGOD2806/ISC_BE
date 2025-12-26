# Use Node.js LTS version
FROM node:20-alpine

# Install build dependencies for native modules (bcrypt, sharp, etc.)
RUN apk add --no-cache python3 make g++ vips-dev

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Create necessary directories
RUN mkdir -p logs uploads

# Expose port
EXPOSE 8888

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8888/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application
CMD ["npm", "start"]
