"""PaperTrail backend API tests."""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "http://localhost:8000").rstrip("/")
# Try to read frontend .env if REACT_APP_BACKEND_URL not set in env
try:
    with open("/app/frontend/.env") as f:
        for line in f:
            if line.startswith("REACT_APP_BACKEND_URL="):
                BASE_URL = line.strip().split("=", 1)[1].rstrip("/")
except Exception:
    pass

API = f"{BASE_URL}/api"


@pytest.fixture(scope="module")
def s():
    return requests.Session()


# ── Root & meta ─────────────────────────────────────────────────────────
def test_root(s):
    r = s.get(f"{API}/")
    assert r.status_code == 200
    d = r.json()
    assert d["ok"] is True
    assert d["docs"] == 82


def test_meta(s):
    r = s.get(f"{API}/meta")
    assert r.status_code == 200
    d = r.json()
    assert "Karnataka" in d["states"] and "Maharashtra" in d["states"]
    assert d["doc_count"] == 82
    assert len(d["languages"]) == 15
    assert isinstance(d["categories"], list) and len(d["categories"]) > 0


# ── Documents ───────────────────────────────────────────────────────────
def test_documents_karnataka(s):
    r = s.get(f"{API}/documents", params={"state": "Karnataka"})
    assert r.status_code == 200
    docs = r.json()
    assert len(docs) == 41
    assert all(d["state"] == "Karnataka" for d in docs)


def test_documents_maharashtra(s):
    r = s.get(f"{API}/documents", params={"state": "Maharashtra"})
    assert r.status_code == 200
    docs = r.json()
    assert len(docs) == 41


def test_document_detail(s):
    lst = s.get(f"{API}/documents", params={"state": "Karnataka"}).json()
    doc_id = lst[0]["id"]
    r = s.get(f"{API}/documents/{doc_id}")
    assert r.status_code == 200
    d = r.json()
    for k in ["name", "state", "confidence", "online_process", "offline_process", "required_documents"]:
        assert k in d


def test_document_404(s):
    r = s.get(f"{API}/documents/nonexistent999")
    assert r.status_code == 404


# ── Search (LLM/RAG) ────────────────────────────────────────────────────
def _validate_answer(payload):
    assert "answer" in payload and "confidence" in payload and "matches" in payload
    a = payload["answer"]
    for k in ["summary", "steps", "required_documents", "fees", "processing_time", "office_or_portal", "tips"]:
        assert k in a
    assert isinstance(a["steps"], list)
    assert payload["confidence"] in ("VERIFIED", "PARTIALLY VERIFIED", "UNVERIFIED")


def test_search_karnataka_caste(s):
    r = s.post(f"{API}/search", json={"query": "caste certificate", "state": "Karnataka", "language": "en"}, timeout=90)
    assert r.status_code == 200, r.text
    _validate_answer(r.json())


def test_search_maharashtra_saledeed(s):
    r = s.post(f"{API}/search", json={"query": "sale deed registration", "state": "Maharashtra", "language": "en"}, timeout=90)
    assert r.status_code == 200, r.text
    d = r.json()
    _validate_answer(d)
    # Expect maharashtra-relevant matches
    if d["matches"]:
        assert any(m["state"] == "Maharashtra" for m in d["matches"])


def test_search_web_fallback(s):
    r = s.post(f"{API}/search", json={"query": "birth certificate karnataka", "state": "Karnataka", "language": "en"}, timeout=90)
    assert r.status_code == 200, r.text
    _validate_answer(r.json())


# ── Translate ───────────────────────────────────────────────────────────
def test_translate_hindi(s):
    r = s.post(f"{API}/translate", json={"text": "Hello", "language": "hi"}, timeout=60)
    assert r.status_code == 200
    out = r.json()["text"]
    # Should contain Devanagari
    assert any("\u0900" <= ch <= "\u097F" for ch in out), f"No Devanagari in: {out}"


def test_translate_english_passthrough(s):
    r = s.post(f"{API}/translate", json={"text": "x", "language": "en"})
    assert r.status_code == 200
    assert r.json()["text"] == "x"


# ── Auth guards ─────────────────────────────────────────────────────────
def test_checklists_get_requires_auth(s):
    r = s.get(f"{API}/checklists")
    assert r.status_code == 401


def test_checklists_post_requires_auth(s):
    r = s.post(f"{API}/checklists", json={"doc_id": "x", "doc_name": "y", "state": "Karnataka", "steps": []})
    assert r.status_code == 401


def test_checklists_patch_requires_auth(s):
    r = s.patch(f"{API}/checklists/abc", json={"steps": []})
    assert r.status_code == 401


def test_checklists_delete_requires_auth(s):
    r = s.delete(f"{API}/checklists/abc")
    assert r.status_code == 401


def test_auth_session_invalid(s):
    r = s.post(f"{API}/auth/session", json={"access_token": "invalid-token-999"})
    assert r.status_code == 401
