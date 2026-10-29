/* Hali Brand Studio — single source of brand data for the design system, playbook, voice page and asset library.
   Values mirror the design-system tokens (src/styles/tokens/*.css). If a token changes there, change it here. */

export interface BrandColor { name: string; token: string; hex: string; dark: string; role: string; usage: string; group: string }
export interface Alias { token: string; ref: string; use: string }
export interface RecordState { id: string; name: string; line: string; color: string; meaning: string }
export interface VoiceSection { id: string; title: string; status: 'verified' | 'confirm'; body: string }

export const VERSION = '1.4.0';
const C = (name: string, token: string, hex: string, dark: string, role: string, usage: string, group: string): BrandColor => ({ name, token, hex, dark, role, usage, group });
export const COLORS = [
  C('Paper', '--n-25', '#FBFAF7', '#161514', 'Page background', 'Default page and artwork background. Pair with Ink text.', 'Neutrals'),
  C('White', '--n-0', '#FFFFFF', '#1F1D1B', 'Card surface', 'Cards, inputs and dialogs on Paper. Never as a page background on brand artwork.', 'Neutrals'),
  C('Sand', '--n-50', '#F5F3EE', '#24221F', 'Subtle surface', 'Hover rows, subtle panels, draft-state backgrounds.', 'Neutrals'),
  C('Linen', '--n-100', '#ECE9E2', '#2D2A27', 'Sunken surface / selected', 'Selected rows, sunken wells, pressed ghost buttons.', 'Neutrals'),
  C('Stone', '--n-200', '#DDD9D0', '#3A3734', 'Default border', '1px card and divider borders; image hatch on Paper.', 'Neutrals'),
  C('Pebble', '--n-300', '#C6C1B6', '#4D4945', 'Strong border / input border', 'Input outlines, closed-state lines.', 'Neutrals'),
  C('Ash', '--n-400', '#9C968A', '#6E6963', 'Disabled text, dashed draft line', 'Disabled labels only. Not for body text (fails AA on Paper).', 'Neutrals'),
  C('Slate', '--n-500', '#736D65', '#9F998F', 'Tertiary text, secondary icons', 'Metadata, timestamps, icons. Minimum for small text on Paper.', 'Neutrals'),
  C('Graphite', '--n-600', '#5C5751', '#B8B2A9', 'Secondary text', 'Supporting copy, descriptions, muted artwork text.', 'Neutrals'),
  C('Charcoal', '--n-700', '#44403B', '#D2CDC4', 'Primary hover, focus border', 'Hover state of primary buttons.', 'Neutrals'),
  C('Soot', '--n-800', '#2C2926', '#E7E3DB', 'Primary icons', 'Icons that carry meaning; dark artwork surfaces.', 'Neutrals'),
  C('Ink', '--n-900', '#1C1A18', '#F5F3EE', 'Primary text, primary action', 'Body and headline text, primary buttons, dark artwork backgrounds.', 'Neutrals'),
  C('Deep Sea 50', '--sea-50', '#EDF5F4', '#132A2A', 'Agreed background', 'Background of agreed / recorded states.', 'Brand · Deep Sea'),
  C('Deep Sea 100', '--sea-100', '#D3E6E3', '#1B3B3B', 'Tint', 'Muted text on Deep Sea artwork; light tint fills.', 'Brand · Deep Sea'),
  C('Deep Sea 300', '--sea-300', '#86B9B3', '#3E7A74', 'Accent on dark', 'Brand accent on Ink or Deep Sea backgrounds; lines and rules only.', 'Brand · Deep Sea'),
  C('Deep Sea 500', '--sea-500', '#367570', '#5FA9A1', 'Mid tone', 'Borders on Deep Sea surfaces.', 'Brand · Deep Sea'),
  C('Deep Sea', '--sea-600', '#285B57', '#6FBDB4', 'Brand accent · commit', 'The brand mark, commit actions and agreed states only. Never decoration.', 'Brand · Deep Sea'),
  C('Deep Sea 700', '--sea-700', '#1E4744', '#A9D8D2', 'Commit hover, agreed text', 'Text on agreed backgrounds; commit button hover.', 'Brand · Deep Sea'),
  C('Deep Sea 900', '--sea-900', '#10292A', '#D7EEEB', 'Commit pressed', 'Pressed commit buttons; deepest brand surface.', 'Brand · Deep Sea'),
  C('Blue 50', '--blue-50', '#EEF3FB', '#16233A', 'Info / proposed background', 'Proposed-state and info alert backgrounds.', 'Semantic · Information & proposed'),
  C('Blue 500', '--blue-500', '#3462B8', '#7AA3EC', 'Proposed line, focus ring', 'Dashed proposed lines, focus rings, info icons.', 'Semantic · Information & proposed'),
  C('Blue 700', '--blue-700', '#1F3E78', '#BCD0F6', 'Info text', 'Text on info / proposed backgrounds.', 'Semantic · Information & proposed'),
  C('Amber 50', '--amber-50', '#FDF5E4', '#2C2210', 'Attention background', 'Someone owes a decision: awaiting-state backgrounds, warnings.', 'Semantic · Warning & awaiting'),
  C('Amber 500', '--amber-500', '#C98A12', '#E2AA45', 'Awaiting line, attention icon', 'Lines and icons only — fails AA as text on Paper.', 'Semantic · Warning & awaiting'),
  C('Amber 700', '--amber-700', '#7A520A', '#F2D08E', 'Attention text', 'Text on attention backgrounds.', 'Semantic · Warning & awaiting'),
  C('Red 50', '--red-50', '#FCEEEC', '#341A16', 'Error background', 'Failed operations and disputed records only.', 'Semantic · Error & problem'),
  C('Red 500', '--red-500', '#C2412D', '#F07D69', 'Problem line, error icon', 'Error icons and problem lines.', 'Semantic · Error & problem'),
  C('Red 600', '--red-600', '#A33424', '#C2412D', 'Danger action', 'Destructive buttons.', 'Semantic · Error & problem'),
  C('Red 700', '--red-700', '#812819', '#F6B4A7', 'Error text', 'Text on error backgrounds.', 'Semantic · Error & problem'),
  C('Green 50', '--green-50', '#EDF6EE', '#15281A', 'Success background', 'Operation succeeded (saved, sent, exported). Not for agreed commercial states — use Deep Sea.', 'Semantic · Success'),
  C('Green 500', '--green-500', '#3A8A4A', '#66BC78', 'Success icon', 'Success icons.', 'Semantic · Success'),
  C('Green 700', '--green-700', '#235832', '#A8DBB1', 'Success text', 'Text on success backgrounds.', 'Semantic · Success')
];
const A = (token: string, ref: string, use: string): Alias => ({ token, ref, use });
export const ALIASES = [
  A('--surface-page', '--n-25', 'Page background'), A('--surface-card', '--n-0', 'Cards, inputs, panels'), A('--surface-subtle', '--n-50', 'Subtle panels'), A('--surface-sunken', '--n-100', 'Wells, canvas background'),
  A('--surface-inverse', '--n-900', 'Inverse surfaces'), A('--text-primary', '--n-900', 'Body and headings'), A('--text-secondary', '--n-600', 'Supporting text'), A('--text-tertiary', '--n-500', 'Metadata'),
  A('--text-link', '--sea-600', 'Links'), A('--border-default', '--n-200', 'Card borders, dividers'), A('--border-strong', '--n-300', 'Emphasised borders'), A('--action-primary-bg', '--n-900', 'Primary button'),
  A('--action-commit-bg', '--sea-600', 'Commit button (agree, approve)'), A('--action-danger-bg', '--red-600', 'Destructive button'), A('--focus-color', '--blue-500', 'Focus ring')
];
export const STATES: RecordState[] = [
  { id: 'suggested', name: 'Suggested', line: '1.5px dotted', color: '#736D65', meaning: 'Suggested by Hali — not yet reviewed by a person.' },
  { id: 'draft', name: 'Draft', line: '1.5px dashed', color: '#9C968A', meaning: 'Being prepared. Not yet agreed.' },
  { id: 'proposed', name: 'Proposed', line: '1.5px dashed', color: '#3462B8', meaning: 'Sent to the client. Not yet agreed.' },
  { id: 'awaiting-client', name: 'Awaiting', line: '1.5px solid', color: '#C98A12', meaning: 'Someone owes a decision.' },
  { id: 'agreed', name: 'Agreed', line: '1.5px solid', color: '#285B57', meaning: 'Recorded and agreed.' },
  { id: 'declined', name: 'Closed', line: '1.5px solid', color: '#C6C1B6', meaning: 'Closed or declined — grey, not red.' }
];
export const TYPE_SCALE: [string, number][] = [['--text-xs', 12], ['--text-sm', 13], ['--text-md', 14], ['--text-base', 16], ['--text-lg', 18], ['--text-xl', 20], ['--text-2xl', 24], ['--text-3xl', 30], ['--text-4xl', 38], ['--text-5xl', 48], ['--text-6xl', 60]];
export const TYPE_ROLES: [string, string, string, string][] = [
  ['--type-display', '600 48px/1.08 Geist', '-0.03em', 'Marketing headlines, artwork titles'], ['--type-headline', '600 30px/1.15 Geist', '-0.02em', 'Page headlines'],
  ['--type-headline-sm', '600 24px/1.2 Geist', '-0.02em', 'Section headlines'], ['--type-page-title', '600 24px/1.3 Geist', '0', 'App page titles'],
  ['--type-section', '600 18px/1.3 Geist', '0', 'Section titles'], ['--type-subsection', '600 14px/1.3 Geist', '0', 'Sub-sections, card titles'],
  ['--type-body', '400 14px/1.5 Geist', '0', 'Agency app body'], ['--type-body-client', '400 16px/1.6 Geist', '0', 'Client and public body'],
  ['--type-document', '400 17px/1.6 Geist', '0', 'Long-form documents'], ['--type-supporting', '400 13px/1.5 Geist', '0', 'Help text'],
  ['--type-label', '500 13px/1.3 Geist', '0', 'Form labels'], ['--type-button', '500 14px/1 Geist', '0', 'Buttons'],
  ['--type-overline', '500 12px/1.2 Geist Mono', '0.04em', 'Overlines (uppercase)'], ['--type-money', '500 14px/1.3 Geist', '0', 'Money in tables (tabular)'],
  ['--type-money-lg', '600 30px/1.1 Geist', '0', 'Headline money'], ['--type-reference', '400 12px/1.3 Geist Mono', '0', 'References, versions, timestamps']
];
export const SPACING: [string, number][] = [['--space-0-5', 2], ['--space-1', 4], ['--space-2', 8], ['--space-3', 12], ['--space-4', 16], ['--space-5', 20], ['--space-6', 24], ['--space-8', 32], ['--space-10', 40], ['--space-12', 48], ['--space-16', 64], ['--space-20', 80]];
export const SIZES: [string, string][] = [['--size-control-sm', '32px'], ['--size-control-md', '40px'], ['--size-control-lg', '48px'], ['--size-touch-min', '44px'], ['--size-input-height', '44px'], ['--size-icon-sm', '16px'], ['--size-icon-md', '18px'], ['--size-icon-lg', '22px']];
export const LAYOUT: [string, string, string][] = [['--layout-reading', '680px', 'Reading column'], ['--layout-form', '560px', 'Forms'], ['--layout-narrow', '880px', 'Client / public column'], ['--layout-page', '1200px', 'Page container'], ['--layout-wide', '1440px', 'Wide container'], ['--layout-sidebar', '248px', 'Agency app sidebar'], ['--layout-drawer', '480px', 'Drawer']];
export const BREAKPOINTS: [string, string, string, string, string][] = [['xs', '< 640px', '4 columns', '16px gutter', 'Single column, stacked cards, bottom-sheet dialogs, sticky primary actions'], ['sm', '≥ 640px', '8 columns', '24px gutter', 'Two-column forms, side-by-side cards'], ['md', '≥ 960px', '12 columns', '32px gutter', 'Sidebar appears, split panes'], ['lg', '≥ 1280px', '12 columns', '32px gutter', 'Full desktop'], ['xl', '≥ 1600px', '12 columns', '32px gutter', 'Wide container']];
export const RADII: [string, string, string][] = [['--radius-xs', '3px', 'Tiny chips'], ['--radius-sm', '5px', 'Thumbnails'], ['--radius-control', '6px', 'Buttons, inputs'], ['--radius-surface', '10px', 'Cards, panels'], ['--radius-lg', '14px', 'Dialogs'], ['--radius-pill', '999px', 'Badges, choice chips only']];
export const SHADOWS: [string, string, string][] = [['--shadow-1', '0 1px 2px rgba(28,26,24,.06)', 'Lifted controls (rare)'], ['--shadow-2', '0 1px 2px rgba(28,26,24,.05), 0 4px 12px rgba(28,26,24,.06)', 'Floating previews'], ['--shadow-overlay', '0 2px 6px rgba(28,26,24,.08), 0 16px 40px rgba(28,26,24,.16)', 'Dialogs, menus, popovers']];
export const MOTION: [string, string, string][] = [['--duration-fast', '120ms', 'Hover, colour changes'], ['--duration-base', '200ms', 'Opening menus, dialogs'], ['--duration-slow', '320ms', 'Large panels'], ['--ease-standard', 'cubic-bezier(.2,0,0,1)', 'Entering'], ['--ease-exit', 'cubic-bezier(.4,0,1,1)', 'Leaving']];
export const ZINDEX: [string, string][] = [['--z-sticky', '10'], ['--z-dropdown', '30'], ['--z-drawer', '40'], ['--z-dialog', '50'], ['--z-toast', '60'], ['--z-tooltip', '70']];

