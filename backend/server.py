"""PaperTrail backend — RAG-powered Indian government document guidance."""
import os
import sys

def log_memory(stage: str):
    try:
        import resource
        mem = resource.getrusage(resource.RUSAGE_SELF).ru_maxrss / 1024.0
    except ImportError:
        try:
            import psutil
            process = psutil.Process(os.getpid())
            mem = process.memory_info().rss / (1024.0 * 1024.0)
        except ImportError:
            mem = 0.0
    print(f"--- MEMORY DIAGNOSIS --- PID: {os.getpid()} | Parent PID: {os.getppid()} | Stage: {stage} | RSS Memory: {mem:.2f} MB", flush=True)

log_memory("1. Before any imports (Start of server.py)")

import json
import re
import uuid
import logging
import itertools
import hashlib
from pathlib import Path
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any

# Add parent directory to python path to resolve absolute imports of 'backend' when executing from inside backend folder
sys.path.append(str(Path(__file__).resolve().parent.parent))

log_memory("2. After standard library imports")

from fastapi import FastAPI, APIRouter, HTTPException, Header, Request, Response
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field
from backend.retriever import retrieve
import httpx
from groq import AsyncGroq

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env", override=True)

log_memory("3. After third-party library imports")



logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("papertrail")

# ─── Config ────────────────────────────────────────────────────────────────
MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME", "papertrail")
GROQ_API_KEY = os.environ.get("GROQ_API_KEY")
GROQ_MODEL = os.environ.get("GROQ_MODEL", "llama-3.3-70b-versatile")
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
DEV_MODE = os.environ.get("DEV_MODE", "false").lower() == "true"
dev_query_counts = {}
DEV_QUERY_LIMIT = 20

TAVILY_KEYS = [k.strip() for k in os.environ.get("TAVILY_KEYS", "").split(",") if k.strip()]
_tavily_cycle = itertools.cycle(TAVILY_KEYS) if TAVILY_KEYS else None

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_ANON_KEY = os.environ.get("SUPABASE_ANON_KEY")


if not GROQ_API_KEY or not SUPABASE_URL or not SUPABASE_ANON_KEY:
    missing_vars = []
    if not GROQ_API_KEY: missing_vars.append("GROQ_API_KEY")
    if not SUPABASE_URL: missing_vars.append("SUPABASE_URL")
    if not SUPABASE_ANON_KEY: missing_vars.append("SUPABASE_ANON_KEY")
    
    error_msg = (
        f"\n\n========================================================================\n"
        f"❌ MISSING REQUIRED ENVIRONMENT VARIABLES: {', '.join(missing_vars)}\n"
        f"========================================================================\n"
        f"To fix this, please:\n"
        f"1. Copy the file '.env.example' to 'backend/.env'.\n"
        f"2. Fill in your keys (GROQ_API_KEY, SUPABASE_URL, SUPABASE_ANON_KEY).\n"
        f"For detailed instructions, refer to: docs/setup.md\n"
        f"========================================================================\n"
    )
    logger.error(error_msg)
    # Exits the process cleanly rather than traceback crash
    import sys
    sys.exit(1)

_groq = AsyncGroq(api_key=GROQ_API_KEY)

log_memory("4. Before AsyncIOMotorClient initialization")
client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]
log_memory("5. After AsyncIOMotorClient initialization")


# ─── Data loading + BM25 indexing ──────────────────────────────────────────
def _load_state(fname: str, state: str) -> List[Dict[str, Any]]:
    with open(ROOT_DIR / "data" / fname, "r") as f:
        rows = json.load(f)
    docs = []
    for r in rows:
        d = {
            "id": hashlib.md5(f"{state}:{r['Document Name']}".encode()).hexdigest()[:16],
            "name": r["Document Name"],
            "state": state,
            "confidence": r.get("Status/Confidence", "UNVERIFIED").split(" - ")[0].strip().upper(),
            "issuing_office": r.get("Issuing Office", ""),
            "department": r.get("Department", ""),
            "fee": r.get("Fee", ""),
            "processing_time": r.get("Processing Time", ""),
            "portal": r.get("Portal", ""),
            "source_url": r.get("Source URL", ""),
            "last_verified": r.get("Last Verified", ""),
            "online_process": r.get("Online Process", ""),
            "offline_process": r.get("Offline Process", ""),
            "required_documents": r.get("Required Documents", ""),
            "category": r.get("Category", "General"),
        }
        docs.append(d)
    return docs

