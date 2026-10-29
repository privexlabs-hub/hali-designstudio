/* Hali Brand Studio — template library. Pure data + layout functions; no DOM.
   Every template is a function of (format, colour scheme) so the same design re-flows to any size.
   Copy in templates is illustrative (labelled in the UI). Bracketed text = facts the brand must supply. */
import type { Box, Category, Ctx, Design, El, ElStyle, Format, LogoVariant, Page, PageSpec, Scheme, SchemeId, Template, TemplateVars } from './types';
import { celebrationTemplates } from './celebrations';

export * from './types';

const A = '/assets/logo/';
export const LOGO: Record<LogoVariant, Record<string, string | number> & { ratio: number; default: string }> = {
  lockup: { default: 'hali-lockup-horizontal.svg', reverse: 'hali-lockup-horizontal-reverse.svg', mono: 'hali-lockup-horizontal-mono.svg', ratio: 230 / 72 },
  stacked: { default: 'hali-lockup-stacked.svg', reverse: 'hali-lockup-stacked-reverse.svg', mono: 'hali-lockup-stacked.svg', ratio: 1 },
  wordmark: { default: 'hali-wordmark.svg', reverse: 'hali-wordmark-reverse.svg', mono: 'hali-wordmark-mono.svg', ratio: 2.4 },
  symbol: { default: 'hali-symbol.svg', reverse: 'hali-symbol-light.svg', mono: 'hali-symbol-mono.svg', ink: 'hali-symbol-ink.svg', sea: 'hali-symbol-sea.svg', ratio: 1 },
  appicon: { default: '../icons/app-icon-full-bleed.svg', reverse: '../icons/app-icon-full-bleed.svg', mono: '../icons/app-icon-full-bleed.svg', ratio: 1 },
};
export function logoSrc(variant: string | undefined, tone: string | undefined): string {
  const l = LOGO[variant as LogoVariant] || LOGO.lockup;
  const f = (tone && typeof l[tone] === 'string' ? l[tone] : l.default) as string;
  return f.startsWith('../') ? '/assets/' + f.slice(3) : A + f;
}

export const SCHEMES: Record<SchemeId, Scheme> = {
  paper: { name: 'Paper', bg: '#FBFAF7', fg: '#1C1A18', muted: '#5C5751', accent: '#285B57', line: '#9C968A', surface: '#FFFFFF', border: '#DDD9D0', ctaBg: '#1C1A18', ctaFg: '#FFFFFF', tone: 'default', hatch: '#DDD9D0' },
  ink: { name: 'Ink', bg: '#1C1A18', fg: '#FBFAF7', muted: '#C6C1B6', accent: '#86B9B3', line: '#736D65', surface: '#2C2926', border: '#44403B', ctaBg: '#FBFAF7', ctaFg: '#1C1A18', tone: 'reverse', hatch: '#44403B' },
  sea: { name: 'Deep Sea', bg: '#285B57', fg: '#FFFFFF', muted: '#D3E6E3', accent: '#D3E6E3', line: '#86B9B3', surface: '#1E4744', border: '#367570', ctaBg: '#FBFAF7', ctaFg: '#1C1A18', tone: 'reverse', hatch: '#367570' },
};

const F = (id: string, name: string, w: number, h: number, group: string, safe?: Box): Format => ({ id, name, w, h, group, safe });
/* The editorial "Website article hero" (1600×900) has its own id; it previously shared `web-hero` with the 1440×720 web format. */
export const FORMATS: Format[] = [
  F('sq', 'Square post', 1080, 1080, 'Social'), F('portrait', 'Portrait feed post', 1080, 1350, 'Social'),
  F('story', 'Story / reel', 1080, 1920, 'Social', { x: 0, y: 220, w: 1080, h: 1420 }), F('yt', 'YouTube thumbnail', 1280, 720, 'Social'),
  F('x-header', 'X header', 1500, 500, 'Banner', { x: 100, y: 50, w: 1300, h: 310 }),
  F('li-personal', 'LinkedIn profile banner', 1584, 396, 'Banner', { x: 600, y: 30, w: 940, h: 336 }),
  F('li-company', 'LinkedIn company cover', 1128, 191, 'Banner', { x: 40, y: 20, w: 1048, h: 151 }),
  F('fb-cover', 'Facebook cover', 1640, 624, 'Banner', { x: 120, y: 60, w: 1400, h: 504 }),
  F('yt-channel', 'YouTube channel art', 2560, 1440, 'Banner', { x: 507, y: 509, w: 1546, h: 423 }),
  F('twitch', 'Twitch profile banner', 1200, 480, 'Banner'), F('podcast', 'Podcast cover', 3000, 3000, 'Banner'),
  F('newsletter-header', 'Newsletter header', 1200, 400, 'Banner'), F('web-banner', 'Website banner', 1920, 600, 'Banner'),
  F('event-banner', 'Event banner', 2160, 1080, 'Banner'), F('community-banner', 'Community banner (Discord)', 960, 540, 'Banner'),
  F('avatar', 'Avatar', 400, 400, 'Avatar', { x: 59, y: 59, w: 282, h: 282 }),
  F('ad-land', 'Landscape ad', 1200, 628, 'Ad'), F('mpu', 'Medium rectangle', 300, 250, 'Ad'), F('leader', 'Leaderboard', 728, 90, 'Ad'),
  F('sky', 'Wide skyscraper', 160, 600, 'Ad'), F('halfpage', 'Half page', 300, 600, 'Ad'), F('mobile', 'Mobile banner', 320, 50, 'Ad'),
  F('x-article', 'X article image (5:2)', 1500, 600, 'Editorial'), F('li-article', 'LinkedIn article cover', 1280, 720, 'Editorial'),
  F('li-post', 'LinkedIn post image', 1200, 627, 'Editorial'), F('medium', 'Medium article image', 1400, 788, 'Editorial'),
  F('article-hero', 'Website article hero', 1600, 900, 'Editorial'), F('blog-og', 'Blog promotion / Open Graph', 1200, 630, 'Editorial'),
  F('newsletter-promo', 'Newsletter promotion', 1200, 600, 'Editorial'), F('pin', 'Pinterest / tall promo', 1000, 1500, 'Editorial'),
  F('email-full', 'Full email', 600, 1500, 'Email'), F('email-header', 'Email header', 600, 200, 'Email'), F('email-hero', 'Email hero', 600, 320, 'Email'),
  F('email-section', 'Email section', 600, 400, 'Email'), F('email-footer', 'Email footer', 600, 180, 'Email'),
  F('web-hero', 'Website hero', 1440, 720, 'Web'), F('web-feature', 'Website feature section', 1440, 900, 'Web'), F('web-cta', 'Website CTA band', 1440, 480, 'Web'),
  F('web-mobile', 'Mobile web hero', 390, 844, 'Web'),
  /* Platform post sizes. Safe areas keep content clear of each app's own interface. */
  F('ig-square', 'Instagram post · square', 1080, 1080, 'Instagram'), F('ig-portrait', 'Instagram post · portrait', 1080, 1350, 'Instagram'),
  F('ig-story', 'Instagram story', 1080, 1920, 'Instagram', { x: 0, y: 250, w: 1080, h: 1420 }), F('ig-reel', 'Instagram reel cover', 1080, 1920, 'Instagram', { x: 0, y: 240, w: 1080, h: 1440 }),
  F('tiktok', 'TikTok video cover', 1080, 1920, 'TikTok', { x: 60, y: 150, w: 900, h: 1200 }),
  F('x-post', 'X / Twitter post', 1600, 900, 'X / Twitter'),
  F('fb-square', 'Facebook post · square', 1080, 1080, 'Facebook'), F('fb-portrait', 'Facebook post · portrait', 1080, 1350, 'Facebook'),
  F('fb-link', 'Facebook link / landscape post', 1200, 630, 'Facebook'), F('fb-story', 'Facebook story', 1080, 1920, 'Facebook', { x: 0, y: 250, w: 1080, h: 1420 }),
  F('li-square', 'LinkedIn post · square', 1200, 1200, 'LinkedIn'), F('li-portrait', 'LinkedIn post · portrait', 1080, 1350, 'LinkedIn'),
  F('threads', 'Threads post', 1080, 1350, 'Threads'),
  F('snap', 'Snapchat story', 1080, 1920, 'Snapchat', { x: 0, y: 150, w: 1080, h: 1520 }),
  F('wa-status', 'WhatsApp status', 1080, 1920, 'WhatsApp', { x: 0, y: 200, w: 1080, h: 1520 }),
  F('yt-community', 'YouTube community post', 1080, 1080, 'YouTube'),
];
export const FMT: Record<string, Format> = Object.fromEntries(FORMATS.map((f) => [f.id, f]));

/** Generic post sizes followed by every platform's exact post, story and cover sizes. */
export const POST_FORMATS = ['sq', 'portrait', 'story', 'yt', 'ig-square', 'ig-portrait', 'ig-story', 'ig-reel', 'tiktok', 'x-post', 'fb-square', 'fb-portrait', 'fb-link', 'fb-story', 'li-square', 'li-portrait', 'threads', 'pin', 'snap', 'wa-status', 'yt-community'];
/** Still (feed) post sizes only — no stories, reels or video covers. */
export const POST_FORMATS_STILL = ['sq', 'portrait', 'ig-square', 'ig-portrait', 'fb-square', 'fb-portrait', 'li-square', 'li-portrait', 'threads'];

