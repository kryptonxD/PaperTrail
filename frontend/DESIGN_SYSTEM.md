# PaperTrail interface system

PaperTrail uses a civic-editorial visual language: warm archival materials, quiet rules, one copper annotation color, and pine actions. The product should feel authored and trustworthy without imitating a government portal or a generic SaaS dashboard.

## Design tokens

Tokens live in `src/index.css` and are exposed to Tailwind in `tailwind.config.js`.

| Role | Light | Dark | Use |
| --- | --- | --- | --- |
| Page | `#F4F0E7` | `#0C1411` | Main canvas |
| Card | `#FFFCF6` | `#121D18` | Forms, guide sheets, focused content |
| Elevated | `#FAF6EE` | `#17231E` | Alternating sections and contextual bands |
| Primary text | `#17201C` | `#F2EEE5` | Headings and body text |
| Secondary text | `#626D66` | `#A8B2AB` | Supporting copy and metadata |
| Border | `#D8D2C5` | `#2A3831` | Rules and surface boundaries |
| Copper | `#A65336` | `#DF7751` | Annotations, trail nodes and editorial emphasis |
| Action | `#1F4437` | `#97C1A9` | Primary actions, progress and completion |
| Focus | `#B7782F` | `#E2B762` | Keyboard focus only |

Typography roles:

- Cormorant Garamond: brand wordmark and editorial display headings.
- Outfit: interface, body copy, buttons and form controls.
- JetBrains Mono: compact metadata, docket numbers and progress labels.

Readable type floors:

- Primary body and process content: 16px with 1.55–1.65 line height.
- Compact supporting copy: 15px with at least 1.5 line height.
- Controls and navigation: 15–16px.
- Metadata: 14px; decorative mono labels may use 12px but never carry essential instructions alone.

Use the 8px spacing rhythm. Most controls are at least 44px tall. Corners stay between 6px and 10px; status pills are the only fully rounded controls.

## Components and patterns

### Primary button

Use for the single next action in a section: opening a guide, saving a checklist or beginning a search. The button uses the action token, has a 44px minimum height, a visible focus ring, and a restrained 1px hover lift. Do not place two primary buttons side by side.

### Secondary button

Use for navigation, official-source links, theme controls and supporting actions. It uses the card surface and a semantic border. Destructive actions keep their own semantic red hover treatment.

### Search field

The homepage version has a visible label, a plain-language “I need to” prefix and a visible submit action at every breakpoint. The compact version retains the same keyboard and error behavior. Empty submission returns an inline status message.

### Guide sheet

The layered guide preview is PaperTrail’s signature motif. It shows a real sequence—outcome, documents, route and source—rather than acting as decoration. Use it only in high-level product explanation, not as a generic card style.

### Confidence badge

Confidence is always expressed with text and color. Each badge includes a short definition via accessible label and title. “Verified” means checked against an official source; it does not promise application approval.

### Process checklist

The complete row is a labelled click target. Each checkbox has a descriptive accessible name, progress uses a semantic progressbar, and completion is never communicated by color alone.

### Navigation

Desktop navigation keeps preferences visible. Mobile navigation uses a real menu containing routes, state, language and account actions; no critical control is hidden without an alternative.

## Motion and accessibility

- Entry motion is limited to a 12px rise and opacity over 600ms.
- The trail line draws once; nothing loops continuously.
- `prefers-reduced-motion` reduces animations and transitions to effectively zero.
- All interactive controls need a visible `:focus-visible` ring and a 44px target.
- Form and control boundaries use the dedicated `--control-border` token so they retain at least 3:1 contrast against adjacent surfaces.
- Pages include a `<main id="main-content">` landmark and the header exposes a skip link.
- Body text uses the secondary token only at sizes that retain readable contrast.

## Do and do not

- Do keep source links and review context near the claim they support.
- Do use hairline rules, whitespace and type scale before adding another card.
- Do keep official facts visually separate from practical or community context.
- Do use the tactile paper/leather folder as the homepage’s day/night material motif; keep its lettering as HTML so it remains crisp.
- Do not add neon color, glassmorphism, glowing shadows, gradient blobs or looping decoration.
- Do not use copper for primary actions; it is an annotation color.
- Do not label content “verified” without an actual source-review state.
