# Hali Brand Studio

Start at **Brand Studio.dc.html** (hub). Pages: `Brand Studio Editor.dc.html`, `Design System.dc.html` (12 sections, click-to-copy tokens), `Brand Voice.dc.html` (copy per section / copy all / .md / .txt), `Asset Library.dc.html` (previews, single downloads, ZIP). Shared data lives in `studio/brand.js` (tokens, voice) and `studio/templates.js`.

## Phase 1: Editor, social & editorial templates, image export

Open **Brand Studio Editor.dc.html** in a browser. No install or build step; everything runs client-side.
Deep links: `#new` (template gallery), `#new=article` (gallery on a category), `#t=article/editorial/x-article` (create a design directly).

## What was inspected
The project contained no existing application — only the attached Hali design system (tokens, components, logo and icon assets). The "supplied template inventory" was not provided, so the inventory below is derived from the names listed in the brief. Replace or extend it when the original list is available.

## Files
- `Brand Studio Editor.dc.html` — editor UI (Hali design system components + tokens).
- `studio/templates.js` — formats, colour schemes, template layouts, re-flow logic. Pure data, no DOM.
- `studio/export.js` — PNG / JPEG / SVG capture, ZIP bundling, font embedding.
- `assets/logo/`, `assets/icons/` — centralised Hali logo, symbol, wordmark, favicon, app-icon and social assets (copied from the design system; used directly by templates).

## Template inventory (implemented)
- **Social posts** (Square 1080×1080, Portrait 1080×1350, Story/reel 1080×1920, YouTube thumbnail 1280×720): Announcement, Product update, Testimonial, Educational post, Statistic, Launch, Quote, Call to action, Comparison, Founder story, Community spotlight, Event.
- **Engagement posts** (Square, Portrait, Story): Poll, Question, This or that, Fill in the blank.
- **Carousels** (Square, Portrait): 5-slide carousel — Cover, Point, List, Quote, Closing CTA; any slide layout can be inserted again.
- **Article & editorial** (X article 1500×600 = 5:2, LinkedIn article cover 1280×720, LinkedIn post 1200×627, Medium 1400×788, Website hero 1600×900, Blog/Open Graph 1200×630, Newsletter promo 1200×600, Pinterest/tall 1000×1500): Editorial, Centred, Split with image, Minimal ink, Record lines.
- **Banners & covers**: X header, LinkedIn profile, LinkedIn company, Facebook cover, YouTube channel art (safe area marked), Twitch, Podcast cover 3000², Newsletter header, Website banner, Event banner, Community (Discord) — Brand statement, Headline + CTA, Event.
- **Advertising** (Square, Portrait, Story, Landscape 1200×628, 300×250, 728×90, 160×600, 300×600, 320×50): Offer, Problem → solution, Testimonial ad.
- **Avatars** 400×400: Symbol on paper, Full-bleed symbol, Ink symbol, Light symbol on Deep Sea, Wordmark, Initials, Photo with ring, Record rings.
- **Blank canvas** in every size above.
Every template works in Paper, Ink and Deep Sea schemes.

## Verified workflows
- Choose category → size → template; open, duplicate, delete saved designs (auto-saved to this browser).
- Select, drag, resize (8 handles, centre/edge snapping), nudge with arrow keys, double-click text to edit inline.
- Edit text, font, size, weight, line height, tracking, alignment (left/centre/right/justify, top/middle/bottom), case, colour, fill, border, radius, padding, opacity, rotation, X/Y/W/H.
- Add heading, text, label, button, image (upload), shape, record line (dotted/dashed/solid), logo (lockup/stacked/wordmark/symbol/app icon, 5 tones). Duplicate, delete, reorder, hide layers.
- Pages: add, insert before/after, duplicate, delete, reorder (buttons or drag), rename, page background. Selecting a page centres it in the canvas viewport.
- Change size or colour scheme: layout re-flows and keeps edited text, images, colours and moved elements.
- Reset template (with confirmation; undoable). Undo/redo (Ctrl/⌘ Z, Shift Z, Y).
- Export current page, all pages, every size in the category, or all saved designs — PNG/JPEG (1×/2×/3×, JPEG quality) or SVG; multiple files download as a ZIP. Design file (.hali.json) export and import.
- Light/dark UI theme (persisted). Artwork colours are brand colours and are independent of the UI theme.
- Responsive: desktop three-panel layout; under 960px the panels become bottom sheets with a tab bar.

## Phase 3: Document editor

