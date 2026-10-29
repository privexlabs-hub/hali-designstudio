/* Hali Brand Studio — document library: types, page sizes, page kinds and block constructors.
   A document is { id, type, title, author, size, numberFrom, header, pages:[{ id, kind, name, bg, valign, number, header, blocks:[...] }] }.
   Copy is illustrative; [bracketed] text marks facts the author must supply. */

export type BlockType = 'heading' | 'para' | 'kicker' | 'meta' | 'title' | 'quote' | 'callout' | 'list' | 'image' | 'table' | 'stats' | 'chart' | 'kv' | 'timeline' | 'people' | 'cta' | 'divider' | 'spacer' | 'toc' | 'logo';
export type Align = 'left' | 'center' | 'right' | 'justify';

export interface Block {
  id: string;
  t: BlockType;
  align: Align;
  scale: number;
  color: string;
  text?: string;
  level?: 1 | 2 | 3;
  sub?: string;
  cite?: string;
  style?: string;
  title?: string;
  tone?: 'note' | 'info' | 'attention' | 'success';
  ordered?: boolean;
  src?: string;
  caption?: string;
  h?: number;
  fit?: 'cover' | 'contain';
  unit?: string;
  dash?: 'solid' | 'dashed' | 'dotted';
  variant?: 'lockup' | 'symbol' | 'wordmark' | 'stacked';
  italic?: boolean;
  dropcap?: boolean;
}

export type PageScheme = 'paper' | 'white' | 'ink' | 'sea';
export interface DocPage { id: string; kind: string; name: string; bg: PageScheme; valign: 'top' | 'center' | 'bottom'; number: boolean; header: boolean; blocks: Block[] }
export type PageSpec = Omit<DocPage, 'id' | 'kind'>;
export type SizeId = 'book' | 'a4' | 'letter' | 'slide' | 'web' | 'email';
export type DocType = 'book' | 'report' | 'whitepaper' | 'proposal' | 'casestudy' | 'presentation' | 'article' | 'newsletter' | 'resume';
export type ExportFormat = 'pdf' | 'print' | 'docx' | 'pptx' | 'epub' | 'html' | 'md' | 'txt' | 'png';

export interface Doc {
  id: string; v: 1; type: DocType; title: string; author: string; size: SizeId; numberFrom: number; header: boolean; pages: DocPage[]; updated: number;
}