ALL_DOCS: List[Dict[str, Any]] = _load_state("karnataka.json", "Karnataka") + _load_state("maharashtra.json", "Maharashtra")

def search_docs(query: str, state: Optional[str] = None, top_k: int = 6) -> List[Dict[str, Any]]:
    return retrieve(query, state=state, top_k=top_k)


CATEGORIES = sorted({d["category"].split("/")[0].strip() for d in ALL_DOCS})

# ─── Tavily (web fallback) with key rotation ───────────────────────────────
async def tavily_search(query: str, state: str) -> Dict[str, Any]:
    if not _tavily_cycle:
        return {"answer": "", "results": []}
    q = f"{query} — Indian government process in {state}. Steps, required documents, fees, official portal."
    async with httpx.AsyncClient(timeout=20) as ac:
        for _ in range(min(len(TAVILY_KEYS), 4)):
            key = next(_tavily_cycle)
            try:
                r = await ac.post(
                    "https://api.tavily.com/search",
                    json={"api_key": key, "query": q, "search_depth": "advanced", "include_answer": True, "max_results": 5, "include_domains": ["gov.in", "nic.in", "india.gov.in"]},
                )
                if r.status_code == 200:
                    j = r.json()
                    return {"answer": j.get("answer", ""), "results": [{"title": x.get("title"), "url": x.get("url"), "content": x.get("content", "")[:400]} for x in j.get("results", [])]}
                if r.status_code in (429, 432, 403):
                    logger.warning(f"Tavily key rate-limited, rotating: {r.status_code}")
                    continue
            except Exception as e:
                logger.warning(f"Tavily error: {e}")
                continue
    return {"answer": "", "results": []}

# ─── LLM helper (Groq) ──────────────────────────────────────────────────────
async def llm_call(system: str, user: str, model: Optional[str] = None) -> str:
    try:
        resp = await _groq.chat.completions.create(
            model=model or GROQ_MODEL,
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": user},
            ],
            temperature=0.3,
            max_tokens=2048,
        )
        logger.info("Request served by Groq")
        return resp.choices[0].message.content or ""
    except Exception as e:
        logger.warning(f"Groq API call failed: {e}. Retrying with Gemini fallback...")
        if not GEMINI_API_KEY:
            logger.error("Gemini API key is not configured. Cannot trigger fallback.")
            raise e
        
        models_to_try = ["gemini-2.0-flash", "gemini-2.0-flash-lite", "gemini-flash-lite-latest", "gemini-flash-latest"]

        last_err = e
        async with httpx.AsyncClient(timeout=30) as client:
            for gem_model in models_to_try:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/{gem_model}:generateContent?key={GEMINI_API_KEY}"
                payload = {
                    "systemInstruction": {
                        "parts": [{"text": system}]
                    },
                    "contents": [
                        {
                            "role": "user",
                            "parts": [{"text": user}]
                        }
                    ],
                    "generationConfig": {
                        "temperature": 0.3,
                        "maxOutputTokens": 2048
                    }
                }
                try:
                    logger.info(f"Trying Gemini fallback with model: {gem_model}")
                    r = await client.post(url, json=payload)
                    if r.status_code == 200:
                        data = r.json()
                        content = data["candidates"][0]["content"]["parts"][0]["text"]
                        logger.info(f"Request served by Gemini ({gem_model} fallback)")
                        return content or ""
                    else:
                        logger.warning(f"Gemini {gem_model} fallback failed with status {r.status_code}: {r.text}")
                except Exception as ex:
                    logger.warning(f"Gemini {gem_model} call raised exception: {ex}")
                    last_err = ex
            
            logger.error("All Gemini fallback models failed.")
            raise last_err



