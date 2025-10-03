# backend/core/config.py

import os
import torch
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    """Loads and validates application settings from the environment."""

    # Load environment variables from a .env file
    model_config = SettingsConfigDict(env_file='.env', env_file_encoding='utf-8')

    # RAG Pipeline Configuration
    EMBEDDING_MODEL_NAME: str = "all-mpnet-base-v2"  # Better embeddings
    PERSIST_DIRECTORY: str = os.path.join(os.getcwd(), "db")
    LLM_CHECKPOINT: str = "google/flan-t5-large"  # More tokens (1024), better quality
    
    # File handling
    DOCS_DIRECTORY: str = os.path.join(os.getcwd(), "docs")

    # Device configuration
    DEVICE: str = "cuda" if torch.cuda.is_available() else "cpu"
    USE_8BIT: bool = False  # Set True to reduce GPU memory usage

    # Optional: fallback for accelerate missing
    ACCELERATE_AVAILABLE: bool = False

    def __init__(self, **values):
        super().__init__(**values)
        try:
            import accelerate
            self.ACCELERATE_AVAILABLE = True
        except ImportError:
            self.ACCELERATE_AVAILABLE = False
            print(
                "[Warning] `accelerate` is not installed. "
                "Models with `device_map='auto'` may not work. "
                "Install via `pip install accelerate` for full GPU support."
            )


# Instantiate settings to be imported by other modules
settings = Settings()
