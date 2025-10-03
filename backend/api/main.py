#backend\api\main.py
from dotenv import load_dotenv
import os

load_dotenv()  # Load values from .env during init

MODEL_CHECKPOINT = os.getenv("MODEL_CHECKPOINT")
EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL")
CHROMA_PERSIST_DIRECTORY = os.getenv("CHROMA_PERSIST_DIRECTORY")
DOCS_DIRECTORY = os.getenv("DOCS_DIRECTORY")
HUGGINGFACE_API_KEY = os.getenv("HUGGINGFACE_API_KEY")
DEVICE = os.getenv("DEVICE", "cpu")