export const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
/** Default variables for a new design: next month, and the coming year from October on. */
export function defaultVars(keys: Template['vars'], now = new Date()): TemplateVars {
  const v: TemplateVars = {};
  if (!keys) return v;
  if (keys.includes('month')) v.month = MONTHS[(now.getMonth() + 1) % 12];
  if (keys.includes('year')) v.year = String(now.getFullYear() + (now.getMonth() >= 9 ? 1 : 0));
  return v;
}

let _n = 0;
export const uid = () => 'e' + Date.now().toString(36) + (_n++).toString(36);
const r = Math.round;

/* ---------- element constructors ---------- */
function T(role: string, x: number, y: number, w: number, h: number, text: string, s?: ElStyle): El {
  return { id: uid(), role, type: 'text', x: r(x), y: r(y), w: r(w), h: r(h), text, s: Object.assign({ font: 'sans', size: 32, weight: 400, color: '#1C1A18', align: 'left', valign: 'top', lh: 1.3, ls: 0, upper: false, italic: false, bg: '', radius: 0, border: '', pad: 0, opacity: 1 }, s) };
}
function R(role: string, x: number, y: number, w: number, h: number, s?: ElStyle): El { return { id: uid(), role, type: 'shape', x: r(x), y: r(y), w: r(w), h: r(h), s: Object.assign({ bg: '#285B57', radius: 0, border: '', opacity: 1 }, s) }; }
function L(role: string, x: number, y: number, w: number, s?: ElStyle): El { const t = (s && s.thick) || 4; return { id: uid(), role, type: 'line', x: r(x), y: r(y), w: r(w), h: r(t), s: Object.assign({ color: '#285B57', dash: 'solid', thick: t, opacity: 1 }, s) }; }
function I(role: string, x: number, y: number, w: number, h: number, s?: ElStyle): El { return { id: uid(), role, type: 'image', x: r(x), y: r(y), w: r(w), h: r(h), src: '', s: Object.assign({ fit: 'cover', radius: 0, hatch: '#DDD9D0', bg: 'transparent', border: '', opacity: 1, label: 'Agency work image' }, s) }; }
function G(role: string, x: number, y: number, h: number, variant: LogoVariant, tone: string, w?: number): El { const ratio = (LOGO[variant] || LOGO.lockup).ratio; return { id: uid(), role, type: 'logo', x: r(x), y: r(y), w: r(w || h * ratio), h: r(h), logo: variant, tone, s: { opacity: 1 } }; }
export const make = { T, R, L, I, G };

/* ---------- layout helpers ---------- */
/** A stack item: text block ('text'), vertical space ('gap') or a custom element factory ('el'). */
export interface Item extends ElStyle {
  t: 'text' | 'gap' | 'el' | string;
  role?: string;
  text?: string;
  w?: number;
  h?: number;
  wInset?: number;
  fixed?: boolean;
  make?: (x: number, y: number, w: number, h: number, k: number) => El | El[];
}
type ElItem = Item & { t: 'el'; h: number };
type GapItem = Item & { t: 'gap'; h: number };
type TextItem = Item & { t: 'text'; role: string; text: string; size: number };
type Valign = 'top' | 'center' | 'bottom';

/** Heuristic text height (chars per line from an average glyph width of 0.54em). */
export function est(text: string, size: number, w: number, lh: number): number {
  const cpl = Math.max(1, Math.floor(w / (size * 0.54)));
  let lines = 0;
  String(text).split('\n').forEach((p) => { lines += Math.max(1, Math.ceil(p.length / cpl)); });
  return Math.ceil(lines * size * lh);
}
/** Stacks items vertically in `box`, shrinking everything by up to ~55% until it fits. */
export function stack(items: Item[], box: Box, valign?: Valign | string): El[] {
  let k = 1, hs: number[] = [];
  const meas = (it: Item) => it.t === 'gap' ? (it.h || 0) * k : it.t === 'el' ? (it.fixed ? (it.h || 0) : (it.h || 0) * k) : est(it.text || '', (it.size || 32) * k, box.w - (it.pad || 0) * 2 - (it.wInset || 0), it.lh || 1.3) + (it.pad || 0) * 2 + 4;
  for (let i = 0; i < 12; i++) { hs = items.map(meas); if (hs.reduce((a, b) => a + b, 0) <= box.h || k < 0.45) break; k *= 0.92; }
  const total = hs.reduce((a, b) => a + b, 0);
  let y = box.y + (valign === 'center' ? (box.h - total) / 2 : valign === 'bottom' ? box.h - total : 0);
  const out: El[] = [];
  items.forEach((it, i) => {
    const h = hs[i];
    if (it.t === 'text') {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { t, role, text, size, w, wInset, h: _h, fixed, make: _m, ...st } = it;
      const ww = w ? Math.min(w, box.w) : box.w;
      const x = st.align === 'center' && w ? box.x + (box.w - ww) / 2 : st.align === 'right' && w ? box.x + box.w - ww : box.x;
      out.push(T(role || 'text', x, y, ww, h, text || '', Object.assign(st, { size: r((size || 32) * k) })));
    } else if (it.t === 'el' && it.make) out.push(...([] as El[]).concat(it.make(box.x, y, box.w, h, k)));
    y += h;
  });
  return out;
}
export function ctxFor(fmt: Format, scheme: string, vars: TemplateVars = {}): Ctx {
  const W = fmt.w, H = fmt.h, c = SCHEMES[scheme as SchemeId] || SCHEMES.paper;
  const ratio = W / H;
  const o = ratio >= 2.4 ? 'wide' : ratio > 1.2 ? 'land' : ratio >= 0.85 ? 'square' : 'tall';
  const base = fmt.safe || { x: 0, y: 0, w: W, h: H };
  const pad = r(Math.max(8, Math.min(base.w, base.h) * (fmt.safe ? 0.06 : 0.075)));
  const Fr = { x: base.x + pad, y: base.y + pad, w: base.w - pad * 2, h: base.h - pad * 2 };
  const u = Math.min(W, H * 1.6) / 1080;
  return { W, H, c, o, u, pad, F: Fr, fmt, scheme, vars };
}
const bgRect = (ctx: Ctx) => R('background', 0, 0, ctx.W, ctx.H, { bg: ctx.c.bg });
const cta = (ctx: Ctx, label: string, size: number, role?: string): ElItem => ({ t: 'el', h: size * 2.4, make: (x, y, w, h, k) => { const s = size * k; const bw = Math.min(w, label.length * s * 0.6 + s * 2.6); return T(role || 'cta', x, y, bw, s * 2.4, label, { size: r(s), weight: 500, color: ctx.c.ctaFg, bg: ctx.c.ctaBg, radius: r(s * 0.4), align: 'center', valign: 'center', lh: 1 }); } });
const motif = (ctx: Ctx, w: number, t: number): ElItem => ({ t: 'el', h: t * 6, make: (x, y) => L('motif', x, y + t * 2, w, { color: ctx.c.accent, dash: 'solid', thick: r(t) }) });
function recordRows(ctx: Ctx, rows: string[][], size: number): ElItem[] {
  return rows.map((row, i) => ({ t: 'el' as const, h: size * 2.2, make: (x: number, y: number, w: number, h: number, k: number) => {
    const s = size * k; const lw = s * 3.2;
    return [L('row-line-' + i, x, y + h / 2 - 2, lw, { color: ctx.c.accent, dash: row[0] as ElStyle['dash'], thick: r(Math.max(2, s * 0.12)) }), T('row-' + i, x + lw + s, y, w - lw - s, h, row[1], { size: r(s), color: ctx.c.fg, valign: 'center', lh: 1.25 })];
  } }));
}
// header (logo + overline) and footer for social formats; returns { els, box }
function chrome(ctx: Ctx, overline: string, footer: string) {
  const { F: Fr, c, u } = ctx; const lh = r(46 * u);
  const els = [G('logo', Fr.x, Fr.y, lh, 'lockup', c.tone)];
  if (overline) els.push(T('overline', Fr.x + Fr.w * 0.45, Fr.y, Fr.w * 0.55, lh, overline, { font: 'mono', size: r(22 * u), weight: 500, color: c.muted, align: 'right', valign: 'center', upper: true, ls: 0.06, lh: 1.2 }));
  let bottom = Fr.y + Fr.h;
  if (footer) {
    const fs = r(22 * u);
    els.push(L('footer-rule', Fr.x, bottom - fs * 2.6, Fr.w, { color: c.line, dash: 'solid', thick: Math.max(1, r(1.5 * u)) }));
    els.push(T('footer', Fr.x, bottom - fs * 1.6, Fr.w, fs * 1.6, footer, { font: 'mono', size: fs, color: c.muted, valign: 'bottom', upper: true, ls: 0.04, lh: 1.2 }));
    bottom -= fs * 4.2;
  }
  const top = Fr.y + lh + 48 * u;
  return { els, box: { x: Fr.x, y: top, w: Fr.w, h: bottom - top } };
}
function splitImage(ctx: Ctx, box: Box, ratio?: number) {
  if (ctx.o === 'land' || ctx.o === 'wide') { const iw = box.w * (ratio || 0.44); return { img: { x: box.x + box.w - iw, y: box.y, w: iw, h: box.h }, text: { x: box.x, y: box.y, w: box.w - iw - 40 * ctx.u, h: box.h } }; }
  const ih = box.h * (ratio || (ctx.o === 'tall' ? 0.42 : 0.4));
  return { img: { x: box.x, y: box.y, w: box.w, h: ih }, text: { x: box.x, y: box.y + ih + 40 * ctx.u, w: box.w, h: box.h - ih - 40 * ctx.u } };
}
const img = (ctx: Ctx, b: Box, role?: string, extra?: ElStyle) => I(role || 'image', b.x, b.y, b.w, b.h, Object.assign({ hatch: ctx.c.hatch, radius: r(10 * ctx.u) }, extra));
const title = (ctx: Ctx, text: string, size: number, more?: Partial<TextItem>): TextItem => Object.assign({ t: 'text' as const, role: 'title', text, size: size * ctx.u, weight: 600, ls: -0.03, lh: 1.06, color: ctx.c.fg }, more);
const body = (ctx: Ctx, text: string, size: number, more?: Partial<TextItem>): TextItem => Object.assign({ t: 'text' as const, role: 'body', text, size: size * ctx.u, color: ctx.c.muted, lh: 1.4 }, more);
const gap = (ctx: Ctx, h: number): GapItem => ({ t: 'gap', h: h * ctx.u });
const FOOT = 'Scope → approval → invoice, in one record';
const one = (els: El[]): PageSpec[] => [{ key: 'p1', name: 'Page 1', els }];

