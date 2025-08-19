#!/bin/bash

# Adobe PDF Insights & Podcast Platform - Jury Build Script
# Single command to build and run the complete solution

set -e

echo "🚀 Adobe PDF Insights & Podcast Platform - Jury Deployment"
echo "============================================================="
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Error: Docker is not running. Please start Docker Desktop and try again."
    exit 1
fi

echo "✅ Docker is running"

# Check if docker-compose is available
if ! command -v docker-compose > /dev/null 2>&1; then
    echo "❌ Error: docker-compose is not installed. Please install Docker Compose and try again."
    exit 1
fi

echo "✅ Docker Compose is available"

# Clean up any existing containers
echo "🧹 Cleaning up any existing containers..."
docker-compose down > /dev/null 2>&1 || true

# Build and start the application
echo "🔨 Building the application (this may take a few minutes)..."
docker-compose up --build -d

# Wait for the application to be ready
echo "⏳ Waiting for application to start..."
sleep 10

# Check if the application is healthy
max_attempts=30
attempt=1

while [ $attempt -le $max_attempts ]; do
    if curl -f http://localhost:8080/health > /dev/null 2>&1; then
        echo "✅ Application is healthy and ready!"
        break
    fi
    
    if [ $attempt -eq $max_attempts ]; then
        echo "❌ Application failed to start properly. Check logs with: docker-compose logs"
        exit 1
    fi
    
    echo "⏳ Attempt $attempt/$max_attempts - waiting for application..."
    sleep 2
    attempt=$((attempt + 1))
done

echo ""
echo "🎉 SUCCESS! Adobe PDF Insights & Podcast Platform is running!"
echo ""
echo "📱 Access the application:"
echo "   Main App:     http://localhost:8080"
echo "   API Docs:     http://localhost:8080/docs"
echo "   Health Check: http://localhost:8080/health"
echo ""
echo "📋 Jury Evaluation Features:"
echo "   ✅ PDF Upload & Processing"
echo "   ✅ AI Insights Generation (5 types)"
echo "   ✅ Semantic Search & Connections" 
echo "   ✅ Podcast/Audio Generation"
echo "   ✅ PDF Navigation & Highlighting"
echo ""
echo "🛠️  Management Commands:"
echo "   View logs:    docker-compose logs -f"
echo "   Stop app:     docker-compose down"
echo "   Restart:      docker-compose restart"
echo ""
echo "Ready for evaluation! 🚀"
