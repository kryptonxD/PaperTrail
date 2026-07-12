# PaperTrail V2 — MVP Build Spec (for Claude Code)

## Context

You already have access to the existing PaperTrail MVP repo, source code, and docs (built on the "Emergent" platform — FastAPI + React + Mongo, BM25-only retrieval, Groq LLM, 82 hardcoded documents across Karnataka + Maharashtra).

This is NOT a new project. Do not rebuild from scratch. Upgrade the existing codebase in place, file by file, preserving what already works (routing, checklist save/toggle, auth flow, data schema) unless a task below explicitly says to replace it.

**This is a scoped MVP.** Everything in this doc is meant to be built now. Anything not in this doc (hybrid retrieval, reranking, multi-LLM fallback, admin dashboard, analytics, GitHub webhook automation, document versioning, voice/WhatsApp, banking) is intentionally deferred — see the Roadmap section at the bottom. Do not build roadmap items. If you're ever unsure whether something belongs in MVP or roadmap, default to NOT building it and flag it back to me instead.

---

## MVP Scope — build these, in this order

### 1. Remove Emergent branding
Strip every trace of the Emergent platform from the repo: branding, logos, footer text, `.emergent/` config, generated naming conventions, comments referencing Emergent, and the Emergent-hosted Google OAuth proxy (`auth.emergentagent.com`). Replace auth with a standard Google OAuth flow (or Supabase Auth, which handles this natively — preferred, since we're already moving to Supabase).

### 2. Real RAG pipeline (replace the fake retrieval)
Current state: JSON file loaded into memory, keyword search via BM25 only, Groq LLM generates the answer. No embeddings, no vector DB.

Build:
```
Documents (JSON, and later PDF/DOCX/MD/CSV/TXT)
  ↓
Chunking (one chunk per logical field group: steps, docs required, fees/office)
  ↓
Embeddings — sentence-transformers, all-MiniLM-L6-v2 (free, local, no API cost)
  ↓
Vector DB — ChromaDB (self-hosted, free, simplest to run on Render free tier)
  ↓
Retriever — cosine similarity top-k, filtered by state
  ↓
LLM generation — keep Groq (Llama 3.3) as primary, no fallback provider yet (that's V2)
  ↓
Structured JSON response (same schema as today: summary, steps, docs, fees, time, office, tips)
```
Keep the ingestion pipeline modular so PDF/DOCX/CSV loaders can be added later without restructuring — but only build the JSON loader now. Don't build multi-format ingestion in MVP.

Document why `all-MiniLM-L6-v2` + Chroma were chosen (free, fast, sufficient for an 80–150 doc corpus) in the docs.

### 3. Location lookup — "where do I actually go"
This was a real gap in V1: users got steps and fees but never the nearest physical office to submit documents.

- When a query resolves to a process needing an in-person visit, do a web search (Tavily, already integrated) specifically for the nearest relevant office in the user's state/city.
- **Never let the LLM invent an address, phone number, or contact name.** If the web search doesn't return a confident match, respond with "Search for your nearest [office type] via [official portal link]" instead of guessing.
- Apply the same confidence system already in use (Verified / Partially Verified / Unverified) to the location result specifically, not just the process data. A process can be Verified while its location result is Unverified — show both.

### 4. Community Notes — GitHub-based, MVP version
Keep this simple. No webhook automation, no auto-publish pipeline yet.

- Add a `CONTRIBUTING.md` and a fixed contribution template (`community-notes/TEMPLATE.md` or `.json`) — fields: process name, state, city, office visited, date, what was asked for, what wasn't listed anywhere else, tips.
- Contributors submit a PR adding one file per note, following the template.
- You review and merge manually — no auto-publish.
- One simple script (`scripts/reindex_notes.py`) that a maintainer runs after merging: reads new note files, embeds them, adds them to the vector DB, tags them as "Community Note" (distinct from official data) with their own confidence label.
- Optional: a GitHub Action that runs the reindex script automatically on merge to `main` — this is fine to include since it's just running a script post-merge, not a review/approval automation. The human approval step (merging the PR) stays manual.

### 5. Repo hygiene / security basics
- `.env.example` with every required variable named but empty.
- Proper `.gitignore` (no secrets, no `.env`, no node_modules etc — audit current one, it's mostly fine).
- Rate limiting on `/api/search` (per-IP, simple in-memory or Redis-free token bucket is fine for MVP).
- Basic input validation (query length caps, reject empty/garbage).
- Basic prompt-injection guard: strip/ignore any instruction-like text embedded in retrieved community notes before passing to the LLM as context.

### 6. UI redesign
Current theme (dark navy/gold "luxury" look) is fine as a direction — don't necessarily throw it out, but tighten it: better spacing, better loading states (skeletons instead of spinners where reasonable), and make sure the location result and confidence badges are visually distinct sections, not buried in the answer body. Reference: Linear/Vercel-style restraint — minimal, dark, confident typography, no clutter.

### 7. Documentation
Add a `/docs` folder with:
- Architecture overview (one diagram: ingestion → embeddings → vector DB → retrieval → LLM → response)
- How the confidence system works (process data vs. location vs. community notes)
- How to contribute via GitHub
- Setup/run instructions

---

## Explicitly out of scope for this MVP (do not build)
Hybrid retrieval + reranking, multi-LLM automatic fallback, admin dashboard, analytics dashboard, RAG transparency/debug dashboard, GitHub webhook auto-publish, document versioning, multi-format ingestion beyond JSON, voice, WhatsApp, banking data.

---

## Roadmap (documented for context only — not built now)

**V2** — More states, smarter and more accurate search, an internal dashboard for reviewing community contributions at scale.

**V3** — Full coverage across all process categories in more cities, WhatsApp support for search and reminders, proactive renewal notifications.

**V4** — Department and office transparency: showing not just the process, but which office and authority is responsible, so government processes feel traceable and accountable.

**V5** — Full national coverage across every state and district, AI voice support, notifications as new cities and categories go live.

**V6+ (secondary, not core value)** — Banking and financial institution processes. Explicitly deferred — not core to PaperTrail's civic-tech identity, revisit only after V4–V5 are solid.

---

## Definition of done for this MVP
- [ ] Zero references to Emergent anywhere in the codebase (grep clean)
- [ ] Search results are generated from real vector retrieval, not BM25-only
- [ ] A query that needs an in-person visit returns a location result with its own confidence label, or an honest "search here" fallback — never an invented address
- [ ] A working GitHub contribution flow: template → PR → manual merge → reindex script updates the vector DB
- [ ] `.env.example`, `.gitignore`, rate limiting, and input validation all in place
- [ ] `/docs` folder explains the architecture end to end
- [ ] App still deploys entirely on free tiers (Vercel + Render + Supabase + Chroma self-hosted)

If any of these can't be hit within free-tier constraints, stop and flag it back rather than silently cutting corners.
