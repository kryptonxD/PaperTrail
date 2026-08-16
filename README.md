<div align="center">

# 📄 PaperTrail ([Click Me](https://paper-trail-mvp.vercel.app/))

### Building the AI Operating System for Bureaucracy

AI-powered government workflow intelligence that transforms fragmented public information into personalized, trustworthy, and actionable guidance.

![Status](https://img.shields.io/badge/Status-In%20Development-blue)
[![Python](https://img.shields.io/badge/Python-3.12-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/license/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-brightgreen.svg)](https://makeapullrequest.com/)

</div>

---

## 🚀 Overview

Government processes shouldn't require hours of research, multiple office visits, or expensive intermediaries.

**PaperTrail** is an AI-powered civic-tech platform that helps citizens navigate government processes through personalized, location-aware guidance powered by **Retrieval-Augmented Generation (RAG)**.

Instead of searching across government websites, blogs, YouTube videos, and forums, users receive one structured workflow tailored to their situation.

---

## ✨ Features

- 🤖 AI-powered government process guidance
- 📍 State & city-specific recommendations
- 📑 Personalized document checklists
- 💰 Fees & processing timelines
- 🏢 Office & department information
- 👥 Community Notes
- ✅ Interactive checklists
- 🧠 Trust-first RAG architecture

---

## 🎯 The Problem

Government information exists—but it's scattered.

Citizens often struggle with:

- Confusing eligibility requirements
- Missing documents
- Outdated online information
- Different requirements across states
- Multiple office visits
- Application rejections

PaperTrail transforms fragmented information into one personalized workflow.

---

## 💡 How It Works

```text
User Query
      │
      ▼
Intent Detection
      │
      ▼
Clarification Questions
      │
      ▼
RAG Knowledge Retrieval
      │
      ▼
AI Reasoning
      │
      ▼
Personalized Workflow
      │
      ▼
Checklist + Community Notes
```

---

## 🏗️ Tech Stack

| Layer | Technology |
|--------|------------|
| Frontend | React 19 (CRA + CRACO), Tailwind CSS, Radix UI |
| Backend | FastAPI (Python 3.12) |
| LLM | Groq `llama-3.3-70b-versatile`, with Gemini fallback |
| Embeddings | `all-MiniLM-L6-v2` via fastembed (ONNX, CPU-local, no API cost) |
| Vector Store | Prebuilt in-memory NumPy store (`backend/data/vector_store.pkl`) |
| Web Fallback | Tavily Search (multi-key rotation) |
| Database | MongoDB (Motor async driver) |
| Auth | Supabase (Google OAuth) |
| Architecture | Retrieval-Augmented Generation (RAG) |
| Deployment | Vercel (frontend) + Render (backend) |

---

## 🗺️ Roadmap

- ✅ **V1** — AI Government Guide
- 🚧 **V2** — Hyperlocal Intelligence
- 📅 **V3** — AI Government Assistant
- 🔮 **V4** — Administrative Workflow Expansion
- 🤖 **V5** — Autonomous AI Workflow Agent

---

## 🔭 Future Vision

PaperTrail is evolving from an AI assistant into an intelligent workflow platform capable of:

- AI-powered document verification
- Intelligent form filling
- Appointment scheduling
- Government scheme recommendations
- Application tracking
- Bureaucracy Knowledge Graph
- Human-in-the-loop AI Agents

---

## 🤝 Contributing

There are **two ways** to contribute to PaperTrail.

### 1. 🏛️ Contribute Civic Knowledge (Community Notes)

Recently completed a government process? Help others by sharing your experience.

Examples:
- Actual fees paid
- Required documents
- Office-specific tips
- Common mistakes
- Waiting times

#### Steps

1. Fork this repository.
2. Navigate to `community-notes/`.
3. Copy `community-notes/TEMPLATE.md`.
4. Create a new file using:

```text
community-notes/<state>-<city>-<process>-<date>.md
```

Example:

```text
community-notes/karnataka-bengaluru-aadhaar-update-2026-07-12.md
```

5. Fill in your experience.
6. Open a Pull Request.

After approval, the note is automatically indexed into the RAG knowledge base, making it searchable for future users.

---

### 2. 💻 Contribute Code

Developers can contribute by improving:

- Frontend
- Backend
- AI Pipeline
- RAG
- UI/UX
- Performance
- New Government Workflows

#### Setup

Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/PaperTrail.git
cd PaperTrail
```

Backend

```bash
python -m venv venv

# Windows
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate

pip install -r backend/requirements.txt

uvicorn backend.server:app --reload
```

Frontend

```bash
cd frontend

yarn install

yarn start
```

Environment Variables

Copy

```text
.env.example
```

to

```text
.env
```

and configure:

- `GROQ_API_KEY` — required, the app exits at startup without it
- `SUPABASE_URL` — required
- `SUPABASE_ANON_KEY` — required
- `MONGO_URL` — checklists and sessions
- `TAVILY_KEYS` — optional, comma-separated; enables web fallback and office lookup
- `GEMINI_API_KEY` — optional, LLM fallback when Groq fails

See [`docs/setup.md`](docs/setup.md) for the full walkthrough, including building the
vector store before first run.

Finally,

1. Create a feature branch.
2. Commit your changes.
3. Push your branch.
4. Open a Pull Request.

---

## 📂 Project Structure

```text
PaperTrail/
├── backend/
│   ├── server.py            # FastAPI app: search, auth, checklists, translation
│   ├── retriever.py         # Cosine-similarity retrieval over the vector store
│   ├── embeddings.py        # fastembed / all-MiniLM-L6-v2 wrapper
│   ├── ingest.py            # Chunking + embedding + store build
│   ├── data/                # Karnataka & Maharashtra JSON + vector_store.pkl
│   └── scripts/
│       └── build_vector_store.py
├── frontend/
│   └── src/                 # Pages, components, context, lib
├── community-notes/         # Citizen-contributed notes + TEMPLATE.md
├── scripts/
│   └── reindex_notes.py     # Re-embeds merged community notes
├── docs/                    # Architecture, confidence system, setup, contributing
└── README.md
```

---

## 👨‍💻 Author

**Ritik Barnwal**

AI Product Management • RAG • Prompt Engineering • Civic Tech

- 🌐 Portfolio: https://ritikx-portfolio.netlify.app/
- 💼 LinkedIn: https://www.linkedin.com/in/barnwal-ritik/
- 📧 Email: ritikbarnwla028@gmail.com

---

<div align="center">

⭐ If you found this project valuable, consider starring the repository.

**PaperTrail is building the intelligence layer between citizens and bureaucracy.**

</div>
