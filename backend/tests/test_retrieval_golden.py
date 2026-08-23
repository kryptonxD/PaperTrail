"""Retrieval regression harness.

Two things must hold as the corpus grows:
  present - a document we do have must rank first for a natural query
  absent  - a document we do NOT have must not clear the confidence threshold,
            or the app answers confidently from a near-miss record

Run before and after any change to the corpus, the embedding model, or the
retrieval logic. Exits non-zero on regression so CI can gate on it.
"""
import json
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parent.parent.parent))

from backend.retriever import retrieve

THRESHOLD = 0.35
GOLDEN = Path(__file__).parent / "golden_queries.json"


def confident(hit):
    return hit["_score"] >= THRESHOLD and hit.get("_grounded", True)


def main() -> int:
    data = json.loads(GOLDEN.read_text(encoding="utf-8"))
    failures = []

    print("PRESENT - a real document must rank first and be answered confidently")
    for c in data["present"]:
        hits = retrieve(c["q"], state=c["state"], top_k=1)
        if not hits:
            failures.append(f'no hit: {c["q"]} [{c["state"]}]')
            print(f'  FAIL  {c["q"][:40]:40} -> NO HIT')
            continue
        h = hits[0]
        ok = confident(h) and (c["expect"] is None or h["name"] == c["expect"])
        if not ok:
            failures.append(f'{c["q"]} [{c["state"]}] -> {h["name"]} {h["_score"]:.3f}')
        print(f'  {"PASS" if ok else "FAIL"}  {c["q"][:40]:40} -> {h["name"][:34]:34} {h["_score"]:.3f}')

    print()
    print("ABSENT - a document we do not hold must fall back, not answer")
    for c in data["absent"]:
        hits = retrieve(c["q"], state=c["state"], top_k=1)
        if hits and confident(hits[0]):
            failures.append(f'confident wrong answer: {c["q"]} [{c["state"]}] -> {hits[0]["name"]}')
            print(f'  FAIL  {c["q"][:40]:40} -> {hits[0]["name"][:34]:34} {hits[0]["_score"]:.3f}')
        else:
            got = hits[0]["name"][:34] if hits else "no hit"
            print(f'  PASS  {c["q"][:40]:40} -> falls back ({got})')

    total = len(data["present"]) + len(data["absent"])
    print()
    print(f"{total - len(failures)}/{total} passed")
    for f in failures:
        print(f"  ! {f}")
    return 1 if failures else 0


if __name__ == "__main__":
    raise SystemExit(main())
