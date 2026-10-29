/* Hali Brand Studio — celebration and holiday templates.
   On-brand and type-led: a typographic greeting, the record-line motif and the brand schemes only (the playbook rules
   out illustration, gradients and decorative colour). Copy follows the voice rules: sentence case, no emoji, no
   exclamation marks, [brackets] for facts the brand supplies, and remembrance days never say "Happy". */
import type { Ctx, El, ElStyle, LogoVariant, PageSpec, SchemeId, Template } from './types';
import type { Item } from './index';

/** Layout helpers handed over by the template engine (avoids a circular import). */
export interface CelebrationHelpers {
  T(role: string, x: number, y: number, w: number, h: number, text: string, s?: ElStyle): El;
  R(role: string, x: number, y: number, w: number, h: number, s?: ElStyle): El;
  L(role: string, x: number, y: number, w: number, s?: ElStyle): El;
  G(role: string, x: number, y: number, h: number, variant: LogoVariant, tone: string, w?: number): El;
  stack(items: Item[], box: { x: number; y: number; w: number; h: number }, valign?: string): El[];
  chrome(ctx: Ctx, overline: string, footer: string): { els: El[]; box: { x: number; y: number; w: number; h: number } };
  bgRect(ctx: Ctx): El;
  recordRows(ctx: Ctx, rows: string[][], size: number): Item[];
  motif(ctx: Ctx, w: number, t: number): Item;
  one(els: El[]): PageSpec[];
  r(n: number): number;
  MONTHS: string[];
}

export type CelebrationLayout = 'greeting' | 'numeral' | 'statement' | 'solemn' | 'stacked' | 'month';

export interface Celebration {
  id: string;
  name: string;
  group: string;
  scheme: SchemeId;
  layout: CelebrationLayout;
  /** Small mono line above the greeting. */
  kicker?: string;
  /** Main greeting. For `stacked`, the first line; `greeting2` is the second. */
  greeting: string;
  greeting2?: string;
  /** Large date numeral for `numeral` ('25', '1'); `{year}` reads the template variable. */
  numeral?: string;
  /** Supporting line under the greeting. */
  line: string;
  /** Date shown top-right (mono). */
  date: string;
  /** Record rows for `statement` ([dash, text]). */
  rows?: string[][];
  vars?: ('month' | 'year')[];
}

export const CELEBRATION_GROUPS = ['Monthly & New Year', 'Global days', 'Religious & cultural', 'Nigeria', 'United States', 'United Kingdom', 'Generic'];
const SIGN = 'From all of us at [Agency name]';

const M = 'Monthly & New Year', GL = 'Global days', RC = 'Religious & cultural', NG = 'Nigeria', US = 'United States', UK = 'United Kingdom', GE = 'Generic';

