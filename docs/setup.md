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
   TAVILY_KEYS=your_tavily_key_1,your_tavily_key_2
   SUPABASE_URL=https://your-supabase-project.supabase.co
   SUPABASE_ANON_KEY=your_supabase_anon_key
   CORS_ORIGINS=http://localhost:3000
   ```
3. Fill in the values in `frontend/.env`:
   ```ini
   REACT_APP_BACKEND_URL=http://localhost:8000
   REACT_APP_SUPABASE_URL=https://your-supabase-project.supabase.co
   REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

---

## 3. Backend Setup

1. Open a terminal and navigate to the `backend/` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Start the FastAPI server:
   ```bash
   uvicorn server:app --host 127.0.0.1 --port 8000 --reload
   ```
   *Note: On startup, if the ChromaDB vector database is empty, the server will automatically ingest the 82 documents from `data/karnataka.json` and `data/maharashtra.json`.*

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

To run the backend test suite, run:
```bash
cd backend
pytest tests/backend_test.py
```
