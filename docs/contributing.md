# PaperTrail V2 — Contribution Flow

This document describes how community notes are submitted, reviewed, and merged into the PaperTrail RAG pipeline.

---

## 1. Submission Flow

Community members share their first-hand government office experiences by creating markdown files:

1. **Copy Template**: Copy `community-notes/TEMPLATE.md`.
2. **Fill Fields**: Fill in Process Name, State, City, Office Visited, Date, What was asked for, What wasn't listed, and Tips.
3. **Save File**: Save as `community-notes/<state>-<city>-<process>-<date>.md`.
4. **Pull Request**: Open a PR back to the main repository.

---

## 2. Review and Merge Flow (Maintainer Action)

Maintainers must manually review each Pull Request:

1. **Verify Format**: Ensure the file is placed in `community-notes/` and follows the markdown heading structure (`### Process Name`, etc.).
2. **Safety Check**: Check for offensive content, spam, or prompt-injection phrases (e.g. instructions trying to hijack the LLM prompt).
3. **Merge**: Click "Merge Pull Request" on GitHub.

---

## 3. Reindexing Flow

After merging the Pull Request, the new notes must be embedded into the vector store.

- **Automatic (GitHub Actions)**:
  `.github/workflows/reindex.yml` runs on every merge to `main` that touches
  `community-notes/`. It spins up a runner, installs backend dependencies, and executes
  `python scripts/reindex_notes.py`.

- **Manual (Local CLI)**:
  ```bash
  python scripts/reindex_notes.py
  ```
  The script parses each markdown file into fields, builds a single combined chunk per
  note, embeds it with `all-MiniLM-L6-v2`, and tags it `is_community_note: True` with
  category `Community Note` and confidence `PARTIALLY VERIFIED` — so community knowledge
  is always visually distinguishable from maintainer-verified official data.

> ⚠️ **Known issue — this path is currently broken.**
> `reindex_notes.py` still calls `collection.upsert(...)`, an API that existed when the
> project used ChromaDB. Retrieval has since moved to a pickled NumPy store, and
> `get_collection()` now returns a `MockCollection` exposing only `count()` — so the
> script raises `AttributeError` and the Action fails on merge.
>
> Until it is fixed, community notes will merge but will **not** become searchable. The
> fix is to have the script load `vector_store.pkl`, append the note chunks, and re-pickle
> it — reusing the write path in `backend/ingest.py`.