export const CELEBRATIONS_DATA: Celebration[] = [
  // Monthly and New Year
  { id: 'cel-new-month', name: 'Happy new month', group: M, scheme: 'paper', layout: 'month', kicker: 'Happy new month', greeting: 'Happy new month', line: 'Wishing you a clear, well-planned month ahead.', date: '', vars: ['month', 'year'] },
  { id: 'cel-new-years-eve', name: "New Year's Eve", group: M, scheme: 'ink', layout: 'numeral', numeral: '31', kicker: 'December', greeting: 'The last page of the year', line: 'Thank you for working with us this year.', date: '31 December' },
  { id: 'cel-new-year', name: 'Happy New Year', group: M, scheme: 'sea', layout: 'numeral', numeral: '{year}', kicker: 'A new year', greeting: 'Happy New Year', line: 'Here is to clear agreements and good work together.', date: '1 January', vars: ['year'] },
  { id: 'cel-weekend', name: 'Happy weekend', group: M, scheme: 'paper', layout: 'greeting', kicker: 'Friday', greeting: 'Happy weekend', line: 'Rest well. The record will be here on Monday.', date: '[Date]' },
  // Global days
  { id: 'cel-valentines', name: "Valentine's Day", group: GL, scheme: 'paper', layout: 'stacked', greeting: 'Happy', greeting2: "Valentine's Day", line: 'To the clients and collaborators we love working with.', date: '14 February' },
  { id: 'cel-womens-day', name: "International Women's Day", group: GL, scheme: 'sea', layout: 'statement', kicker: "International Women's Day", greeting: 'Celebrating the women who build, lead and create', line: '[A short note on the women in your team or community.]', date: '8 March' },
  { id: 'cel-mothers-day', name: "Mother's Day", group: GL, scheme: 'paper', layout: 'greeting', kicker: "Mother's Day", greeting: "Happy Mother's Day", line: 'To every mother, and everyone who mothers.', date: '[Date]' },
  { id: 'cel-fathers-day', name: "Father's Day", group: GL, scheme: 'paper', layout: 'greeting', kicker: "Father's Day", greeting: "Happy Father's Day", line: 'To every father and father figure.', date: '[Date]' },
  { id: 'cel-workers-day', name: "Workers' Day", group: GL, scheme: 'sea', layout: 'numeral', numeral: '1', kicker: 'May', greeting: "Happy Workers' Day", line: 'To everyone whose work keeps things moving.', date: '1 May' },
  { id: 'cel-earth-day', name: 'Earth Day', group: GL, scheme: 'sea', layout: 'statement', kicker: 'Earth Day', greeting: 'One planet. Plan the work, waste less.', line: '[How your studio is reducing its footprint.]', date: '22 April' },
  { id: 'cel-creativity-day', name: 'World Creativity and Innovation Day', group: GL, scheme: 'paper', layout: 'statement', kicker: 'World Creativity and Innovation Day', greeting: 'Good ideas deserve a clear brief', line: 'Celebrating the creative work that moves people.', date: '21 April', rows: [['dotted', 'An idea'], ['dashed', 'A proposal'], ['solid', 'The work']] },
  { id: 'cel-friendship-day', name: 'International Day of Friendship', group: GL, scheme: 'paper', layout: 'greeting', kicker: 'International Day of Friendship', greeting: 'Happy Friendship Day', line: 'Good work is better with good people.', date: '30 July' },
  { id: 'cel-teachers-day', name: "World Teachers' Day", group: GL, scheme: 'paper', layout: 'greeting', kicker: "World Teachers' Day", greeting: "Happy Teachers' Day", line: 'Thank you to the people who taught us how to learn.', date: '5 October' },
  { id: 'cel-halloween', name: 'Halloween', group: GL, scheme: 'ink', layout: 'stacked', greeting: 'Happy', greeting2: 'Halloween', line: 'No scary surprises. Just a clear scope.', date: '31 October' },
  { id: 'cel-seasons-greetings', name: "Season's greetings", group: GL, scheme: 'sea', layout: 'stacked', greeting: "Season's", greeting2: 'greetings', line: 'Wishing you rest, warmth and a good year ahead.', date: 'December' },
  // Religious and cultural
  { id: 'cel-ramadan', name: 'Ramadan Kareem', group: RC, scheme: 'sea', layout: 'stacked', kicker: 'Ramadan', greeting: 'Ramadan', greeting2: 'Kareem', line: 'Wishing you a peaceful and blessed month.', date: '[Date]' },
  { id: 'cel-eid-fitr', name: 'Eid al-Fitr', group: RC, scheme: 'sea', layout: 'stacked', kicker: 'Eid al-Fitr', greeting: 'Eid', greeting2: 'Mubarak', line: 'Wishing you and your family joy and peace.', date: '[Date]' },
  { id: 'cel-eid-adha', name: 'Eid al-Adha', group: RC, scheme: 'paper', layout: 'stacked', kicker: 'Eid al-Adha', greeting: 'Eid al-Adha', greeting2: 'Mubarak', line: 'Wishing you and your loved ones a blessed celebration.', date: '[Date]' },
  { id: 'cel-good-friday', name: 'Good Friday', group: RC, scheme: 'ink', layout: 'solemn', kicker: 'Good Friday', greeting: 'Good Friday', line: 'A day of quiet reflection.', date: '[Date]' },
  { id: 'cel-easter', name: 'Happy Easter', group: RC, scheme: 'paper', layout: 'greeting', kicker: 'Easter', greeting: 'Happy Easter', line: 'Wishing you hope and new beginnings.', date: '[Date]' },
  { id: 'cel-holi', name: 'Holi', group: RC, scheme: 'paper', layout: 'stacked', kicker: 'Holi', greeting: 'Happy', greeting2: 'Holi', line: 'Wishing you a bright and joyful festival of colours.', date: '[Date]' },
  { id: 'cel-diwali', name: 'Diwali', group: RC, scheme: 'ink', layout: 'stacked', kicker: 'Diwali', greeting: 'Happy', greeting2: 'Diwali', line: 'May the festival of lights bring you joy and prosperity.', date: '[Date]' },
  { id: 'cel-rosh-hashanah', name: 'Rosh Hashanah', group: RC, scheme: 'paper', layout: 'stacked', kicker: 'Rosh Hashanah', greeting: 'Shana', greeting2: 'Tova', line: 'Wishing you a good and sweet new year.', date: '[Date]' },
  { id: 'cel-hanukkah', name: 'Hanukkah', group: RC, scheme: 'ink', layout: 'stacked', kicker: 'Hanukkah', greeting: 'Happy', greeting2: 'Hanukkah', line: 'Wishing you eight nights of light.', date: '[Date]' },
  { id: 'cel-lunar-new-year', name: 'Lunar New Year', group: RC, scheme: 'paper', layout: 'stacked', kicker: 'Lunar New Year', greeting: 'Happy', greeting2: 'Lunar New Year', line: 'Wishing you health, luck and prosperity in the year ahead.', date: '[Date]' },
  { id: 'cel-christmas-eve', name: 'Christmas Eve', group: RC, scheme: 'ink', layout: 'greeting', kicker: 'Christmas Eve', greeting: 'Christmas Eve', line: 'Wishing you a calm evening with the people you love.', date: '24 December' },
  { id: 'cel-christmas', name: 'Merry Christmas', group: RC, scheme: 'sea', layout: 'stacked', kicker: 'Christmas', greeting: 'Merry', greeting2: 'Christmas', line: 'Thank you for a year of good work together.', date: '25 December' },
  { id: 'cel-boxing-day', name: 'Boxing Day', group: RC, scheme: 'paper', layout: 'numeral', numeral: '26', kicker: 'December', greeting: 'Happy Boxing Day', line: 'Rest, leftovers and no new requests.', date: '26 December' },
  { id: 'cel-kwanzaa', name: 'Kwanzaa', group: RC, scheme: 'paper', layout: 'stacked', kicker: 'Kwanzaa', greeting: 'Happy', greeting2: 'Kwanzaa', line: 'Celebrating family, community and culture.', date: '26 December – 1 January' },
  // Nigeria
  { id: 'cel-ng-independence', name: 'Nigeria Independence Day', group: NG, scheme: 'sea', layout: 'numeral', numeral: '1', kicker: 'October', greeting: 'Happy Independence Day, Nigeria', line: 'Celebrating [n] years of independence.', date: '1 October' },
  { id: 'cel-ng-democracy', name: 'Nigeria Democracy Day', group: NG, scheme: 'paper', layout: 'numeral', numeral: '12', kicker: 'June', greeting: 'Happy Democracy Day', line: 'Celebrating democracy in Nigeria.', date: '12 June' },
  { id: 'cel-ng-children', name: "Nigeria Children's Day", group: NG, scheme: 'paper', layout: 'greeting', kicker: "Children's Day", greeting: "Happy Children's Day", line: 'To the young people who will build what comes next.', date: '27 May' },
  { id: 'cel-ng-sallah', name: 'Happy Sallah', group: NG, scheme: 'sea', layout: 'stacked', kicker: 'Happy Sallah', greeting: 'Barka da', greeting2: 'Sallah', line: 'Wishing you and your family a joyful celebration.', date: '[Date]' },
  { id: 'cel-ng-armed-forces', name: 'Armed Forces Remembrance Day', group: NG, scheme: 'ink', layout: 'solemn', kicker: 'Armed Forces Remembrance Day', greeting: 'We remember those who served', line: 'Honouring the fallen and their families.', date: '15 January' },
  // United States
  { id: 'cel-us-independence', name: 'US Independence Day', group: US, scheme: 'paper', layout: 'numeral', numeral: '4', kicker: 'July', greeting: 'Happy Independence Day', line: 'Wishing you a safe and happy Fourth of July.', date: '4 July' },
  { id: 'cel-us-juneteenth', name: 'Juneteenth', group: US, scheme: 'ink', layout: 'statement', kicker: 'Juneteenth', greeting: 'Celebrating freedom', line: 'Honouring Juneteenth and the history it marks.', date: '19 June' },
  { id: 'cel-us-mlk', name: 'Martin Luther King Jr. Day', group: US, scheme: 'paper', layout: 'statement', kicker: 'Martin Luther King Jr. Day', greeting: 'A day of service', line: 'Honouring the life and legacy of Dr. Martin Luther King Jr.', date: '[Date]' },
  { id: 'cel-us-presidents', name: "Presidents' Day", group: US, scheme: 'paper', layout: 'greeting', kicker: "Presidents' Day", greeting: "Presidents' Day", line: '[Opening hours for the holiday.]', date: '[Date]' },
  { id: 'cel-us-memorial', name: 'Memorial Day', group: US, scheme: 'ink', layout: 'solemn', kicker: 'Memorial Day', greeting: 'Remembering those who gave everything', line: 'We honour their service and sacrifice.', date: '[Date]' },
  { id: 'cel-us-labor', name: 'Labor Day', group: US, scheme: 'sea', layout: 'greeting', kicker: 'Labor Day', greeting: 'Happy Labor Day', line: 'Thank you to everyone whose work moves us forward.', date: '[Date]' },
  { id: 'cel-us-veterans', name: 'Veterans Day', group: US, scheme: 'ink', layout: 'solemn', kicker: 'Veterans Day', greeting: 'Thank you for your service', line: 'Honouring all who served.', date: '11 November' },
  { id: 'cel-us-thanksgiving', name: 'Thanksgiving', group: US, scheme: 'paper', layout: 'stacked', kicker: 'Thanksgiving', greeting: 'Happy', greeting2: 'Thanksgiving', line: 'Grateful for our clients, our team and good work together.', date: '[Date]' },
  { id: 'cel-us-bhm', name: 'Black History Month (US)', group: US, scheme: 'ink', layout: 'statement', kicker: 'Black History Month', greeting: 'Honouring Black history, every day', line: '[A note on the people and stories your team is celebrating.]', date: 'February' },
  // United Kingdom
  { id: 'cel-uk-bank-holiday', name: 'Bank holiday weekend', group: UK, scheme: 'paper', layout: 'greeting', kicker: 'Bank holiday', greeting: 'Enjoy the long weekend', line: '[The office is closed on Monday. We are back on Tuesday.]', date: '[Date]' },
  { id: 'cel-uk-st-george', name: "St George's Day", group: UK, scheme: 'paper', layout: 'greeting', kicker: "St George's Day", greeting: "Happy St George's Day", line: "Celebrating England's patron saint.", date: '23 April' },
  { id: 'cel-uk-st-andrew', name: "St Andrew's Day", group: UK, scheme: 'sea', layout: 'greeting', kicker: "St Andrew's Day", greeting: "Happy St Andrew's Day", line: "Celebrating Scotland's patron saint.", date: '30 November' },
  { id: 'cel-uk-st-david', name: "St David's Day", group: UK, scheme: 'paper', layout: 'greeting', kicker: "St David's Day", greeting: "Happy St David's Day", line: 'Dydd Gŵyl Dewi Hapus.', date: '1 March' },
  { id: 'cel-uk-st-patrick', name: "St Patrick's Day", group: UK, scheme: 'sea', layout: 'greeting', kicker: "St Patrick's Day", greeting: "Happy St Patrick's Day", line: "Celebrating Ireland's patron saint.", date: '17 March' },
  { id: 'cel-uk-bonfire', name: 'Bonfire Night', group: UK, scheme: 'ink', layout: 'numeral', numeral: '5', kicker: 'November', greeting: 'Bonfire Night', line: 'Remember, remember. Stay safe tonight.', date: '5 November' },
  { id: 'cel-uk-remembrance', name: 'Remembrance Sunday', group: UK, scheme: 'ink', layout: 'solemn', kicker: 'Remembrance Sunday', greeting: 'We will remember them', line: 'Honouring all who served and sacrificed.', date: '[Date]' },
  { id: 'cel-uk-bhm', name: 'Black History Month (UK)', group: UK, scheme: 'ink', layout: 'statement', kicker: 'Black History Month', greeting: 'Honouring Black history, every day', line: '[A note on the people and stories your team is celebrating.]', date: 'October' },
  // Generic
  { id: 'cel-national-day', name: 'National day', group: GE, scheme: 'sea', layout: 'greeting', kicker: '[Country]', greeting: 'Happy [National] Day', line: 'Celebrating [Country] today.', date: '[Date]' },
  { id: 'cel-milestone', name: 'Anniversary or milestone', group: GE, scheme: 'paper', layout: 'numeral', numeral: '[n]', kicker: 'Years', greeting: 'Thank you for [n] years', line: 'To every client and collaborator who made it possible.', date: '[Date]' },
];

