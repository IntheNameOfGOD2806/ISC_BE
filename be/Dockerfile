# Use Node.js LTS version
FROM node:20-alpine

# Install build dependencies for native modules (bcrypt, sharp, etc.)
RUN apk add --no-cache python3 make g++ vips-dev

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy application code
COPY . .

# Create necessary directories
RUN mkdir -p logs uploads

# Environment Variables (Non-sensitive defaults only)
ENV API_URL=http://localhost:8888
ENV CORS_ORIGIN="*"
ENV DB_HOST=database-1.chm2sqeus382.ap-southeast-2.rds.amazonaws.com
ENV DB_NAME=postgres
ENV DB_PORT=5432
ENV DB_SYNC=true
ENV DB_USER=postgres
ENV EMAIL_FROM=tranthanhdat4321@gmail.com
ENV EMAIL_FROM_NAME=shopmini
ENV EMAIL_HOST=smtp.gmail.com
ENV EMAIL_PORT=587
ENV EMAIL_USERNAME=tranthanhdat4321@gmail.com
ENV FRONTEND_URL=https://boncauthongminh.vercel.app
ENV JWT_EXPIRES_IN=1d
ENV JWT_REFRESH_EXPIRES_IN=7d
ENV MAX_FILE_SIZE=5242880
ENV NODE_ENV=production
ENV PORT=8888
ENV REDIS_HOST=localhost
ENV REDIS_PORT=6379
ENV UPLOAD_DIR=uploads

# Expose port
EXPOSE 8888

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8888/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application
CMD ["npm", "start"]