LANGUAGES = {
    "en": "English", "hi": "Hindi", "kn": "Kannada", "mr": "Marathi", "ta": "Tamil",
    "te": "Telugu", "bn": "Bengali", "gu": "Gujarati", "ml": "Malayalam", "pa": "Punjabi",
    "ur": "Urdu", "or": "Odia", "as": "Assamese", "kok": "Konkani", "ne": "Nepali",
}

# ─── Models ─────────────────────────────────────────────────────────────────
class SearchRequest(BaseModel):
    query: str
    state: Optional[str] = None
    language: str = "en"

class SaveChecklistRequest(BaseModel):
    doc_id: str
    doc_name: str
    state: str
    steps: List[Dict[str, Any]]  # [{text, done}]
    query: Optional[str] = None

class ChecklistUpdate(BaseModel):
    steps: List[Dict[str, Any]]

# ─── App ───────────────────────────────────────────────────────────────────
app = FastAPI(title="PaperTrail API")
api = APIRouter(prefix="/api")

# ─── Auth (Supabase Google OAuth) ──────────────────────────────────────────
async def current_user(request: Request) -> Optional[Dict[str, Any]]:
    tok = None
    auth = request.headers.get("authorization")
    if auth and auth.lower().startswith("bearer "):
        tok = auth.split(" ", 1)[1]
    if not tok:
        tok = request.cookies.get("session_token")
    if not tok:
        return None
    sess = await db.sessions.find_one({"session_token": tok})
    if not sess:
        return None
    return {"user_id": sess["user_id"], "email": sess["email"], "name": sess.get("name"), "picture": sess.get("picture")}

@api.get("/")
async def root():
    return {"ok": True, "app": "PaperTrail", "docs": len(ALL_DOCS)}

@api.get("/meta")
async def meta():
    return {
        "states": sorted({d["state"] for d in ALL_DOCS}),
        "categories": CATEGORIES,
        "languages": [{"code": c, "name": n} for c, n in LANGUAGES.items()],
        "doc_count": len(ALL_DOCS),
    }

@api.get("/documents")
async def list_documents(state: Optional[str] = None, category: Optional[str] = None):
    docs = ALL_DOCS
    if state:
        docs = [d for d in docs if d["state"].lower() == state.lower()]
    if category:
        docs = [d for d in docs if category.lower() in d["category"].lower()]
    return [{"id": d["id"], "name": d["name"], "state": d["state"], "category": d["category"], "confidence": d["confidence"], "department": d["department"], "processing_time": d["processing_time"], "fee": d["fee"]} for d in docs]

@api.get("/documents/{doc_id}")
async def get_document(doc_id: str):
    for d in ALL_DOCS:
        if d["id"] == doc_id:
            return d
    raise HTTPException(404, "Document not found")

