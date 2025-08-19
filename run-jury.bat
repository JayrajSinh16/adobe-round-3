@echo off
REM Adobe PDF Insights & Podcast Platform - Jury Build Script (Windows)
REM Single command to build and run the complete solution

echo 🚀 Adobe PDF Insights ^& Podcast Platform - Jury Deployment
echo =============================================================
echo.

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo ❌ Error: Docker is not running. Please start Docker Desktop and try again.
    pause
    exit /b 1
)

echo ✅ Docker is running

REM Check if docker-compose is available
docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Error: docker-compose is not installed. Please install Docker Compose and try again.
    pause
    exit /b 1
)

echo ✅ Docker Compose is available

REM Clean up any existing containers
echo 🧹 Cleaning up any existing containers...
docker-compose down >nul 2>&1

REM Build and start the application
echo 🔨 Building the application (this may take a few minutes)...
docker-compose up --build -d

REM Wait for the application to be ready
echo ⏳ Waiting for application to start...
timeout /t 10 /nobreak >nul

REM Check if the application is healthy
set max_attempts=30
set attempt=1

:check_health
curl -f http://localhost:8080/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Application is healthy and ready!
    goto :success
)

if %attempt% geq %max_attempts% (
    echo ❌ Application failed to start properly. Check logs with: docker-compose logs
    pause
    exit /b 1
)

echo ⏳ Attempt %attempt%/%max_attempts% - waiting for application...
timeout /t 2 /nobreak >nul
set /a attempt+=1
goto :check_health

:success
echo.
echo 🎉 SUCCESS! Adobe PDF Insights ^& Podcast Platform is running!
echo.
echo 📱 Access the application:
echo    Main App:     http://localhost:8080
echo    API Docs:     http://localhost:8080/docs
echo    Health Check: http://localhost:8080/health
echo.
echo 📋 Jury Evaluation Features:
echo    ✅ PDF Upload ^& Processing
echo    ✅ AI Insights Generation (5 types)
echo    ✅ Semantic Search ^& Connections
echo    ✅ Podcast/Audio Generation
echo    ✅ PDF Navigation ^& Highlighting
echo.
echo 🛠️  Management Commands:
echo    View logs:    docker-compose logs -f
echo    Stop app:     docker-compose down
echo    Restart:      docker-compose restart
echo.
echo Ready for evaluation! 🚀
echo.
echo Press any key to open the application in your browser...
pause >nul
start http://localhost:8080
