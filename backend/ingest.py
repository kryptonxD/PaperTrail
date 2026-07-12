import logging
from typing import List, Dict, Any
from backend.retriever import get_collection

logger = logging.getLogger("papertrail.ingest")


def make_steps_chunk(d: Dict[str, Any]) -> str:
    parts = [
        f"Document Name: {d.get('name', '')}",
        f"State: {d.get('state', '')}",
        f"Category: {d.get('category', '')}",
        f"Department: {d.get('department', '')}",
        f"Online Application Process: {d.get('online_process', '')}",
        f"Offline Submission Process: {d.get('offline_process', '')}"
    ]
    return " | ".join([p for p in parts if p])

def make_docs_chunk(d: Dict[str, Any]) -> str:
    parts = [
        f"Document Name: {d.get('name', '')}",
        f"State: {d.get('state', '')}",
        f"Required Documents: {d.get('required_documents', '')}"
    ]
    return " | ".join([p for p in parts if p])

def make_fees_chunk(d: Dict[str, Any]) -> str:
    parts = [
        f"Document Name: {d.get('name', '')}",
        f"State: {d.get('state', '')}",
        f"Issuing Office: {d.get('issuing_office', '')}",
        f"Government/Service Fees: {d.get('fee', '')}",
        f"Processing Time/Duration: {d.get('processing_time', '')}",
        f"Official Web Portal: {d.get('portal', '')}"
    ]
    return " | ".join([p for p in parts if p])

def make_metadata(d: Dict[str, Any], chunk_type: str) -> Dict[str, Any]:
    # ChromaDB metadata values must be str, int, float, or bool
    return {
        "doc_id": str(d.get("id", "")),
        "name": str(d.get("name", "")),
        "state": str(d.get("state", "")),
        "confidence": str(d.get("confidence", "UNVERIFIED")),
        "issuing_office": str(d.get("issuing_office", "")),
        "department": str(d.get("department", "")),
        "fee": str(d.get("fee", "")),
        "processing_time": str(d.get("processing_time", "")),
        "portal": str(d.get("portal", "")),
        "source_url": str(d.get("source_url", "")),
        "last_verified": str(d.get("last_verified", "")),
        "online_process": str(d.get("online_process", "")),
        "offline_process": str(d.get("offline_process", "")),
        "required_documents": str(d.get("required_documents", "")),
        "category": str(d.get("category", "General")),
        "is_community_note": False,
        "chunk_type": chunk_type
    }

def ingest_documents(docs: List[Dict[str, Any]]):
    collection = get_collection()
    
    chunks_text = []
    ids = []
    metadatas = []
    
    for d in docs:
        # 1. Process steps chunk
        steps_text = make_steps_chunk(d)
        chunks_text.append(steps_text)
        ids.append(f"{d['id']}_steps")
        metadatas.append(make_metadata(d, "steps"))
        
        # 2. Required documents chunk
        docs_text = make_docs_chunk(d)
        chunks_text.append(docs_text)
        ids.append(f"{d['id']}_docs")
        metadatas.append(make_metadata(d, "required_documents"))
        
        # 3. Fees and office chunk
        fees_text = make_fees_chunk(d)
        chunks_text.append(fees_text)
        ids.append(f"{d['id']}_fees")
        metadatas.append(make_metadata(d, "fees_office"))
        
    if not chunks_text:
        return
        
    logger.info(f"Ingesting/updating {len(chunks_text)} chunks in ChromaDB (automatic ONNX embedding)...")
    collection.upsert(
        ids=ids,
        documents=chunks_text,
        metadatas=metadatas
    )
    logger.info("Ingestion completed successfully.")

