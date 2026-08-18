# PaperTrail — PRD

> Status: reflects the V2 codebase as of 2026-08-16.
> For technical detail see [`docs/architecture.md`](../docs/architecture.md).

## Original problem statement

Build PaperTrail — an AI-powered app that helps Indian citizens navigate government
paperwork (Aadhaar, PAN, certificates, property, vehicle, business processes) with
personalized, step-by-step guidance based on state and situation. RAG pipeline over
verified process data, confidence indicators (Verified / Partially Verified / Unverified),
silent web fallback, 15-language support, interactive saveable checklists, Google auth.

The product thesis: citizens don't hate government processes, they hate *uncertainty*.
Success is measured in unnecessary office visits prevented — not queries served.

## Key decisions

| Area | Decision | Rationale |
| :--- | :--- | :--- |
| LLM | Groq `llama-3.3-70b-versatile`, Gemini fallback | Free tier, fast. Fallback added after Groq rate limits caused user-visible failures. |
| Embeddings | `all-MiniLM-L6-v2` via fastembed (ONNX) | Local, no API cost. fastembed over sentence-transformers to avoid a ~2GB PyTorch dep that broke Render's free tier. |
| Vector store | Pickled NumPy store, cosine scan | ChromaDB was tried and dropped — its memory footprint exceeded Render free tier, and 246 vectors scan in under a millisecond. |
| Web fallback | Tavily, 4-key rotation, gov domains only | Free-tier quota stretching. Triggers silently below 0.35 similarity. |
| Auth | Supabase Google OAuth → session cookie | Replaced the Emergent OAuth proxy. |
| Languages | 15 Indian languages, LLM translation on demand | No translation vendor needed. |
| States live | Karnataka, Maharashtra | 41 documents each, 82 total. |

## V2 scope — delivered

- Emergent platform branding and OAuth proxy fully removed
- Real embedding-based retrieval replacing V1's BM25 keyword search
- 82 documents → 246 chunks (3 per doc: steps / required docs / fees+office)
- Office location lookup with an anti-hallucination extraction prompt and its own
  independent confidence label
- Community Notes: template, PR flow, reindex script, GitHub Action
- Rate limiting, input validation, prompt-injection sanitization, `.env.example`
- Interactive saveable checklists with progress tracking
- 15-language translation, category browsing, light/dark theming
- `/docs` covering architecture, confidence system, contributing, setup

## Known gaps

- Rate limiting is per-process in memory — resets on redeploy, needs Redis for multi-worker.
- Retrieval is a linear scan; fine at 246 chunks, needs a real index past a few thousand.
- Vector store must be rebuilt and committed manually before deploy.

## Roadmap (not built)

- **V2+** — More states, hybrid retrieval + reranking, internal dashboard for reviewing
  community contributions at scale
- **V3** — Full category coverage in more cities, WhatsApp search and reminders, proactive
  renewal notifications
- **V4** — Department and office transparency: which office and authority is accountable
- **V5** — National coverage, AI voice support, new-city notifications
- **V6+** — Banking and financial processes (explicitly deferred; not core to the civic-tech
  identity)