export function celebrationTemplates(h: CelebrationHelpers): Template[] {
  const { L, stack, chrome, bgRect, one, r } = h;

  /** Three short record lines — dotted, dashed, solid — the brand's only graphic device. */
  const trio = (ctx: Ctx, align: 'left' | 'center'): Item => {
    const u = ctx.u, len = 110 * u, gp = 22 * u, t = Math.max(2, r(5 * u));
    return {
      t: 'el', h: 40 * u, make: (x, y, w, hh, k) => {
        const total = (len * 3 + gp * 2) * k, x0 = align === 'center' ? x + (w - total) / 2 : x, yy = y + hh / 2 - t / 2;
        return (['dotted', 'dashed', 'solid'] as const).map((dash, i) => L('mark-' + (i + 1), x0 + i * (len + gp) * k, yy, len * k, { color: ctx.c.accent, dash, thick: t }));
      },
    };
  };
  /**
   * Display text sized so its longest word always fits on one line (no mid-word breaks), with a conservative
   * width for the height estimate (bold display glyphs are wider than the engine's average).
   */
  const display = (ctx: Ctx, role: string, text: string, size: number, more: Partial<Item>, w = ctx.F.w): Item => {
    const longest = Math.max(1, ...text.split(/\s+/).map((x) => x.length));
    const bold = (more.weight || 400) >= 600;
    return { t: 'text', role, text, size: Math.min(size * ctx.u, w / (longest * (bold ? 0.66 : 0.6))), wInset: w * (bold ? 0.16 : 0.1), ...more };
  };
  const kick = (ctx: Ctx, text: string, align: ElStyle['align']): Item => ({ t: 'text', role: 'kicker', text, size: 26 * ctx.u, font: 'mono', weight: 500, upper: true, ls: 0.08, color: ctx.c.muted, align, lh: 1.2 });
  const line = (ctx: Ctx, text: string, align: ElStyle['align'], size = 36): Item => ({ t: 'text', role: 'line', text, size: size * ctx.u, color: ctx.c.muted, align, lh: 1.35 });
  const gap = (ctx: Ctx, n: number): Item => ({ t: 'gap', h: n * ctx.u });
  const page = (ctx: Ctx, d: Celebration, items: Item[], valign = 'center') => {
    const ch = chrome(ctx, d.date, SIGN);
    return one([bgRect(ctx), ...ch.els, ...stack(items, ch.box, valign)]);
  };
  const wide = (ctx: Ctx) => ctx.o === 'wide' || ctx.o === 'land';

  const LAYOUTS: Record<CelebrationLayout, (ctx: Ctx, d: Celebration) => PageSpec[]> = {
    greeting: (ctx, d) => page(ctx, d, [
      ...(d.kicker ? [kick(ctx, d.kicker, 'center'), gap(ctx, 28)] : []),
      display(ctx, 'greeting', d.greeting, 132, { weight: 600, ls: -0.035, lh: 1.02, color: ctx.c.fg, align: 'center' }),
      gap(ctx, 32), line(ctx, d.line, 'center'), gap(ctx, 48), trio(ctx, 'center'),
    ]),
    stacked: (ctx, d) => page(ctx, d, [
      ...(d.kicker && d.kicker !== d.greeting ? [kick(ctx, d.kicker, 'center'), gap(ctx, 24)] : []),
      display(ctx, 'greeting', d.greeting, 104, { weight: 400, ls: -0.03, lh: 1.02, color: ctx.c.muted, align: 'center' }),
      display(ctx, 'greeting-2', d.greeting2 || '', 168, { weight: 700, ls: -0.045, lh: 0.98, color: ctx.c.accent, align: 'center' }),
      gap(ctx, 36), line(ctx, d.line, 'center'), gap(ctx, 48), trio(ctx, 'center'),
    ]),
    numeral: (ctx, d) => {
      const n = (d.numeral || '').replace('{year}', ctx.vars.year || '');
      const big = n.length > 2 ? 230 : 340;
      if (wide(ctx)) {
        // Numeral on the left, words on the right.
        const ch = chrome(ctx, d.date, SIGN), b = ch.box, nw = b.w * (n.length > 2 ? 0.48 : 0.36), g = 48 * ctx.u;
        return one([bgRect(ctx), ...ch.els,
          ...stack([display(ctx, 'numeral', n, big, { weight: 600, ls: -0.05, lh: 0.9, color: ctx.c.accent }, nw)], { x: b.x, y: b.y, w: nw, h: b.h }, 'center'),
          ...stack([...(d.kicker ? [kick(ctx, d.kicker, 'left'), gap(ctx, 18)] : []),
            display(ctx, 'greeting', d.greeting, 86, { weight: 600, ls: -0.03, lh: 1.05, color: ctx.c.fg }, b.w - nw - g),
            gap(ctx, 24), line(ctx, d.line, 'left', 32), gap(ctx, 36), trio(ctx, 'left')], { x: b.x + nw + g, y: b.y, w: b.w - nw - g, h: b.h }, 'center')]);
      }
      return page(ctx, d, [
        display(ctx, 'numeral', n, big, { weight: 600, ls: -0.05, lh: 0.9, color: ctx.c.accent }),
        ...(d.kicker ? [gap(ctx, 12), kick(ctx, d.kicker, 'left')] : []),
        gap(ctx, 36),
        display(ctx, 'greeting', d.greeting, 92, { weight: 600, ls: -0.03, lh: 1.04, color: ctx.c.fg }),
        gap(ctx, 28), line(ctx, d.line, 'left'), gap(ctx, 44), trio(ctx, 'left'),
      ]);
    },
    statement: (ctx, d) => page(ctx, d, [
      ...(d.kicker ? [kick(ctx, d.kicker, 'left'), gap(ctx, 28)] : []),
      display(ctx, 'greeting', d.greeting, 100, { weight: 600, ls: -0.03, lh: 1.05, color: ctx.c.fg }),
      gap(ctx, 32), line(ctx, d.line, 'left'), gap(ctx, 44),
      ...(d.rows ? h.recordRows(ctx, d.rows, 32 * ctx.u) : [trio(ctx, 'left')]),
    ]),
    solemn: (ctx, d) => page(ctx, d, [
      ...(d.kicker ? [kick(ctx, d.kicker, 'left'), gap(ctx, 36)] : []),
      display(ctx, 'greeting', d.greeting, 84, { weight: 500, ls: -0.025, lh: 1.1, color: ctx.c.fg }),
      gap(ctx, 40),
      { t: 'el', h: 6 * ctx.u, make: (x, y) => L('rule', x, y, 140 * ctx.u, { color: ctx.c.muted, dash: 'solid', thick: Math.max(1, r(2 * ctx.u)) }) },
      gap(ctx, 40), line(ctx, d.line, 'left', 32),
    ]),
    month: (ctx, d) => {
      const month = ctx.vars.month || h.MONTHS[0];
      return page(ctx, d, [
        kick(ctx, d.kicker || d.greeting, 'left'), gap(ctx, 20),
        display(ctx, 'month', month, 200, { weight: 600, ls: -0.045, lh: 0.95, color: ctx.c.accent }),
        ...(ctx.vars.year ? [gap(ctx, 8), { t: 'text', role: 'year', text: ctx.vars.year, size: 40 * ctx.u, font: 'mono', weight: 500, color: ctx.c.muted, lh: 1.2 } as Item] : []),
        gap(ctx, 40),
        { t: 'el', h: 20 * ctx.u, make: (x, y, w) => L('days', x, y + 6 * ctx.u, w, { color: ctx.c.line, dash: 'dotted', thick: Math.max(2, r(6 * ctx.u)) }) },
        gap(ctx, 36), line(ctx, d.line, 'left'),
      ]);
    },
  };

  return CELEBRATIONS_DATA.map((d) => ({
    id: d.id, name: d.name, scheme: d.scheme, group: d.group, vars: d.vars,
    // Stories, reels and covers have far more height than a square post: set the type larger to use it.
    build: (ctx: Ctx) => LAYOUTS[d.layout](ctx.o === 'tall' ? { ...ctx, u: ctx.u * 1.3 } : ctx, d),
  }));
}
