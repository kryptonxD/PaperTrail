import os
import sys
import logging
from pathlib import Path

# Add project root to python path
sys.path.append(str(Path(__file__).resolve().parent.parent.parent))

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("build_vector_store")

def build():
    logger.info("Initializing build vector store process...")
    
    # Import document data
    try:
        from backend.server import ALL_DOCS
    except Exception as e:
        logger.error(f"Failed to import ALL_DOCS: {e}")
        sys.exit(1)
        
    # Import ingestion function
    try:
        from backend.ingest import ingest_documents
    except Exception as e:
        logger.error(f"Failed to import ingest_documents: {e}")
        sys.exit(1)
        
    logger.info(f"Loaded {len(ALL_DOCS)} source documents. Starting ingestion...")
    ingest_documents(ALL_DOCS)
    logger.info("Custom vector store built successfully!")

if __name__ == "__main__":
    build()
