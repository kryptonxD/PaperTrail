# PaperTrail — PRD

## Original problem statement
Build PaperTrail — an AI-powered app that helps Indian citizens navigate government paperwork (Aadhaar, PAN, certificates, property, vehicle, business processes) with personalized, step-by-step guidance based on state and situation. RAG pipeline over verified process data (Karnataka + Maharashtra, 82 docs), confidence indicators (Verified/Partially Verified/Unverified), silent web fallback via Tavily, 15-language support, interactive saveable checklists, Google auth, premium regal design.

## User choices (Feb 2026)
- LLM: Groq (primary) + translation via LLM
- Embeddings: skipped — used BM25 retrieval over 82 docs (small corpus, fast, free)
- Web fallback: Tavily with 4-key rotation
- Auth: Supabase Auth
- Languages: 15 Indian languages via LLM translation on-the-fly
- States live: Karnataka, Maharashtra

## Architecture
### Backend (FastAPI, `/app/backend/server.py`)
- Data: `data/karnataka.json` + `data/maharashtra.json` loaded at boot, indexed with BM25 (`rank_bm25`)
- `/api/search` — BM25 retrieval → LLM generation → structured JSON answer + confidence
- `/api/documents`, `/api/documents/{id}` — browse and detail
- `/api/translate` — LLM translation
- `/api/auth/session|me|logout` — Supabase Google OAuth exchange
- `/api/checklists` (GET/POST/PATCH/DELETE) — user checklists in Mongo
- `/api/meta` — states, categories, languages
- Silent Tavily fallback when BM25 top score < 2.0

### Frontend (React, TailwindCSS + shadcn UI)
- Design: dark navy #0B101E, gold #D4AF37 accents, Cormorant Garamond serif + Outfit sans
- Pages: `/` Home (hero + categories), `/search` Results, `/doc/:id` Detail (interactive checklist), `/browse` Category browse, `/checklists` Saved, `/auth/callback` OAuth handler
- Global state: `AppContext` (state, language, user)
- Confidence badges: Emerald / Gold / Maroon

## Implemented (Feb 2026)
- Full RAG search pipeline with silent Tavily fallback
- 82 documents indexed (Karnataka + Maharashtra)
- Confidence indicators on every result
- Interactive saveable checklists with progress tracking
- Google login (Supabase Auth)
- 15-language translation
- Category browsing
- Premium regal UI matching brief

## Deferred (P1/P2)
- Community-contributions layer (schema-ready)
- More states (schema is state-agnostic — add JSON + BM25 reindex)
- Embeddings-based retrieval if corpus grows > few thousand docs
- Full offline caching / PWA
- Sharing checklists

## Next
- Test end-to-end and iterate
