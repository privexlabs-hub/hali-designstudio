# Hali Brand Studio

Next.js + TypeScript rebuild of the Hali Brand Studio Claude Design project (the original `.dc.html` source is kept unchanged in `docs/Brand Design System Implementation/` as the reference).

The app is a static, fully client-side site: no server or database. Designs and documents are saved in the browser (IndexedDB), and every export — PNG, JPEG, SVG, ZIP, PDF, DOCX, PPTX, EPUB, HTML, Markdown, text — is produced in the browser with bundled libraries and self-hosted fonts, so it works offline.

## Run

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # static export to out/
npm start          # serve out/ on http://localhost:3000
```

Checks:

```bash
npm run typecheck
npm run lint
npm test           # Vitest: template engine, document library, DOCX/EPUB validity
npm run e2e        # Playwright: editors, exports, pages, responsive matrix (builds must exist in out/)
```

Run `npx playwright install chromium` once before the first `npm run e2e`.

## Pages

| Route | Page |
|---|---|
| `/` | Hub |
| `/playbook/` | Brand identity playbook (13 chapters) |
| `/design-system/` | Design system (12 sections, click any value to copy) |
| `/voice/` | Brand voice and knowledge (filter, copy, Markdown/text downloads) |
| `/assets/` | Asset library (single downloads, ZIP of a selection) |
| `/editor/` | Template editor — deep links `#new`, `#new=<category>`, `#t=<category>/<template>[/<size>]` |
| `/documents/` | Document editor — deep links `#type=<book\|report\|whitepaper\|proposal\|casestudy\|presentation\|article\|newsletter\|resume>`, `#new` |

## Structure

```
src/app/                  routes, root layout (pre-paint theme script, metadata, icons)
src/components/ds/        design-system components (Button, Logo, Alert, CommercialState, Tabs, …) + ds.css
src/components/shell/     studio header, theme toggle/sync, copy toast, chapter nav, menu
src/components/pages/     hub-adjacent static pages
src/components/editor/    template editor (canvas, panels, gallery, export) + shared editor CSS
src/components/documents/ document editor (page renderer, navigator, properties)
src/lib/brand.ts          brand data: colours, type, spacing, voice, contrast helpers
src/lib/templates/        template formats, schemes, layout engine, re-flow
src/lib/documents/        document types, sizes, page kinds, blocks
src/lib/docexport/        Markdown, text, DOCX, EPUB, HTML, print, PDF, PPTX
src/lib/export.ts         image capture, ZIP, download, font embedding
src/lib/storage.ts        IndexedDB store (migrates the original localStorage data)
src/styles/tokens/        design tokens (ported verbatim; fonts self-hosted)
public/assets/            logo and icon files (copied verbatim)
public/fonts/             Geist and Geist Mono WOFF2 (from the `geist` package)
scripts/gen-icons.mjs     builds the Lucide icon registry from the names used in src/
```

## Templates

The template editor (`/editor/`) has 11 categories. Every template re-flows to every size in its category and to the Paper, Ink and Deep Sea schemes.

**Platform post sizes** (social, engagement and celebration templates; carousels use the feed sizes):

| Platform | Sizes |
|---|---|
| Any platform | Square 1080×1080, portrait 1080×1350, story/reel 1080×1920, YouTube thumbnail 1280×720 |
| Instagram | Square 1080×1080, portrait 1080×1350, story 1080×1920, reel cover 1080×1920 |
| TikTok | Video cover 1080×1920 |
| X / Twitter | Post 1600×900 |
| Facebook | Square 1080×1080, portrait 1080×1350, link/landscape 1200×630, story 1080×1920 |
| LinkedIn | Square 1200×1200, portrait 1080×1350 |
| Threads | Post 1080×1350 |
| Pinterest | Pin 1000×1500 |
| Snapchat | Story 1080×1920 |
| WhatsApp | Status 1080×1920 |
| YouTube | Community post 1080×1080 |

Story, reel and video-cover sizes have safe areas (shown dashed on the canvas) that keep text clear of each app's interface.

