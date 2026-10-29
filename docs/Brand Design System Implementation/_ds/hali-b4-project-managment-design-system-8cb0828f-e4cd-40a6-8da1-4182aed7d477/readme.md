# Hali Design System

Hali is a commercial operating platform for independent branding and design agencies (≈3–20 people). It keeps **agreed scope → client requests → change decisions → approvals → delivery → invoicing** connected in one commercial record, with an agency-branded public page and enquiry form as the front door. Central principle: help agencies make better commercial decisions without making client relationships feel transactional or adversarial.

Three surfaces share this system:
- **Public agency page & enquiry** — agency-branded; Hali appears only as a small attribution.
- **Agency workspace** — Hali chrome; commercial control and daily coordination.
- **Client portal** — agency-branded secure links; clarity and informed decisions.

## Sources
All supplied as pasted text / `uploads/Hali.md` (same content): Master Prompt — Hali · Product Strategy and Business Context · A Practical Framework for Building Products… · Design System and Product Experience Strategy · Hali's Public Link. **Not supplied:** user research, codebase, Figma, existing logo or brand assets, licensed fonts. The identity here is a **proposal**, not an approved brand.

Version **1.4.0** — see `CHANGELOG.md`.

## Index
- `styles.css` — entry point (imports only) → `tokens/fonts.css`, `colors.css`, `themes.css` (dark), `typography.css`, `spacing.css`, `layout.css` (grid, breakpoints, utilities), `base.css`
- `docs/01-product-understanding.md` — source audit, roles, lifecycle, conflicts, architecture, RBAC, AI boundary
- `docs/02-ux-and-ia.md` — sitemap, journeys, screen inventory, state matrix, decision rationale
- `docs/04-creative-review-and-integrations.md` — creative record, review rounds, revision policy, Canva/other tool adapters, commercial stages
- `docs/03-handoff.md — interaction specs, security, a11y, responsive, test plan, build order
- `docs/decision-log.md` — persistent decision log
- `docs/engineering/` — **engineering handbook** (00 index + 10 areas: rules, architecture, data model, codebase, stack, security, testing, scalability, operations, governance)
- `docs/06-concerns-and-disputes.md` — raise a concern → reply → disputed → outcome; evidence pack; billing effects
- `docs/05-proposals-and-change-orders.md` — many proposals per client, one live version per opportunity, options, one open change order per engagement
- `docs/components.md` — anatomy, variants, states, do/don't, a11y for every component
- `docs/tokens.md` — generated token reference + naming convention
- `docs/accessibility.md` — WCAG 2.2 AA guidelines + release checklist
- `docs/governance.md` — ownership, versioning, contribution, deprecation, naming, maintenance
- `CHANGELOG.md`
- `assets/logo/` — symbol, wordmark, horizontal + stacked lockups (default / ink / light / reverse / mono) SVG
- `assets/icons/` — favicon SVG + 16/32/48 PNG, apple-touch-icon 180, PWA 192/512 + maskable, social avatar, OG image, `site.webmanifest`
- `guidelines/` — foundation cards (colour, type, spacing, logo, icons, voice)
- `components/` — React primitives (below)
- `ui_kits/public-page/`, `ui_kits/agency-app/`, `ui_kits/client-portal/`, `ui_kits/patterns/` — responsive click-through prototypes (illustrative data)
- `SKILL.md`, `thumbnail.html`

## Components
- brand: **Logo**, **AgencyMark**, **Icon**
- actions: **Button**, **IconButton**, **Link**
- forms: **Field**, **TextInput**, **TextArea**, **Select**, **Checkbox**, **RadioGroup**, **Switch**, **ChoiceGroup**, **SearchField**, **FileDrop**
- feedback: **Alert**, **StatusBadge**, **Tooltip**, **ProgressBar**, **EmptyState**, **Spinner**, **Skeleton**
- navigation: **SideNav**, **TopBar**, **Tabs**, **Breadcrumbs**, **Menu**, **Stepper**, **Pagination**
- layout: **AppShell**, **Card**
- overlay: **Dialog**
- data: **Money** (+ `formatMoney`), **DataTable**, **List**, **ListItem**, **Avatar**, **ActivityLog**
- review: **SourceBadge**, **ArtifactVersion**, **VersionStrip**, **FeedbackItem** (+ `FEEDBACK_CLASSES`), **RevisionPolicy**
- commercial: **CommercialState** (+ `COMMERCIAL_STATES`), **ScopeItem**, **RevisionRounds**, **Assessment**, **ChangeOrderSummary**, **DecisionRecord**, **ApprovalConditions**, **VersionTag**

Intentional scope: no Toast or custom Date picker — results are shown inline (Alert, Button success) where the action happened, and native date inputs suffice for MVP timelines. Drawer behaviour lives inside AppShell.

## CONTENT FUNDAMENTALS
- **Voice:** clear not legalistic · professional not cold · firm not aggressive · transparent not alarmist · helpful not presumptuous.
- **Person:** product speaks to the user as "you"; refers to the agency by name to clients ("Studio North has prepared…"); Hali refers to itself in the third person only for suggestions ("Hali found a possible difference…"). Never "we" in product UI.
- **Casing:** sentence case everywhere — titles, buttons, nav, labels. Overlines are mono uppercase (`NOT INCLUDED`).
- **Action labels** name the exact action: "Authorise and send", "Approve change", "Record invoice", "Create proposal". Never "Continue/OK" for consequential actions.
- **Hedging on interpretation, certainty on records:** "This request *may* fall outside the agreed scope" (assessment) vs "Approved and recorded" (decision).
- **Fixed vocabulary:** enquiry · proposal · agreement · scope (vN) · deliverable · revision round · request · change order (client sees "proposed change") · approval · billable work · invoice. Don't swap synonyms.
- **Money** always with currency and basis: "$1,800 · Proposed", "$6,000 agreed → $7,800 if approved". Never "Revenue recovered".
- **Errors** say what happened + how to fix: "Enter a full email address so the agency can reply."
- **No emoji.** No exclamation marks in commercial contexts. Examples are labelled *illustrative*.
- Examples — avoid "You exceeded your revision limit." → prefer "Your two included revision rounds are complete. This request can be handled as an additional change."

## VISUAL FOUNDATIONS
- **Concept — "the record":** quiet paper-and-ink surfaces where commercial certainty is visible in the line itself. **Dotted = suggested by Hali · dashed = not yet agreed · solid = recorded.** Colour adds who must act (amber = someone owes a decision, Deep Sea = agreed, blue = proposed). Works without colour.
- **Colour:** warm neutrals from Paper `#FBFAF7` to Ink `#1C1A18`; one brand accent **Deep Sea** `#285B57` used for the brand mark and for committing/agreed states only. Semantic hues (blue, amber, red, green) are reserved for meaning, never decoration. Agency pages take the agency's colour for CTAs.
- **Type:** one superfamily — **Geist** for UI and display (600, −0.02 to −0.03em tracking for headlines) and **Geist Mono** for references, versions, timestamps and overlines. Chosen because it is neutral and precise without being corporate, has excellent tabular figures for money, is free (OFL) and keeps one family to load. Body 14px in agency app, 16px for clients/public. Financial values never below 13px.
- **Themes:** light everywhere; optional dark theme (`data-theme="dark"`) for the agency workspace only. Public pages, client portal and emails stay light and agency-branded.
- **Grid & breakpoints:** 4/8/12 columns at xs <640 / sm ≥640 / md ≥960; lg ≥1280, xl ≥1600. Gutters 16/24/32. Phones: single column, tables become stacked cards, dialogs become bottom sheets, primary actions stick to the bottom.
- **Spacing:** 4px base; 8/12/16/24 dominate. Generous whitespace on public/client surfaces, denser lists in the agency app.
- **Backgrounds:** flat paper; no gradients, textures or illustrations. Portfolio placeholders use a subtle diagonal hatch. Imagery comes from the agency's own work only.
- **Borders over shadows:** 1px `--border-default` cards; shadows only for overlays (`--shadow-overlay`) and floating previews. No left-border accent cards.
- **Radii:** 6px controls, 10px surfaces, 14px dialogs, pill only for choice chips and badges.
- **Cards:** used only where a record is a unit (scope item, change order, decision). Lists are rows with dividers, not card grids.
- **Hover:** background shifts one neutral step; primary darkens to `--n-700`. **Press:** one further step (`--action-*-bg-pressed`), no scale/bounce. **Focus:** 2px page-colour + 2px blue ring.
- **Motion:** 120–200ms, `cubic-bezier(.2,0,0,1)`, opacity/colour only. Nothing animates on records or money. Respects reduced motion.
- **Transparency/blur:** only the dialog scrim (`rgba(28,26,24,.42)`). No glass.
- **Layout:** agency app = 248px sidebar + max 1080px content; public/client = centered 560–880px column; sticky elements limited to headers and form actions.
- **Status:** CommercialState for commercial objects; StatusBadge/Alert for operations. A declined proposal is grey (closed), not red; red means something failed or is disputed.