async def get_office_location(doc: Dict[str, Any], query: str, state: str) -> Dict[str, Any]:
    # Check if offline process is empty/N/A or doesn't mention physical steps
    offline = doc.get("offline_process", "")
    if not offline or offline.lower().strip() in ("n/a", "none", "no offline process"):
        return {"needed": False, "address": "", "phone": "", "portal_link": doc.get("portal", ""), "confidence": "VERIFIED"}

    # Extract city names (simple check for common cities in Karnataka/Maharashtra)
    cities = ["bengaluru", "bangalore", "mumbai", "pune", "nagpur", "thane", "nashik", "aurangabad", "mysuru", "mysore", "hubli", "dharwad", "belagavi", "mangaluru", "mangalore"]
    city_match = None
    for c in cities:
        if re.search(rf"\b{c}\b", query.lower()):
            city_match = c.capitalize()
            break
            
    search_location = f"{city_match}, {state}" if city_match else state
    office_type = doc.get("issuing_office", doc.get("department", "government office"))
    
    tavily_q = f"nearest {office_type} office address contact details in {search_location}"
    web = await tavily_search(tavily_q, state)
    
    # Pass search context to LLM for safe extraction
    ctx = ""
    if web.get("answer"):
        ctx += f"Answer Summary: {web['answer']}\n"
    ctx += "\n".join([f"- {r['title']}: {r['content']} ({r['url']})" for r in web.get("results", [])])
    
    system_prompt = (
        "You are a strict data extraction assistant. Your task is to extract the nearest official office location address, "
        "phone/contact number, and official portal link from the search context.\n"
        "RULES:\n"
        "1. Never invent or hallucinate any address, phone number, portal link, or office name. "
        "If you do not see a specific, real physical address or contact number in the context, do not guess.\n"
        "2. If no specific address or contact details are found in the context, set address to empty and set confidence to 'UNVERIFIED'.\n"
        "3. Set confidence to 'VERIFIED' only if there is a specific, matching address from an official source. "
        "Set to 'PARTIALLY VERIFIED' if there is an address but details are sparse. "
        "Set to 'UNVERIFIED' if no address was found."
    )
    
    user_msg = (
        f"Office Type: {office_type}\n"
        f"Target Location: {search_location}\n\n"
        f"Search Context:\n{ctx}\n\n"
        "Return a JSON object (no markdown formatting fences) with this exact schema:\n"
        "{\n"
        '  "address": "exact street address or empty if not found",\n'
        '  "phone": "contact phone number or empty if not found",\n'
        '  "portal_link": "URL to the official office portal or empty",\n'
        '  "confidence": "VERIFIED or PARTIALLY VERIFIED or UNVERIFIED"\n'
        "}\nReturn ONLY the JSON."
    )
    
    try:
        raw = await llm_call(system_prompt, user_msg)
        raw = raw.strip()
        if raw.startswith("```"):
            raw = re.sub(r"^```(?:json)?\n?|\n?```$", "", raw).strip()
        parsed = json.loads(raw)
    except Exception as e:
        logger.error(f"Error parsing location LLM response: {e}")
        parsed = {"address": "", "phone": "", "portal_link": "", "confidence": "UNVERIFIED"}
        
    portal = parsed.get("portal_link") or doc.get("portal") or "official government portal"
    if not parsed.get("address") or parsed.get("address") == "empty":
        parsed["address"] = f"Search for your nearest {office_type} via {portal}"
        parsed["confidence"] = "UNVERIFIED"
        
    return {
        "needed": True,
        "address": parsed.get("address", ""),
        "phone": parsed.get("phone", ""),
        "portal_link": portal,
        "confidence": parsed.get("confidence", "UNVERIFIED")
    }

class TokenBucketLimiter:
    def __init__(self, rate: float, capacity: float):
        self.rate = rate          # tokens per second
        self.capacity = capacity  # max tokens
        from collections import defaultdict
        import time
        self.buckets = defaultdict(lambda: (capacity, time.time()))
        
    def check_rate_limit(self, ip: str) -> bool:
        import time
        tokens, last_update = self.buckets[ip]
        now = time.time()
        elapsed = now - last_update
        tokens = min(self.capacity, tokens + elapsed * self.rate)
        
        if tokens >= 1.0:
            self.buckets[ip] = (tokens - 1.0, now)
            return True
        else:
            self.buckets[ip] = (tokens, now)
            return False

# Limit to 10 requests per minute capacity, 1 request replenished every 6 seconds
search_limiter = TokenBucketLimiter(rate=1.0/6.0, capacity=10.0)

def sanitize_community_context(text: str) -> str:
    if not text:
        return ""
    # Common prompt injection patterns (case insensitive)
    patterns = [
        r"(?i)\bignore\b.*\binstructions\b",
        r"(?i)\bsystem\b.*\bprompt\b",
        r"(?i)\bsystem\b.*\binstructions\b",
        r"(?i)\byou\b\s+\bare\b.*\bnow\b",
        r"(?i)\bforget\b.*\beverything\b",
        r"(?i)\boverride\b",
        r"(?i)\bdelete\b.*\binstructions\b",
        r"(?i)\bact\s+as\b"
    ]
    sanitized = text
    for pattern in patterns:
        sanitized = re.sub(pattern, "[redacted instruction-like text]", sanitized)
    return sanitized