Open **Document Editor.dc.html** (deep link `#type=book|report|whitepaper|proposal|casestudy|presentation|article|newsletter|resume`, or `#new` for the chooser). Files: `studio/documents.js` (types, sizes, page kinds, blocks), `studio/docexport.js` (exports).

- **Types and starter structures:** Book/ebook (30 pages: cover, title, copyright, dedication, epigraph, contents, foreword, preface, introduction, part, chapters, body, subsection, pull quote, figure, table, case study, exercise, reflection, key takeaways, summary, conclusion, appendix, references, acknowledgements, about the author, final CTA, back cover) · Report (12) · Whitepaper (12) · Proposal (11) · Case study (9) · Presentation (17 slides) · Article/blog (13 sections) · Newsletter (12 sections) · Resume/CV (2 pages + 6 section pages). Every page kind can be inserted again from the Add menu.
- **Sizes:** 6×9 in book, A4, US Letter, 16:9 slide, 880px web article and 600px email (auto height).
- **Blocks (20):** heading H1–H3, paragraph (italic, drop cap), overline, metadata, display title, pull quote, callout (4 tones), list, image/figure, table, statistics, bar chart, key details, timeline, people, CTA, record line, spacer, auto table of contents, logo. Edit text inline on the page or in the panel; align left/centre/right/justify; size 50–200%; brand colour.
- **Pages:** add, insert before/after, duplicate, delete, reorder (buttons or drag), rename, background (Paper/White/Ink/Deep Sea), vertical position, page number and running header per page; numbering start page per document. Move blocks between pages. Selecting a page in the navigator centres it in the canvas.
- **Overflow:** pages that hold more than fits are flagged; "Flow onto new pages" moves the overflow onto continued pages until everything fits.
- **Exports (current edited state):** PDF (image-based, exact layout) · Print → Save as PDF (selectable text, exact page size) · DOCX (headings, lists, tables, images, page breaks, page size) · PPTX (presentations, proposals, case studies; text editable, visuals as pictures) · EPUB 3 (books; chapters, nav, cover, images) · HTML · Markdown · text · PNG per page (ZIP). Whole document or current page. Save/open `.hali-doc.json`.
- Verified in this session: all nine types load without overflow; DOCX, Markdown, HTML, PDF and PNG ZIP from a resume; PPTX from a presentation; EPUB from a book; DOCX XML validated.

## Phase 4: Brand identity playbook, email and web templates

- **Brand Playbook.dc.html** — 13 chapters: brand overview, logo/symbol/favicon/avatar, colour (proportion and rules, click to copy), typography hierarchy, spacing/grid/radius/shadow, motif/imagery/icons/illustration, components and patterns (live), social and marketing, presentations and documents, light and dark, do and don't (6 visual pairs), accessibility contrast table (computed), governance checklist. Reads the same tokens and assets as everything else.
- **Email graphics** (template editor): Full email 600×1500, header 600×200, hero 600×320, section 600×400, footer 600×180 — Announcement, Product update, Event invitation, Newsletter digest.
- **Web graphics**: Website hero 1440×720, feature section 1440×900, CTA band 1440×480, mobile hero 390×844 — Landing hero, Feature section, CTA band, Landing hero · Ink.
- Email/web are image templates for mockups and campaign graphics. Send-ready HTML email comes from the Document editor's Newsletter (HTML export); it uses div layout, so test it in your email tool or rebuild as table-based HTML for older clients.

## Limitations
- Exports render through html-to-image and JSZip loaded from jsDelivr, and Geist from Google Fonts — the first export needs a network connection.
- SVG export wraps HTML in `foreignObject`: it opens in browsers but most design tools will not edit its text.
- Storage is browser `localStorage` (≈5 MB). Large uploaded images can fill it; the editor warns and the design file export is the backup path.
- Template copy is illustrative. Bracketed items ([Client name], [Date], [Agency name]) are facts the brand must supply; no URLs, handles, statistics or customers were invented.
- Phase 2 added the design system, voice & knowledge page, asset library and hub. Voice sections are marked Verified (from Hali source documents) or Needs confirmation (mission, pricing, customers, pillars, channels, URLs/handles are not established).
- Not yet built: nothing from the brief's major areas is outstanding except the Next.js port. The brief asked for Next.js; this environment produces browser-native HTML components, so a Next.js port would be a separate handoff.
- Documents: PDF download is rasterised (use Print → Save as PDF for selectable text). EPUB is reflowable, so fixed layout and page numbers are replaced by the reader's. PPTX/DOCX use Geist — install it for exact rendering. Charts become tables in DOCX/EPUB. Overflow splitting works block-by-block; a single block taller than a page must be shortened.
