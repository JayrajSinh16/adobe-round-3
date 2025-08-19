# 🏆 Adobe PDF Insights & Podcast Platform
## Grand Finale Submission - Complete AI-Powered Solution

<div align="center">

**🎯 One-Command Deployment Ready for Jury Evaluation**

[![Docker](https://img.shields.io/badge/Docker-Ready-blue?logo=docker)](./Dockerfile)
[![React](https://img.shields.io/badge/React-19-61dafb?logo=react)](./frontend)
[![FastAPI](https://img.shields.io/badge/FastAPI-Latest-009688?logo=fastapi)](./backend)
[![Adobe](https://img.shields.io/badge/Adobe-PDF%20Embed-red?logo=adobe)](https://developer.adobe.com/document-services/apis/pdf-embed/)
[![AI](https://img.shields.io/badge/AI-Gemini%20%2B%20Azure-green?logo=google)](./backend)

**🎉 Complete PDF Processing, AI Insights & Podcast Generation Platform**

</div>

---

## 🚀 Quick Start for Jury

### One-Command Deployment (Recommended)

```bash
# Method 1: Use our deployment script (Recommended)
./run-jury.sh        # Linux/Mac
run-jury.bat         # Windows

# Method 2: Direct Docker Compose
docker-compose up --build

# Method 3: Docker Build & Run
docker build -t adobe-pdf-platform .
docker run -p 8080:8080 adobe-pdf-platform
```

### System Requirements
- **Docker Desktop** with 4GB+ RAM allocated
- **Port 8080** available (configurable in docker-compose.yml)
- **Internet access** for AI APIs (Google Gemini & Azure TTS)

### Access Points
- **🌐 Main Application**: http://localhost:8080
- **📚 API Documentation**: http://localhost:8080/docs  
- **❤️ Health Check**: http://localhost:8080/health
---

## 📊 Performance Metrics

| Metric | Performance | Details |
|--------|-------------|---------|
| 📄 PDF Processing | ~0.16s per document | Includes outline extraction and indexing |
| 🔍 Search Response | <100ms indexed | TF-IDF vectorization with caching |
| 💡 Insight Generation | 2-5s per request | Google Gemini API processing time |
| 🎙️ Audio Generation | 3-8s per script | Azure TTS synthesis and encoding |
| 🚀 Container Startup | ~30-40s | Complete application initialization |
| 💾 Memory Usage | 2-4GB | Optimized for production deployment |
| 🌐 Frontend Bundle | <2MB gzipped | Vite optimization with code splitting |
| 🔄 API Response | <50ms average | FastAPI with async processing |



## 🎯 Core Features Implemented

### ✅ Mandatory Requirements
- **📄 PDF Upload & Processing** - Drag & drop with automatic outline generation
- **🔍 Advanced Semantic Search (Heading)** - Cross-document content discovery with the model made in Round 1A
- **🎯 Text Highlighting** - Real-time text highlighting in PDF viewer during search
- **🤝 Content Connections** - Intelligent relationship discovery between documents  
- **⚡ High Performance** - Sub-second response times, optimized algorithms
- **🎨 Modern UI** - Responsive design with smooth interactions and animations

### 🏆 Bonus Features (+10 Points)
- **💡 AI Insights Bulb** (+5) - 5 insight types: takeaways, contradictions, examples, cross-references, facts
- **🎙️ Podcast Generation** (+5) - AI-generated audio content with Azure TTS
- **🎯 PDF Navigation** - Click-to-navigate with text highlighting via Adobe Embed API
- **🔄 Real-time Updates** - Live connection discovery and insight caching

### 🌟 Advanced Features
- **📖 Inline PDF Viewer** - Embedded Adobe PDF Embed API with text selection
- **🎨 Text Selection Popup** - Interactive popup for selected text with connections
- **🔊 Audio Playback** - Integrated audio player for generated podcasts
- **📱 Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- **⚡ Real-time Search** - Instant search results with debounced input
- **🎭 Framer Motion Animations** - Smooth transitions and micro-interactions

---

## 🎯 Feature Spotlight: Advanced Semantic Search with Text Highlighting

### How It Works
Our intelligent semantic search system provide accurate content discovery across all uploaded PDFs. When you search for content, the system:

1. **Analyzes Your Query** - Processes natural language queries using advanced NLP
2. **Searches Document Outlines** - Finds relevant headings and sections across all PDFs
3. **Ranks Results** - Uses relevance scoring with exact match prioritization
4. **Highlights Content** - Opens the relevant document and highlights matching text
5. **Shows Context** - Displays the document page and surrounding content

#### 🎯 Text Highlighting in PDF Viewer
When you click on a search result:
- **Automatic Navigation** - Opens the document to the exact page
- **Text Highlighting** - Highlights the matching content in the PDF viewer
- **Adobe Embed Integration** - Uses Adobe PDF Embed API for precise text highlighting
- **Smooth Transitions** - Framer Motion animations for seamless navigation



#### Search Algorithm
```python
# Linux/macOS - Make executable and run
chmod +x run-jury.sh
./run-jury.sh

# Windows - Run batch file
run-jury.bat

# Direct Docker Compose (Alternative)
docker-compose up --build

# Silent background deployment
docker-compose up --build -d
```

#### Docker Commands
```bash
# Build only (without running)
docker build -t adobe-pdf-platform .

# Run with custom port
docker run -p 3000:8080 adobe-pdf-platform

# Run with environment variables
docker run -p 8080:8080 \
  -e GOOGLE_API_KEY=your_key \
  -e AZURE_TTS_KEY=your_key \
  adobe-pdf-platform
```

### 🛠️ Development Commands

#### Local Development Setup
```bash
# Backend development
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
# or
venv\Scripts\activate     # Windows

pip install -r requirements.txt
python main.py

# Frontend development
cd frontend
npm install
npm run dev

# Run both in development mode
npm run dev:all
```

#### Development with Docker
```bash
# Development build with hot reload
docker-compose -f docker-compose.dev.yml up

# Run specific services
docker-compose up backend
docker-compose up frontend

# Execute commands in running container
docker-compose exec adobe-pdf-platform bash
docker-compose exec adobe-pdf-platform python backend/main.py
```
---

## 🏗️ Technical Architecture

### Single Container Solution
```
📦 Docker Container (Production-Ready)
├── 🎨 Frontend (React 19 + Vite)
│   ├── Adobe PDF Embed API Integration
│   ├── Modern UI with Framer Motion
│   ├── TailwindCSS Styling
│   ├── Real-time Text Selection
│   └── Responsive Design System
├── 🔧 Backend (FastAPI + Python 3.11)
│   ├── PDF Processing Pipeline
│   ├── Google Gemini AI Integration  
│   ├── Azure Text-to-Speech
│   ├── Round 1A Search Engine
│   ├── Connection Discovery Engine
│   └── RESTful API Endpoints
├── 🧠 AI Services
│   ├── Google Gemini (Text Analysis)
│   ├── Azure TTS (Audio Generation)
│   ├── TF-IDF Vectorization
│   └── Cosine Similarity Matching
└── 💾 Storage
    ├── PDF Files
    ├── Generated Outlines
    ├── Audio Content
    └── Search Indices
```

### Component Architecture

#### Frontend Components (React 19)
```
src/
├── components/
│   ├── LeftPanel.jsx           # File list and search interface
│   ├── CenterPanel.jsx         # PDF viewer and content display
│   ├── RightPanel.jsx          # Insights and podcast tabs
│   ├── search/
│   │   ├── SemanticSearch.jsx  # AI-powered search interface
│   │   └── FilenameSearch.jsx  # Basic filename filtering
│   ├── InlinePDFViewer.jsx     # Adobe Embed API wrapper
│   ├── TextSelectionPopup.jsx  # Interactive text selection
│   ├── InsightsTab.jsx         # AI insights generation
│   └── PodcastTab.jsx          # Audio content generation
├── services/
│   └── api.js                  # API communication layer
└── utils/
    └── pdfDb.js               # Client-side storage utilities
```

#### Backend Services (FastAPI)
```
backend/
├── main.py                    # Application entry point
├── config.py                  # Environment configuration
├── api/
│   ├── documents.py           # PDF upload and management
│   ├── search.py              # Semantic search endpoints
│   ├── insights.py            # AI insights generation
│   ├── connections.py         # Document relationship discovery
│   └── podcast.py             # Audio generation endpoints
├── services/
│   ├── document_service.py    # PDF processing logic
│   ├── search_service.py      # TF-IDF search implementation
│   ├── insights_service.py    # Gemini AI integration
│   ├── connection_service.py  # Relationship analysis
│   └── podcast_service.py     # Azure TTS integration
├── models/                    # Data models and schemas
├── outline_engine/            # PDF outline extraction
└── utils/                     # Shared utilities and helpers
```
---

## 🎯 Jury Evaluation Guide

### Quick Validation Steps

1. **🚀 Deploy**: Run `docker-compose up --build` or `./run-jury.sh`
2. **✅ Verify**: Check http://localhost:8080/health (should return `{"status": "healthy"}`)
3. **📄 Upload**: Try uploading a PDF via the drag & drop interface
4. **🔍 Search**: Test semantic search functionality with sample queries
5. **💡 Insights**: Generate AI insights for selected text content
6. **🎙️ Audio**: Create a podcast from uploaded PDFs
7. **🎯 Navigation**: Test click-to-navigate from search results

### Key Differentiators to Evaluate

- **🏆 Complete Integration** - Frontend + Backend in single container with health checks
- **⚡ Production Ready** - Comprehensive error handling, logging, and monitoring
- **🎨 User Experience** - Modern, responsive interface with smooth animations
- **🧠 AI Integration** - Multiple AI services (Google Gemini + Azure TTS) working seamlessly
- **📈 Performance** - Optimized for speed, reliability, and resource efficiency
- **🔍 Advanced Search** - Real-time semantic search with text highlighting and navigation
- **📖 PDF Integration** - Deep Adobe PDF Embed API integration with text selection

### Feature Verification Checklist

#### Core Requirements ✅
- [ ] PDF upload and processing pipeline works end-to-end
- [ ] Semantic search returns relevant results across documents  
- [ ] Search results navigate to exact PDF pages with highlighting
- [ ] Content connection discovery finds relationships between documents
- [ ] High-performance response times (search <100ms, processing <1s)
- [ ] Modern, responsive UI works on different screen sizes

#### Bonus Features ✅ 
- [ ] AI Insights Bulb generates 5 different insight types
- [ ] Podcast generation creates audio content from PDF text
- [ ] Text selection in PDF triggers instant insight generation
- [ ] Real-time search updates as user types
- [ ] Smooth animations and micro-interactions throughout UI


#### Preview Command Issues
```bash
# If npm run preview fails, ensure build files exist
cd frontend
npm run build                      # Build production files first
npm run preview                    # Then preview

# Check if port 3000 is available
sudo lsof -i :3000                # Check what's using port 3000
npx kill-port 3000                # Kill process on port 3000

# Use different port for preview
npm run preview -- --port 3001    # Use port 3001 instead

# Verify Vite installation
npm list vite                     # Check if Vite is installed
npm install vite --save-dev       # Reinstall Vite if needed
```


<div align="center">

**🎉 Ready for Jury Evaluation!**

**Just run `docker-compose up --build` and visit http://localhost:8080**

*Complete PDF insights and podcast platform in a single command* 🚀

---

**🏆 Connecting the Dots - Grand Finale Submission**

*Delivering advanced AI-powered document processing with modern UI/UX design*

**📧 Support**: Check logs with `docker-compose logs -f` for any issues

</div>