interface EmailData { meta: string; overline: string; title: string; body: string; cta: string; stories: string[][] }
interface WebData { kind?: string; overline: string; title: string; body: string; cta: string; navCta: string; cols?: string[][] }

/* ---------- social post variants ---------- */
function social(overline: string, inner: (ctx: Ctx, b: Box) => El[], opts?: { footer?: boolean }) {
  return (ctx: Ctx): PageSpec[] => {
    const ch = chrome(ctx, overline, (opts && opts.footer) === false ? '' : FOOT);
    return one([bgRect(ctx), ...ch.els, ...inner(ctx, ch.box)]);
  };
}
const SOCIAL: Template[] = [
  { id: 'announcement', name: 'Announcement', scheme: 'paper', build: social('Announcement', (ctx, b) => stack([
    title(ctx, 'Proposals now carry straight through to the agreed scope', 92), gap(ctx, 32),
    body(ctx, 'Every proposal you send becomes the starting record for requests, change decisions and invoicing.', 34), gap(ctx, 40), motif(ctx, 160 * ctx.u, 4 * ctx.u)], b, 'center')) },
  { id: 'product-update', name: 'Product update', scheme: 'paper', build: social('Product update', (ctx, b) => stack([
    title(ctx, 'Change orders, now clearer for clients', 84), gap(ctx, 40),
    ...recordRows(ctx, [['dotted', 'Suggested by Hali — not yet reviewed'], ['dashed', 'Proposed — awaiting the client'], ['solid', 'Approved and recorded']], 30 * ctx.u)], b, 'center')) },
  { id: 'testimonial', name: 'Testimonial', scheme: 'sea', build: social('Client words', (ctx, b) => stack([
    { t: 'text', role: 'quote-mark', text: '“', size: 180 * ctx.u, weight: 600, color: ctx.c.accent, lh: 0.8 },
    { t: 'text', role: 'quote', text: 'Clients see exactly what changed and what it costs before they approve. The conversation got easier.', size: 54 * ctx.u, weight: 500, ls: -0.02, lh: 1.2, color: ctx.c.fg }, gap(ctx, 40),
    { t: 'text', role: 'name', text: '[Client name]', size: 30 * ctx.u, weight: 600, color: ctx.c.fg },
    { t: 'text', role: 'role', text: 'Illustrative · Studio director', size: 22 * ctx.u, font: 'mono', upper: true, ls: 0.05, color: ctx.c.muted }], b, 'center')) },
  { id: 'educational', name: 'Educational post', scheme: 'paper', build: social('Guide · 01', (ctx, b) => stack([
    title(ctx, 'Three lines that keep scope honest', 84), gap(ctx, 44),
    ...recordRows(ctx, [['dotted', 'Dotted: suggested by Hali'], ['dashed', 'Dashed: not yet agreed'], ['solid', 'Solid: recorded']], 34 * ctx.u), gap(ctx, 24),
    body(ctx, 'The record works without colour. Colour only adds who must act.', 28)], b, 'center')) },
  { id: 'statistic', name: 'Statistic', scheme: 'paper', build: social('Illustrative example', (ctx, b) => stack([
    { t: 'text', role: 'figure', text: '$7,800', size: 230 * ctx.u, weight: 600, ls: -0.045, lh: 1, color: ctx.c.accent },
    { t: 'text', role: 'figure-label', text: '$6,000 agreed → $7,800 if approved', size: 30 * ctx.u, font: 'mono', color: ctx.c.muted, lh: 1.3 }, gap(ctx, 40), motif(ctx, 120 * ctx.u, 4 * ctx.u), gap(ctx, 16),
    body(ctx, 'Show the agreed figure and the proposed change side by side, with currency and basis.', 34, { color: ctx.c.fg })], b, 'center')) },
  { id: 'launch', name: 'Launch', scheme: 'ink', build: social('Now available', (ctx, b) => { const s = splitImage(ctx, b); return [img(ctx, s.img), ...stack([
    title(ctx, 'The agency page is your front door', 76), gap(ctx, 20), body(ctx, 'An agency-branded page and enquiry form, connected to the record.', 30), gap(ctx, 32), cta(ctx, 'Create proposal', 28 * ctx.u)], s.text, 'top')]; }) },
  { id: 'quote', name: 'Quote', scheme: 'ink', build: social('', (ctx, b) => stack([
    motif(ctx, 120 * ctx.u, 4 * ctx.u), gap(ctx, 24),
    { t: 'text', role: 'quote', text: 'Clear, not legalistic. Firm, not aggressive. Transparent, not alarmist.', size: 78 * ctx.u, weight: 600, ls: -0.03, lh: 1.1, color: ctx.c.fg }, gap(ctx, 36),
    { t: 'text', role: 'attribution', text: 'Hali · voice principle', size: 24 * ctx.u, font: 'mono', upper: true, ls: 0.05, color: ctx.c.muted }], b, 'center')) },
  { id: 'cta', name: 'Call to action', scheme: 'sea', build: social('', (ctx, b) => stack([
    title(ctx, 'Keep every request connected to the agreed scope', 88), gap(ctx, 28),
    body(ctx, 'One commercial record from proposal to invoice.', 34), gap(ctx, 48), cta(ctx, 'Create proposal', 32 * ctx.u)], b, 'center')) },
  { id: 'comparison', name: 'Comparison', scheme: 'paper', build: social('Before · after', (ctx, b) => {
    const u = ctx.u; const head = stack([title(ctx, 'Before and after a shared record', 72)], { x: b.x, y: b.y, w: b.w, h: b.h * 0.3 }, 'top');
    const hb = head.reduce((m, e) => Math.max(m, e.y + e.h), b.y) + 40 * u; const land = ctx.o === 'land';
    const gw = 24 * u, cw = land ? (b.w - gw) / 2 : b.w, ch = land ? b.y + b.h - hb : (b.y + b.h - hb - gw) / 2;
    const box = (role: string, x: number, y: number, label: string, lines: string, dash: string, col: string) => [T(role + '-box', x, y, cw, ch, '', { border: (3 * u).toFixed(1) + 'px ' + dash + ' ' + col, radius: r(10 * u) }),
      T(role + '-label', x + 32 * u, y + 28 * u, cw - 64 * u, 40 * u, label, { font: 'mono', size: r(22 * u), upper: true, ls: 0.05, color: col, weight: 500 }),
      T(role + '-text', x + 32 * u, y + 80 * u, cw - 64 * u, ch - 100 * u, lines, { size: r(32 * u), lh: 1.45, color: ctx.c.fg })];
    return [...head, ...box('before', b.x, hb, 'Not yet agreed', 'Requests in email threads\nScope in a PDF\nChanges discussed, not decided', 'dashed', ctx.c.line),
      ...box('after', land ? b.x + cw + gw : b.x, land ? hb : hb + ch + gw, 'Recorded', 'Requests linked to scope\nChanges priced and proposed\nApprovals recorded', 'solid', ctx.c.accent)];
  }) },
  { id: 'founder-story', name: 'Founder story', scheme: 'paper', build: social('Founder story', (ctx, b) => { const s = splitImage(ctx, b, ctx.o === 'square' ? 0.42 : undefined); return [img(ctx, s.img, 'portrait', { label: 'Founder portrait' }), ...stack([
    { t: 'text', role: 'quote', text: '“We built the record we wanted when our own studio kept losing track of what was agreed.”', size: 46 * ctx.u, weight: 500, ls: -0.02, lh: 1.25, color: ctx.c.fg }, gap(ctx, 28),
    { t: 'text', role: 'name', text: '[Founder name]', size: 28 * ctx.u, weight: 600, color: ctx.c.fg },
    { t: 'text', role: 'role', text: 'Founder · [Company]', size: 22 * ctx.u, font: 'mono', upper: true, ls: 0.05, color: ctx.c.muted }], s.text, 'top')]; }) },
  { id: 'community-spotlight', name: 'Community spotlight', scheme: 'paper', build: social('Community spotlight', (ctx, b) => { const s = splitImage(ctx, b); return [img(ctx, s.img, 'image', { label: "Agency's own work" }), ...stack([
    { t: 'text', role: 'agency', text: '[Agency name]', size: 64 * ctx.u, weight: 600, ls: -0.03, lh: 1.1, color: ctx.c.fg }, gap(ctx, 16),
    body(ctx, '[One sentence on the agency and its work, supplied and approved by the agency.]', 30), gap(ctx, 24),
    { t: 'text', role: 'meta', text: '[City] · [Team size]', size: 22 * ctx.u, font: 'mono', upper: true, ls: 0.05, color: ctx.c.muted }], s.text, 'top')]; }) },
  { id: 'event', name: 'Event', scheme: 'sea', build: social('Live session', (ctx, b) => stack([
    { t: 'text', role: 'date', text: '[Date] · [Time]', size: 30 * ctx.u, font: 'mono', upper: true, ls: 0.05, color: ctx.c.muted }, gap(ctx, 24),
    title(ctx, 'Running revision rounds clients understand', 84), gap(ctx, 24),
    body(ctx, 'Online · [Platform] · 45 minutes', 30), gap(ctx, 44), cta(ctx, 'Register', 30 * ctx.u)], b, 'center')) }
];