**Celebrations & holidays** (53 templates). They are type-led and on-brand: a typographic greeting, the record-line motif and brand colours, with no illustration. In the gallery they can be filtered by group.

| Group | Templates |
|---|---|
| Monthly & New Year | Happy new month, New Year's Eve, Happy New Year, Happy weekend |
| Global days | Valentine's Day, International Women's Day, Mother's Day, Father's Day, Workers' Day, Earth Day, World Creativity and Innovation Day, International Day of Friendship, World Teachers' Day, Halloween, Season's greetings |
| Religious & cultural | Ramadan Kareem, Eid al-Fitr, Eid al-Adha, Good Friday, Easter, Holi, Diwali, Rosh Hashanah, Hanukkah, Lunar New Year, Christmas Eve, Merry Christmas, Boxing Day, Kwanzaa |
| Nigeria | Independence Day, Democracy Day, Children's Day, Happy Sallah, Armed Forces Remembrance Day |
| United States | Independence Day, Juneteenth, Martin Luther King Jr. Day, Presidents' Day, Memorial Day, Labor Day, Veterans Day, Thanksgiving, Black History Month |
| United Kingdom | Bank holiday weekend, St George's Day, St Andrew's Day, St David's Day, St Patrick's Day, Bonfire Night, Remembrance Sunday, Black History Month |
| Generic | National day, Anniversary or milestone |

- **Dates:** "Happy new month" and "Happy New Year" start with the coming month and year. You can change them with the Month and Year selects in the Design panel.
- **Remembrance days** (Good Friday, Memorial Day, Veterans Day, Remembrance Sunday, Armed Forces Remembrance Day) use a quiet layout and never say "Happy".
- **Copy follows the brand voice:** no emoji and no exclamation marks. Dates that move each year, and facts you must supply, are in `[brackets]`.

## Responsive behaviour

- Breakpoints are CSS only (xs < 640, sm ≥ 640, md ≥ 960, lg ≥ 1280), so there is no layout flash on load.
- Studio header: scrollable nav with edge fades; a menu on phones.
- Playbook / Design system: sticky numbered side nav ≥ 960px, sticky chapter pill bar below.
- Multi-column rows stack under 640px; the contrast table and the button state matrix become cards.
- Editors: three panels on desktop; under 960px the canvas is full width and the panels become resizable bottom sheets (drag handle, snap points) over a tab bar, with safe-area insets.
- Touch editing: pointer capture for drag/resize, 44px handle hit areas, tap a selected text element to edit it, two-finger pinch zoom, long-press grips to reorder pages.

The Playwright responsive suite loads every route at 320–1920px in light and dark and fails on any horizontal page overflow or console error.

## Differences from the original

These are fixes; everything else matches the original behaviour.

- The editorial "Website article hero" format had the same id as the web "Website hero" (`web-hero`), so one overwrote the other. It is now `article-hero` (1600 × 900).
- Re-flow (size or scheme change) now keeps rotation, padding, line thickness and image overlay overrides.
- Exports no longer need a network connection (libraries bundled, fonts embedded from `public/fonts/`). Exported HTML embeds the fonts.
- Storage moved from one 5 MB localStorage key to IndexedDB; existing designs and documents are migrated on first open.
- Page reordering works on touch (the original used HTML5 drag-and-drop only).
- Snapping shows guides and can be toggled; the platform safe area can be hidden. Shift-drag a corner handle keeps the aspect ratio.
- Scrolling the canvas no longer clears the selection.

## Known behaviour

- PDF download is rasterised; use Print → Save as PDF for selectable text.
- SVG export wraps HTML in `foreignObject`: it opens in browsers, but most design tools cannot edit its text.
- PPTX and DOCX use Geist; install it for an exact match in Office.
- Under heavy parallel automated load, React occasionally reports a recoverable hydration error (#418) and client-renders the page. Output is identical and the theme is re-applied, so there is no visible effect. It could not be reproduced with a single browser session.
