import os 
import chromadb
from chromadb.config import Settings 

# Updated Chroma settings for newer versions
CHROMA_SETTINGS = Settings(
    persist_directory='db',
    anonymized_telemetry=False
)