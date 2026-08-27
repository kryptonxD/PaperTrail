# State Research Guide

How to research a new state so the output can actually be used. Written after
importing Uttar Pradesh, Bihar and Rajasthan, where **2,328 researched records
yielded only 480 usable ones** — and the gap came from avoidable habits, not
from lack of effort.

The prompt in [The complete agent prompt](#the-complete-agent-prompt) is
self-contained: the only thing that changes between runs is the state name.

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

## The five rules

### 1. Leave a field empty. Never explain why it is empty.

The single most expensive habit from the last batch. These sentences were
written into detail fields:

> "No government fee indicated in the official approval catalogue"
> "exact checklist not stated on the reviewed landing page"
> "Fees, eligibility and required documents were not transcribed"

Each is true, and each is worthless. Worse, each is *actively harmful*: an
importer sees a filled field, a model reading it sees prose where a document
list should be, and a user receives a confident answer built on an absence.

**An empty cell is a correct and complete answer.** The app is built to say "the
official source does not publish this" — but only when the cell is empty.

### 2. Work the list. Do not choose your own.

Rajasthan returned 1,316 records because the researcher enumerated whatever a
portal index happened to list. The result was deep in one sector and empty in
others. [The master document list](#the-master-document-list) below is the
scope. Attempt every row, and report the ones you could not complete.

### 3. The catalogue page is not the service page.

The last batch was sourced from service *catalogues* — Nivesh Mitra's
live-services PDF, Jan Soochna's A-Z index, Bihar's ServiceList.pdf. A catalogue
confirms a service exists. It never carries fees or document checklists.

Symptom: in the last batch **532 records shared only 65 distinct URLs**, because
the "direct application URL" was a portal homepage. If two records point at the
same URL, neither is deep enough.

**Highest-leverage single move:** find the state's consolidated e-District or CSC
**fee notification**. One document often carries fees for dozens of services.

### 4. Every state calls things something different.

This is what breaks research that is given only a state name. The land record of
rights is *RTC / Pahani* in Karnataka, *7/12 Extract* in Maharashtra, *Khatauni*
in Uttar Pradesh, *Jamabandi* in Rajasthan and *Khatiyan* in Bihar. An agent
searching for "Land Record of Rights" in Bihar finds nothing and reports the
document as unavailable — when it exists under another name.

For every row, **search the local name first**, then the English one. The master
list gives the known aliases.

### 5. Fill these four fields above all others.

| Field | The question it answers |
| :--- | :--- |
| `Required Documents` | What do I need to bring? |
| `Government Fee` | What will it cost? |
| `Expected Processing Time` | How long will it take? |
| `Who Can Apply` | Am I eligible? |

A record with an official portal plus **two or more** of these is usable. With
fewer, it becomes a directory entry — kept, but unable to answer anyone.

---

## The master document list

51 processes across 11 sectors. This is the full scope for any state.

`Central` rows are identical nationwide: confirm the process is available in the
state and record the national fee, but do not go hunting for a state-specific
version. `Local` rows vary by municipal corporation in cities and by block or
gram panchayat in rural areas — say which you documented.

### Core Identity — 4 · Central
| # | Document | Notes |
| --: | :--- | :--- |
| 1 | Aadhaar Card | Enrolment and update. UIDAI, national fee |
| 2 | PAN Card | Income Tax, national fee |
| 3 | Voter ID (EPIC) | ECI rules, state CEO/ERO executes |
| 4 | Passport | MEA. Note the state's PSK/POPSK locations |

### Life Events — 4 · Local
Highest query volume in India, and **missing from every state we currently hold.
Research these first.**

| # | Document | Common aliases |
| --: | :--- | :--- |
| 5 | Birth Certificate | Janma Praman Patra |
| 6 | Death Certificate | Mrityu Praman Patra |
| 7 | Marriage Certificate | Vivah Praman Patra; note Hindu Marriage Act vs Special Marriage Act routes |
| 8 | Legal Heir / Succession Certificate | Varisu, Warisan, Uttaradhikar |

### Welfare and Entitlement — 10 · State
| # | Document | Common aliases |
| --: | :--- | :--- |
| 9 | Caste Certificate | Jati Praman Patra; SC/ST/OBC may be separate routes |
| 10 | Income Certificate | Aay Praman Patra |
| 11 | Domicile / Residence Certificate | Niwas / Mool Niwas Praman Patra |
| 12 | EWS Certificate | Economically Weaker Section |
| 13 | Ration Card | PDS; note APL/BPL/AAY categories |
| 14 | BPL Card | May be merged into the ration card in some states |
| 15 | Senior Citizen Card | |
| 16 | Old Age / Widow Pension | Vridha / Vidhwa Pension; social security pension |
| 17 | Post-Matric Scholarship | SC/ST/OBC/minority scholarship portals |
| 18 | MGNREGA Job Card | NREGA; high volume in rural states |

### Health — 3
| # | Document | Notes |
| --: | :--- | :--- |
| 19 | Ayushman Bharat / state health card | Named per state — AB-ArK in Karnataka, MJPJAY in Maharashtra. Find the local scheme |
| 20 | Disability Certificate / UDID | Central scheme, state issuance |
| 21 | Health Insurance Card | State employee or general scheme |

### Property and Land — 8 · State and Local
| # | Document | Common aliases |
| --: | :--- | :--- |
| 22 | Land Record of Rights | **RTC/Pahani (KA), 7/12 (MH), Khatauni (UP), Jamabandi (RJ), Khatiyan (BR)** |
| 23 | Mutation | Dakhil Kharij, Namantaran, Intekal |
| 24 | Encumbrance Certificate | EC |
| 25 | Sale Deed / Property Registration | Includes stamp duty rates |
| 26 | Property Tax | Municipal; name the corporation |
| 27 | Rent Agreement | Registration and stamp duty |
| 28 | RERA Registration | Named per state — K-RERA, MahaRERA, UP-RERA |
| 29 | Society / Housing NOC | |

### Utilities and Civic — 3 · Local
| # | Document | Notes |
| --: | :--- | :--- |
| 30 | New Electricity Connection | Name the state discom |
| 31 | New Water / Sewerage Connection | Municipal or state board |
| 32 | Building Plan Approval | Includes completion/occupancy certificate |

### Transport — 2 · Central rules, state RTO
| # | Document | Notes |
| --: | :--- | :--- |
| 33 | Driving Licence | Learner, permanent, renewal. Parivahan plus state RTO |
| 34 | Vehicle Registration (RC) | New, transfer, duplicate |

### Business — 8
| # | Document | Notes |
| --: | :--- | :--- |
| 35 | GST Registration | Central |
| 36 | Shops and Establishment Registration | State labour dept |
| 37 | Trade Licence | Municipal |
| 38 | Udyam / MSME Registration | Central, free |
| 39 | FSSAI Registration / Licence | Central, state-administered |
| 40 | Professional Tax (PTRC/PTEC) | Not levied in every state — record if absent |
| 41 | Fire NOC | State fire services |
| 42 | Liquor Licence | State excise |

### Employment — 3 · Central
| # | Document | Notes |
| --: | :--- | :--- |
| 43 | EPFO / UAN | |
| 44 | ESI Card | |
| 45 | Labour Card (BOCW) | State welfare board |

### Finance — 3 · Central
| # | Document | Notes |
| --: | :--- | :--- |
| 46 | Bank Account KYC | RBI norms |
| 47 | Income Tax Return | |
| 48 | GST Returns | GSTR-1 / GSTR-3B |

### Hospitality and Legal — 3
| # | Document | Notes |
| --: | :--- | :--- |
| 49 | Eating House Licence | Municipal or police |
| 50 | Police Verification for Hotel Guests | Includes C-Form for foreign nationals |
| 51 | Notarized Affidavit | General purpose, stamp value |

---

## Sourcing rules

- **Official sources only** for facts: the state portal, the department site, a
  citizen charter, a government order, a fee notification. Aggregator blogs,
  YouTube and news may point you toward a source, but are never the citation.
- **Two sources for money.** Fees change most and hurt most when wrong. A single
  source caps the record at `PARTIALLY VERIFIED`.
- **`Primary Source URL` is the page the fee and documents were actually read
  from** — not the portal homepage.
- **Date every record.**
- **Never infer a state fee from another state.** Only genuinely central
  services — Aadhaar, PAN, Passport, GST, EPFO, ESIC — share a fee nationwide.

## Verification status

| Status | Means |
| :--- | :--- |
| `VERIFIED` | Official source; fee, documents and timeline confirmed; checked within 90 days; fee seen in two places |
| `PARTIALLY VERIFIED` | Official source, but some fields absent or fee single-sourced |
| `CONFLICTING` | Two official sources disagree. **Say so — do not pick one** |
| `OUTDATED` | Source is genuine but stale or superseded |
| `NOT AVAILABLE IN STATE` | The process genuinely does not exist here. A real finding — record it |

`CONFLICTING` is a feature. The Bihar researcher noticed the Panchayati Raj page
said 8,053 Gram Panchayats while the live drill-down showed 8,058, and flagged
it rather than choosing. Keep that instinct.

---

## The complete agent prompt

Replace `[STATE]` and run. Nothing else needs changing.

```text
You are researching government services for [STATE], India, for PaperTrail — a
civic-tech app that tells citizens what documents to bring, what a process
costs, and how long it takes.

Accuracy matters more than volume. A wrong fee is worse than no fee.

STEP 1 — MAP THE STATE
Identify [STATE]'s official portals before researching any document:
  - the e-District / citizen services portal
  - the land records portal
  - the transport / RTO portal
  - the single-window business portal
  - the municipal corporation sites for the 2-3 largest cities
  - the rural route: block / tehsil / gram panchayat offices
List these with URLs before continuing.

STEP 2 — RESEARCH ALL 51 PROCESSES BELOW
Work the list in order. Do not substitute your own list. If a process does not
exist in [STATE], set Verification Status to NOT AVAILABLE IN STATE and move on
— that is a real finding, not a failure.

CRITICAL: every state uses different local names. ALWAYS search the local name
first, then English. Example: the land record of rights is RTC/Pahani in
Karnataka, 7/12 in Maharashtra, Khatauni in UP, Jamabandi in Rajasthan,
Khatiyan in Bihar. If you search only the English name you will wrongly report
documents as unavailable.

LIFE EVENTS (do these first — highest demand):
 1 Birth Certificate (Janma Praman Patra)
 2 Death Certificate (Mrityu Praman Patra)
 3 Marriage Certificate (Vivah Praman Patra; Hindu Marriage Act and Special
   Marriage Act routes)
 4 Legal Heir / Succession Certificate (Varisu / Warisan / Uttaradhikar)

CORE IDENTITY (central — confirm state availability and national fee):
 5 Aadhaar Card (enrolment and update)
 6 PAN Card
 7 Voter ID / EPIC
 8 Passport (note the state's PSK and POPSK locations)

WELFARE AND ENTITLEMENT:
 9 Caste Certificate (Jati Praman Patra; SC/ST/OBC routes)
10 Income Certificate (Aay Praman Patra)
11 Domicile / Residence Certificate (Niwas / Mool Niwas)
12 EWS Certificate
13 Ration Card (APL/BPL/AAY)
14 BPL Card
15 Senior Citizen Card
16 Old Age / Widow Pension (Vridha / Vidhwa Pension)
17 Post-Matric Scholarship (SC/ST/OBC/minority)
18 MGNREGA Job Card

HEALTH:
19 Ayushman Bharat or the [STATE] health scheme card (find the local name)
20 Disability Certificate / UDID
21 Health Insurance Card

PROPERTY AND LAND:
22 Land Record of Rights (find [STATE]'s local name)
23 Mutation (Dakhil Kharij / Namantaran / Intekal)
24 Encumbrance Certificate
25 Sale Deed / Property Registration (include stamp duty)
26 Property Tax (name the municipal corporation)
27 Rent Agreement registration
28 RERA Registration (find [STATE]'s RERA name)
29 Society / Housing NOC

UTILITIES AND CIVIC:
30 New Electricity Connection (name the discom)
31 New Water / Sewerage Connection
32 Building Plan Approval and Completion Certificate

TRANSPORT:
33 Driving Licence (learner, permanent, renewal)
34 Vehicle Registration Certificate (new, transfer, duplicate)

BUSINESS:
35 GST Registration
36 Shops and Establishment Registration
37 Trade Licence
38 Udyam / MSME Registration
39 FSSAI Registration / Licence
40 Professional Tax PTRC/PTEC (not levied in every state — say so if absent)
41 Fire NOC
42 Liquor Licence

EMPLOYMENT:
43 EPFO / UAN
44 ESI Card
45 Labour Card (BOCW)

FINANCE:
46 Bank Account KYC
47 Income Tax Return
48 GST Returns (GSTR-1 / GSTR-3B)

HOSPITALITY AND LEGAL:
49 Eating House Licence
50 Police Verification for Hotel Guests (incl. C-Form for foreign nationals)
51 Notarized Affidavit (general purpose, note stamp value)

STEP 3 — HARD RULES

1. NEVER write a sentence explaining that information was missing. If the
   official page does not state a fee, leave "Government Fee" as "". Do NOT
   write "not stated", "not indicated", "not available on the portal", or any
   similar phrase in ANY field. An empty string is the correct answer. The ONLY
   field where sourcing prose belongs is "Verification Notes".

2. Do not stop at the service catalogue, A-Z index or service list. Those
   confirm a service exists but never carry fees or checklists. Open the
   service's own page, its citizen charter, or the department fee notification.
   If two records end up with the same Primary Source URL, go deeper.

3. Look for [STATE]'s consolidated e-District or CSC fee notification. One
   document often carries the fee for dozens of services at once.

4. Prioritise filling: Required Documents, Government Fee, Expected Processing
   Time, Who Can Apply. A record needs at least two of these to be useful.

5. Never copy a fee from another state. State fees are set per state by
   notification. Only Aadhaar, PAN, Passport, GST, EPFO and ESIC share a fee
   nationwide.

6. If two official sources disagree, set Verification Status to CONFLICTING and
   explain in Verification Notes. Do not silently pick one.

7. For municipal services, say which city or corporation you documented. For
   rural routes, say whether it is the block, tehsil or gram panchayat office.

STEP 4 — OUTPUT

Deliver ONE Excel file (.xlsx) named:
  PaperTrail_[STATE]_Research_YYYY-MM-DD.xlsx

FORMATTING RULES — these matter, the file is parsed by a script:
  - Column headers go in ROW 1. Do NOT put a title, record count or summary
    banner above the header. Put those on the Coverage sheet instead.
  - One row per process. Never merge cells. Never split a process across rows.
  - Use the exact column names below, in this order, spelled exactly.
  - An unknown value is an EMPTY CELL. Do not write "N/A", "-", "Not Verified"
    or a sentence. Empty means "the official source does not publish this",
    which the app states honestly. A filled cell means the app will repeat it.
  - Plain text only. No formulas, no colour-coding as meaning, no footnotes.

SHEET 1 — name it "Documents". Columns, in order:

  Document / Service Name
  Local / Regional Name
  Government Level
  Sector
  Department
  Issuing Authority
  State
  District / City Documented
  Who Can Apply
  Required Documents
  Government Fee
  Expected Processing Time
  Validity
  Application Method
  Access Mode
  Official Portal
  Direct Application URL
  Physical Office Name
  Office Address
  Primary Source URL
  Secondary Source URL
  Verification Status
  Verification Notes
  Date Researched

Government Level must be exactly one of: Central, Central / State, State,
District / Regional, Tehsil / Subdistrict, Urban Local Body, Rural Local Body.

Verification Status must be exactly one of: VERIFIED, PARTIALLY VERIFIED,
CONFLICTING, OUTDATED, NOT AVAILABLE IN STATE.

SHEET 2 — name it "Coverage". Header in row 1:
  Sector | Attempted | Completed with 2+ core fields | Marked unavailable

SHEET 3 — name it "Gaps". Header in row 1:
  Document / Service Name | What is missing | Where you looked | Why you stopped

SHEET 4 — name it "Portals". The portal map from Step 1. Header in row 1:
  Portal Name | Purpose | URL

STEP 5 — SELF-CHECK BEFORE RETURNING
State explicitly whether each of these passes. Fix any that fail, then re-check.
  - No cell anywhere contains a sentence explaining something was not found
  - All 51 processes attempted, each either researched or marked
    NOT AVAILABLE IN STATE
  - At least 60% of records have two or more of the four core fields
  - No two records share a Primary Source URL unless the fee genuinely is
    published on one shared page
  - Every fee has a source URL on which that fee is visible
  - No fee was copied from another state
  - Local names were searched, not just English names
  - Every record has a Government Level and a research date

Finish with a coverage table: sector, attempted, completed with 2+ core fields,
marked unavailable. Then list every process you could not complete and say what
was missing.
```

---

## After the research comes back

```bash
python scripts/import_state_research.py --source-dir "<folder with the workbooks>"
```

It grades each record and prints usable versus directory counts per state. The
last batch was **21% usable**. Below roughly 60%, the cause is almost always
rule 1 (absence prose) or rule 3 (catalogue sourcing).
