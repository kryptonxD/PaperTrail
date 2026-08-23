"""Guard against semantically-near but factually-wrong retrieval matches.

Embeddings score "birth certificate" against "Caste Certificate" highly,
because both are short government certificate names. The similarity is real and
the match is useless. Requiring the top hit to share a *distinctive* word with
the query catches this: the shared word is "certificate", which is exactly the
word that carries no information in a corpus made of certificates.

A hit that fails this check is not deleted - it may still be worth showing as a
related result - but it must not clear the confidence threshold, so the request
falls back to web search instead of answering confidently from the wrong record.
"""
import re
from typing import Any, Dict, Iterable, Set

# Words that appear across so much of the corpus that matching on them says
# nothing about whether the record is the one the user meant.
GENERIC = {
    # document-type nouns
    "certificate", "certificates", "card", "cards", "licence", "license",
    "registration", "register", "permit", "document", "documents", "form",
    "application", "apply", "applying", "issuance", "issue", "request",
    "service", "services", "scheme", "online", "offline", "portal", "govt",
    "government", "official", "new", "copy", "download", "status", "number",
    # question scaffolding
    "how", "what", "where", "when", "which", "who", "why", "do", "does", "did",
    "can", "i", "my", "me", "we", "you", "your", "a", "an", "the", "to", "of",
    "for", "in", "on", "at", "is", "are", "am", "be", "get", "getting", "got",
    "need", "needed", "want", "make", "made", "take", "and", "or", "with",
    "from", "by", "it", "its", "this", "that", "there", "have", "has", "if",
    "please", "help", "tell", "about", "any", "all", "must", "should", "will",
}

_TOKEN = re.compile(r"[a-z0-9]+")


def tokens(text: str) -> Set[str]:
    return set(_TOKEN.findall((text or "").lower()))


def distinctive_terms(query: str) -> Set[str]:
    """Query words that actually identify what the user is asking for."""
    return {t for t in tokens(query) if t not in GENERIC and len(t) > 2}


def is_grounded(query: str, doc: Dict[str, Any]) -> bool:
    """True when the record shares at least one identifying word with the query.

    With no distinctive terms to test - a query like "how do I apply" - there is
    nothing to contradict, so the semantic score is left to stand on its own.
    """
    terms = distinctive_terms(query)
    if not terms:
        return True

    haystack = tokens(" ".join(str(doc.get(f, "")) for f in
                              ("name", "category", "department", "issuing_office")))
    if terms & haystack:
        return True

    # Allow simple morphology: "registrations" in the query vs "registration"
    # in the record, "vehicles" vs "vehicle".
    for term in terms:
        for word in haystack:
            if len(term) > 4 and len(word) > 4 and (
                term.startswith(word[:5]) or word.startswith(term[:5])
            ):
                return True
    return False


def annotate(query: str, hits: Iterable[Dict[str, Any]]) -> list:
    out = []
    for h in hits:
        h["_grounded"] = is_grounded(query, h)
        out.append(h)
    return out
