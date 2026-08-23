"""Vector retrieval over the prebuilt PaperTrail store.

Embeddings are held as one L2-normalised float32 matrix so a query is a single
matmul rather than a Python loop that re-allocates a NumPy array per chunk.
"""
import logging
import pickle
from pathlib import Path
from typing import List, Dict, Any, Optional

import numpy as np

from backend.embeddings import get_embeddings

logger = logging.getLogger("papertrail.retriever")

ROOT_DIR = Path(__file__).parent
CHROMA_DIR = ROOT_DIR / "data" / "chroma"          # legacy, unused
STORE_PATH = ROOT_DIR / "data" / "vector_store.pkl"

vector_store_data: List[Dict[str, Any]] = []

# Derived index, rebuilt whenever the store is (re)loaded
_matrix: Optional[np.ndarray] = None   # (N, dim) float32, rows L2-normalised
_states: Optional[np.ndarray] = None   # (N,) lowercased state per chunk


def _build_index() -> None:
    """Precompute the normalised embedding matrix and the state filter column."""
    global _matrix, _states

    usable = [it for it in vector_store_data if it.get("embedding") is not None]
    if len(usable) != len(vector_store_data):
        logger.warning(
            "Skipping %d chunk(s) with no embedding.",
            len(vector_store_data) - len(usable),
        )
    if not usable:
        _matrix, _states = None, None
        return

    mat = np.asarray([it["embedding"] for it in usable], dtype=np.float32)
    norms = np.linalg.norm(mat, axis=1, keepdims=True)
    norms[norms == 0] = 1.0          # keep zero vectors at zero similarity
    _matrix = mat / norms
    _states = np.asarray(
        [str(it["metadata"].get("state", "")).strip().lower() for it in usable]
    )
    # keep positional alignment between the matrix and the records it indexes
    vector_store_data[:] = usable
    logger.info(
        "Vector index ready: %d chunks x %d dims (%.1f MB).",
        _matrix.shape[0], _matrix.shape[1], _matrix.nbytes / 1e6,
    )


def load_vector_store() -> None:
    global vector_store_data
    if not STORE_PATH.exists():
        logger.warning("Vector store not found at %s. Needs seeding.", STORE_PATH)
        vector_store_data = []
        _build_index()
        return
    try:
        logger.info("Loading vector store from %s...", STORE_PATH)
        with open(STORE_PATH, "rb") as f:
            vector_store_data = pickle.load(f)
        logger.info("Loaded %d embedding vectors.", len(vector_store_data))
    except Exception as e:
        logger.error("Failed to load vector store: %s", e)
        vector_store_data = []
    _build_index()


load_vector_store()


class MockCollection:
    def count(self):
        return len(vector_store_data)


def get_collection():
    return MockCollection()


def cosine_similarity(a: np.ndarray, b: np.ndarray) -> float:
    """Kept for callers/tests that score a single pair."""
    na, nb = np.linalg.norm(a), np.linalg.norm(b)
    if na == 0 or nb == 0:
        return 0.0
    return float(np.dot(a, b) / (na * nb))


def retrieve(query: str, state: Optional[str] = None, top_k: int = 5) -> List[Dict[str, Any]]:
    if _matrix is None:
        logger.warning("Retrieval requested but vector store is empty.")
        return []

    try:
        embs = get_embeddings([query])
        if not embs:
            return []
        q = np.asarray(embs[0], dtype=np.float32)
    except Exception as e:
        logger.error("Failed to generate query embedding: %s", e)
        return []

    qn = np.linalg.norm(q)
    if qn == 0:
        return []
    scores = _matrix @ (q / qn)          # cosine, both sides normalised

    if state:
        want = state.strip().lower()
        # chunks with no state recorded stay eligible, matching prior behaviour
        mask = (_states == want) | (_states == "")
        if not mask.any():
            return []
        scores = np.where(mask, scores, -np.inf)

    docs: List[Dict[str, Any]] = []
    seen: set = set()
    for i in np.argsort(-scores):
        score = scores[i]
        if not np.isfinite(score):
            break
        meta = vector_store_data[i]["metadata"]
        parent_id = meta.get("doc_id")
        if not parent_id or parent_id in seen:
            continue
        seen.add(parent_id)
        docs.append({
            "id": parent_id,
            "name": meta.get("name", ""),
            "state": meta.get("state", ""),
            "confidence": meta.get("confidence", "UNVERIFIED"),
            "issuing_office": meta.get("issuing_office", ""),
            "department": meta.get("department", ""),
            "fee": meta.get("fee", ""),
            "processing_time": meta.get("processing_time", ""),
            "portal": meta.get("portal", ""),
            "source_url": meta.get("source_url", ""),
            "last_verified": meta.get("last_verified", ""),
            "online_process": meta.get("online_process", ""),
            "offline_process": meta.get("offline_process", ""),
            "required_documents": meta.get("required_documents", ""),
            "category": meta.get("category", "General"),
            "is_community_note": meta.get("is_community_note", False),
            "_score": float(score),
        })
        if len(docs) >= top_k:
            break
    return docs