const ENGAGEMENT: Template[] = [
  { id: 'poll', name: 'Poll', scheme: 'paper', build: social('Poll', (ctx, b) => { const u = ctx.u; return stack([
    title(ctx, 'A request falls outside the agreed scope. What do you do first?', 66), gap(ctx, 40),
    ...['A   Absorb it this time', 'B   Ask the client to confirm', 'C   Propose a change with a price'].map((o, i): Item => ({ t: 'text', role: 'option-' + i, text: o, size: 32 * u, color: ctx.c.fg, pad: r(22 * u), border: (2 * u).toFixed(1) + 'px dashed ' + ctx.c.line, radius: r(10 * u), valign: 'center', lh: 1.2 })).flatMap((x, i): Item[] => i ? [gap(ctx, 16), x] : [x]),
    gap(ctx, 28), body(ctx, 'Vote in the comments', 24, { font: 'mono', upper: true, ls: 0.05 })], b, 'center'); }) },
  { id: 'question', name: 'Question', scheme: 'sea', build: social('Question', (ctx, b) => stack([
    title(ctx, 'What should every client see before approving a change?', 92), gap(ctx, 40), motif(ctx, 140 * ctx.u, 4 * ctx.u), gap(ctx, 12),
    body(ctx, 'Reply below', 26, { font: 'mono', upper: true, ls: 0.05 })], b, 'center')) },
  { id: 'this-or-that', name: 'This or that', scheme: 'paper', build: (ctx) => {
    const { W, H, u, c } = ctx; const land = ctx.o === 'land'; const half = land ? { w: W / 2, h: H } : { w: W, h: H / 2 };
    const els = [R('left-bg', 0, 0, half.w, half.h, { bg: c.bg }), R('right-bg', land ? W / 2 : 0, land ? 0 : H / 2, half.w, half.h, { bg: '#285B57' })];
    const p = ctx.pad;
    els.push(T('left', p, p, half.w - p * 2, half.h - p * 2, 'Fixed revision rounds', { size: r(76 * u), weight: 600, ls: -0.03, lh: 1.08, align: 'center', valign: 'center', color: c.fg }));
    els.push(T('right', (land ? W / 2 : 0) + p, (land ? 0 : H / 2) + p, half.w - p * 2, half.h - p * 2, 'Open-ended feedback', { size: r(76 * u), weight: 600, ls: -0.03, lh: 1.08, align: 'center', valign: 'center', color: '#FFFFFF' }));
    const d = 140 * u; els.push(T('or', W / 2 - d / 2, H / 2 - d / 2, d, d, 'or', { size: r(44 * u), weight: 600, color: '#FFFFFF', bg: '#1C1A18', radius: r(d / 2), align: 'center', valign: 'center', lh: 1 }));
    els.push(T('overline', p, p, W - p * 2, 40 * u, 'This or that', { font: 'mono', size: r(22 * u), upper: true, ls: 0.06, color: c.muted }));
    return one(els);
  } },
  { id: 'fill-blank', name: 'Fill in the blank', scheme: 'ink', build: social('Fill in the blank', (ctx, b) => stack([
    title(ctx, 'The hardest part of protecting scope is ________.', 92), gap(ctx, 40),
    body(ctx, 'Finish the sentence in the comments', 26, { font: 'mono', upper: true, ls: 0.05 })], b, 'center')) }
];

/* ---------- carousel (multi-page) ---------- */
const PN = { auto: 'pagenum' };
function carouselPage(ctx: Ctx, key: string, name: string, inner: (b: Box) => El[]): PageSpec {
  const ch = chrome(ctx, '', FOOT);
  const pn = T('page-number', ctx.F.x + ctx.F.w * 0.5, ctx.F.y, ctx.F.w * 0.5, r(46 * ctx.u), '01 / 05', { font: 'mono', size: r(22 * ctx.u), color: ctx.c.muted, align: 'right', valign: 'center', ls: 0.06 });
  Object.assign(pn, PN);
  return { key, name, els: [bgRect(ctx), ...ch.els, pn, ...inner(ch.box)] };
}
const CAROUSEL: Template[] = [{ id: 'carousel', name: 'Carousel — 5 slides', scheme: 'paper', multi: true, build: (ctx) => [
  carouselPage(ctx, 'cover', 'Cover', (b) => stack([title(ctx, 'Five ways to keep scope agreed', 100), gap(ctx, 32), body(ctx, 'Swipe →', 28, { font: 'mono', upper: true, ls: 0.05 })], b, 'center')),
  carouselPage(ctx, 'point', 'Point', (b) => stack([{ t: 'text', role: 'number', text: '01', size: 120 * ctx.u, weight: 600, color: ctx.c.accent, font: 'mono', lh: 1 }, gap(ctx, 24),
    title(ctx, 'Write scope as items, not paragraphs', 72), gap(ctx, 24), body(ctx, 'Each scope item has its own revision rounds, so a request can be checked against one line.', 32)], b, 'center')),
  carouselPage(ctx, 'list', 'List', (b) => stack([title(ctx, 'Before you reply to a request', 68), gap(ctx, 36),
    ...recordRows(ctx, [['solid', 'Find the scope item it touches'], ['solid', 'Check the revision rounds used'], ['dashed', 'Propose a change if it falls outside']], 32 * ctx.u)], b, 'center')),
  carouselPage(ctx, 'quote', 'Quote', (b) => stack([{ t: 'text', role: 'quote', text: '“Your two included revision rounds are complete. This request can be handled as an additional change.”', size: 54 * ctx.u, weight: 500, ls: -0.02, lh: 1.25, color: ctx.c.fg }, gap(ctx, 28),
    { t: 'text', role: 'attribution', text: 'Preferred phrasing', size: 22 * ctx.u, font: 'mono', upper: true, ls: 0.05, color: ctx.c.muted }], b, 'center')),
  carouselPage(ctx, 'end', 'Closing CTA', (b) => stack([title(ctx, 'Keep the record with your next proposal', 80), gap(ctx, 44), cta(ctx, 'Create proposal', 30 * ctx.u)], b, 'center'))
] }];

