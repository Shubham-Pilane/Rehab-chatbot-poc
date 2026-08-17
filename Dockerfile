# ==========================================
# STAGE 1: Build the React Frontend
# ==========================================
FROM node:18-alpine AS frontend-builder
WORKDIR /frontend

# Install dependencies
COPY frontend/package*.json ./
RUN npm ci

# Copy frontend source and compile static bundle
COPY frontend/ ./
RUN npm run build

# ==========================================
# STAGE 2: Set up the Express Backend Server
# ==========================================
FROM node:18-alpine
WORKDIR /usr/src/app

# Set production environment
ENV NODE_ENV=production
ENV PORT=5000

# Install backend dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy backend source
COPY src/ ./src/

# Copy compiled frontend assets from Stage 1
COPY --from=frontend-builder /frontend/dist ./frontend/dist

# Expose port
EXPOSE 5000

# Start command
CMD ["node", "src/server.js"]
