import os
import logging
from pathlib import Path
from typing import List, Dict, Any, Optional
import pickle
import numpy as np
from backend.embeddings import get_embeddings

logger = logging.getLogger("papertrail.retriever")

ROOT_DIR = Path(__file__).parent
CHROMA_DIR = ROOT_DIR / "data" / "chroma"
STORE_PATH = ROOT_DIR / "data" / "vector_store.pkl"

vector_store_data: List[Dict[str, Any]] = []

def load_vector_store():
    global vector_store_data
    if STORE_PATH.exists():
        try:
            logger.info(f"Loading custom in-memory vector store from {STORE_PATH}...")
            with open(STORE_PATH, "rb") as f:
                vector_store_data = pickle.load(f)
            logger.info(f"Loaded {len(vector_store_data)} embedding vectors successfully.")
        except Exception as e:
            logger.error(f"Failed to load vector store from pickle: {e}")
            vector_store_data = []
    else:
        logger.warning(f"Vector store pickle file not found at {STORE_PATH}. Needs seeding.")
        vector_store_data = []

# Load on module import
load_vector_store()

class MockCollection:
    def count(self):
        return len(vector_store_data)

def get_collection():
    return MockCollection()

def cosine_similarity(a: np.ndarray, b: np.ndarray) -> float:
    dot = np.dot(a, b)
    norm_a = np.linalg.norm(a)
    norm_b = np.linalg.norm(b)
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return float(dot / (norm_a * norm_b))

def retrieve(query: str, state: Optional[str] = None, top_k: int = 5) -> List[Dict[str, Any]]:
    # Lazy initial check
    if not vector_store_data:
        logger.warning("Retrieval requested but vector store is empty.")
        return []
        
    try:
        # Generate query embedding
        query_embs = get_embeddings([query])
        if not query_embs:
            return []
        query_emb = np.array(query_embs[0])
    except Exception as e:
        logger.error(f"Failed to generate query embedding: {e}")
        return []
        
    scores = []
    for item in vector_store_data:
        meta = item["metadata"]
        
        # Metadata filter by state
        item_state = meta.get("state")
        if state and item_state and item_state.lower().strip() != state.lower().strip():
            continue
            
        try:
            emb = np.array(item["embedding"])
            sim = cosine_similarity(query_emb, emb)
            scores.append((sim, item))
        except Exception as e:
            logger.warning(f"Error calculating similarity for chunk {item.get('id')}: {e}")
            continue
            
    # Sort by similarity descending
    scores.sort(key=lambda x: x[0], reverse=True)
    
    seen_docs = set()
    docs = []
    
    for sim, item in scores:
        meta = item["metadata"]
        parent_id = meta.get("doc_id")
        if not parent_id:
            continue
            
        if parent_id in seen_docs:
            continue
            
        seen_docs.add(parent_id)
        
        d = {
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
            "_score": float(sim)
        }
        docs.append(d)
        
        if len(docs) >= top_k:
            break
            
    return docs
