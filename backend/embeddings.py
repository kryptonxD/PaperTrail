import logging
from typing import List
from sentence_transformers import SentenceTransformer

logger = logging.getLogger("papertrail.embeddings")

_model = None

def get_embedding_model():
    global _model
    if _model is None:
        logger.info("Loading sentence-transformers model 'all-MiniLM-L6-v2'...")
        _model = SentenceTransformer("all-MiniLM-L6-v2")
        logger.info("Model loaded successfully.")
    return _model

def get_embeddings(texts: List[str]) -> List[List[float]]:
    model = get_embedding_model()
    embeddings = model.encode(texts, show_progress_bar=False)
    return [e.tolist() for e in embeddings]
