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

# --- Build-time model selection (with sensible defaults) ---
# You can override these at build time for smaller models on free tiers
# Example (free tier):
#   docker build --build-arg EMBEDDING_MODEL_NAME=all-MiniLM-L6-v2 \
#                --build-arg LLM_CHECKPOINT=google/flan-t5-small \
#                -t infogenie:mini .
ARG EMBEDDING_MODEL_NAME=all-mpnet-base-v2
ARG LLM_CHECKPOINT=google/flan-t5-large

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

# Download embedding model (parameterized)
RUN python -c "from sentence_transformers import SentenceTransformer; \
               import os; \
               model=os.environ.get('EMBEDDING_MODEL_NAME','all-mpnet-base-v2'); \
               SentenceTransformer(model)"

# Download LLM model (parameterized)
RUN python -c "from transformers import AutoTokenizer, AutoModelForSeq2SeqLM; \
               import os; \
               ckpt=os.environ.get('LLM_CHECKPOINT','google/flan-t5-large'); \
               tokenizer = AutoTokenizer.from_pretrained(ckpt); \
               model = AutoModelForSeq2SeqLM.from_pretrained(ckpt)"

# ~~~~~~~~~~~ STAGE 2: Production Image ~~~~~~~~~~~
FROM python:3.10-slim as production

# --- System Dependencies ---
# Install only runtime dependencies
RUN apt-get update && apt-get install -y \
    libgomp1 \
    libgcc-s1 \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# --- Build-time model selection (propagate defaults) ---
ARG EMBEDDING_MODEL_NAME=all-mpnet-base-v2
ARG LLM_CHECKPOINT=google/flan-t5-large

# --- Environment Variables ---
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1
ENV HF_HOME=/app/models
ENV TRANSFORMERS_CACHE=/app/models
ENV SENTENCE_TRANSFORMERS_HOME=/app/models
ENV EMBEDDING_MODEL_NAME=${EMBEDDING_MODEL_NAME}
ENV LLM_CHECKPOINT=${LLM_CHECKPOINT}

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
# Use Render's dynamic PORT for proper deployment
CMD exec uvicorn backend.main:app --host 0.0.0.0 --port ${PORT:-8000} --workers 1 --access-log --log-level info --timeout-keep-alive 30 --timeout-graceful-shutdown 30