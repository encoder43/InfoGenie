#  InfoGenie - Intelligent PDF Document Assistant

<div align="center">

![InfoGenie Logo](https://img.shields.io/badge/InfoGenie-PDF%20Assistant-blue?style=for-the-badge&logo=book-open)

**Ask questions about your PDF documents and get intelligent answers powered by AI**

[![Python](https://img.shields.io/badge/Python-3.10+-blue?logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-green?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18+-61dafb?logo=react&logoColor=black)](https://reactjs.org)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ed?logo=docker&logoColor=white)](https://docker.com)
[![LangChain](https://img.shields.io/badge/LangChain-RAG-fb8500?logo=chainlink&logoColor=white)](https://langchain.com)

[🚀 Live Demo](#) • [📖 Documentation](#documentation) • [🤝 Contributing](#contributing)

</div>

---

## Table of Contents

- [About](#about)
- [ Features](#features)
- [ Tech Stack](#tech-stack)
- [ Quick Start](#quick-start)
- [ Docker Deployment](#docker-deployment)
- [ API Documentation](#api-documentation)
- [ Development](#development)
- [ Testing](#testing)
- [ Production Deployment](#production-deployment)
- [ Contributing](#contributing)
- [License](#license)
- [ Contact](#contact)

---

## About

InfoGenie is a cutting-edge **Retrieval-Augmented Generation (RAG)** application that transforms how you interact with PDF documents. Simply upload a PDF, ask questions in natural language, and receive intelligent, context-aware answers extracted directly from your document content.

**Perfect for:**
- Research and academia
-  Legal document analysis  
-  Business report insights
-  Educational content exploration
-  Enterprise document management

---

##  Features

###  Core Functionality
- **PDF Upload**: Drag-and-drop PDF document upload
- **Intelligent Search**: Natural language queries with semantic understanding
- **Interactive Chat**: Real-time conversation interface
- **Context-Aware Answers**: Responses based on document content
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Real-time Processing**: Instant responses with loading indicators

###  Advanced Capabilities
- **Multiple Document Support**: Process and query multiple PDFs
- **Modern UI**: Clean, intuitive interface built with React + TypeScript
- **Fast Processing**: Optimized vector search with ChromaDB
- **Secure**: CORS-protected API with file validation
- **Analytics Ready**: Structured logging with timestamps
- **Production Ready**: Dockerized with health checks

---

## Tech Stack

### Backend
- **FastAPI**: Modern, fast web framework for building APIs
- **LangChain**: Framework for developing LLM-powered applications
- **HuggingFace**: Pre-training Transformers (google/flan-t5-large)
- **SentenceTransformers**: all-mpnet-base-v2 for embeddings
- **ChromaDB**: Vector database for similarity search
- **PDF Processing**: pdfminer.six for document extraction

### Frontend
- **React 18**: Modern UI library with hooks
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Vite**: Fast build tool and dev server
- **Radix UI**: Accessible UI components

### Infrastructure
- **Docker**: Containerized deployment
- **Render.com**: Production hosting platform
- **Nginx**: Reverse proxy and load balancing
- **Health Checks**: Automatic service monitoring

---

## Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- Docker (optional)

### 1. Clone Repository
```bash
git clone https://github.com/encoder43/infogenie.git
cd infogenie
```

### 2. Backend Setup
```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start backend
cd backend
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 3. Frontend Setup
```bash
# Install dependencies
cd frontend
npm install

# Start development server
npm run dev
```

### 4. Access Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

---

##  Docker Deployment

### Local Development with Docker

#### 1. Build Image
```bash
# Build production image
docker build -t infogenie:latest .

# Build with specific tag
docker build -t infogenie:v1.0.0 .
```

#### 2. Run Container
```bash
# Run with port mapping
docker run -p 8000:8000 \
  -e HF_HOME=/app/models \
  -e TRANSFORMERS_CACHE=/app/models \
  infogenie:latest

# Run with volume mounts for persistence
docker run -p 8000:8000 \
  -v $(pwd)/docs:/app/docs \
  -v $(pwd)/db:/app/db \
  infogenie:latest
```

#### 3. Docker Compose (Recommended)
```bash
# Start complete stack
docker-compose -f docker-compose.prod.yml up --build

# Start with Nginx
docker-compose -f docker-compose.prod.yml --profile with-nginx up --build
```

### Production Deployment

#### Docker Hub
```bash
# Tag for production
docker tag infogenie:latest dcoder3/infogenie:v1.0.0

# Push to Docker Hub
docker push dcoder3/infogenie:v1.0.0

# Pull on production server
docker pull dcoder3/infogenie:v1.0.0
docker run -d -p 8000:8000 --name infogenie dcoder3/infogenie:v1.0.0
```

#### Environment Variables
```bash
# Essential environment variables
export PYTHONUNBUFFERED=1
export HF_HOME=/app/models
export TRANSFORMERS_CACHE=/app/models
export SENTENCE_TRANSFORMERS_HOME=/app/models
```

---

##  API Documentation

### Core Endpoints

#### POST /upload
Upload and process a PDF document.

```bash
curl -X POST "http://localhost:8000/upload" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@document.pdf"
```

**Response:**
```json
{
  "status": "success",
  "filename": "document.pdf", 
  "message": "File processed and ready for questions."
}
```

#### POST /ask
Ask questions about uploaded documents.

```bash
curl -X POST "http://localhost:8000/ask" \
  -H "Content-Type: application/json" \
  -d '{"query": "What is the main topic of this document?"}'
```

**Response:**
```json
{
  "answer": "The main topic discusses..."
}
```

#### GET /
Health check endpoint.

```bash
curl http://localhost:8000/
```

**Response:**
```json
{
  "status": "InfoGenie Backend is running!"
}
```

### Error Handling
All endpoints return appropriate HTTP status codes:
- `200`: Success
- `400`: Bad Request (invalid file type, malformed query)
- `422`: Validation Error
- `500`: Internal Server Error
- `503`: Service Unavailable (model loading)

---

## 🏗️ Development

### Project Structure
```
infogenie/
├── backend/                 # FastAPI backend
│   ├── main.py            # Main application entry point
│   ├── api/               # API routes
│   ├── core/              # Configuration and settings
│   ├── rag/               # RAG pipeline implementation
│   └── utils/             # Utility functions
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/    # Reusable React components
│   │   ├── App.tsx        # Main app component
│   │   └── index.css      # Global styles
│   ├── package.json       # Node.js dependencies
│   └── vite.config.ts     # Vite configuration
├── docs/                  # Documentation files
├── Dockerfile             # Container configuration
├── docker-compose.prod.yml # Production orchestration
├── requirements.txt       # Python dependencies
└── README.md              # This file
```

### Code Quality
```bash
# Python formatting
black backend/
isort backend/

# Type checking
mypy backend/

# Frontend linting
cd frontend
npm run lint
npm run type-check
```

---

##  Testing

### Backend Testing
```bash
cd backend
python -m pytest tests/
```

### Frontend Testing
```bash
cd frontend
npm test
npx playwright test
```

### Integration Testing
```bash
# Test complete flow
curl -X POST "http://localhost:8000/upload" -F "file=@test.pdf"
curl -X POST "http://localhost:8000/ask" -d '{"query":"Test question"}'
```

---

##  Production Deployment

### Render.com Deployment

#### 1. Repository Setup
- Connect your GitHub repository
- Ensure `render.yaml` is in project root
- Set environment variables in Render dashboard

#### 2. Environment Variables
```bash
PYTHONUNBUFFERED=1
PYTHONDONTWRITEBYTECODE=1
HF_HOME=/app/models
TRANSFORMERS_CACHE=/app/models
SENTENCE_TRANSFORMERS_HOME=/app/models
PORT=8000
HOST=0.0.0.0
```

#### 3. Automatic Deployment
- Push to `main` branch triggers deployment
- Health checks ensure service availability
- Auto-scaling based on traffic

### Performance Optimization

#### Model Caching
- Models are pre-downloaded during Docker build
- Eliminates startup delays in production
- Optimized for containerized environments

#### Resource Management
- Memory limits configured for hosting platforms
- CPU optimization for cost-effective deployment
- Connection pooling for better throughput

---

##  Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards
- Follow PEP 8 for Python code
- Use TypeScript strict mode for frontend
- Include tests for new features
- Update documentation as needed

---

##  License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

##  Contact

**Project Maintainer:** [Yerram Deekshith Kumar]

- Email: deekshithyerram@gmail.com
- GitHub: [@encoder43](https://github.com/encoder43)
- LinkedIn: [yerramdeekshithkumar](https://www.linkedin.com/in/yerramdeekshithkumar)

**Project Links:**
- Live Demo: [Demo URL](https://infogenie-abd.onrender.com)
- Documentation: [Docs URL](#)
- Research paper:[Infoginie](https://www.scitepress.org/Papers/2024/133125/133125.pdf)
- Issue Tracker: [GitHub Issues](https://github.com/encoder43/infogenie/issues)

---

<div align="center">

**Made with ❤️ by the InfoGenie Team**

![Stars](https://img.shields.io/github/stars/encoder43/infogenie?style=social)
![Forks](https://img.shields.io/github/forks/encoder43/infogenie?style=social)
![Watchers](https://img.shields.io/github/watchers/encoder43/infogenie?style=social)

</div>