@api.post("/search")
async def search(req: SearchRequest, request: Request):
    # 1. Dev Mode Session Cap
    if DEV_MODE:
        session_id = request.cookies.get("session_token") or (request.client.host if request.client else "unknown")
        current_count = dev_query_counts.get(session_id, 0)
        if current_count >= DEV_QUERY_LIMIT:
            raise HTTPException(
                status_code=403, 
                detail=f"Dev Mode limit reached: You have executed {DEV_QUERY_LIMIT} queries in this session. "
                       f"Please restart your server or change sessions to reset this cap."
            )
        dev_query_counts[session_id] = current_count + 1
        logger.info(f"Dev Mode session {session_id} query count: {current_count + 1}/{DEV_QUERY_LIMIT}")

    # 2. Rate Limiting
    ip = request.client.host if request.client else "unknown"
    if not search_limiter.check_rate_limit(ip):
        raise HTTPException(status_code=429, detail="Too many search requests. Please wait and try again.")

    # 3. Input Validation
    query = req.query.strip() if req.query else ""
    if not query:
        raise HTTPException(status_code=400, detail="Search query cannot be empty.")
    if len(query) > 500:
        raise HTTPException(status_code=400, detail="Search query is too long (max 500 characters).")
    if not re.search(r"\w", query):
        raise HTTPException(status_code=400, detail="Invalid search query.")

    """RAG search: BM25 retrieval → LLM generation with confidence indicator.
    Falls back to web search silently when no strong local match."""
    hits = search_docs(query, req.state, top_k=5)
    top_score = hits[0]["_score"] if hits else 0

    # Silent fallback threshold
    use_web = top_score < 0.35
    web = None
    if use_web:
        web = await tavily_search(query, req.state or "India")

    # Prepare compact context for LLM with prompt-injection protection for community notes
    ctx_docs = hits[:3]
    ctx_docs_formatted = []
    for i, d in enumerate(ctx_docs):
        online = d.get("online_process", "")
        offline = d.get("offline_process", "")
        required = d.get("required_documents", "")
        
        # Trim excessively long local content chunks to conserve tokens
        if len(online) > 800: online = online[:800] + "..."
        if len(offline) > 800: offline = offline[:800] + "..."
        if len(required) > 800: required = required[:800] + "..."
        
        # Strip instruction-like text from community notes
        if d.get("is_community_note"):
            online = sanitize_community_context(online)
            offline = sanitize_community_context(offline)
            required = sanitize_community_context(required)
            
        ctx_docs_formatted.append(
            f"[DOC {i+1}] Name: {d['name']} | State: {d['state']} | Confidence: {d['confidence']}\n"
            f"Dept: {d['department']} | Fee: {d['fee']} | Time: {d['processing_time']} | Portal: {d['portal']} | Source: {d['source_url']}\n"
            f"Online: {online}\n"
            f"Offline: {offline}\n"
            f"Docs needed: {required}"
        )
        
    ctx_text = "\n\n".join(ctx_docs_formatted)
    if web and web.get("answer"):
        ctx_text += f"\n\n[SUPPLEMENTARY WEB CONTEXT]\n{web['answer']}\n" + "\n".join([f"- {r['title']}: {r['content']}" for r in web.get("results", [])[:2]])


    lang_name = LANGUAGES.get(req.language, "English")

    system = (
        "You are PaperTrail, a warm, precise guide to Indian government paperwork. "
        "Given a user query and reference process data, produce a personalized, step-by-step answer. "
        f"Respond ENTIRELY in {lang_name}. Use clear headings and numbered steps. "
        "Never mention 'context' or 'documents provided' or that you looked anything up. "
        "Speak with authority and quiet confidence. If information is uncertain, phrase it carefully but do not disclaim sources."
    )
    user_msg = (
        f"USER QUERY: {req.query}\nSTATE: {req.state or 'not specified'}\n\n"
        f"REFERENCE DATA:\n{ctx_text}\n\n"
        "Produce a JSON object with this exact schema (no markdown fences):\n"
        "{\n"
        '  "summary": "2-3 sentence overview of what the user needs to do",\n'
        '  "steps": ["step 1 text", "step 2 text", ...],  // 5-10 actionable steps\n'
        '  "required_documents": ["doc 1", "doc 2", ...],\n'
        '  "fees": "fee summary",\n'
        '  "processing_time": "time summary",\n'
        '  "office_or_portal": "primary office/portal to use",\n'
        '  "tips": ["helpful tip 1", "tip 2"]  // 2-3 practical tips\n'
        "}\nReturn ONLY the JSON."
    )
    try:
        raw = await llm_call(system, user_msg)
        raw = raw.strip()
        if raw.startswith("```"):
            raw = re.sub(r"^```(?:json)?\n?|\n?```$", "", raw).strip()
        answer = json.loads(raw)
    except Exception as e:
        logger.error(f"LLM parse failed: {e}")
        answer = {"summary": "We couldn't structure a full answer just now. Here's what we know:", "steps": [], "required_documents": [], "fees": "", "processing_time": "", "office_or_portal": "", "tips": []}
        if hits:
            answer["steps"] = [f"Refer to {hits[0]['name']} process at {hits[0]['portal']}"]

    # Confidence: highest confidence among top hits (or UNVERIFIED if web-only)
    if hits and hits[0]["_score"] >= 0.35:
        confidence = hits[0]["confidence"]
    elif hits:
        confidence = "PARTIALLY VERIFIED"
    else:
        confidence = "UNVERIFIED"

    # Location lookup
    location_result = None
    if hits:
        location_result = await get_office_location(hits[0], req.query, req.state or hits[0]["state"])

    return {
        "answer": answer,
        "confidence": confidence,
        "matches": [{"id": d["id"], "name": d["name"], "state": d["state"], "category": d["category"], "confidence": d["confidence"], "score": d["_score"]} for d in hits],
        "primary_doc_id": hits[0]["id"] if hits and hits[0]["_score"] >= 0.35 else None,
        "location_result": location_result,
    }



