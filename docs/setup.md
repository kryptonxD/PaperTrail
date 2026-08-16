# PaperTrail V2 — Setup and Installation

Follow these steps to configure, run, and test PaperTrail V2 locally.

---

## 1. Prerequisites

Make sure you have the following installed on your local machine:
- **Python**: Version 3.12 or newer.
- **Node.js / Yarn**: Node 18+ and Yarn 1.x.
- **MongoDB**: A running local MongoDB instance on port `27017` (default).

---

## 2. Environment Configuration

1. Copy `.env.example` in the root directory to `backend/.env` and `frontend/.env`.
2. Fill in the values in `backend/.env`:
   ```ini
   MONGO_URL=mongodb://localhost:27017
   DB_NAME=papertrail
   GROQ_API_KEY=your_groq_api_key
   GROQ_MODEL=llama-3.3-70b-versatile
   GEMINI_API_KEY=your_gemini_api_key
   TAVILY_KEYS=your_tavily_key_1,your_tavily_key_2
   SUPABASE_URL=https://your-supabase-project.supabase.co
   SUPABASE_ANON_KEY=your_supabase_anon_key
   CORS_ORIGINS=http://localhost:3000
   DEV_MODE=true
   ```

   `GROQ_API_KEY`, `SUPABASE_URL`, and `SUPABASE_ANON_KEY` are **required** — the server
   exits at startup if any is missing. `GEMINI_API_KEY` (LLM fallback) and `TAVILY_KEYS`
   (web fallback + office lookup) are optional; without them those features degrade
   quietly rather than failing.

   With `DEV_MODE=true`, each session is capped at 20 searches so a stray loop can't burn
   your free-tier quota. Set it to `false` in production.
3. Fill in the values in `frontend/.env`:
   ```ini
   REACT_APP_BACKEND_URL=http://localhost:8000
   REACT_APP_SUPABASE_URL=https://your-supabase-project.supabase.co
   REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

---

## 3. Backend Setup

All backend commands are run **from the repository root**, not from inside `backend/`.

1. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   ```
   Then `venv\Scripts\activate` on Windows, or `source venv/bin/activate` on macOS/Linux.

2. Install dependencies:
   ```bash
   pip install -r backend/requirements.txt
   ```

3. **Build the vector store.** This step is required — the server does *not* ingest
   documents at startup. It reads a prebuilt store and logs a critical error if it's
   missing or empty.
   ```bash
   python backend/scripts/build_vector_store.py
   ```
   This loads the 82 documents from `backend/data/karnataka.json` and
   `backend/data/maharashtra.json`, splits each into 3 chunks, embeds all 246 chunks with
   `all-MiniLM-L6-v2`, and writes `backend/data/vector_store.pkl`. The first run downloads
   the ONNX model (~90MB) and takes a minute or two; later runs are fast.

   Re-run it whenever you change the source JSON files.

4. Start the FastAPI server **from the repository root** (imports are absolute on the
   `backend` package, so running from inside `backend/` will fail):
   ```bash
   uvicorn backend.server:app --host 127.0.0.1 --port 8000 --reload
   ```
   Confirm it came up with `curl http://127.0.0.1:8000/health`.

---

## 4. Frontend Setup

1. Open a new terminal and navigate to the `frontend/` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   yarn install
   ```
3. Run the development dev server:
   ```bash
   yarn start
   ```
   The application will open automatically at `http://localhost:3000`.

---

## 5. Running Automated Tests

Install the dev dependencies, then run the backend suite from the repository root:
```bash
pip install -r backend/requirements-dev.txt
```
```bash
pytest backend/tests/backend_test.py
```
