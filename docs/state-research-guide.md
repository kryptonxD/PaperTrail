# State Research Guide

How to research a new state so the output can actually be used. Written after
importing Uttar Pradesh, Bihar and Rajasthan, where **2,328 researched records
yielded only 480 usable ones** — and the gap came from four avoidable habits,
not from lack of effort.

Give this document to whoever, or whatever, does the research.

---

## What went wrong last time

| State | Records | Usable | Why the rest failed |
| :--- | ---: | ---: | :--- |
| Rajasthan | 1,316 | 218 | Breadth over depth — mostly service names with no detail |
| Uttar Pradesh | 765 | 211 | Detail fields held sentences explaining the detail was missing |
| Bihar | 247 | 51 | Same, plus catalogue-only sourcing |

Every record had a valid `gov.in` source. The research was honest and carefully
cited. It simply was not **answerable**, and answerable is the only thing that
reaches a user.

---

## The four rules

### 1. Leave a field empty. Never explain why it is empty.

This is the single most expensive habit from the last batch.

These sentences were written into detail fields:

> "No government fee indicated in the official approval catalogue"
> "exact checklist not stated on the reviewed landing page"
> "Fees, eligibility and required documents were not transcribed"

Each is true, and each is worthless. Worse, each is *actively harmful*: an
importer sees a filled field, an AI reading it sees prose where a document list
should be, and a user receives a confident answer built on an absence.

**An empty cell is a correct and complete answer.** The app is built to say "the
official source does not publish this" — but only when the cell is empty.

> If you are about to type a sentence about what you could not find, stop and
> leave the cell blank instead.

### 2. Forty complete records beat a thousand shells.

Rajasthan has 1,316 records, of which 3 originally carried a fee *and* documents
*and* a timeline. That is a list of service names, not a guide.

Bihar has one fifth as many records and produced better coverage per hour spent.

**Target 40 to 60 processes per state, fully filled.** When in doubt, stop adding
rows and go deeper on the ones already there.

### 3. The catalogue page is not the service page.

This is why the detail was missing. The last batch was sourced from service
*catalogues* — Nivesh Mitra's live-services PDF, Jan Soochna's A-Z index,
Bihar's ServiceList.pdf. A catalogue confirms a service exists. It never carries
fees or document checklists.

The fee and the checklist live one or two clicks deeper: on the service's own
page, in its citizen charter, or in a departmental fee notification.

Symptom to watch for: in the last batch **532 records shared only 65 distinct
URLs**, because the "direct application URL" was a portal homepage. If two
records point at the same URL, neither is deep enough.

**Highest-leverage single move:** find the state's consolidated e-District or CSC
**fee notification**. One document often carries the fee for dozens of citizen
services at once — far cheaper than chasing them one at a time.

### 4. Fill these four fields above all others.

The app answers four questions. Everything else is secondary.

| Field | The question it answers |
| :--- | :--- |
| `Required Documents` | What do I need to bring? |
| `Government Fee` | What will it cost? |
| `Expected Processing Time` | How long will it take? |
| `Who Can Apply` | Am I eligible? |

A record with an official portal plus **two or more** of these is usable. With
fewer, it becomes a directory entry — kept in the repository, but unable to
answer anyone.

---

## Sourcing rules

- **Official sources only** for facts: the state portal, the department site, a
  citizen charter, a government order, a fee notification. Aggregator blogs,
  YouTube and news articles may point you toward a source, but are never the
  citation.
- **Two sources for money.** Fees change most often and hurt most when wrong. A
  single source caps the record at `PARTIALLY VERIFIED`.
- **Record where each fact came from.** `Primary Source URL` must be the page the
  fee and documents were actually read from, not the portal homepage.
- **Date every record.** A fee with no date cannot be trusted a year from now.
- **Never infer a state fee from another state.** State fees are set by that
  state's own notification. Copying Karnataka's caste certificate fee to Bihar is
  fabrication. Only genuinely central services — Aadhaar, PAN, Passport, GST,
  EPFO, ESIC — share a fee nationwide.

---

## Verification status

| Status | Means |
| :--- | :--- |
| `VERIFIED` | Official source; fee, documents and timeline all confirmed; checked within 90 days; fee seen in two places |
| `PARTIALLY VERIFIED` | Official source, but some fields absent or the fee is single-sourced |
| `CONFLICTING` | Two official sources disagree. **Say so — do not pick one.** |
| `OUTDATED` | The source is genuine but stale or superseded |

`CONFLICTING` is a feature, not a failure. In the last batch the Bihar researcher
noticed the Panchayati Raj page said 8,053 Gram Panchayats while the live
drill-down showed 8,058, and flagged the discrepancy instead of choosing one.
That is exactly the right instinct — keep it.

---

## Which processes, in what order

Central services are identical nationwide, so **research them once, not per
state.** For a new state, work down this list.

**Tier 1 — life events and identity.** Highest query volume, and currently
missing from every state we hold.

Birth certificate · Death certificate · Marriage certificate · Legal heir and
succession certificate

**Tier 2 — welfare and entitlement.**

Caste certificate · Income certificate · Domicile or residence certificate · EWS
certificate · Ration card · Old age and widow pension · Scholarship · MGNREGA
job card

**Tier 3 — land and property.**

Land record, under the state's own name for it (Khatiyan, Jamabandi, Khatauni) ·
Mutation · Encumbrance certificate · Property tax

**Tier 4 — transport and business.**

Driving licence · Vehicle registration · Shops and establishment registration ·
Trade licence · Professional tax

Tag every record with its `Government Level`: `Central`, `Central / State`,
`State`, `District / Regional`, `Tehsil / Subdistrict`, `Urban Local Body`, or
`Rural Local Body`. This decides whether a process is researched once or per
state, and in rural-majority states it decides whether a citizen is sent to a
municipal office or a block office.

---

## Self-check before handing over

Reject your own work if any of these fail.

- [ ] No cell contains a sentence explaining that something was not found
- [ ] At least 60% of records carry two or more of the four core fields
- [ ] No two records share a `Primary Source URL`, unless the fee genuinely is published on one shared page
- [ ] Every fee has a source URL on which that fee is visible
- [ ] No fee was copied from another state
- [ ] Every record has a `Government Level` and a research date
- [ ] Disagreeing sources are marked `CONFLICTING`, not silently resolved

---

## Output format

One JSON object per process. Use exactly these keys, with an empty string for
anything not found on an official source.

```json
{
  "Document / Service Name": "",
  "Government Level": "",
  "Department": "",
  "Issuing Authority": "",
  "State": "",
  "Who Can Apply": "",
  "Required Documents": "",
  "Government Fee": "",
  "Expected Processing Time": "",
  "Application Method": "",
  "Access Mode": "",
  "Official Portal": "",
  "Direct Application URL": "",
  "Physical Office Name": "",
  "Office Address": "",
  "Primary Source URL": "",
  "Secondary Source URL": "",
  "Verification Status": "",
  "Verification Notes": "",
  "Date Researched": ""
}
```

`Verification Notes` is the one place a sentence about sourcing belongs. Keep
that kind of prose out of every other field.

Run the result through `scripts/import_state_research.py`, which grades each
record and reports how many are usable. If the guide count comes back low, the
cause is almost always rule 1 or rule 3.