@api.post("/translate")
async def translate(payload: Dict[str, Any]):
    """Translate text into target language via LLM for speed/cost."""
    text = payload.get("text", "")
    lang = payload.get("language", "en")
    if lang == "en" or not text:
        return {"text": text}
    lang_name = LANGUAGES.get(lang, "English")
    system = f"You are a professional translator. Translate exactly into {lang_name}. Output only the translation, no notes."
    try:
        out = await llm_call(system, text)
        return {"text": out.strip()}
    except Exception as e:
        logger.error(f"translate failed: {e}")
        return {"text": text}

# ─── Auth endpoints ────────────────────────────────────────────────────────
class SupabaseTokenRequest(BaseModel):
    access_token: str

@api.post("/auth/session")
async def auth_session(req: SupabaseTokenRequest, response: Response):
    """Exchange a Supabase access_token for our session_token."""
    async with httpx.AsyncClient(timeout=15) as ac:
        r = await ac.get(
            f"{SUPABASE_URL}/auth/v1/user",
            headers={
                "Authorization": f"Bearer {req.access_token}",
                "apikey": SUPABASE_ANON_KEY,
            },
        )
    if r.status_code != 200:
        raise HTTPException(401, "invalid session")
    data = r.json()
    email = data.get("email")
    if not email:
        raise HTTPException(401, "no email")
    meta = data.get("user_metadata", {})
    user = await db.users.find_one({"email": email})
    if not user:
        user = {
            "user_id": data.get("id") or str(uuid.uuid4()),
            "email": email,
            "name": meta.get("full_name") or meta.get("name"),
            "picture": meta.get("avatar_url") or meta.get("picture"),
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        await db.users.insert_one(user)
    token = str(uuid.uuid4())
    await db.sessions.update_one(
        {"session_token": token},
        {"$set": {
            "session_token": token,
            "user_id": user["user_id"],
            "email": email,
            "name": user.get("name"),
            "picture": user.get("picture"),
            "created_at": datetime.now(timezone.utc).isoformat(),
        }},
        upsert=True,
    )
    response.set_cookie("session_token", token, httponly=True, secure=True, samesite="none", max_age=60 * 60 * 24 * 7, path="/")
    return {"token": token, "user": {"email": email, "name": user.get("name"), "picture": user.get("picture")}}

@api.get("/auth/me")
async def auth_me(request: Request):
    u = await current_user(request)
    if not u:
        return {"user": None}
    return {"user": {"email": u["email"], "name": u.get("name"), "picture": u.get("picture")}}

@api.post("/auth/logout")
async def auth_logout(request: Request, response: Response):
    tok = request.cookies.get("session_token") or (request.headers.get("authorization", "").replace("Bearer ", "") or None)
    if tok:
        await db.sessions.delete_one({"session_token": tok})
    response.delete_cookie("session_token", path="/")
    return {"ok": True}

# ─── Checklists ────────────────────────────────────────────────────────────
@api.get("/checklists")
async def list_checklists(request: Request):
    u = await current_user(request)
    if not u:
        raise HTTPException(401, "login required")
    items = await db.checklists.find({"user_id": u["user_id"]}, {"_id": 0}).sort("updated_at", -1).to_list(200)
    return items

@api.post("/checklists")
async def save_checklist(req: SaveChecklistRequest, request: Request):
    u = await current_user(request)
    if not u:
        raise HTTPException(401, "login required")
    now = datetime.now(timezone.utc).isoformat()
    doc = {
        "id": str(uuid.uuid4()),
        "user_id": u["user_id"],
        "doc_id": req.doc_id,
        "doc_name": req.doc_name,
        "state": req.state,
        "steps": req.steps,
        "query": req.query,
        "created_at": now,
        "updated_at": now,
    }
    await db.checklists.insert_one(doc)
    return {k: v for k, v in doc.items() if k != "_id"}

@api.patch("/checklists/{cid}")
async def update_checklist(cid: str, upd: ChecklistUpdate, request: Request):
    u = await current_user(request)
    if not u:
        raise HTTPException(401, "login required")
    r = await db.checklists.update_one({"id": cid, "user_id": u["user_id"]}, {"$set": {"steps": upd.steps, "updated_at": datetime.now(timezone.utc).isoformat()}})
    if r.matched_count == 0:
        raise HTTPException(404, "not found")
    return {"ok": True}

@api.delete("/checklists/{cid}")
async def delete_checklist(cid: str, request: Request):
    u = await current_user(request)
    if not u:
        raise HTTPException(401, "login required")
    await db.checklists.delete_one({"id": cid, "user_id": u["user_id"]})
    return {"ok": True}

# ─── mount ─────────────────────────────────────────────────────────────────
cors_origins_str = os.environ.get("CORS_ORIGINS") or os.environ.get("ALLOWED_ORIGINS") or ""
cors_origins = []
if cors_origins_str:
    cors_origins = [o.strip().strip("'\"").rstrip("/") for o in cors_origins_str.split(",") if o.strip()]

# Add standard production and dev origins by default
default_origins = [
    "https://www.solvailabs.com",
    "https://paper-trail-mvp.vercel.app",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8000",
    "http://127.0.0.1:8000"
]
for origin in default_origins:
    if origin not in cors_origins:
        cors_origins.append(origin)

# Remove '*' wildcard if present, since it crashes Starlette when allow_credentials=True
if "*" in cors_origins:
    cors_origins.remove("*")
    logger.warning("CORS: '*' wildcard removed because allow_credentials=True is set. Explicit origins used instead.")

logger.info(f"CORS origins configured: {cors_origins}")

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=cors_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"status": "ok"}

@app.api_route("/health", methods=["GET", "HEAD"])
async def health_check():
    """Lightweight health check endpoint for uptime monitoring to keep Render active."""
    return {"status": "ok"}

app.include_router(api)




@app.on_event("startup")
async def startup():
    log_memory("6. FastAPI startup event triggered")
    logger.info(f"Loaded GROQ_API_KEY at startup: {GROQ_API_KEY[:7]}...")
    try:
        from backend.retriever import get_collection, STORE_PATH
        log_memory("7. Before loading custom vector store")
        collection = get_collection()
        cnt = collection.count()
        log_memory(f"8. After custom vector store loaded (Count: {cnt})")
        if cnt == 0:
            logger.error(
                f"❌ CRITICAL ERROR: Vector store file not found at {STORE_PATH} or contains 0 chunks. "
                "Please run: 'python backend/scripts/build_vector_store.py' locally before deploying."
            )
        else:
            logger.info(f"Custom vector store loaded successfully with {cnt} chunks.")
    except Exception as e:
        logger.error(f"Error during startup custom vector store load: {e}")



@app.on_event("shutdown")
async def shutdown():
    client.close()
