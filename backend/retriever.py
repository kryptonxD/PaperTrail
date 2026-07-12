import os
import logging
from pathlib import Path
from typing import List, Dict, Any, Optional
import chromadb
from backend.embeddings import get_embeddings

logger = logging.getLogger("papertrail.retriever")

ROOT_DIR = Path(__file__).parent
CHROMA_DIR = ROOT_DIR / "data" / "chroma"

_client = None
_collection = None

def get_chroma_client():
    global _client
    if _client is None:
        CHROMA_DIR.mkdir(parents=True, exist_ok=True)
        # PersistentClient saves data to disk
        _client = chromadb.PersistentClient(path=str(CHROMA_DIR))
    return _client

class PaperTrailEmbeddingFunction(chromadb.EmbeddingFunction):
    def __call__(self, input: list) -> list:
        # Re-use our singleton get_embeddings to save memory
        return get_embeddings(input)

def get_collection():
    global _collection
    if _collection is None:
        client = get_chroma_client()
        # Use cosine similarity for the collection and pass our custom embedding function
        _collection = client.get_or_create_collection(
            name="documents",
            metadata={"hnsw:space": "cosine"},
            embedding_function=PaperTrailEmbeddingFunction()
        )
    return _collection


def retrieve(query: str, state: Optional[str] = None, top_k: int = 5) -> List[Dict[str, Any]]:
    collection = get_collection()
    
    # Check if collection is empty
    count = collection.count()
    if count == 0:
        logger.warning("ChromaDB collection is empty. Returning empty list.")
        return []
        
    query_embs = get_embeddings([query])
    if not query_embs:
        return []
    query_emb = query_embs[0]
    
    # Construct metadata filter
    where_filter = {}
    if state:
        # Standardize state capitalization
        where_filter["state"] = state.strip().capitalize()
        
    # We query more than top_k to account for chunk deduplication
    n_results = min(count, max(top_k * 3, 15))
    
    try:
        results = collection.query(
            query_embeddings=[query_emb],
            n_results=n_results,
            where=where_filter if where_filter else None
        )
    except Exception as e:
        logger.error(f"Chroma query failed: {e}")
        return []
        
    if not results or not results["documents"] or not results["documents"][0]:
        return []
        
    ids = results["ids"][0]
    metadatas = results["metadatas"][0]
    distances = results["distances"][0]
    
    seen_docs = set()
    docs = []
    
    for doc_id, meta, dist in zip(ids, metadatas, distances):
        parent_id = meta.get("doc_id")
        if not parent_id:
            continue
            
        if parent_id in seen_docs:
            continue
            
        seen_docs.add(parent_id)
        
        # Reconstruct full document from metadata
        score = 1.0 - dist  # Cosine similarity = 1 - distance
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
            "_score": float(score)
        }
        docs.append(d)
        
        if len(docs) >= top_k:
            break
            
    return docs
