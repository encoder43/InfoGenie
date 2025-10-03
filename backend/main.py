# backend/main.py

import os
import logging
import aiofiles
from fastapi import FastAPI, UploadFile, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from contextlib import asynccontextmanager
from backend.core.config import settings
from backend.rag.pipeline import RAGPipeline

# --- 1. Logging Configuration ---
# Set up a logger for better monitoring and debugging.
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# --- 2. Pydantic Models for Type Hinting & Validation ---
# Define the expected request and response bodies for your API.
# This provides automatic data validation and generates accurate OpenAPI docs.
class AskRequest(BaseModel):
    query: str

class AskResponse(BaseModel):
    answer: str

class UploadResponse(BaseModel):
    status: str
    filename: str
    message: str

# --- 3. FastAPI App with Lifespan Events ---
# The 'lifespan' context manager is the modern way to handle
# startup and shutdown events in FastAPI.
@asynccontextmanager
async def lifespan(app: FastAPI):
    # --- Startup ---
    logger.info("Application startup: Starting...")
    
    try:
        logger.info("Step 1: Importing RAG pipeline...")
        from backend.rag.pipeline import RAGPipeline
        logger.info("Step 2: RAG pipeline imported successfully")
        
        logger.info("Step 3: Initializing RAG pipeline...")
        app.state.pipeline = RAGPipeline()
        logger.info("Step 4: RAG pipeline initialized successfully")
        
    except Exception as e:
        logger.error(f"RAG pipeline initialization failed: {e}")
        app.state.pipeline = None
    
    logger.info("Application startup complete.")
    yield
    # --- Shutdown ---
    logger.info("Application shutdown.")
    app.state.pipeline = None

app = FastAPI(
    title="InfoGenie RAG API",
    description="API for chatting with your PDF documents.",
    version="1.0.0",
    lifespan=lifespan
)

# --- 4. CORS Middleware ---
# Configure Cross-Origin Resource Sharing to allow your frontend to connect.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict this to your frontend's domain.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 5. API Endpoints ---

@app.get("/", tags=["General"])
def read_root():
    """A simple health check endpoint."""
    return {"status": "InfoGenie Backend is running!"}

@app.get("/test", tags=["General"])
def test_endpoint():
    """A simple test endpoint that doesn't depend on RAG pipeline."""
    return {"message": "Simple test endpoint works!", "timestamp": "2024-01-01T00:00:00Z"}

@app.post("/upload", response_model=UploadResponse, status_code=status.HTTP_201_CREATED, tags=["RAG Pipeline"])
async def upload_file(request: Request, file: UploadFile):
    """
    Uploads a PDF, processes it asynchronously, and updates the RAG pipeline.
    """
    pipeline: RAGPipeline = request.app.state.pipeline
    
    # Check if pipeline is initialized
    if pipeline is None:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="RAG pipeline is still initializing. Please try again in a few moments.")
    
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid file type. Please upload a PDF.")

    try:
        os.makedirs(settings.DOCS_DIRECTORY, exist_ok=True)
        filepath = os.path.join(settings.DOCS_DIRECTORY, file.filename)

        # Asynchronously write the file to disk to avoid blocking.
        async with aiofiles.open(filepath, "wb") as f:
            while chunk := await file.read(1024):  # Read in chunks
                await f.write(chunk)
        
        logger.info(f"File '{file.filename}' uploaded successfully. Processing...")
        pipeline.process_document(filepath)
        logger.info(f"File '{file.filename}' processed and indexed.")
        
        return {
            "status": "success", 
            "filename": file.filename,
            "message": "File processed and ready for questions."
        }
    
    except Exception as e:
        logger.error(f"Error during file upload: {e}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to process file: {str(e)}")

@app.post("/ask", response_model=AskResponse, tags=["RAG Pipeline"])
async def ask_question(request: Request, ask_request: AskRequest):
    """
    Receives a query and returns an answer from the RAG pipeline.
    """
    pipeline: RAGPipeline = request.app.state.pipeline
    try:
        logger.info(f"Received query: {ask_request.query}")
        answer = pipeline.ask_question(ask_request.query)
        logger.info("Successfully generated an answer.")
        return {"answer": answer}
    
    except Exception as e:
        logger.error(f"Error during query processing: {e}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to get an answer: {str(e)}")
# (duplicate /test endpoint removed)