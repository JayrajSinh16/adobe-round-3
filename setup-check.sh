#!/bin/bash

# Environment Setup and Validation Script
# Adobe PDF Insights & Podcast Platform

echo "🔧 Adobe PDF Platform - Environment Setup & Validation"
echo "======================================================"
echo ""

# Function to check command availability
check_command() {
    if command -v $1 >/dev/null 2>&1; then
        echo "✅ $1 is installed"
        return 0
    else
        echo "❌ $1 is not installed"
        return 1
    fi
}

# Function to check port availability
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo "⚠️  Port $1 is already in use"
        return 1
    else
        echo "✅ Port $1 is available"
        return 0
    fi
}

echo "🔍 Checking Prerequisites..."
echo ""

# Check Docker
if check_command "docker"; then
    echo "   Docker version: $(docker --version)"
else
    echo "   Please install Docker Desktop from https://docker.com/products/docker-desktop"
    exit 1
fi

# Check Docker Compose
if check_command "docker-compose"; then
    echo "   Docker Compose version: $(docker-compose --version)"
else
    echo "   Please install Docker Compose"
    exit 1
fi

# Check if Docker daemon is running
if docker info >/dev/null 2>&1; then
    echo "✅ Docker daemon is running"
else
    echo "❌ Docker daemon is not running. Please start Docker Desktop."
    exit 1
fi

echo ""
echo "🔍 Checking System Resources..."

# Check available memory (Linux/Mac)
if command -v free >/dev/null 2>&1; then
    mem_gb=$(free -g | awk '/^Mem:/{print $7}')
    if [ "$mem_gb" -ge 2 ]; then
        echo "✅ Available memory: ${mem_gb}GB (sufficient)"
    else
        echo "⚠️  Available memory: ${mem_gb}GB (recommended: 4GB+)"
    fi
fi

# Check available disk space
df_output=$(df -h . | tail -1)
available=$(echo $df_output | awk '{print $4}')
echo "✅ Available disk space: $available"

echo ""
echo "🔍 Checking Port Availability..."

check_port 8080

echo ""
echo "🔍 Validating Configuration Files..."

# Check if essential files exist
files_to_check=(
    "docker-compose.yml"
    "Dockerfile"
    "backend/main.py"
    "backend/requirements.txt"
    "frontend/package.json"
    "backend/.env"
    "frontend/.env"
)

for file in "${files_to_check[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file exists"
    else
        echo "❌ $file is missing"
        exit 1
    fi
done

echo ""
echo "🔍 Checking Environment Variables..."

# Check backend .env
if grep -q "GOOGLE_API_KEY" backend/.env; then
    echo "✅ Google API key configured in backend/.env"
else
    echo "⚠️  Google API key not found in backend/.env"
fi

# Check frontend .env  
if grep -q "VITE_ADOBE_CLIENT_ID" frontend/.env; then
    echo "✅ Adobe Client ID configured in frontend/.env"
else
    echo "⚠️  Adobe Client ID not found in frontend/.env"
fi

echo ""
echo "🔍 Validating Sample Data..."

if [ -d "backend/sample_pdf" ] && [ "$(ls -A backend/sample_pdf)" ]; then
    pdf_count=$(ls backend/sample_pdf/*.pdf 2>/dev/null | wc -l)
    echo "✅ Sample PDFs available: $pdf_count files"
else
    echo "⚠️  No sample PDFs found in backend/sample_pdf/"
fi

echo ""
echo "🎯 Environment Validation Complete!"
echo ""

if [ -f "run-jury.sh" ]; then
    echo "🚀 Ready to deploy! Run the following command:"
    echo "   ./run-jury.sh"
    echo ""
    echo "   Or use Docker Compose directly:"
    echo "   docker-compose up --build"
else
    echo "🚀 Ready to deploy! Run the following command:"
    echo "   docker-compose up --build"
fi

echo ""
echo "📋 What will be deployed:"
echo "   • React frontend (built as static files)"
echo "   • FastAPI backend with Python 3.11"
echo "   • Adobe PDF Embed API integration"
echo "   • Google Gemini AI for insights"
echo "   • Azure Text-to-Speech for audio"
echo "   • Complete PDF processing pipeline"
echo ""
echo "🎉 All systems ready for jury evaluation!"