/* Brand voice & knowledge. status: 'verified' = stated in the supplied Hali source documents; 'confirm' = needs confirmation by the brand owner. */
const V = (id: string, title: string, status: VoiceSection['status'], body: string): VoiceSection => ({ id, title, status, body });
export const VOICE = [
  V('description', 'Brand description', 'verified', 'Hali is a commercial operating platform for independent branding and design agencies. It keeps agreed scope, client requests, change decisions, approvals, delivery and invoicing connected in one commercial record, with an agency-branded public page and enquiry form as the front door.\n\nIn plain language: Hali helps small agencies keep track of what the client bought, what the client is now asking for, and whether that request costs extra — and makes sure agreed extra work is delivered and invoiced. Clients get a clear, polite way to give feedback and approve changes.'),
  V('positioning', 'Positioning and core promise', 'verified', 'Core promise: "Help agencies protect their margins and give clients a clearer, more professional project experience."\nGoverning principle: help agencies make better commercial decisions without making client relationships feel transactional or adversarial.\nPositioning: generic project tools track tasks, invoicing tools track money, CRMs track leads and revision counters count rounds. Hali keeps these connected through one commercial record.'),
  V('mission', 'Mission, vision and purpose', 'confirm', 'No formal mission or vision statement exists in the source material. Do not write one into content. Use the core promise above until the brand owner approves wording.'),
  V('audience', 'Target audience', 'verified', 'Primary customer: independent branding and design agencies of roughly 3–20 people including regular contractors, working on fixed-fee projects with defined deliverables and revision limits, running several projects at once. The agency pays (subscription per agency account).\nSegments (roles, not account types — in a 3-person studio one person holds most of them):\n- Agency owner / commercial decision-maker: protects margin, authorises change orders.\n- Agency team member (account lead, designer, contractor): needs to know what to deliver, which round they are on, and whether extra work is approved.\n- Client contact: wants good work, on time, with no surprise costs. The creative contact and the budget holder may be different people.\n- Prospective client: deciding whether an agency fits; may not know exact deliverables or budget.'),
  V('problems', 'Customer problems and desired outcomes', 'verified', 'Problem: the link between agreement → request → decision → delivery → invoice breaks, because requests arrive through meetings, email, messaging apps and annotated files and nobody reconciles them against the original scope. The agency then absorbs the work, pushes back awkwardly, or tries to charge after the fact.\nWhere it breaks: reconstructing what was agreed; deciding whether a request is included; getting a timely client decision; remembering to invoice approved extras.\nOutcomes: no approved extra goes uninvoiced; decisions reached faster; fewer awkward conversations; clients can explain what they agreed and what they approved without feeling accused.\nNote: these come from problem framing in the source documents, not from validated user research.'),
  V('value', 'Value proposition and differentiators', 'verified', 'Hali can answer five questions at any time:\n1. What exactly did the client agree to buy?\n2. What has changed since?\n3. Which requests are included and which may need a change order?\n4. What happens next, and who is responsible?\n5. What is the financial consequence of the current state?\nEvery piece of content should connect to at least one of these questions.'),
  V('features', 'Products and features (MVP)', 'verified', '- Structured scope record: deliverables, quantities, exclusions, revision limits, milestones, responsibilities, commercial terms; imports are verified by a person before they become authoritative.\n- Client request and revision tracking against specific deliverables.\n- Change-order workflow: flag a potential change → agency reviews → priced change order → client approval, with the original agreement preserved.\n- Approval and dependency tracking: who owes the next decision, by when.\n- Billable-change register: approved extra, agreed price, delivery status, invoiced or not. Integrates with accounting; does not replace it.\n- Owner dashboard: pending change orders, awaiting client, approved-not-invoiced, scope and budget risk.\n- Public agency page and enquiry form, with an enquiry inbox.\nExplicitly not in the product: general task management, full CRM, a design editor, accounting or payment processing, a marketplace, or AI that changes agreements, sends charges or approves work.'),
  V('pricing', 'Pricing, customers and results', 'confirm', 'No pricing, customer names, testimonials, metrics or case-study results have been confirmed. Do not state prices, customer counts, percentages or outcomes. Testimonials in templates are illustrative placeholders and must be replaced with approved quotes.'),
  V('personality', 'Brand personality', 'verified', 'Clear, not legalistic. Professional, not cold. Firm, not aggressive. Transparent, not alarmist. Helpful, not presumptuous.\nVisual concept — "the record": quiet paper-and-ink surfaces where commercial certainty is visible in the line itself. Dotted = suggested by Hali · dashed = not yet agreed · solid = recorded.'),
  V('tone', 'Tone by context', 'verified', '- Product UI: speak to the user as "you". Never "we".\n- To clients: refer to the agency by name ("Studio North has prepared…"). Plain, non-punitive language.\n- Hali suggestions: Hali refers to itself in the third person only for suggestions ("Hali found a possible difference…").\n- Interpretation: hedge ("This request may fall outside the agreed scope").\n- Records: be certain ("Approved and recorded").\n- Errors: say what happened and how to fix it ("Enter a full email address so the agency can reply.").\n- Marketing and social: the same voice — calm, specific, useful. [Confirm: marketing tone has not been separately defined.]'),
  V('style', 'Writing style and vocabulary', 'verified', 'Sentence case everywhere — titles, buttons, navigation, labels. Overlines are mono uppercase.\nAction labels name the exact action: "Authorise and send", "Approve change", "Record invoice", "Create proposal". Never "Continue" or "OK" for consequential actions.\nFixed vocabulary (do not swap synonyms): enquiry · proposal · agreement · scope (vN) · deliverable · revision round · request · change order (clients see "proposed change") · approval · billable work · invoice.\nMoney always has currency and basis: "$1,800 · Proposed", "$6,000 agreed → $7,800 if approved".\nA request is not a charge. Approval ≠ delivered ≠ invoiced ≠ paid.'),
  V('avoid', 'Words, claims and approaches to avoid', 'verified', '- Emoji. Exclamation marks in commercial contexts.\n- "We" in product UI.\n- Punitive phrasing: "You exceeded your revision limit." → "Your two included revision rounds are complete. This request can be handled as an additional change."\n- Adversarial framing: "catch clients", "stop scope creep forever", "Revenue recovered".\n- Synonyms for fixed vocabulary ("ticket", "job", "upsell", "extra fee").\n- Claims that AI decides, approves, charges or changes agreements. AI interprets, compares, flags and drafts; people decide.\n- Unsupported numbers, customer names or results.'),
  V('pillars', 'Messaging pillars and key messages', 'confirm', 'Proposed pillars derived from the source documents — confirm before use:\n1. One commercial record — scope, requests, changes, approvals and invoices stay connected.\n2. Clarity for clients — plain language, one link, no account needed to give feedback.\n3. Decisions, not disputes — price a change before the work starts, calmly.\n4. Nothing slips — approved extras are delivered and invoiced.'),
  V('content', 'Content pillars and editorial principles', 'confirm', 'Proposed content pillars (confirm): scope writing, revision rounds, pricing changes, client communication, agency operations.\nEditorial principles (verified voice rules applied): be specific and practical; label examples as illustrative; prefer one worked example over general advice; respect both agency and client; never shame clients.'),
  V('cta', 'Calls to action', 'verified', 'Name the exact action. Verified product actions: "Create proposal", "Approve change", "Authorise and send", "Record invoice".\n[Confirm: marketing CTAs such as "Start trial" or "Book a demo" depend on an offer that has not been defined.]'),
  V('channels', 'Social, article and newsletter guidelines', 'confirm', 'Proposed (confirm):\n- Social: one idea per post; headline under 12 words; use the record-line motif (dotted / dashed / solid) to show certainty; Deep Sea only for agreed or brand moments.\n- Articles: practical guides for agency owners; title states the problem; subtitle states the outcome; include one illustrative example with money shown with currency and basis.\n- Newsletter: short; one main story; plain-text friendly.\n- No handles, URLs or posting cadence are confirmed.'),
  V('facts', 'Brand facts and constraints', 'verified', '- Name: Hali (lowercase "hali" in the wordmark only).\n- The visual identity is a proposal, not an approved brand. A type designer should do an optical pass on the logo before trademark filing.\n- Fonts: Geist and Geist Mono (SIL Open Font License).\n- Brand accent: Deep Sea #285B57. Warm neutrals Paper #FBFAF7 to Ink #1C1A18.\n- On agency public pages and client portals the agency\'s brand leads; Hali appears only as a small attribution.\n- Canva and other creative tools are optional integrations; Hali is not a design editor.\n[Confirm: website URL, social handles, company legal name, founding date, location, team.]'),
  V('examples', 'Correct and incorrect examples', 'verified', 'Correct: "This request may fall outside the agreed scope. Review it against Scope v2."\nIncorrect: "Scope creep detected!"\nCorrect: "Studio North has prepared a proposed change: $1,800 · Proposed."\nIncorrect: "You owe an extra $1,800."\nCorrect: "Approved and recorded."\nIncorrect: "Great news! It\'s approved 🎉"\nCorrect: "Your two included revision rounds are complete. This request can be handled as an additional change."\nIncorrect: "You exceeded your revision limit."'),
  V('ai', 'AI instructions and quality checks', 'verified', 'When writing for Hali:\n1. Use only the facts above. If a fact is marked "Needs confirmation", leave a [bracketed placeholder] instead of inventing it.\n2. Use the fixed vocabulary exactly.\n3. Sentence case; no emoji; no exclamation marks in commercial contexts.\n4. Hedge interpretations; state records with certainty.\n5. Show money with currency and basis.\n6. Never describe AI as deciding, approving, charging or changing agreements.\n7. Label examples and figures as illustrative.\nQuality check before publishing: Does it answer one of the five questions? Is every claim supported here? Would a client feel respected reading it? Are actions named exactly?')
];

