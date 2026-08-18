"""Re-embed community notes into the PaperTrail vector store.

Run after merging a community-note PR. The rebuild is idempotent: every
community note is regenerated from the markdown on each run, so edited notes are
refreshed and deleted notes disappear. Official document chunks are never
touched.
"""
import sys
import re
import hashlib
import logging
from pathlib import Path
from typing import Dict, List, Any

# Add project root to path so `backend` resolves as a package
sys.path.append(str(Path(__file__).resolve().parent.parent))

from backend.embeddings import get_embeddings
from backend.ingest import load_store, save_store

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger("reindex_notes")

NOTES_DIR = Path(__file__).resolve().parent.parent / "community-notes"

# Template headings, normalised to the keys parse_markdown_note produces
F_PROCESS = "process_name"
F_STATE = "state"
F_CITY = "city"
F_OFFICE = "office_visited"
F_DATE = "date_of_visit"
F_ASKED = "what_was_asked_for"
F_UNLISTED = "what_wasn't_listed_anywhere_else"
F_TIPS = "tips_for_visitors"

# Placeholder italics from TEMPLATE.md, e.g. "*Describe the document...*"
_PLACEHOLDER = re.compile(r"^\*.*\*$", re.DOTALL)


def parse_markdown_note(path: Path) -> Dict[str, str]:
    """Split a note into {heading_slug: body} using its `### Heading` lines."""
    fields: Dict[str, str] = {}
    current_field = None
    current_lines: List[str] = []

    for line in path.read_text(encoding="utf-8").splitlines():
        m = re.match(r"^###\s+(.*)$", line.strip())
        if m:
            if current_field:
                fields[current_field] = "\n".join(current_lines).strip()
            current_field = m.group(1).strip().lower().replace(" ", "_")
            current_lines = []
        elif current_field:
            current_lines.append(line)

    if current_field:
        fields[current_field] = "\n".join(current_lines).strip()

    # Drop untouched template placeholders so they never reach the index
    return {
        k: ("" if _PLACEHOLDER.match(v.strip()) else v.strip())
        for k, v in fields.items()
    }


def build_note_chunk(fields: Dict[str, str], source: str) -> Dict[str, Any]:
    """Turn one parsed note into a single chunk record, or None if unusable."""
    process = fields.get(F_PROCESS, "")
    state = fields.get(F_STATE, "")
    if not process or not state:
        return None

    city = fields.get(F_CITY, "")
    office = fields.get(F_OFFICE, "")
    date = fields.get(F_DATE, "")
    asked = fields.get(F_ASKED, "")
    unlisted = fields.get(F_UNLISTED, "")
    tips = fields.get(F_TIPS, "")

    text = (
        "COMMUNITY EXPERIENCE NOTE\n"
        f"Process Name: {process}\n"
        f"State: {state} | City: {city or 'N/A'}\n"
        f"Office Visited: {office}\n"
        f"Date of Visit: {date}\n"
        f"Experience / What was asked: {asked}\n"
        f"Unexpected requirements: {unlisted}\n"
        f"Tips for visitors: {tips}"
    )

    note_id = hashlib.md5(f"note:{state}:{city}:{process}:{date}".encode()).hexdigest()[:16]

    return {
        "id": f"note_{note_id}",
        "text": text,
        "metadata": {
            "doc_id": f"note_{note_id}",
            "name": f"Community Note: {process} ({city or state})",
            "state": state.strip().title(),
            "confidence": "PARTIALLY VERIFIED",
            "issuing_office": office,
            "department": "Community Contribution",
            "fee": "See note details",
            "processing_time": f"Visited on {date}" if date else "",
            "portal": "",
            "source_url": f"community-notes/{source}",
            "last_verified": date,
            "online_process": "",
            "offline_process": "\n\n".join(p for p in (asked, unlisted) if p),
            "required_documents": asked,
            "category": "Community Note",
            "is_community_note": True,
            "chunk_type": "community_note",
        },
        # filled in by reindex_all once all texts are batched
        "embedding": None,
    }


def reindex_all() -> int:
    if not NOTES_DIR.exists():
        logger.error("community-notes directory does not exist at %s", NOTES_DIR)
        return 1

    store = load_store()
    official = [c for c in store if not c["metadata"].get("is_community_note")]
    logger.info(
        "Loaded store: %d chunks (%d official, %d existing community notes)",
        len(store), len(official), len(store) - len(official),
    )

    if not official:
        logger.error(
            "No official document chunks found. Run "
            "'python backend/scripts/build_vector_store.py' before reindexing notes, "
            "otherwise this would publish an index containing only community notes."
        )
        return 1

    chunks: List[Dict[str, Any]] = []
    skipped = 0
    for path in sorted(NOTES_DIR.glob("*.md")):
        if path.name == "TEMPLATE.md":
            continue
        chunk = build_note_chunk(parse_markdown_note(path), path.name)
        if chunk is None:
            logger.warning("Skipping %s: missing Process Name or State", path.name)
            skipped += 1
            continue
        logger.info("Parsed %s -> %s", path.name, chunk["id"])
        chunks.append(chunk)

    if chunks:
        embeddings = get_embeddings([c["text"] for c in chunks])
        if len(embeddings) != len(chunks):
            logger.error("Embedding count mismatch: %d texts, %d vectors", len(chunks), len(embeddings))
            return 1
        for chunk, emb in zip(chunks, embeddings):
            chunk["embedding"] = emb

    save_store(official + chunks)
    logger.info(
        "Reindex complete: %d community notes indexed, %d skipped, %d chunks total.",
        len(chunks), skipped, len(official) + len(chunks),
    )
    return 0


if __name__ == "__main__":
    sys.exit(reindex_all())
