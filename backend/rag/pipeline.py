# backend/rag/pipeline.py

import os
import torch
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM, pipeline
from langchain_community.document_loaders import PDFMinerLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.embeddings import SentenceTransformerEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_community.llms import HuggingFacePipeline
from langchain.chains import RetrievalQA
from langchain.schema import BaseRetriever

from backend.core.config import settings
from constants import CHROMA_SETTINGS


class DummyRetriever(BaseRetriever):
    """A placeholder retriever that returns empty results for initialization."""
    def get_relevant_documents(self, query):
        return []

    async def aget_relevant_documents(self, query):
        return []


class RAGPipeline:
    def __init__(self):
        self.qa_chain = None
        self.llm = None
        self.embeddings = None
        self._initialize_pipeline()

    def _initialize_pipeline(self):
        """Initializes the full RAG pipeline and loads models."""
        print("Initializing RAG pipeline...")

        # -------- Embeddings --------
        print(f"Loading embedding model: {settings.EMBEDDING_MODEL_NAME}")
        self.embeddings = SentenceTransformerEmbeddings(model_name=settings.EMBEDDING_MODEL_NAME)

        # -------- LLM --------
        print(f"Loading LLM: {settings.LLM_CHECKPOINT}")
        tokenizer = AutoTokenizer.from_pretrained(settings.LLM_CHECKPOINT)

        # Device selection
        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        print(f"Device set to use {device}")

        # Load model safely
        base_model = AutoModelForSeq2SeqLM.from_pretrained(
            settings.LLM_CHECKPOINT,
            device_map="auto" if torch.cuda.is_available() else None,
            torch_dtype=torch.float32,
        )

        # HuggingFace pipeline
        hf_pipeline = pipeline(
            task="text2text-generation",
            model=base_model,
            tokenizer=tokenizer,
            max_length=256,
            do_sample=True,
            temperature=0.3,
            top_p=0.95,
            device=0 if torch.cuda.is_available() else -1
        )

        self.llm = HuggingFacePipeline(pipeline=hf_pipeline)

        # -------- Vector Store / Retriever --------
        if os.path.exists(settings.PERSIST_DIRECTORY) and os.listdir(settings.PERSIST_DIRECTORY):
            print("Loading existing vector store...")
            db = Chroma(
                persist_directory=settings.PERSIST_DIRECTORY,
                embedding_function=self.embeddings,
                client_settings=CHROMA_SETTINGS,
            )
            retriever = db.as_retriever()
            self.qa_chain = RetrievalQA.from_chain_type(
                llm=self.llm,
                chain_type="stuff",
                retriever=retriever,
                return_source_documents=True
            )
            print("QA chain initialized with existing vector store.")
        else:
            print("No vector store found. QA chain will be initialized after first document upload.")
            dummy_retriever = DummyRetriever()
            self.qa_chain = RetrievalQA.from_chain_type(
                llm=self.llm,
                chain_type="stuff",
                retriever=dummy_retriever,
                return_source_documents=True
            )

    def process_document(self, filepath: str):
        """Processes a single PDF document and updates the QA chain."""
        print(f"Processing document: {filepath}")
        loader = PDFMinerLoader(filepath)
        documents = loader.load()

        splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
        texts = splitter.split_documents(documents)

        # Create vector store
        print("Creating and persisting vector store...")
        db = Chroma.from_documents(
            texts,
            self.embeddings,
            persist_directory=settings.PERSIST_DIRECTORY,
            client_settings=CHROMA_SETTINGS
        )
        db.persist()

        # Update retriever in QA chain
        self.qa_chain.retriever = db.as_retriever()
        print("QA chain has been updated with the new document.")

    def ask_question(self, query: str) -> str:
        """Answers a question based on the documents."""
        if not self.qa_chain or not self.qa_chain.retriever:
            return "The system is not ready. Please upload a document first."

        print(f"Answering query: {query}")
        result = self.qa_chain(query)
        return result.get("result", "Sorry, I could not find an answer.")