export interface Size { name: string; w: number; h: number | null; m: [number, number, number, number]; type: 'book' | 'print' | 'slide' | 'web' | 'email' }
export const SIZES: Record<SizeId, Size> = {
  book: { name: '6 × 9 in book', w: 576, h: 864, m: [64, 56, 72, 56], type: 'book' },
  a4: { name: 'A4 portrait', w: 794, h: 1123, m: [80, 72, 88, 72], type: 'print' },
  letter: { name: 'US Letter portrait', w: 816, h: 1056, m: [80, 76, 88, 76], type: 'print' },
  slide: { name: 'Slide 16:9 · 1920 × 1080', w: 1920, h: 1080, m: [112, 128, 112, 128], type: 'slide' },
  web: { name: 'Web article · 880 wide', w: 880, h: null, m: [56, 64, 56, 64], type: 'web' },
  email: { name: 'Email · 600 wide', w: 600, h: null, m: [32, 36, 32, 36], type: 'email' },
};
// type scale per size class (px). Print body 16px = 12pt minimum.
export interface Scale { title: number; h1: number; h2: number; h3: number; body: number; small: number; lh: number; gap: number }
export const SCALE: Record<Size['type'], Scale> = {
  book: { title: 40, h1: 30, h2: 21, h3: 17, body: 16, small: 12, lh: 1.62, gap: 14 },
  print: { title: 52, h1: 34, h2: 24, h3: 19, body: 16, small: 12, lh: 1.6, gap: 16 },
  slide: { title: 112, h1: 80, h2: 56, h3: 40, body: 32, small: 24, lh: 1.35, gap: 28 },
  web: { title: 56, h1: 40, h2: 28, h3: 22, body: 18, small: 14, lh: 1.65, gap: 18 },
  email: { title: 36, h1: 28, h2: 22, h3: 18, body: 16, small: 13, lh: 1.55, gap: 14 },
};
export interface DocScheme { name: string; bg: string; fg: string; muted: string; accent: string; line: string; surface: string; tone: 'default' | 'reverse' }
export const SCHEMES: Record<PageScheme, DocScheme> = {
  paper: { name: 'Paper', bg: '#FBFAF7', fg: '#1C1A18', muted: '#5C5751', accent: '#285B57', line: '#DDD9D0', surface: '#FFFFFF', tone: 'default' },
  white: { name: 'White', bg: '#FFFFFF', fg: '#1C1A18', muted: '#5C5751', accent: '#285B57', line: '#DDD9D0', surface: '#F5F3EE', tone: 'default' },
  ink: { name: 'Ink', bg: '#1C1A18', fg: '#FBFAF7', muted: '#C6C1B6', accent: '#86B9B3', line: '#44403B', surface: '#2C2926', tone: 'reverse' },
  sea: { name: 'Deep Sea', bg: '#285B57', fg: '#FFFFFF', muted: '#D3E6E3', accent: '#D3E6E3', line: '#367570', surface: '#1E4744', tone: 'reverse' },
};
let n = 0;
export const uid = () => 'b' + Date.now().toString(36) + (n++).toString(36);
type O = Partial<Block>;
const B = (t: BlockType, o?: O): Block => Object.assign({ id: uid(), t, align: 'left' as Align, scale: 1, color: '' }, o);
const H = (level: 1 | 2 | 3, text: string, o?: O) => B('heading', Object.assign({ level, text }, o));
const P = (text: string, o?: O) => B('para', Object.assign({ text }, o));
const K = (text: string, o?: O) => B('kicker', Object.assign({ text }, o));
const M = (text: string, o?: O) => B('meta', Object.assign({ text }, o));
const TI = (text: string, sub?: string, o?: O) => B('title', Object.assign({ text, sub: sub || '' }, o));
const Q = (text: string, cite?: string, o?: O) => B('quote', Object.assign({ text, cite: cite || '', style: 'pull' }, o));
const CO = (title: string, text: string, tone?: Block['tone']) => B('callout', { title, text, tone: tone || 'note' });
const LI = (items: string[], ordered?: boolean) => B('list', { text: items.join('\n'), ordered: !!ordered });
const IM = (caption?: string, h?: number, o?: O) => B('image', Object.assign({ src: '', caption: caption || '', h: h || 280, fit: 'cover' as const }, o));
const TB = (rows: string[], caption?: string) => B('table', { text: rows.join('\n'), caption: caption || '' });
const ST = (rows: string[]) => B('stats', { text: rows.join('\n') });
const CH = (rows: string[], caption?: string, unit?: string) => B('chart', { text: rows.join('\n'), caption: caption || '', unit: unit || '' });
const KV = (rows: string[]) => B('kv', { text: rows.join('\n') });
const TL = (rows: string[]) => B('timeline', { text: rows.join('\n') });
const PE = (rows: string[]) => B('people', { text: rows.join('\n') });
const CTA = (text: string, sub?: string) => B('cta', { text, sub: sub || '' });
const DV = (dash?: Block['dash']) => B('divider', { dash: dash || 'solid' });
const SP = (h?: number) => B('spacer', { h: h || 40 });
const TOC = () => B('toc', { text: 'Contents' });
const LG = (variant?: Block['variant']) => B('logo', { variant: variant || 'lockup' });
/** [label, icon, factory] */
export const BLOCKS: Record<BlockType, [string, string, () => Block]> = {
  heading: ['Heading', 'heading', () => H(2, 'New heading')], para: ['Paragraph', 'pilcrow', () => P('New paragraph.')], kicker: ['Overline', 'tag', () => K('Section label')],
  meta: ['Metadata / byline', 'at-sign', () => M('[Author name] · [Date]')], title: ['Display title', 'type', () => TI('Display title', 'Subtitle')], quote: ['Pull quote', 'quote', () => Q('A short, memorable line.', '[Attribution]')],
  callout: ['Callout / note', 'info', () => CO('Note', 'Supporting detail the reader should not miss.')], list: ['List', 'list', () => LI(['First point', 'Second point', 'Third point'])],
  image: ['Image / figure', 'image', () => IM('Figure caption')], table: ['Table', 'table', () => TB(['Column A | Column B | Column C', 'Value | Value | Value'], 'Table caption')],
  stats: ['Statistics', 'hash', () => ST(['[Value] | [Label]', '[Value] | [Label]'])], chart: ['Bar chart', 'chart-bar', () => CH(['Agreed: 6000', 'Proposed: 1800'], 'Illustrative figures', '$')],
  kv: ['Key details', 'list-tree', () => KV(['Label | Value'])], timeline: ['Timeline', 'milestone', () => TL(['[When] | [What happens]'])], people: ['People / team', 'users', () => PE(['[Name] | [Role] | [One line]'])],
  cta: ['Call to action', 'mouse-pointer-click', () => CTA('Create proposal', '[Where to go next]')], divider: ['Record line', 'minus', () => DV('solid')], spacer: ['Spacer', 'move-vertical', () => SP(40)],
  toc: ['Table of contents', 'list-ordered', () => TOC()], logo: ['Logo', 'hexagon', () => LG('lockup')],
};
type PageOpts = Partial<PageSpec>;
const pg = (name: string, blocks: Block[], o?: PageOpts): PageSpec => Object.assign({ name, blocks, bg: 'paper' as PageScheme, valign: 'top' as const, number: true, header: true }, o);
const cover = (o?: PageOpts): PageOpts => Object.assign({ number: false, header: false }, o);
const ILL = 'Illustrative figures — replace with your own data.';
type Kinds = Record<string, () => PageSpec>;