/* ---------- banners ---------- */
function bannerLayout(ctx: Ctx, items: (k: number) => Item[], logo: LogoVariant): El[] {
  const { F: Fr, c, u } = ctx; const els = [bgRect(ctx)];
  if (ctx.o === 'wide' || ctx.o === 'land') {
    const lh = Math.min(Fr.h * 0.34, 90 * Math.max(u, 0.4) * 1.4);
    const lw = logo === 'symbol' ? lh : lh * LOGO.lockup.ratio;
    els.push(G('logo', Fr.x, Fr.y + (Fr.h - lh) / 2, lh, logo, c.tone));
    const gx = Fr.x + lw + Math.max(Fr.h * 0.25, 24);
    els.push(L('divider', gx, Fr.y + Fr.h * 0.12, 0, { color: c.line, thick: 2 })); els[els.length - 1].w = 2; els[els.length - 1].h = r(Fr.h * 0.76);
    const tb = { x: gx + Math.max(Fr.h * 0.25, 24), y: Fr.y, w: Fr.x + Fr.w - gx - Math.max(Fr.h * 0.25, 24), h: Fr.h };
    els.push(...stack(items(Math.min(Fr.h / 300, tb.w / 900)), tb, 'center'));
  } else {
    const lh = Fr.h * 0.1;
    els.push(G('logo', Fr.x, Fr.y, lh, 'lockup', c.tone));
    els.push(...stack(items(Fr.w / 1000), { x: Fr.x, y: Fr.y + lh * 2, w: Fr.w, h: Fr.h - lh * 2 }, 'bottom'));
  }
  return els;
}
const bt = (role: string, text: string, size: number, c: string, more?: Partial<Item>): Item => Object.assign({ t: 'text', role, text, size, color: c, lh: 1.15 }, more);
const BANNERS: Template[] = [
  { id: 'brand', name: 'Brand statement', scheme: 'paper', build: (ctx) => one(bannerLayout(ctx, (k) => [
    bt('title', 'Agreed scope, requests, approvals and invoicing in one record.', 64 * k, ctx.c.fg, { weight: 600, ls: -0.025, lh: 1.1 }), { t: 'gap', h: 20 * k },
    { t: 'el', h: 24 * k, make: (x, y) => [L('m1', x, y + 8 * k, 80 * k, { color: ctx.c.accent, dash: 'dotted', thick: r(4 * k) }), L('m2', x + 100 * k, y + 8 * k, 80 * k, { color: ctx.c.accent, dash: 'dashed', thick: r(4 * k) }), L('m3', x + 200 * k, y + 8 * k, 80 * k, { color: ctx.c.accent, dash: 'solid', thick: r(4 * k) })] }], 'lockup')) },
  { id: 'headline', name: 'Headline + CTA', scheme: 'ink', build: (ctx) => one(bannerLayout(ctx, (k) => [
    bt('overline', 'For independent agencies', 22 * k, ctx.c.muted, { font: 'mono', upper: true, ls: 0.06 }), { t: 'gap', h: 14 * k },
    bt('title', 'Make better commercial decisions, without the friction', 64 * k, ctx.c.fg, { weight: 600, ls: -0.025, lh: 1.08 }), { t: 'gap', h: 14 * k },
    bt('subtitle', 'Proposals, change orders and approvals — connected.', 28 * k, ctx.c.muted)], 'symbol')) },
  { id: 'event', name: 'Event banner', scheme: 'sea', build: (ctx) => one(bannerLayout(ctx, (k) => [
    bt('date', '[Date] · [Time] · Online', 24 * k, ctx.c.muted, { font: 'mono', upper: true, ls: 0.06 }), { t: 'gap', h: 14 * k },
    bt('title', 'Running revision rounds clients understand', 68 * k, ctx.c.fg, { weight: 600, ls: -0.025, lh: 1.08 }), { t: 'gap', h: 24 * k }, cta(ctx, 'Register', 26 * k)], 'symbol')) }
];

/* ---------- avatars (content kept inside the central circle) ---------- */
const av = (fn: (ctx: Ctx, W: number, H: number) => El[]) => (ctx: Ctx) => one(fn(ctx, ctx.W, ctx.H));
const AVATARS: Template[] = [
  { id: 'symbol-sea', name: 'Symbol on paper', scheme: 'paper', build: av((ctx, W) => [bgRect(ctx), G('symbol', W * 0.22, W * 0.22, W * 0.56, 'symbol', 'default')]) },
  { id: 'symbol-full', name: 'Full-bleed symbol', scheme: 'sea', build: av((ctx, W) => [bgRect(ctx), G('symbol', 0, 0, W, 'appicon', 'default')]) },
  { id: 'symbol-ink', name: 'Ink symbol', scheme: 'paper', build: av((ctx, W) => [R('background', 0, 0, W, W, { bg: '#F5F3EE' }), G('symbol', W * 0.22, W * 0.22, W * 0.56, 'symbol', 'ink')]) },
  { id: 'symbol-light', name: 'Light symbol on Deep Sea', scheme: 'sea', build: av((ctx, W) => [bgRect(ctx), G('symbol', W * 0.22, W * 0.22, W * 0.56, 'symbol', 'reverse')]) },
  { id: 'wordmark', name: 'Wordmark', scheme: 'paper', build: av((ctx, W) => [bgRect(ctx), G('wordmark', W * 0.2, W * 0.5 - W * 0.6 / 2.4 / 2, W * 0.6 / 2.4, 'wordmark', 'default', W * 0.6)]) },
  { id: 'initials', name: 'Initials (team member)', scheme: 'sea', build: av((ctx, W) => [bgRect(ctx), T('initials', 0, 0, W, W, 'SN', { size: r(W * 0.34), weight: 600, ls: -0.03, color: '#FFFFFF', align: 'center', valign: 'center', lh: 1 })]) },
  { id: 'photo-ring', name: 'Photo with ring', scheme: 'paper', build: av((ctx, W) => [bgRect(ctx), R('ring', W * 0.06, W * 0.06, W * 0.88, W * 0.88, { bg: 'transparent', radius: 9999, border: r(W * 0.025) + 'px solid #285B57' }), I('photo', W * 0.12, W * 0.12, W * 0.76, W * 0.76, { radius: 9999, hatch: '#DDD9D0', label: 'Profile photo' })]) },
  { id: 'record-rings', name: 'Record rings', scheme: 'paper', build: av((ctx, W) => [bgRect(ctx),
    R('ring-1', W * 0.06, W * 0.06, W * 0.88, W * 0.88, { bg: 'transparent', radius: 9999, border: '4px dotted #9C968A' }),
    R('ring-2', W * 0.14, W * 0.14, W * 0.72, W * 0.72, { bg: 'transparent', radius: 9999, border: '4px dashed #3462B8' }),
    R('ring-3', W * 0.22, W * 0.22, W * 0.56, W * 0.56, { bg: 'transparent', radius: 9999, border: '4px solid #285B57' }),
    G('symbol', W * 0.33, W * 0.33, W * 0.34, 'symbol', 'default')]) }
];

/* ---------- ads ---------- */
function adLayout(ctx: Ctx, d: { overline?: string; title: string; body?: string; cta: string }): El[] {
  const { W, H, c } = ctx; const els = [bgRect(ctx)]; const ratio = W / H; const p = ctx.pad;
  if (ratio >= 3) {
    const lh = H * 0.56; els.push(G('logo', p, (H - lh) / 2, lh, 'symbol', c.tone === 'default' ? 'default' : 'reverse'));
    const cs = H * 0.2, cw = Math.min(W * 0.3, d.cta.length * cs * 0.62 + cs * 2.4), ch = H * 0.56;
    els.push(T('cta', W - p - cw, (H - ch) / 2, cw, ch, d.cta, { size: r(cs), weight: 500, color: c.ctaFg, bg: c.ctaBg, radius: 4, align: 'center', valign: 'center', lh: 1 }));
    const tx = p + lh + p; els.push(T('title', tx, 0, W - tx - cw - p * 2, H, d.title, { size: r(Math.min(H * 0.26, (W - tx - cw - p * 2) / (d.title.length * 0.5))), weight: 600, ls: -0.02, color: c.fg, valign: 'center', lh: 1.1 }));
    return els;
  }
  const u = Math.min(W, H * 1.6) / 1080; const lh = Math.max(16, 52 * u);
  els.push(G('logo', p, p, lh, ratio < 0.6 ? 'symbol' : 'lockup', c.tone));
  const box = { x: p, y: p + lh + p * 0.8, w: W - p * 2, h: H - p * 2.8 - lh };
  const items: Item[] = [];
  if (d.overline) items.push({ t: 'text', role: 'overline', text: d.overline, size: 22 * u, font: 'mono', upper: true, ls: 0.06, color: c.muted }, { t: 'gap', h: 16 * u });
  items.push({ t: 'text', role: 'title', text: d.title, size: 90 * u * (ratio < 0.6 ? 1.6 : 1), weight: 600, ls: -0.03, lh: 1.06, color: c.fg }, { t: 'gap', h: 24 * u });
  if (d.body) items.push({ t: 'text', role: 'body', text: d.body, size: 32 * u * (ratio < 0.6 ? 1.5 : 1), color: c.muted, lh: 1.35 }, { t: 'gap', h: 36 * u });
  items.push(cta(ctx, d.cta, 30 * u * (ratio < 0.6 ? 1.5 : 1)));
  els.push(...stack(items, box, ratio < 0.6 ? 'bottom' : 'center'));
  return els;
}
const ADS: Template[] = [
  { id: 'offer', name: 'Offer', scheme: 'sea', build: (ctx) => one(adLayout(ctx, { overline: 'For independent agencies', title: 'Proposal to invoice, in one record', body: 'Agency-branded pages, change orders and approvals.', cta: 'Create proposal' })) },
  { id: 'problem-solution', name: 'Problem → solution', scheme: 'paper', build: (ctx) => one(adLayout(ctx, { overline: 'Scope creep', title: '“Quick changes” add up. Price them before you start.', body: 'Propose a change with a clear figure. The client approves; it is recorded.', cta: 'See how it works' })) },
  { id: 'testimonial-ad', name: 'Testimonial ad', scheme: 'ink', build: (ctx) => one(adLayout(ctx, { overline: 'Illustrative · [Client name]', title: '“The conversation about extra work got easier.”', body: '', cta: 'Read the story' })) }
];

