import logging
from typing import List
from fastembed import TextEmbedding

logger = logging.getLogger("papertrail.embeddings")

MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"

_model = None


def _log_memory(stage: str) -> None:
    """Best-effort memory diagnostics.

    Importing backend.server is optional here. The server exits the process when
    its required env vars are missing, which would otherwise take down the
    offline tools (build_vector_store, reindex_notes) that only need to embed
    text and have no use for GROQ/Supabase credentials.
    """
    try:
        from backend.server import log_memory
    except BaseException:
        logger.debug("Memory diagnostics unavailable at stage: %s", stage)
        return
    log_memory(stage)


def get_embedding_model():
    global _model
    if _model is None:
        _log_memory("Before fastembed TextEmbedding model initialization")
        logger.info("Initializing fastembed TextEmbedding model %r...", MODEL_NAME)
        # fastembed runs ONNX models on CPU by default
        _model = TextEmbedding(model_name=MODEL_NAME)
        logger.info("fastembed model initialized successfully.")
        _log_memory("After fastembed TextEmbedding model initialization")
    return _model


def get_embeddings(texts: List[str]) -> List[List[float]]:
    model = get_embedding_model()
    embeddings = list(model.embed(texts))
    return [e.tolist() for e in embeddings]
