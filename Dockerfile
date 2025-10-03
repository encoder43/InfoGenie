# =============================================================================
# Production-Ready Dockerfile for InfoGenie RAG Application
# Optimized for Render.com deployment with persistent model caching
# =============================================================================

# ~~~~~~~~~~~ STAGE 1: Dependencies & Model Download ~~~~~~~~~~~
FROM python:3.10-slim as builder

# --- System Dependencies ---
# Install essential system packages for ML libraries
RUN apt-get update && apt-get install -y \
    build-essential \
    gcc \
    g++ \
    libffi-dev \
    libssl-dev \
    && rm -rf /var/lib/apt/lists/*

# --- Environment Variables ---
ENV PYTHONUNBUFFERED=1
ENV PIP_NO_CACHE_DIR=1
ENV PIP_DISABLE_PIP_VERSION_CHECK=1
ENV PYTHONDONTWRITEBYTECODE=1

# Set working directory
WORKDIR /app

# --- Install Python Dependencies ---
# Copy requirements first for better layer caching
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip setuptools wheel && \
    pip install --no-cache-dir -r requirements.txt

# --- Pre-download Models ---
# Download and cache all required models during build time
ENV HF_HOME=/app/models
ENV TRANSFORMERS_CACHE=/app/models
ENV SENTENCE_TRANSFORMERS_HOME=/app/models

# Download embedding model
RUN python -c "from sentence_transformers import SentenceTransformer; \
               SentenceTransformer('all-mpnet-base-v2')"

# Download LLM model
RUN python -c "from transformers import AutoTokenizer, AutoModelForSeq2SeqLM; \
               tokenizer = AutoTokenizer.from_pretrained('google/flan-t5-large'); \
               model = AutoModelForSeq2SeqLM.from_pretrained('google/flan-t5-large')"

# ~~~~~~~~~~~ STAGE 2: Production Image ~~~~~~~~~~~
FROM python:3.10-slim as production

# --- System Dependencies ---
# Install only runtime dependencies
RUN apt-get update && apt-get install -y \
    libgomp1 \
    libgcc-s1 \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# --- Environment Variables ---
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1
ENV HF_HOME=/app/models
ENV TRANSFORMERS_CACHE=/app/models
ENV SENTENCE_TRANSFORMERS_HOME=/app/models

# --- Create Application User ---
RUN groupadd -r appuser && useradd -r -g appuser appuser

# Set working directory
WORKDIR /app

# --- Copy Dependencies from Builder ---
COPY --from=builder /usr/local/lib/python3.10/site-packages /usr/local/lib/python3.10/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

# --- Copy Pre-downloaded Models ---
COPY --from=builder /app/models /app/models

# --- Copy Application Code ---
COPY backend/ ./backend/
COPY constants.py ./

# --- Create Directories ---
RUN mkdir -p /app/docs /app/db /app/logs && \
    chown -R appuser:appuser /app

# --- Health Check ---
HEALTHCHECK --interval=30s --timeout=30s --start-period=60s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:8000/', timeout=10)"

# --- Switch to Non-Root User ---
USER appuser

# --- Expose Port ---
EXPOSE 8000

# --- Production Command ---
# Use gunicorn with uvicorn workers for better performance
CMD ["python", "-m", "uvicorn", "backend.main:app", \
     "--host", "0.0.0.0", \
     "--port", "8000", \
     "--workers", "1", \
     "--access-log", \
     "--log-level", "info", \
     "--timeout-keep-alive", "30", \
     "--timeout-graceful-shutdown", "30"]