# Contributing to PaperTrail

Thank you for helping Indian citizens navigate government paperwork! By sharing your first-hand experiences, you make the civic space more transparent and less intimidating for everyone.

This version of PaperTrail supports **Community Notes** via GitHub Pull Requests.

---

## How to Contribute a Community Note

We welcome updates, practical tips, and correction notes based on your actual visits to government offices. 

Follow these steps to submit your experience:

1. **Fork** this repository to your own GitHub account.
2. **Clone** your fork locally.
3. Locate the `community-notes/` directory.
4. Copy `community-notes/TEMPLATE.md` to a new file in that directory.
   - Name your file using the format: `community-notes/<state>-<city>-<process>-<date>.md`
   - Example: `community-notes/karnataka-bengaluru-aadhaar-update-2026-07-12.md`
5. **Fill out all fields** in your copy, adhering to the markdown structure. Be as specific as possible (exact offices, fees charged, unexpected documents requested, etc.).
6. Commit your changes and push them to your fork.
7. Open a **Pull Request (PR)** from your fork back to our `main` branch.

---

## Note Verification and Indexing

1. A repository maintainer will manually review your PR.
2. Once the PR is merged, our indexing workflow will automatically run the reindexing script (`scripts/reindex_notes.py`) to embed your experience and inject it into the search RAG pipeline.
3. Your experience will show up as a **Community Note** in search results, helping others immediately!