/* ---------- article / editorial ---------- */
const ART = { overline: 'Article · Pricing', title: 'How to price a change without souring the relationship', subtitle: 'A practical guide to scope, revision rounds and change orders for independent agencies.', byline: '[Author name] · [Date]' };
function artUnits(ctx: Ctx) { return Math.min(ctx.W, ctx.H * 1.7) / 1080; }
function articleText(ctx: Ctx, u: number, align?: ElStyle['align'], scale?: number): Item[] {
  const s = scale || 1, c = ctx.c;
  return [{ t: 'text', role: 'overline', text: ART.overline, size: 22 * u, font: 'mono', upper: true, ls: 0.06, color: c.muted, align }, { t: 'gap', h: 22 * u },
    { t: 'text', role: 'title', text: ART.title, size: 84 * u * s, weight: 600, ls: -0.03, lh: 1.06, color: c.fg, align }, { t: 'gap', h: 24 * u },
    { t: 'text', role: 'subtitle', text: ART.subtitle, size: 32 * u * s, color: c.muted, lh: 1.35, align }];
}
const ARTICLE: Template[] = [
  { id: 'editorial', name: 'Editorial', scheme: 'paper', build: (ctx) => { const u = artUnits(ctx), Fr = ctx.F, c = ctx.c; const lh = 44 * u;
    return one([bgRect(ctx), G('logo', Fr.x, Fr.y, lh, 'lockup', c.tone),
      T('byline', Fr.x + Fr.w / 2, Fr.y, Fr.w / 2, lh, ART.byline, { font: 'mono', size: r(20 * u), color: c.muted, align: 'right', valign: 'center', upper: true, ls: 0.04 }),
      ...stack([...articleText(ctx, u, 'left'), { t: 'gap', h: 32 * u }, motif(ctx, 140 * u, 4 * u)], { x: Fr.x, y: Fr.y + lh + 30 * u, w: ctx.o === 'tall' ? Fr.w : Fr.w * 0.82, h: Fr.h - lh - 30 * u }, 'bottom')]); } },
  { id: 'centered', name: 'Centred', scheme: 'sea', build: (ctx) => { const u = artUnits(ctx), Fr = ctx.F, c = ctx.c; const sh = 64 * u;
    return one([bgRect(ctx), ...stack([{ t: 'el', h: sh, make: (x, y, w, h) => G('symbol', x + w / 2 - h / 2, y, h, 'symbol', 'reverse') }, { t: 'gap', h: 30 * u }, ...articleText(ctx, u, 'center'), { t: 'gap', h: 30 * u },
      { t: 'text', role: 'byline', text: ART.byline, size: 20 * u, font: 'mono', upper: true, ls: 0.04, color: c.muted, align: 'center' }], { x: Fr.x + Fr.w * 0.06, y: Fr.y, w: Fr.w * 0.88, h: Fr.h }, 'center')]); } },
  { id: 'split-image', name: 'Split with image', scheme: 'paper', build: (ctx) => { const u = artUnits(ctx), c = ctx.c, W = ctx.W, H = ctx.H, tall = ctx.o === 'tall' || ctx.o === 'square';
    const im = tall ? { x: 0, y: 0, w: W, h: H * 0.45 } : { x: W * 0.55, y: 0, w: W * 0.45, h: H };
    const tb = tall ? { x: ctx.pad, y: H * 0.45 + ctx.pad, w: W - ctx.pad * 2, h: H * 0.55 - ctx.pad * 2 } : { x: ctx.pad, y: ctx.pad, w: W * 0.55 - ctx.pad * 1.6, h: H - ctx.pad * 2 };
    const lh = 40 * u;
    return one([bgRect(ctx), I('image', im.x, im.y, im.w, im.h, { hatch: c.hatch, label: 'Article image' }), G('logo', tb.x, tb.y, lh, 'lockup', c.tone),
      ...stack([...articleText(ctx, u, 'left', 0.85), { t: 'gap', h: 24 * u }, { t: 'text', role: 'byline', text: ART.byline, size: 20 * u, font: 'mono', upper: true, ls: 0.04, color: c.muted }], { x: tb.x, y: tb.y + lh + 24 * u, w: tb.w, h: tb.h - lh - 24 * u }, 'bottom')]); } },
  { id: 'minimal-ink', name: 'Minimal ink', scheme: 'ink', build: (ctx) => { const u = artUnits(ctx), Fr = ctx.F, c = ctx.c; const sh = 72 * u;
    return one([bgRect(ctx), ...stack([{ t: 'text', role: 'title', text: ART.title, size: 100 * u, weight: 600, ls: -0.035, lh: 1.04, color: c.fg }], { x: Fr.x, y: Fr.y, w: Fr.w * 0.86, h: Fr.h - sh - 20 * u }, 'top'),
      G('symbol', Fr.x + Fr.w - sh, Fr.y + Fr.h - sh, sh, 'symbol', 'reverse'),
      T('overline', Fr.x, Fr.y + Fr.h - sh, Fr.w - sh - 20 * u, sh, ART.overline, { font: 'mono', size: r(22 * u), color: c.muted, upper: true, ls: 0.06, valign: 'bottom' })]); } },
  { id: 'record-lines', name: 'Record lines', scheme: 'paper', build: (ctx) => { const u = artUnits(ctx), Fr = ctx.F, c = ctx.c, lh = 44 * u;
    const ly = Fr.y + Fr.h - 70 * u;
    return one([bgRect(ctx), G('logo', Fr.x, Fr.y, lh, 'lockup', c.tone),
      ...stack(articleText(ctx, u, 'left'), { x: Fr.x, y: Fr.y + lh + 30 * u, w: ctx.o === 'tall' ? Fr.w : Fr.w * 0.8, h: ly - Fr.y - lh - 70 * u }, 'center'),
      L('line-suggested', Fr.x, ly, Fr.w * 0.3, { color: '#736D65', dash: 'dotted', thick: r(4 * u) }),
      L('line-proposed', Fr.x + Fr.w * 0.35, ly, Fr.w * 0.3, { color: '#3462B8', dash: 'dashed', thick: r(4 * u) }),
      L('line-agreed', Fr.x + Fr.w * 0.7, ly, Fr.w * 0.3, { color: '#285B57', dash: 'solid', thick: r(4 * u) }),
      T('byline', Fr.x, ly + 20 * u, Fr.w, 40 * u, ART.byline, { font: 'mono', size: r(20 * u), color: c.muted, upper: true, ls: 0.04 })]); } }
];

