import os
import sys
import re
import hashlib
import logging
from pathlib import Path

# Add backend to path so we can import modules
sys.path.append(str(Path(__file__).resolve().parent.parent))

from backend.embeddings import get_embeddings
from backend.retriever import get_collection

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("reindex_notes")

def parse_markdown_note(path: Path) -> dict:
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
        
    fields = {}
    current_field = None
    current_lines = []
    
    lines = content.splitlines()
    for line in lines:
        line_str = line.strip()
        m = re.match(r"^###\s+(.*)$", line_str)
        if m:
            if current_field:
                fields[current_field] = "\n".join(current_lines).strip()
            current_field = m.group(1).lower().replace(" ", "_")
            current_lines = []
        elif current_field:
            current_lines.append(line)
            
    if current_field:
        fields[current_field] = "\n".join(current_lines).strip()
        
    return fields

def reindex_all():
    notes_dir = Path(__file__).resolve().parent.parent / "community-notes"
    if not notes_dir.exists():
        logger.error("community-notes directory does not exist.")
        return
        
    collection = get_collection()
    
    note_paths = list(notes_dir.glob("*.md"))
    
    indexed_count = 0
    for p in note_paths:
        if p.name == "TEMPLATE.md":
            continue
            
        logger.info(f"Parsing community note: {p.name}")
        fields = parse_markdown_note(p)
        
        process_name = fields.get("process_name", "").strip()
        state = fields.get("state", "").strip()
        city = fields.get("city", "").strip()
        office = fields.get("office_visited", "").strip()
        date = fields.get("date_of_visit", "").strip()
        asked_for = fields.get("what_was_asked_for", "").strip()
        not_listed = fields.get("what_wasn't_listed_anywhere_else", "").strip()
        tips = fields.get("tips_for_visitors", "").strip()
        
        if not process_name or not state:
            logger.warning(f"Skipping {p.name}: Missing Process Name or State")
            continue
            
        chunk_text = (
            f"COMMUNITY EXPERIENCE NOTE\n"
            f"Process Name: {process_name}\n"
            f"State: {state} | City: {city or 'N/A'}\n"
            f"Office Visited: {office}\n"
            f"Date of Visit: {date}\n"
            f"Experience / What was asked: {asked_for}\n"
            f"Unexpected requirements: {not_listed}\n"
            f"Tips for visitors: {tips}"
        )
        
        note_id = hashlib.md5(f"note:{state}:{city}:{process_name}:{date}".encode()).hexdigest()[:16]
        
        meta = {
            "doc_id": f"note_{note_id}",
            "name": f"Community Note: {process_name} ({city or state})",
            "state": state.strip().capitalize(),
            "confidence": "PARTIALLY VERIFIED",
            "issuing_office": office,
            "department": "Community Contribution",
            "fee": "Refer to note details below",
            "processing_time": f"Visited on {date}",
            "portal": "GitHub Contributions",
            "source_url": "N/A",
            "last_verified": date,
            "online_process": "N/A",
            "offline_process": asked_for + "\n\n" + not_listed,
            "required_documents": asked_for,
            "category": "Community Note",
            "is_community_note": True,
            "chunk_type": "community_note"
        }
        
        embs = get_embeddings([chunk_text])
        if not embs:
            continue
        emb = embs[0]
        
        logger.info(f"Indexing to ChromaDB with id: note_{note_id}")
        collection.upsert(
            ids=[f"note_{note_id}"],
            documents=[chunk_text],
            embeddings=[emb],
            metadatas=[meta]
        )
        indexed_count += 1
        
    logger.info(f"Reindexing completed. Indexed {indexed_count} community notes.")

if __name__ == "__main__":
    reindex_all()
