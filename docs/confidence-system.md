# PaperTrail V2 — Confidence Scoring System

PaperTrail helps citizens navigate complex government workflows. Because rules, fees, and office procedures change over time, the app utilizes a dual-layered **Confidence Scoring System** to distinguish official verified instructions, community updates, and web fallback results.

---

## 1. Process Confidence Scoring

Process confidence is computed in `/api/search` based on the cosine similarity score of the top-ranked vector DB search result.

| Cosine Score | Confidence Level | Visual Badge | Ingestion/Retrieval Behavior |
| :--- | :--- | :--- | :--- |
| **>= 0.35** | **VERIFIED** / **PARTIALLY VERIFIED** | **Green** / **Amber** | The query matched an official document chunk. The LLM uses the official document context, and inherits its hardcoded validation level (`VERIFIED` or `PARTIALLY VERIFIED`). |
| **< 0.35** | **UNVERIFIED** (or web fallback) | **Red** | The query did not match any official local document. A Tavily web search is triggered. The LLM synthesizes web context, and the process is tagged as `UNVERIFIED`. |

---

## 2. Physical Location Confidence Scoring

A process can be verified while its physical office location is unverified. Location confidence is evaluated independently by a strict LLM data extraction prompt run on Tavily location results.

- **VERIFIED** (Green Badge)
  - *Criteria*: The web search returned a specific, real physical address of the government office in the user's city/state from an official portal or a highly-rated Google Maps listing.
  - *UI Render*: Displays the exact street address, phone number, and a direct link to the official appointment/web portal.

- **PARTIALLY VERIFIED** (Amber Badge)
  - *Criteria*: The web search returned a general office address or location indicators, but contact numbers or specific street details are missing.
  - *UI Render*: Displays the address details, marked as partially verified, with a link to search for specific counters/sub-offices.

- **UNVERIFIED** (Red Badge)
  - *Criteria*: No specific office address or location coordinates were found in the Tavily search results.
  - *UI Render*: Standardized safe fallback message: *"Search for your nearest [Office Type] via [Official Portal Link]"*. This guarantees the LLM will **never hallucinate** fake addresses or phone numbers.
