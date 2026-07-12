import logging
from typing import List
from fastembed import TextEmbedding

logger = logging.getLogger("papertrail.embeddings")

_model = None

def get_embedding_model():
    global _model
    if _model is None:
        logger.info("Initializing fastembed TextEmbedding model 'sentence-transformers/all-MiniLM-L6-v2'...")
        # fastembed runs ONNX models on CPU by default
        _model = TextEmbedding(model_name="sentence-transformers/all-MiniLM-L6-v2")
        logger.info("fastembed model initialized successfully.")
    return _model

def get_embeddings(texts: List[str]) -> List[List[float]]:
    model = get_embedding_model()
    embeddings = list(model.embed(texts))
    return [e.tolist() for e in embeddings]