/* ---------- helpers ---------- */
export function hexToRgb(h: string): [number, number, number] {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function rgbToHsl([r, g, b]: [number, number, number]): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (mx + mn) / 2;
  if (mx !== mn) {
    const d = mx - mn;
    s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
    h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
    h *= 60;
  }
  return [Math.round(h), Math.round(s * 100), Math.round(l * 100)];
}

function lum(h: string): number {
  return hexToRgb(h)
    .map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); })
    .reduce((a, v, i) => a + v * [0.2126, 0.7152, 0.0722][i], 0);
}

/** WCAG 2 contrast ratio between two hex colours. */
export function contrast(a: string, b: string): number {
  const x = lum(a), y = lum(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

export function formats(hex: string) {
  const rgb = hexToRgb(hex), hsl = rgbToHsl(rgb);
  return { hex, rgb: 'rgb(' + rgb.join(', ') + ')', hsl: 'hsl(' + hsl[0] + ', ' + hsl[1] + '%, ' + hsl[2] + '%)' };
}

export type Grade = 'AAA' | 'AA' | 'AA large' | 'Fail';
export function grade(r: number): Grade {
  return r >= 7 ? 'AAA' : r >= 4.5 ? 'AA' : r >= 3 ? 'AA large' : 'Fail';
}

export async function copy(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const t = document.createElement('textarea');
    t.value = text;
    t.setAttribute('readonly', '');
    t.style.position = 'fixed';
    t.style.opacity = '0';
    document.body.appendChild(t);
    t.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch { /* unsupported */ }
    t.remove();
    return ok;
  }
}

export function voiceText(sections: VoiceSection[], md: boolean): string {
  const lab = (s: VoiceSection) => (s.status === 'verified' ? 'Verified' : 'Needs confirmation');
  const one = (s: VoiceSection) => (md ? '## ' : '') + s.title + (md ? '\n*' + lab(s) + '*\n\n' : ' (' + lab(s) + ')\n') + s.body;
  return sections.map(one).join('\n\n');
}

export function downloadBlob(blob: Blob, name: string): void {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.appendChild(a);
  a.click();
  // iOS Safari reads the blob after the user confirms the download; revoking too early cancels it.
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 60000);
}

export function download(text: string, name: string, type = 'text/plain'): void {
  downloadBlob(new Blob([text], { type }), name);
}