/* ---------- page kinds per document type ---------- */
const BOOK: Kinds = {
  cover: () => pg('Cover', [LG('lockup'), SP(160), K('A practical guide'), TI('Scope that holds', 'Keeping agreements, requests and change decisions connected — without souring the relationship'), SP(40), M('[Author name]')], cover({ bg: 'sea', valign: 'top' })),
  'title-page': () => pg('Title page', [TI('Scope that holds', 'A practical guide for independent agencies', { align: 'center' }), SP(60), M('[Author name]', { align: 'center' }), SP(200), M('[Publisher] · [City]', { align: 'center' })], cover({ valign: 'center' })),
  copyright: () => pg('Copyright', [SP(380), M('Copyright © [Year] [Author name]. All rights reserved.'), M('No part of this book may be reproduced without permission, except for brief quotations in reviews.'), M('ISBN [000-0-00-000000-0]'), M('First edition · [Month Year]'), M('Examples and figures in this book are illustrative.')], cover({ valign: 'bottom' })),
  dedication: () => pg('Dedication', [P('[For the people this book is dedicated to.]', { align: 'center', italic: true })], cover({ valign: 'center' })),
  epigraph: () => pg('Epigraph', [Q('A request is not a charge. Approval is not delivery. Delivery is not an invoice.', 'Hali principle', { align: 'center' })], cover({ valign: 'center' })),
  toc: () => pg('Contents', [H(1, 'Contents'), TOC()], { number: false, header: false }),
  foreword: () => pg('Foreword', [K('Foreword'), H(1, 'Foreword'), P('[A short foreword by a guest author, explaining why this subject matters to them and to the reader.]'), P('[Second paragraph of the foreword.]'), M('— [Foreword author], [Role]')]),
  preface: () => pg('Preface', [K('Preface'), H(1, 'Preface'), P('This book is for the owners and account leads of small branding and design studios who want to keep clients happy and still be paid for the work they do.'), P('[Why the author wrote it, and how the book was put together.]')]),
  introduction: () => pg('Introduction', [K('Introduction'), H(1, 'Why scope slips'), P('Most extra work does not arrive as a formal request. It arrives in a meeting, a late email, a comment on a file. Each one is small and reasonable. Together they become a second project nobody priced.'), P('The fix is not to say no more often. It is to keep one record that connects what was agreed, what was asked for, and what was decided — so that every conversation about extra work starts from the same facts.'), CO('How to use this book', 'Read the chapters in order the first time. Afterwards, use the exercises and checklists at the end of each chapter on live projects.')]),
  part: () => pg('Part divider', [K('Part one'), TI('The agreement', 'What the client bought, written so it can be checked')], cover({ bg: 'ink', valign: 'center' })),
  chapter: () => pg('Chapter opener', [K('Chapter 1'), H(1, 'Write scope as items, not paragraphs'), DV('solid'), P('A paragraph describing the work is easy to sign and hard to check. A list of deliverables, each with quantities, exclusions and revision rounds, can be checked line by line when a request arrives.', { dropcap: true }), P('In this chapter you will rewrite one of your own proposals as scope items and test it against three requests from a past project.')], { header: false }),
  body: () => pg('Body section', [H(2, 'Deliverables, quantities and exclusions'), P('Start with the deliverable a client would recognise: "Primary logo", "Brand guidelines (12 pages)". Then state the quantity and the format the client receives.'), P('Exclusions matter as much as inclusions. If the logo excludes animation, say so in the same line. A client who reads "Excludes motion versions" will not be surprised later.'), H(3, 'Revision rounds'), P('Give each item its own revision rounds. A round is counted when the agency closes feedback and sends the next version — not per comment.')]),
  subsection: () => pg('Subsection', [H(3, 'When a request touches two items'), P('[Explain how to handle a request that affects more than one scope item.]'), LI(['Find each scope item the request touches', 'Check the rounds used on each', 'Propose one change that names both items'], true)]),
  'pull-quote': () => pg('Pull quote', [SP(120), Q('Price the change before the work starts. It is a calmer conversation than an invoice afterwards.', '[Attribution]')], { valign: 'center' }),
  figure: () => pg('Figure', [H(3, 'Figure 1.1 — One record, five questions'), IM('Figure 1.1 · Replace with a diagram or the agency\'s own work.', 360), P('The five questions: what was bought, what changed, what is included, what happens next, and what it costs.')]),
  'table-page': () => pg('Table', [H(3, 'Table 1.1 — Classifying a request'), TB(['Request type | Counts as a round? | Needs a change order?', 'Clarification | No | No', 'Agency correction | No | No', 'Covered revision | Yes | No', 'New deliverable | — | Yes', 'Change to a deliverable | Depends | Often'], 'Illustrative classification.'), P('Use the table as a starting point. The agency decides the classification; a suggestion is never a decision.')]),
  'case-study': () => pg('Case study', [K('Case study'), H(2, '[Studio name]: a packaging request'), CO('Context', '[Who the client was, what was agreed, and how the request arrived.]'), P('[What the studio did, step by step.]'), ST(['$6,000 | Agreed', '$7,800 | If approved']), M(ILL)]),
  exercise: () => pg('Exercise', [K('Exercise'), H(2, 'Rewrite one proposal'), LI(['Choose a proposal you sent in the last six months', 'List every deliverable as its own line', 'Add a quantity, a format and one exclusion to each', 'Assign revision rounds per item'], true), CO('Time needed', 'About 45 minutes.', 'info')]),
  reflection: () => pg('Reflection', [K('Reflection'), H(2, 'Questions to consider'), LI(['Which request last month felt awkward to discuss? Why?', 'Could the client have explained what they agreed to?', 'What would you change in your next proposal?'])]),
  takeaways: () => pg('Key takeaways', [K('Key takeaways'), H(2, 'In this chapter'), LI(['Scope written as items can be checked', 'Exclusions belong next to the item they limit', 'Rounds belong to items, not to the whole project']), DV('dashed')]),
  summary: () => pg('Chapter summary', [K('Chapter summary'), H(2, 'Summary'), P('[A short summary of the chapter in two or three sentences.]'), P('Next chapter: [title of the next chapter].')]),
  conclusion: () => pg('Conclusion', [K('Conclusion'), H(1, 'Decisions, not disputes'), P('[Closing argument: what the reader should now do differently on their next project.]'), P('[Final paragraph.]')]),
  appendix: () => pg('Appendix', [K('Appendix A'), H(1, 'Scope item checklist'), LI(['Deliverable named as the client would say it', 'Quantity and format', 'Exclusions', 'Revision rounds', 'Dependencies and responsibilities', 'Price and basis'])]),
  references: () => pg('References', [H(1, 'References and bibliography'), LI(['[Author, A. (Year). Title. Publisher.]', '[Author, B. (Year). Article title. Journal, volume(issue), pages.]', '[Organisation. (Year). Report title. URL]'], true)]),
  acknowledgements: () => pg('Acknowledgements', [H(1, 'Acknowledgements'), P('[Thank the people who helped make this book.]')]),
  author: () => pg('About the author', [H(1, 'About the author'), IM('Author portrait', 220), P('[Author name] is [role] at [studio]. [Two sentences of confirmed biography.]')]),
  'final-cta': () => pg('Final call to action', [TI('Put it into practice', 'Use the scope checklist on your next proposal.'), SP(24), CTA('Create proposal', '[Where readers can find the templates]')], cover({ bg: 'sea', valign: 'center' })),
  'back-cover': () => pg('Back cover', [P('“[Short endorsement from a named, approved reviewer.]”', { italic: true }), M('— [Reviewer], [Role]'), SP(40), P('[Two-sentence description of the book for the back cover.]'), SP(120), LG('symbol'), M('[ISBN] · [Price]')], cover({ bg: 'ink', valign: 'bottom' })),
  continued: () => pg('Continued', [])
};
const BOOK_START = ['cover', 'title-page', 'copyright', 'dedication', 'epigraph', 'toc', 'foreword', 'preface', 'introduction', 'part', 'chapter', 'body', 'subsection', 'pull-quote', 'figure', 'table-page', 'case-study', 'exercise', 'reflection', 'takeaways', 'summary', 'chapter', 'body', 'conclusion', 'appendix', 'references', 'acknowledgements', 'author', 'final-cta', 'back-cover'];