/* ---------- email ---------- */
function emailLayout(ctx: Ctx, d: EmailData): PageSpec[] {
  const { W, H, c, fmt } = ctx, p = 32, els = [bgRect(ctx)], id = fmt.id;
  const mono = (role: string, x: number, y: number, w: number, h: number, t: string, o?: ElStyle) => T(role, x, y, w, h, t, Object.assign({ font: 'mono', size: 12, color: c.muted, upper: true, ls: 0.05, lh: 1.3 }, o));
  if (id === 'email-header') { els.push(G('logo', p, H / 2 - 16, 32, 'lockup', c.tone), mono('meta', W / 2, H / 2 - 10, W / 2 - p, 20, d.meta, { align: 'right' }), L('rule', p, H - 24, W - p * 2, { color: c.line, thick: 1 })); return one(els); }
  if (id === 'email-footer') { els.push(G('symbol', p, p, 28, 'symbol', c.tone === 'default' ? 'default' : 'reverse'), T('address', p + 44, p, W - p * 2 - 44, 40, '[Organisation] · [Postal address]', { size: 13, color: c.muted, lh: 1.4 }),
    T('legal', p, H - p - 36, W - p * 2, 36, 'You are receiving this because [reason]. [Unsubscribe] · [Preferences]', { size: 12, color: c.muted, lh: 1.4 })); return one(els); }
  if (id === 'email-full') {
    els.push(G('logo', p, p, 28, 'lockup', c.tone), mono('meta', W / 2, p + 6, W / 2 - p, 18, d.meta, { align: 'right' }), I('hero-image', p, 88, W - p * 2, 250, { hatch: c.hatch, radius: 8, label: 'Hero image' }));
    els.push(...stack([{ t: 'text', role: 'overline', text: d.overline, size: 12, font: 'mono', upper: true, ls: 0.06, color: c.muted }, { t: 'gap', h: 12 },
      { t: 'text', role: 'title', text: d.title, size: 34, weight: 600, ls: -0.025, lh: 1.12, color: c.fg }, { t: 'gap', h: 14 }, { t: 'text', role: 'body', text: d.body, size: 17, color: c.fg, lh: 1.55 }, { t: 'gap', h: 24 }, cta(ctx, d.cta, 16)], { x: p, y: 370, w: W - p * 2, h: 420 }, 'top'));
    els.push(L('divider', p, 820, W - p * 2, { color: c.line, thick: 1 }));
    [0, 1].forEach(i => { const y = 852 + i * 170; els.push(I('story-image-' + i, p, y, 170, 130, { hatch: c.hatch, radius: 6, label: 'Image' }),
      T('story-title-' + i, p + 190, y, W - p * 2 - 190, 56, d.stories[i][0], { size: 19, weight: 600, lh: 1.25, color: c.fg }), T('story-body-' + i, p + 190, y + 60, W - p * 2 - 190, 70, d.stories[i][1], { size: 15, color: c.muted, lh: 1.45 })); });
    els.push(R('footer-bg', 0, 1220, W, H - 1220, { bg: c.surface }), G('symbol', p, 1252, 28, 'symbol', c.tone === 'default' ? 'default' : 'reverse'),
      T('address', p, 1300, W - p * 2, 40, '[Organisation] · [Postal address]', { size: 13, color: c.muted, lh: 1.4 }), T('legal', p, 1350, W - p * 2, 60, 'You are receiving this because [reason]. [Unsubscribe] · [Preferences]', { size: 12, color: c.muted, lh: 1.45 }));
    return one(els);
  }
  if (id === 'email-section') { els.push(I('image', p, p, 220, H - p * 2, { hatch: c.hatch, radius: 8 }));
    els.push(...stack([{ t: 'text', role: 'overline', text: d.overline, size: 12, font: 'mono', upper: true, ls: 0.06, color: c.muted }, { t: 'gap', h: 10 }, { t: 'text', role: 'title', text: d.stories[0][0], size: 22, weight: 600, lh: 1.2, color: c.fg }, { t: 'gap', h: 10 },
      { t: 'text', role: 'body', text: d.stories[0][1], size: 15, color: c.muted, lh: 1.45 }, { t: 'gap', h: 18 }, cta(ctx, 'Read more', 14)], { x: p + 244, y: p, w: W - p * 2 - 244, h: H - p * 2 }, 'center')); return one(els); }
  els.push(...stack([{ t: 'text', role: 'overline', text: d.overline, size: 12, font: 'mono', upper: true, ls: 0.06, color: c.muted }, { t: 'gap', h: 12 }, { t: 'text', role: 'title', text: d.title, size: 32, weight: 600, ls: -0.025, lh: 1.12, color: c.fg }, { t: 'gap', h: 20 }, cta(ctx, d.cta, 15)], { x: p, y: p, w: W - p * 2, h: H - p * 2 }, 'center'));
  return one(els);
}
const EM = (id: string, name: string, scheme: SchemeId, d: EmailData): Template => ({ id, name, scheme, build: (ctx) => emailLayout(ctx, d) });
const EMAIL: Template[] = [
  EM('announcement', 'Announcement', 'paper', { meta: '[Date]', overline: 'Announcement', title: 'Proposals now carry straight through to the agreed scope', body: 'Every proposal you send becomes the starting record for requests, change decisions and invoicing.', cta: 'See what changed', stories: [['Write scope as items, not paragraphs', 'Each item gets its own revision rounds.'], ['Price a change before it starts', 'A calmer conversation than an invoice afterwards.']] }),
  EM('product-update', 'Product update', 'paper', { meta: 'Product update · [Month]', overline: 'What\'s new', title: 'Change orders, now clearer for clients', body: 'Clients see the agreed figure and the proposed change side by side before they decide.', cta: 'Read the update', stories: [['[Update headline]', '[One-line summary.]'], ['[Update headline]', '[One-line summary.]']] }),
  EM('event-invite', 'Event invitation', 'sea', { meta: '[Date] · [Time]', overline: 'Live session', title: 'Running revision rounds clients understand', body: 'Online · [Platform] · 45 minutes. Bring a recent proposal.', cta: 'Register', stories: [['What you will learn', '[Three outcomes, in one line.]'], ['Who it is for', 'Agency owners and account leads.']] }),
  EM('newsletter', 'Newsletter digest', 'paper', { meta: 'Issue [n] · [Date]', overline: 'This issue', title: '[Featured story headline]', body: '[Two-sentence summary of the featured story.]', cta: 'Read the article', stories: [['[Article headline]', '[One-line summary.]'], ['[Article headline]', '[One-line summary.]']] })
];

/* ---------- web ---------- */
function webLayout(ctx: Ctx, d0: Partial<WebData>): PageSpec[] {
  const d = Object.assign({ overline: 'For independent agencies', title: 'Keep every request connected to the agreed scope', body: 'One commercial record from proposal to invoice.', cta: 'Create proposal', navCta: 'Create proposal' }, d0);
  const { W, H, c, fmt } = ctx, tall = W < 700, els = [bgRect(ctx)], u = tall ? W / 390 : W / 1440, p = Math.round((tall ? 20 : 80) * u);
  if (fmt.id === 'web-cta' || d.kind === 'cta') {
    els.push(...stack([{ t: 'text', role: 'title', text: d.title, size: (tall ? 34 : 56) * u, weight: 600, ls: -0.03, lh: 1.08, color: c.fg, align: 'center' }, { t: 'gap', h: 18 * u }, { t: 'text', role: 'body', text: d.body, size: (tall ? 17 : 22) * u, color: c.muted, lh: 1.45, align: 'center' }, { t: 'gap', h: 32 * u },
      { t: 'el', h: 64 * u, make: (x, y, w, h, k) => { const s = (tall ? 17 : 20) * u * k, bw = d.cta.length * s * 0.6 + s * 2.6; return T('cta', x + (w - bw) / 2, y, bw, s * 2.6, d.cta, { size: Math.round(s), weight: 500, color: c.ctaFg, bg: c.ctaBg, radius: 8, align: 'center', valign: 'center', lh: 1 }); } }], { x: p, y: p, w: W - p * 2, h: H - p * 2 }, 'center'));
    return one(els);
  }
  const navH = (tall ? 56 : 72) * u;
  els.push(G('logo', p, navH / 2 - 14 * u, 28 * u, 'lockup', c.tone), L('nav-rule', 0, navH, W, { color: c.line, thick: 1 }));
  if (!tall) { ['Product', 'Pricing', 'Resources'].forEach((n, i) => els.push(T('nav-' + i, W - p - 560 * u + i * 130 * u, navH / 2 - 12 * u, 120 * u, 24 * u, n, { size: Math.round(15 * u), color: c.fg, valign: 'center' })));
    els.push(T('nav-cta', W - p - 160 * u, navH / 2 - 20 * u, 160 * u, 40 * u, d.navCta, { size: Math.round(15 * u), weight: 500, color: c.ctaFg, bg: c.ctaBg, radius: 6, align: 'center', valign: 'center', lh: 1 })); }
  const top = navH + (tall ? 32 : 72) * u;
  if (fmt.id === 'web-feature' || d.kind === 'feature') {
    const head = stack([{ t: 'text', role: 'overline', text: d.overline, size: 14 * u, font: 'mono', upper: true, ls: 0.06, color: c.muted }, { t: 'gap', h: 14 * u }, { t: 'text', role: 'title', text: d.title, size: (tall ? 30 : 48) * u, weight: 600, ls: -0.03, lh: 1.1, color: c.fg, w: tall ? undefined : 900 * u }], { x: p, y: top, w: W - p * 2, h: (tall ? 200 : 220) * u }, 'top');
    els.push(...head); const hb = head.reduce((m, e) => Math.max(m, e.y + e.h), top) + (tall ? 28 : 56) * u;
    const gw = 40 * u, cw = tall ? W - p * 2 : (W - p * 2 - gw * 2) / 3, ch = tall ? (H - hb - p) / 3 : H - hb - p;
    (d.cols || WEB_COLS).forEach((col, i) => { const x = tall ? p : p + i * (cw + gw), y = tall ? hb + i * ch : hb;
      els.push(L('col-line-' + i, x, y, Math.min(cw, 120 * u), { color: c.accent, dash: col[0] as ElStyle['dash'], thick: Math.max(2, Math.round(4 * u)) }),
        T('col-title-' + i, x, y + 24 * u, cw, 40 * u, col[1], { size: Math.round((tall ? 19 : 24) * u), weight: 600, lh: 1.25, color: c.fg }),
        T('col-body-' + i, x, y + (tall ? 58 : 72) * u, cw, ch - 80 * u, col[2], { size: Math.round((tall ? 15 : 18) * u), color: c.muted, lh: 1.5 })); });
    return one(els);
  }
  const textW = tall ? W - p * 2 : (W - p * 2) * 0.5;
  const imgBox = tall ? { x: p, y: H - p - 300 * u, w: W - p * 2, h: 300 * u } : { x: p + textW + 64 * u, y: top, w: W - p * 2 - textW - 64 * u, h: H - top - p };
  els.push(I('hero-image', imgBox.x, imgBox.y, imgBox.w, imgBox.h, { hatch: c.hatch, radius: 12, label: "Agency's own work" }));
  els.push(...stack([{ t: 'text', role: 'overline', text: d.overline, size: 14 * u, font: 'mono', upper: true, ls: 0.06, color: c.muted }, { t: 'gap', h: 18 * u },
    { t: 'text', role: 'title', text: d.title, size: (tall ? 36 : 64) * u, weight: 600, ls: -0.035, lh: 1.04, color: c.fg }, { t: 'gap', h: 20 * u }, { t: 'text', role: 'body', text: d.body, size: (tall ? 17 : 21) * u, color: c.muted, lh: 1.45 }, { t: 'gap', h: 32 * u },
    cta(ctx, d.cta, (tall ? 16 : 18) * u)], { x: p, y: top, w: textW, h: (tall ? imgBox.y - 24 * u : H - p) - top }, tall ? 'top' : 'center'));
  return one(els);
}
const WEB_COLS = [['dotted', 'Suggested', 'Hali flags a request that may fall outside the agreed scope. A person decides.'], ['dashed', 'Proposed', 'The agency prices a change before the work starts.'], ['solid', 'Recorded', 'The client approves and it is recorded.']];
const WB = (id: string, name: string, scheme: SchemeId, d: Partial<WebData>): Template => ({ id, name, scheme, build: (ctx) => webLayout(ctx, d) });
const WEB: Template[] = [
  WB('hero', 'Landing hero', 'paper', { overline: 'For independent agencies', title: 'Agreed scope, requests and approvals in one record', body: 'Price changes before the work starts, and make sure approved extras are delivered and invoiced.', cta: 'Create proposal', navCta: 'Create proposal' }),
  WB('feature', 'Feature section', 'paper', { kind: 'feature', overline: 'How it works', title: 'Certainty you can see in the line itself', navCta: 'Create proposal', cols: [['dotted', 'Suggested', 'Hali flags a request that may fall outside the agreed scope. A person decides.'], ['dashed', 'Proposed', 'The agency prices a change. The client sees the agreed figure and the proposed one side by side.'], ['solid', 'Recorded', 'The client approves and it is recorded — then delivered, then invoiced.']] }),
  WB('cta-band', 'CTA band', 'sea', { kind: 'cta', title: 'Keep every request connected to the agreed scope', body: 'One commercial record from proposal to invoice.', cta: 'Create proposal', navCta: 'Create proposal' }),
  WB('hero-ink', 'Landing hero · Ink', 'ink', { overline: 'Proposal to invoice', title: 'Decisions, not disputes', body: 'A calmer way to handle extra work with clients.', cta: 'See how it works', navCta: 'Create proposal' })
];