## ICONOGRAPHY
- **Lucide** (outline, 2px stroke) via the `lucide-static@0.460.0` icon font imported in `tokens/fonts.css`; use `<Icon name="…">` or `<i class="icon-…">`. No codebase icon set was provided — Lucide matches the icon names used in the source documents.
- Sizes 14/16/18/22px; icon colour `--icon-secondary` unless it carries state.
- Core mapping: file-text (agreement) · list-checks (scope) · message-square (feedback) · inbox (requests/enquiries) · scan-search (assessment) · file-diff (change order) · shield-check (authorised/verified) · receipt (billing) · clock (awaiting) · circle-help (unknown) · layers (superseded) · sparkle (Hali suggestion only) · lock (restricted/preserved).
- Status icons always accompany text. No emoji, no unicode icons (✓/✕ only in guideline cards).

## Logo
**Concept — the folded agreement.** The symbol is a Deep Sea tile with its top-right corner folded: a page that has been read, marked and kept. Inside, a monoline **h**. The wordmark "hali" uses the same monoline geometry; its i-dot is a tiny folded sheet, tying the family together.
- **Family:** lockup (primary) · wordmark · symbol · stacked; tones default (Deep Sea symbol + ink wordmark), ink, light, reverse, mono, mono-reverse.
- **Clear space:** the folded-corner size (≈30% of symbol height) on all sides. **Minimum:** symbol 16px, wordmark 14px, lockup 20px.
- **Where:** Hali workspace, sign-in, Hali emails (footer), marketing, app icons. On agency public pages and client portals Hali appears only as a mono footer attribution — the agency's mark (and favicon) leads.
- **Files:** `assets/logo/*.svg` (vector masters), `assets/icons/*` (favicons, app icons, social, OG, manifest). Use `<Logo>` in React.
- Geometry is hand-constructed; a type designer should do an optical pass before trademark filing.

## Fonts
Geist and Geist Mono (SIL OFL) load from Google Fonts. For production, self-host the WOFF2 files and add `@font-face` rules in `tokens/fonts.css`.