const REPORT: Kinds = {
  cover: () => pg('Cover', [LG('lockup'), SP(220), K('Report · [Year]'), TI('[Report title]', '[One-line description of what the report covers]'), SP(60), M('[Organisation] · [Month Year]')], cover({ bg: 'paper' })),
  toc: BOOK.toc,
  'executive-summary': () => pg('Executive summary', [K('Executive summary'), H(1, 'Executive summary'), P('[Two or three sentences stating the most important finding.]'), ST(['[Value] | [Key finding one]', '[Value] | [Key finding two]', '[Value] | [Key finding three]']), LI(['[Recommendation one]', '[Recommendation two]', '[Recommendation three]']), M(ILL)]),
  introduction: () => pg('Introduction', [K('01'), H(1, 'Introduction'), P('[Why this report exists, who it is for, and the question it answers.]'), H(3, 'Scope of this report'), P('[What is and is not covered.]')]),
  methodology: () => pg('Research and methodology', [K('02'), H(1, 'Research and methodology'), KV(['Sample | [n respondents / organisations]', 'Period | [Dates]', 'Method | [Survey, interviews, data analysis]', 'Limitations | [Known limitations]']), P('[How the data was collected and analysed.]')]),
  analysis: () => pg('Analysis', [K('03'), H(1, 'Analysis'), P('[Interpretation of the data. Hedge interpretations; state recorded facts with certainty.]'), H(3, '[Theme one]'), P('[Discussion.]'), H(3, '[Theme two]'), P('[Discussion.]')]),
  findings: () => pg('Findings', [K('04'), H(1, 'Key findings'), LI(['[Finding one, with the figure that supports it]', '[Finding two]', '[Finding three]'], true), CO('What this means', '[The implication for the reader.]', 'info')]),
  'data-visualisation': () => pg('Data visualisation', [K('05'), H(2, '[Chart title]'), CH(['[Category A]: 64', '[Category B]: 41', '[Category C]: 28', '[Category D]: 12'], 'Figure 1 · ' + ILL, '%'), TB(['Category | Value | Change', '[A] | [64%] | [+4]', '[B] | [41%] | [−2]'], 'Table 1 · ' + ILL)]),
  recommendations: () => pg('Recommendations', [K('06'), H(1, 'Recommendations'), TL(['Now | [Recommendation and owner]', 'Next quarter | [Recommendation and owner]', 'This year | [Recommendation and owner]'])]),
  conclusion: () => pg('Conclusion', [K('07'), H(1, 'Conclusion'), P('[Summarise the findings and the recommended next step.]')]),
  appendix: () => pg('Appendix', [H(1, 'Appendix'), H(3, 'A. Survey questions'), LI(['[Question one]', '[Question two]'], true), H(3, 'B. Supporting data'), TB(['Field | Value', '[Field] | [Value]'])]),
  references: BOOK.references, continued: BOOK.continued
};
const WHITEPAPER: Kinds = {
  cover: () => pg('Cover', [LG('lockup'), SP(220), K('Whitepaper'), TI('[Whitepaper title]', '[The problem and the outcome, in one sentence]'), SP(60), M('[Author] · [Month Year]')], cover({ bg: 'ink' })),
  abstract: () => pg('Abstract', [K('Abstract'), H(1, 'Executive summary'), P('[150-word summary of the problem, the evidence and the recommended approach.]'), CO('Who this is for', '[Intended reader.]', 'info')]),
  toc: BOOK.toc,
  problem: () => pg('Problem statement', [K('The problem'), H(1, '[Problem statement]'), P('[Describe the problem in the reader\'s words. Avoid alarm; be specific.]'), Q('[A sentence that captures the cost of the problem.]', '[Source]')]),
  research: () => pg('Research', [K('Research'), H(1, 'What the research shows'), P('[Summary of sources and approach.]'), ST(['[Value] | [Finding]', '[Value] | [Finding]']), M('Sources: [list]. ' + ILL)]),
  evidence: () => pg('Evidence', [K('Evidence'), H(2, 'Supporting evidence'), CH(['[Item A]: 70', '[Item B]: 45', '[Item C]: 20'], 'Figure 1 · ' + ILL, '%'), P('[What the evidence means.]')]),
  framework: () => pg('Solution framework', [K('Framework'), H(1, '[Framework name]'), TL(['1 · [Step] | [What happens]', '2 · [Step] | [What happens]', '3 · [Step] | [What happens]', '4 · [Step] | [What happens]'])]),
  'case-study': () => pg('Case study', [K('Case study'), H(2, '[Organisation]'), KV(['Challenge | [Challenge]', 'Approach | [Approach]', 'Result | [Result, confirmed]']), Q('[Approved quote]', '[Name, role]')]),
  recommendations: REPORT.recommendations, conclusion: REPORT.conclusion, references: BOOK.references,
  about: () => pg('About', [H(1, 'About [organisation]'), P('[Confirmed description of the organisation.]'), CTA('[Call to action]', '[Contact or URL]')]), continued: BOOK.continued
};
const PROPOSAL: Kinds = {
  cover: () => pg('Cover', [LG('lockup'), SP(200), K('Proposal · v1'), TI('[Project name]', 'Prepared for [Client name]'), SP(60), M('[Agency name] · [Date] · Valid until [Date]')], cover({ bg: 'paper' })),
  client: () => pg('Client and project', [K('01'), H(1, 'Client and project'), KV(['Client | [Client name]', 'Contact | [Name, role]', 'Budget holder | [Name, role]', 'Project | [Project name]', 'Start | [Date]', 'Reference | [Proposal ref]']), P('[Two sentences on what the client asked for.]')]),
  objectives: () => pg('Objectives', [K('02'), H(1, 'Objectives'), LI(['[Objective one]', '[Objective two]', '[Objective three]'], true)]),
  scope: () => pg('Scope', [K('03'), H(1, 'Scope'), P('Each item lists what is included, what is excluded and the revision rounds that apply.'), TB(['Deliverable | Includes | Excludes | Rounds', 'Primary logo | 3 routes, final files | Animation | 2', 'Colour and type | Palette, type pairing | Licensed fonts | 2', 'Brand guidelines | 12-page PDF | Print production | 1'], 'Illustrative scope.')]),
  deliverables: () => pg('Deliverables', [K('04'), H(1, 'Deliverables'), LI(['[Deliverable] — [format] — [quantity]', '[Deliverable] — [format] — [quantity]', '[Deliverable] — [format] — [quantity]'])]),
  timeline: () => pg('Timeline and milestones', [K('05'), H(1, 'Timeline and milestones'), TL(['Week 1 | Discovery and brief sign-off', 'Week 2–3 | Concepts · round 1', 'Week 4 | Refinement · round 2', 'Week 5 | Final files and guidelines']), M('Dates depend on feedback arriving within [n] working days.')]),
  team: () => pg('Team', [K('06'), H(1, 'Team'), PE(['[Name] | [Role] | [One line on responsibility]', '[Name] | [Role] | [One line on responsibility]', '[Name] | [Role] | [One line on responsibility]'])]),
  investment: () => pg('Investment', [K('07'), H(1, 'Investment'), TB(['Item | Basis | Amount', 'Primary logo | Fixed fee | $3,000', 'Colour and type | Fixed fee | $1,200', 'Brand guidelines | Fixed fee | $1,800', 'Total | Agreed on acceptance | $6,000'], 'Illustrative pricing, USD, excluding tax.'), CO('Additional changes', 'Requests outside this scope are proposed as a priced change before work starts.', 'info')]),
  terms: () => pg('Terms', [K('08'), H(1, 'Terms'), LI(['Payment: [schedule]', 'Revision rounds: as listed per deliverable', 'Changes: priced and approved before work starts', 'Ownership: [terms]', 'Cancellation: [terms]']), M('[Link to full terms]')]),
  testimonials: () => pg('Testimonials', [K('09'), H(1, 'What clients say'), Q('[Approved client quote.]', '[Name, role, company]'), Q('[Approved client quote.]', '[Name, role, company]')]),
  'next-steps': () => pg('Next steps', [K('10'), H(1, 'Next steps'), LI(['Review the scope and investment', 'Ask questions — [contact]', 'Accept the proposal to record the agreement'], true), CTA('Accept proposal', 'Acceptance records Scope v1 as the agreement.')]),
  continued: BOOK.continued
};
const CASE: Kinds = {
  cover: () => pg('Cover', [LG('lockup'), SP(200), K('Case study'), TI('[Client name]', '[Outcome in one sentence]'), SP(40), IM('Agency work image', 300)], cover({ bg: 'paper' })),
  context: () => pg('Customer context', [K('Context'), H(1, 'About [client]'), KV(['Industry | [Industry]', 'Size | [Size]', 'Location | [Location]', 'Services | [Services provided]']), P('[Background in two sentences.]')]),
  challenge: () => pg('Challenge', [K('Challenge'), H(1, 'The challenge'), P('[What the client needed and why it was hard.]'), Q('[Client quote on the challenge.]', '[Name, role]')]),
  solution: () => pg('Solution', [K('Solution'), H(1, 'The solution'), P('[What was done.]'), IM('Agency work image', 300)]),
  implementation: () => pg('Implementation', [K('Implementation'), H(1, 'How it was delivered'), TL(['[Phase] | [What happened]', '[Phase] | [What happened]', '[Phase] | [What happened]'])]),
  results: () => pg('Results and metrics', [K('Results'), H(1, 'Results'), ST(['[Value] | [Confirmed metric]', '[Value] | [Confirmed metric]', '[Value] | [Confirmed metric]']), M('Only publish metrics the client has approved.')]),
  testimonial: () => pg('Testimonial', [Q('[Approved client testimonial.]', '[Name, role, company]')], { valign: 'center', bg: 'sea' }),
  lessons: () => pg('Lessons', [K('Lessons'), H(1, 'What we learned'), LI(['[Lesson one]', '[Lesson two]', '[Lesson three]'])]),
  cta: () => pg('Call to action', [TI('[Call-to-action headline]', '[Supporting line]'), SP(20), CTA('[Action]', '[Contact]')], cover({ bg: 'ink', valign: 'center' })),
  continued: BOOK.continued
};
const S = (o?: PageOpts): PageOpts => Object.assign({ header: false }, o);
const PRES: Kinds = {
  cover: () => pg('Cover', [LG('lockup'), SP(220), TI('[Presentation title]', '[Subtitle or occasion]'), M('[Presenter] · [Date]')], cover({ bg: 'paper' })),
  agenda: () => pg('Agenda', [K('Agenda'), LI(['Problem', 'What we found', 'Framework', 'Plan and investment', 'Next steps'], true)], S()),
  divider: () => pg('Section divider', [K('02'), TI('[Section title]', '')], cover({ bg: 'sea', valign: 'center' })),
  problem: () => pg('Problem', [K('The problem'), H(1, 'Requests arrive everywhere. Scope lives in a PDF.'), P('[One supporting line.]')], S({ valign: 'center' })),
  insight: () => pg('Insight', [K('Insight'), Q('[One insight, stated plainly.]', '[Source]')], S({ valign: 'center' })),
  data: () => pg('Data', [K('Data'), ST(['[Value] | [Label]', '[Value] | [Label]', '[Value] | [Label]']), M(ILL)], S({ valign: 'center' })),
  chart: () => pg('Chart', [H(2, '[Chart title]'), CH(['Agreed: 6000', 'Proposed: 1800', 'Invoiced: 4000'], ILL, '$')], S()),
  comparison: () => pg('Comparison', [H(2, 'Before and after'), TB(['Before | After', 'Requests in email threads | Requests linked to scope', 'Changes discussed | Changes priced and proposed', 'Approvals assumed | Approvals recorded'])], S()),
  framework: () => pg('Framework', [H(2, '[Framework name]'), TL(['Suggested | Hali flags a possible difference', 'Proposed | The agency prices a change', 'Agreed | The client approves; it is recorded'])], S()),
  process: () => pg('Process', [H(2, 'Process'), LI(['Brief', 'Concepts · round 1', 'Refine · round 2', 'Deliver'], true)], S()),
  timeline: () => pg('Timeline', [H(2, 'Timeline'), TL(['Week 1 | Discovery', 'Week 2–3 | Concepts', 'Week 4 | Refinement', 'Week 5 | Delivery'])], S()),
  'case-study': () => pg('Case study', [K('Case study'), H(2, '[Client]'), KV(['Challenge | [Challenge]', 'Approach | [Approach]', 'Result | [Approved result]'])], S()),
  quote: () => pg('Quote', [Q('[Approved quote]', '[Name, role]')], S({ bg: 'ink', valign: 'center' })),
  team: () => pg('Team', [H(2, 'Team'), PE(['[Name] | [Role] | [Responsibility]', '[Name] | [Role] | [Responsibility]', '[Name] | [Role] | [Responsibility]'])], S()),
  pricing: () => pg('Pricing', [H(2, 'Investment'), TB(['Option | Includes | Amount', 'Core | [Items] | $6,000', 'Extended | [Items] | $7,800']), M('Illustrative, USD, excluding tax.')], S()),
  summary: () => pg('Summary', [H(2, 'Summary'), LI(['[Point one]', '[Point two]', '[Point three]'])], S()),
  closing: () => pg('Closing', [TI('Thank you', '[Contact details]'), SP(20), LG('symbol')], cover({ bg: 'ink', valign: 'center' })),
  continued: BOOK.continued
};
const ARTICLE: Kinds = {
  hero: () => pg('Hero', [K('Article · Pricing'), TI('How to price a change without souring the relationship', 'A practical guide to scope, revision rounds and change orders for independent agencies.'), M('[Author name] · [Date] · 8 min read'), IM('Article hero image', 380)], cover()),
  body: () => pg('Body', [P('Most extra work arrives as a small, reasonable request. The trouble is not the request — it is that nobody checks it against what was agreed until the invoice.', { dropcap: true }), H(2, 'Start from the record'), P('Before replying, find the scope item the request touches and the rounds already used.')], cover()),
  image: () => pg('Image', [IM('Image caption', 420)], cover()),
  gallery: () => pg('Gallery', [IM('Gallery image 1', 260), IM('Gallery image 2', 260), M('Gallery · the agency\'s own work only.')], cover()),
  quote: () => pg('Quote', [Q('Price the change before the work starts.', '[Attribution]')], cover()),
  statistic: () => pg('Statistic', [ST(['$6,000 | Agreed', '$7,800 | If approved']), M(ILL)], cover()),
  chart: () => pg('Chart', [CH(['Agreed: 6000', 'Proposed: 1800'], ILL, '$')], cover()),
  callout: () => pg('Callout', [CO('Try this', 'Write your next request reply starting with the scope item it touches.', 'info')], cover()),
  list: () => pg('List', [H(3, 'Before you reply'), LI(['Find the scope item', 'Check the rounds used', 'Propose a change if it falls outside'], true)], cover()),
  conclusion: () => pg('Conclusion', [H(2, 'Conclusion'), P('[Closing paragraph and the one action the reader should take.]')], cover()),
  related: () => pg('Related content', [K('Related'), LI(['[Related article title]', '[Related article title]', '[Related article title]'])], cover()),
  bio: () => pg('Author bio', [DV('solid'), H(3, '[Author name]'), P('[One or two confirmed sentences about the author.]')], cover()),
  cta: () => pg('Call to action', [CTA('Create proposal', '[Where to go next]')], cover({ bg: 'sea' })),
  continued: BOOK.continued
};
const NEWS: Kinds = {
  header: () => pg('Header', [LG('lockup'), M('Newsletter · Issue [n] · [Date]')], cover({ bg: 'white' })),
  intro: () => pg('Introduction', [P('Hi [first name],'), P('[Two-sentence introduction to this issue.]')], cover({ bg: 'white' })),
  featured: () => pg('Featured story', [IM('Featured image', 240), K('Featured'), H(2, '[Featured story headline]'), P('[Two-sentence summary.]'), CTA('Read the article', '')], cover({ bg: 'white' })),
  article: () => pg('Article block', [H(3, '[Article headline]'), P('[One-paragraph summary with a link.]'), DV('solid')], cover({ bg: 'white' })),
  announcement: () => pg('Announcement', [K('Announcement'), H(3, '[Announcement]'), P('[What changed and what readers need to do.]')], cover({ bg: 'paper' })),
  event: () => pg('Event', [K('Event'), H(3, '[Event name]'), KV(['When | [Date, time]', 'Where | [Online / venue]']), CTA('Register', '')], cover({ bg: 'white' })),
  quote: () => pg('Quote', [Q('[Quote]', '[Attribution]')], cover({ bg: 'white' })),
  image: () => pg('Image', [IM('Image', 240, { caption: '[Caption]' })], cover({ bg: 'white' })),
  stats: () => pg('Statistics', [ST(['[Value] | [Label]', '[Value] | [Label]']), M(ILL)], cover({ bg: 'white' })),
  cta: () => pg('Call to action', [TI('[CTA headline]', '[Supporting line]'), CTA('[Action]', '')], cover({ bg: 'sea' })),
  footer: () => pg('Footer', [LG('symbol'), M('[Organisation] · [Postal address]'), M('You are receiving this because [reason]. [Unsubscribe] · [Preferences]')], cover({ bg: 'paper' })),
  continued: BOOK.continued
};
const R = (o?: PageOpts): PageOpts => Object.assign({ header: false, number: false }, o);
const RESUME: Kinds = {
  first: () => pg('Page 1', [TI('[Full name]', '[Role / headline]'), M('[City] · [email] · [phone] · [portfolio URL]'), DV('solid'), H(3, 'Profile'), P('[Two-sentence professional summary.]'), H(3, 'Experience'), TL(['[2022–now] | [Role], [Company] — [one-line achievement]', '[2019–2022] | [Role], [Company] — [one-line achievement]', '[2016–2019] | [Role], [Company] — [one-line achievement]'])], R()),
  second: () => pg('Page 2', [H(3, 'Education'), TL(['[Year] | [Qualification], [Institution]']), H(3, 'Skills'), LI(['[Skill]', '[Skill]', '[Skill]']), H(3, 'Certifications'), LI(['[Certification, issuer, year]']), H(3, 'Projects'), KV(['[Project] | [One line]']), H(3, 'Awards'), LI(['[Award, year]']), H(3, 'Publications'), LI(['[Title, outlet, year]']), H(3, 'References'), P('Available on request.')], R()),
  header: () => pg('Header', [TI('[Full name]', '[Role / headline]'), M('[City] · [email] · [phone]')], R()),
  summary: () => pg('Summary', [H(3, 'Summary'), P('[Professional summary.]')], R()),
  experience: () => pg('Experience', [H(3, 'Experience'), TL(['[Dates] | [Role], [Company] — [achievement]'])], R()),
  education: () => pg('Education', [H(3, 'Education'), TL(['[Year] | [Qualification], [Institution]'])], R()),
  skills: () => pg('Skills', [H(3, 'Skills'), LI(['[Skill]', '[Skill]'])], R()),
  contact: () => pg('Contact', [H(3, 'Contact'), KV(['Email | [email]', 'Phone | [phone]', 'Portfolio | [URL]'])], R()),
  continued: () => pg('Continued', [], R())
};