/* Helpers handed to the celebration library (kept in its own file). */
const CELEBRATIONS: Template[] = celebrationTemplates({ T, R, L, G, stack, chrome, bgRect, recordRows, motif, one, r, MONTHS });

const BLANK: Template[] = [{ id: 'blank', name: 'Blank with logo', scheme: 'paper', build: (ctx) => one([bgRect(ctx), G('logo', ctx.F.x, ctx.F.y, Math.max(16, 46 * ctx.u), ctx.W / ctx.H >= 3 ? 'symbol' : 'lockup', ctx.c.tone)]) }];

export const CATEGORIES: Category[] = [
  { id: 'social', name: 'Social posts', desc: 'Instagram, TikTok, X, Facebook, LinkedIn, Threads, Pinterest and more', formats: POST_FORMATS, templates: SOCIAL },
  { id: 'engagement', name: 'Engagement posts', desc: 'Polls, questions and prompts', formats: POST_FORMATS, templates: ENGAGEMENT },
  { id: 'celebrations', name: 'Celebrations & holidays', desc: 'New month, holidays, national and religious days', formats: POST_FORMATS, templates: CELEBRATIONS },
  { id: 'carousel', name: 'Carousels', desc: 'Multi-slide posts', formats: POST_FORMATS_STILL, templates: CAROUSEL },
  { id: 'article', name: 'Article & editorial', desc: 'X, LinkedIn, Medium, web, blog, newsletter', formats: ['x-article', 'li-article', 'li-post', 'medium', 'article-hero', 'blog-og', 'newsletter-promo', 'pin'], templates: ARTICLE },
  { id: 'banners', name: 'Banners & covers', desc: 'Profiles, channels, events, communities', formats: ['x-header', 'li-personal', 'li-company', 'fb-cover', 'yt-channel', 'twitch', 'podcast', 'newsletter-header', 'web-banner', 'event-banner', 'community-banner'], templates: BANNERS },
  { id: 'ads', name: 'Advertising', desc: 'Social and display ad sizes', formats: ['sq', 'portrait', 'story', 'ad-land', 'mpu', 'leader', 'sky', 'halfpage', 'mobile'], templates: ADS },
  { id: 'avatar', name: 'Avatars', desc: '400 × 400 profile images', formats: ['avatar'], templates: AVATARS },
  { id: 'email', name: 'Email graphics', desc: 'Full email, header, hero, section, footer', formats: ['email-full', 'email-header', 'email-hero', 'email-section', 'email-footer'], templates: EMAIL },
  { id: 'web', name: 'Web graphics', desc: 'Hero, feature, CTA band, mobile', formats: ['web-hero', 'web-feature', 'web-cta', 'web-mobile'], templates: WEB },
  { id: 'blank', name: 'Blank canvas', desc: 'Any supported size', formats: FORMATS.map((f) => f.id), templates: BLANK },
];
export const CAT: Record<string, Category> = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]));

export function findTemplate(catId: string, tplId: string): Template {
  const cat = CAT[catId];
  return cat.templates.find((t) => t.id === tplId) || cat.templates[0];
}

export function buildPages(catId: string, tplId: string, fmtId: string, scheme?: string, vars?: TemplateVars): Page[] {
  const tpl = findTemplate(catId, tplId);
  const ctx = ctxFor(FMT[fmtId], scheme || tpl.scheme, vars || defaultVars(tpl.vars));
  return tpl.build(ctx).map((p) => ({ id: uid(), key: p.key, name: p.name, els: p.els }));
}

export function newDoc(catId: string, tplId: string, fmtId: string, scheme?: SchemeId, opts: { vars?: TemplateVars; now?: Date } = {}): Design {
  const cat = CAT[catId], tpl = findTemplate(catId, tplId);
  const f = FMT[fmtId] && cat.formats.includes(fmtId) ? FMT[fmtId] : FMT[cat.formats[0]];
  const sc = scheme || tpl.scheme;
  const vars = opts.vars || defaultVars(tpl.vars, opts.now);
  const d: Design = { id: 'd' + Date.now().toString(36), v: 1, name: tpl.name + ' — ' + f.name, cat: catId, tpl: tpl.id, fmt: f.id, scheme: sc, w: f.w, h: f.h, pages: buildPages(catId, tpl.id, f.id, sc, vars), updated: Date.now() };
  if (Object.keys(vars).length) d.vars = vars;
  return d;
}

/* Re-flow an edited doc to a new format/scheme: regenerate layout, then re-apply user overrides by role. */
const STYLE_KEYS_KEEP: (keyof ElStyle)[] = ['color', 'bg', 'weight', 'font', 'align', 'valign', 'italic', 'upper', 'ls', 'lh', 'border', 'radius', 'opacity', 'fit', 'dash', 'hatch', 'pad', 'thick', 'overlay'];
const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v));

export function reflow(doc: Design, fmtId: string, scheme: SchemeId): Design {
  const f = FMT[fmtId];
  const sx = f.w / doc.w, sy = f.h / doc.h, sk = Math.sqrt(sx * sy);
  const fresh = buildPages(doc.cat, doc.tpl, fmtId, scheme, doc.vars);
  const freshByKey = Object.fromEntries(fresh.map((p) => [p.key, p]));
  const pages = doc.pages.map((op): Page => {
    const np = op.key && freshByKey[op.key] && !op.custom ? clone(freshByKey[op.key]) : null;
    const scaleEl = (e: El): El => {
      const n = clone(e);
      n.x = r(e.x * sx); n.y = r(e.y * sy); n.w = r(e.w * sx); n.h = r(e.h * sy);
      if (n.s && n.s.size) n.s.size = r(n.s.size * sk);
      if (n.s && n.s.thick && n.type === 'line') { n.s.thick = Math.max(1, r(n.s.thick * sk)); n.h = n.s.thick; }
      n.id = uid();
      return n;
    };
    if (!np) return { ...op, id: uid(), els: op.els.map(scaleEl) };
    const freshRoles: Record<string, El | null> = Object.fromEntries(np.els.map((e) => [e.role, e]));
    const out: El[] = [];
    op.els.forEach((oe) => {
      const ne = freshRoles[oe.role];
      if (oe.custom || !ne) { if (oe.custom) out.push(scaleEl(oe)); return; }
      const ov = oe.ov || {};
      if (ov.text) ne.text = oe.text;
      if (oe.src) ne.src = oe.src;
      if (ov.logo) { ne.logo = oe.logo; ne.tone = oe.tone; }
      if (ov.hidden) ne.hidden = oe.hidden;
      if (oe.rot) ne.rot = oe.rot;
      if (ov.geom) { ne.x = r(oe.x * sx); ne.y = r(oe.y * sy); ne.w = r(oe.w * sx); ne.h = r(oe.h * sy); }
      if (ov.size && ne.s && oe.s.size) ne.s.size = r(oe.s.size * sk);
      STYLE_KEYS_KEEP.forEach((k) => { if (ov[k] && ne.s) (ne.s as Record<string, unknown>)[k] = oe.s[k]; });
      ne.ov = ov;
      out.push(ne);
      freshRoles[oe.role] = null;
    });
    // template elements the user deleted stay deleted; order follows the edited doc
    return { id: uid(), key: op.key, name: op.name, bg: op.bg, els: out };
  });
  return { ...doc, fmt: f.id, w: f.w, h: f.h, scheme, pages, name: doc.name.replace(/ — .*$/, '') + ' — ' + f.name, updated: Date.now() };
}
