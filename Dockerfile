# Multi-stage Dockerfile for Adobe PDF Insights & Podcast Platform
# This builds both frontend and backend in a single image for Adobe jury evaluation
# Supports Adobe's required environment variables and platform requirements

FROM node:20-alpine AS frontend-builder

# Set working directory for frontend build
WORKDIR /app/frontend

# Copy frontend package files
COPY frontend/package*.json ./

# Install frontend dependencies
RUN npm install

# Copy frontend source code
COPY frontend/ ./

# Build frontend for production
RUN npm run build

# Python backend stage - supports linux/amd64 platform as required by Adobe
FROM python:3.11-slim AS backend-stage

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    ffmpeg \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy backend requirements and install Python dependencies
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source code
COPY backend/ ./backend/

# Copy built frontend from previous stage
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Create necessary directories for storage
RUN mkdir -p backend/storage/pdfs backend/storage/outlines backend/storage/audio

# Set default environment variables (can be overridden by Adobe's docker run command)
ENV PYTHONPATH=/app/backend \
    ENVIRONMENT=production \
    HOST=0.0.0.0 \
    PORT=8080

# Adobe required environment variables with defaults (will be overridden by jury)
# Non-sensitive defaults only. Secrets are passed at runtime via -e or orchestrator.
ENV LLM_PROVIDER=gemini \
    GEMINI_MODEL=gemini-2.5-flash \
    TTS_PROVIDER=azure

# Expose port 8080 as required by Adobe
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

# Create startup script
RUN echo '#!/bin/sh\n\
set -eu\n\
echo "Starting Adobe PDF Insights & Podcast Platform..."\n\
echo "Environment: $ENVIRONMENT"\n\
echo "Host: $HOST:$PORT"\n\
echo "Python Path: $PYTHONPATH"\n\
# If credentials are mounted at /credentials and env var not set, auto-set it\n\
if [ -z "${GOOGLE_APPLICATION_CREDENTIALS:-}" ] && [ -f "/credentials/adbe-gcp.json" ]; then\n\
    export GOOGLE_APPLICATION_CREDENTIALS=/credentials/adbe-gcp.json\n\
    echo "Detected mounted Google credentials at $GOOGLE_APPLICATION_CREDENTIALS"\n\
fi\n\
cd /app/backend\n\
exec uvicorn main:app --host $HOST --port $PORT' > /app/start.sh

RUN chmod +x /app/start.sh

# Run the application
CMD ["/app/start.sh"]