export interface DocTypeDef { name: string; icon: string; sizes: SizeId[]; kinds: Kinds; start: string[]; numberFrom: number; exports: ExportFormat[] }
export const TYPES: Record<DocType, DocTypeDef> = {
  book: { name: 'Book / ebook', icon: 'book-open', sizes: ['book', 'a4', 'letter'], kinds: BOOK, start: BOOK_START, numberFrom: 6, exports: ['pdf', 'print', 'docx', 'epub', 'html', 'md', 'txt', 'png'] },
  report: { name: 'Report', icon: 'file-chart-column', sizes: ['a4', 'letter'], kinds: REPORT, start: ['cover', 'toc', 'executive-summary', 'introduction', 'methodology', 'analysis', 'findings', 'data-visualisation', 'recommendations', 'conclusion', 'appendix', 'references'], numberFrom: 2, exports: ['pdf', 'print', 'docx', 'html', 'md', 'txt', 'png'] },
  whitepaper: { name: 'Whitepaper', icon: 'file-text', sizes: ['a4', 'letter'], kinds: WHITEPAPER, start: ['cover', 'abstract', 'toc', 'problem', 'research', 'evidence', 'framework', 'case-study', 'recommendations', 'conclusion', 'references', 'about'], numberFrom: 1, exports: ['pdf', 'print', 'docx', 'html', 'md', 'txt', 'png'] },
  proposal: { name: 'Proposal', icon: 'file-signature', sizes: ['a4', 'letter', 'slide'], kinds: PROPOSAL, start: ['cover', 'client', 'objectives', 'scope', 'deliverables', 'timeline', 'team', 'investment', 'terms', 'testimonials', 'next-steps'], numberFrom: 1, exports: ['pdf', 'print', 'docx', 'pptx', 'html', 'md', 'txt', 'png'] },
  casestudy: { name: 'Case study', icon: 'briefcase', sizes: ['a4', 'letter', 'slide'], kinds: CASE, start: ['cover', 'context', 'challenge', 'solution', 'implementation', 'results', 'testimonial', 'lessons', 'cta'], numberFrom: 1, exports: ['pdf', 'print', 'docx', 'pptx', 'html', 'md', 'txt', 'png'] },
  presentation: { name: 'Presentation', icon: 'presentation', sizes: ['slide'], kinds: PRES, start: ['cover', 'agenda', 'divider', 'problem', 'insight', 'data', 'chart', 'comparison', 'framework', 'process', 'timeline', 'case-study', 'quote', 'team', 'pricing', 'summary', 'closing'], numberFrom: 1, exports: ['pptx', 'pdf', 'print', 'png', 'html', 'md', 'txt'] },
  article: { name: 'Article / blog post', icon: 'newspaper', sizes: ['web', 'a4'], kinds: ARTICLE, start: ['hero', 'body', 'image', 'quote', 'statistic', 'chart', 'callout', 'list', 'gallery', 'conclusion', 'bio', 'related', 'cta'], numberFrom: 99, exports: ['html', 'md', 'txt', 'pdf', 'print', 'docx', 'png'] },
  newsletter: { name: 'Newsletter', icon: 'mail', sizes: ['email'], kinds: NEWS, start: ['header', 'intro', 'featured', 'article', 'article', 'announcement', 'event', 'quote', 'image', 'stats', 'cta', 'footer'], numberFrom: 99, exports: ['html', 'md', 'txt', 'pdf', 'png'] },
  resume: { name: 'Resume / CV', icon: 'id-card', sizes: ['a4', 'letter'], kinds: RESUME, start: ['first', 'second'], numberFrom: 99, exports: ['pdf', 'print', 'docx', 'html', 'md', 'txt', 'png'] },
};
export const DOC_TYPES = Object.keys(TYPES) as DocType[];

export function makePage(type: DocType, kind: string): DocPage {
  const k = TYPES[type].kinds[kind] || TYPES[type].kinds.continued;
  return Object.assign({ id: uid(), kind: TYPES[type].kinds[kind] ? kind : 'continued' }, k());
}

const TITLES: Record<DocType, string> = { book: 'Scope that holds', report: '[Report title]', whitepaper: '[Whitepaper title]', proposal: '[Project name] proposal', casestudy: '[Client] case study', presentation: '[Presentation title]', article: 'How to price a change', newsletter: 'Newsletter · Issue [n]', resume: '[Full name] — CV' };

export function newDocument(type: DocType): Doc {
  const T = TYPES[type];
  return { id: 'doc' + Date.now().toString(36), v: 1, type, title: TITLES[type], author: '[Author name]', size: T.sizes[0], numberFrom: T.numberFrom, header: true, pages: T.start.map((k) => makePage(type, k)), updated: Date.now() };
}

export const KIND_NAMES = (type: DocType) => Object.entries(TYPES[type].kinds).filter(([k]) => k !== 'continued').map(([k, f]) => ({ id: k, name: f().name }));
