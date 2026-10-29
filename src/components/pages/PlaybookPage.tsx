'use client';
import Link from 'next/link';
import type { CSSProperties, ReactNode } from 'react';
import { AgencyMark, Alert, Button, Card, Checkbox, CommercialState, Icon, Money, StatusBadge, type BadgeTone } from '@/components/ds';
import { CopyChip, CopyProvider, useCopy } from '@/components/shell/CopyToast';
import { SectionNav, useScrollSpy } from '@/components/shell/SectionNav';
import { StudioHeader } from '@/components/shell/StudioHeader';
import { contrast, grade } from '@/lib/brand';
import { ICON_DIR, LOGO_DIR } from '@/lib/assets';
import { ROUTES } from '@/lib/nav';
import s from './playbook.module.css';

const CH: [string, string][] = [['brand', 'Brand overview'], ['logo', 'Logo and marks'], ['colour', 'Colour'], ['type', 'Typography'], ['layout', 'Layout'], ['motif', 'Motif and imagery'], ['patterns', 'Components'], ['social', 'Social and marketing'], ['documents', 'Documents'], ['themes', 'Light and dark'], ['usage', 'Do and don\'t'], ['access', 'Accessibility'], ['governance', 'Governance']];
const CH_IDS = CH.map(([id]) => id);
const LINKS = CH.map(([id, label]) => ({ id, label }));

const OVERVIEW = [['What Hali is', 'A commercial operating platform for independent branding and design agencies that keeps agreed scope, client requests, change decisions, approvals, delivery and invoicing in one commercial record.'], ['Who it is for', 'Agencies of roughly 3–20 people on fixed-fee projects with defined deliverables and revision limits — and their clients.'], ['Positioning', 'Task tools track tasks, invoicing tools track money, CRMs track leads. Hali keeps them connected through one record.'], ['Personality', 'Clear, not legalistic. Professional, not cold. Firm, not aggressive. Transparent, not alarmist. Helpful, not presumptuous.']];
const LOGO_RULES = [['Horizontal lockup', 'hali-lockup-horizontal.svg', '#FBFAF7', 'Primary. Paper, White or Sand backgrounds.'], ['Lockup reverse', 'hali-lockup-horizontal-reverse.svg', '#1C1A18', 'Ink and Deep Sea backgrounds, dark theme.'], ['Stacked lockup', 'hali-lockup-stacked.svg', '#FBFAF7', 'Square or tall spaces where the lockup would be too small.'], ['Symbol', 'hali-symbol.svg', '#FBFAF7', 'App icons, avatars, favicons, slide corners.'], ['Light symbol', 'hali-symbol-light.svg', '#285B57', 'Symbol on Deep Sea or Ink.'], ['Mono', 'hali-lockup-horizontal-mono.svg', '#FFFFFF', 'One-colour print, embossing, fax-like contexts.']];
const PROPORTION: [string, string, number, string, string][] = [['Paper', '#FBFAF7', 5, '#1C1A18', '≈ 60%'], ['Ink', '#1C1A18', 2.2, '#FBFAF7', '≈ 20%'], ['Stone', '#DDD9D0', 0.9, '#1C1A18', 'lines'], ['Deep Sea', '#285B57', 1.2, '#FFFFFF', '≈ 10%'], ['Semantic', '#3462B8', 0.5, '#FFFFFF', 'meaning only']];
const COLOUR_RULES = [['#FBFAF7', 'Paper', 'Default background for pages, posts and documents.'], ['#1C1A18', 'Ink', 'Text, primary buttons, dark covers and closing slides.'], ['#285B57', 'Deep Sea', 'The brand mark, commit actions and agreed states. Never as decoration or a random accent.'], ['#3462B8', 'Blue', 'Proposed / information only. Dashed lines and focus rings.'], ['#C98A12', 'Amber', 'Someone owes a decision. Lines and icons only on light backgrounds.'], ['#C2412D', 'Red', 'Failed or disputed only. A declined proposal is grey, not red.'], ['#3A8A4A', 'Green', 'Operation succeeded. Do not use for agreed commercial states.']];
const TYPE_RULES = [['Families', 'Geist for everything; Geist Mono for overlines, references, versions and timestamps. No second display face.'], ['Headlines', '600 weight, −0.02 to −0.03em tracking, sentence case, balanced line breaks. One headline per layout.'], ['Body', '14px in the agency app, 16px for clients and public, 16–17px in documents (12pt minimum in print).'], ['Numbers', 'Tabular figures; money always with currency and basis; never below 13px.'], ['Alignment', 'Left-aligned by default. Centre only for covers, dividers and single statements. Justify only in book body text.']];
const LAYOUT_CARDS: { title: string; body: string; chips: [string, string][] }[] = [
  { title: 'Spacing', body: '4px base. 8, 12, 16 and 24 do most of the work. Social and print margins are about 7.5% of the shortest side.', chips: [['var(--space-2)', '8px'], ['var(--space-4)', '16px'], ['var(--space-6)', '24px']] },
  { title: 'Grid', body: '4 / 8 / 12 columns at under 640 / 640 / 960px. Gutters 16 / 24 / 32px. Align everything to a left edge.', chips: [['var(--grid-columns)', 'columns'], ['var(--gutter)', 'gutter']] },
  { title: 'Radius', body: '6px controls, 10px surfaces and images, 14px dialogs, pill only for chips and badges.', chips: [['var(--radius-control)', '6px'], ['var(--radius-surface)', '10px'], ['var(--radius-lg)', '14px']] },
  { title: 'Shadow', body: 'Flat paper with 1px borders. Shadows only for overlays and floating previews. No glass, no gradients.', chips: [['var(--shadow-overlay)', 'overlay'], ['var(--border-default)', 'border']] },
];
const LINES = [['dotted', '#736D65', 'Dotted · suggested', 'Something Hali has suggested and no one has reviewed.'], ['dashed', '#3462B8', 'Dashed · not yet agreed', 'Drafts and proposals waiting for a decision.'], ['solid', '#285B57', 'Solid · recorded', 'Agreed, approved or recorded. The default rule in layouts.']];
const IMAGERY_RULES = [['Photography', 'The agency\'s own work only. No stock photography, no AI-generated imagery.'], ['Placeholders', 'Diagonal hatch in Stone on Paper (or Charcoal on Ink) until real work is supplied.'], ['Cropping', 'Fill the frame; keep subjects clear of text; 10px radius on images inside layouts, full bleed on covers.'], ['Overlays', 'Flat Ink at 30–60% when text sits on a photo; never gradients.'], ['Icons', 'Lucide outline, 2px stroke, 14/16/18/22px, secondary colour unless they carry state. Always beside a word.'], ['Illustration', 'None. Use the record line, real work, numbers and type instead.']];
const PATTERN_RULES = ['A commercial object always shows its state with CommercialState — line style and words, not colour alone.', 'Money shows currency and basis: "$1,800 · Proposed".', 'Commit actions (approve, agree) use the Deep Sea commit button; everything else is primary, secondary or ghost.', 'Cards only for records that are a unit; lists are rows with dividers.', 'Results appear inline where the action happened — no toasts.'];
const SOCIAL_RULES = [['Structure', 'Logo top-left, mono overline top-right, one headline, one supporting line, optional record-line motif.'], ['Copy', 'Headline under 12 words; sentence case; no emoji; no exclamation marks in commercial topics.'], ['Colour', 'Paper by default; Ink for quotes and launches; Deep Sea for testimonials and CTAs.'], ['Figures', 'Label every number "illustrative" unless confirmed; show currency and basis.'], ['Carousels', 'Cover, one point per slide, closing call to action. Page numbers in mono.'], ['Ads', 'One message, one action. On small display sizes use the symbol, not the lockup.']];
const SOCIAL_LINKS = [['social', 'Social posts'], ['celebrations', 'Celebrations'], ['carousel', 'Carousels'], ['article', 'Article banners'], ['banners', 'Banners'], ['ads', 'Ads'], ['email', 'Email graphics'], ['web', 'Web graphics']];
const DOC_RULES = [['Pages', 'Paper pages; Ink or Deep Sea only for covers, part dividers and closing pages.'], ['Hierarchy', 'Mono overline → H1 → body. One H1 per page. H2/H3 for sections.'], ['Numbers', 'Page numbers centred in mono (bottom-right on slides). Covers and front matter unnumbered.'], ['Tables and charts', 'Thin Stone rules, bold header row, values labelled directly; dashed bars for proposed amounts.'], ['Slides', '16:9, 128px side margins, text never below 24px, one idea per slide.'], ['Placeholders', '[Bracketed text] marks facts the author must confirm before publishing.']];
const DOC_LINKS = [['book', 'Ebook'], ['report', 'Report'], ['proposal', 'Proposal'], ['presentation', 'Presentation'], ['resume', 'Resume']];
const DOS = [
  { yes: 'hali', yesBg: '#FBFAF7', yesFg: '#1C1A18', yesFont: '600 34px/1 Geist, sans-serif', yesLs: '-0.03em', yesNote: 'Lockup on Paper', no: 'hali', noBg: 'repeating-linear-gradient(45deg,#C98A12 0 8px,#3462B8 8px 16px)', noFg: '#1C1A18', noFont: '600 34px/1 Geist, sans-serif', noLs: '-0.03em', noNote: 'Logo on busy patterns' },
  { yes: 'Approve change', yesBg: '#FFFFFF', yesFg: '#285B57', yesFont: '600 16px/1.2 Geist, sans-serif', yesLs: '0', yesNote: 'Name the exact action', no: 'OK!', noBg: '#FFFFFF', noFg: '#285B57', noFont: '600 16px/1.2 Geist, sans-serif', noLs: '0', noNote: 'Vague labels, exclamation marks' },
  { yes: '$1,800 · Proposed', yesBg: '#EEF3FB', yesFg: '#1F3E78', yesFont: '500 16px/1.2 Geist, sans-serif', yesLs: '0', yesNote: 'Money with basis', no: 'Revenue recovered!', noBg: '#FCEEEC', noFg: '#812819', noFont: '600 16px/1.2 Geist, sans-serif', noLs: '0', noNote: 'Adversarial framing' },
  { yes: 'Scope v2', yesBg: '#1C1A18', yesFg: '#FBFAF7', yesFont: '600 28px/1 Geist, sans-serif', yesLs: '-0.02em', yesNote: 'Paper on Ink · 17:1', no: 'Scope v2', noBg: '#1C1A18', noFg: '#44403B', noFont: '600 28px/1 Geist, sans-serif', noLs: '-0.02em', noNote: 'Low-contrast text' },
  { yes: 'Clear, not legalistic', yesBg: '#FBFAF7', yesFg: '#1C1A18', yesFont: '600 18px/1.2 Geist, sans-serif', yesLs: '-0.01em', yesNote: 'Sentence case', no: 'CLEAR, NOT LEGALISTIC', noBg: '#FBFAF7', noFg: '#1C1A18', noFont: '700 15px/1.2 Geist, sans-serif', noLs: '0.08em', noNote: 'All-caps headlines' },
  { yes: 'Agreed', yesBg: '#EDF5F4', yesFg: '#1E4744', yesFont: '500 16px/1 Geist, sans-serif', yesLs: '0', yesNote: 'Deep Sea for agreed', no: 'Agreed', noBg: '#285B57', noFg: '#C98A12', noFont: '500 16px/1 Geist, sans-serif', noLs: '0', noNote: 'Mixing brand and amber' },
];
const pair = (fg: string, bg: string, label: string, use: string) => {
  const r = contrast(fg, bg), g = grade(r);
  return { fg, bg, label, use, ratio: r.toFixed(1), grade: g, tone: (g === 'Fail' ? 'error' : g === 'AA large' ? 'attention' : 'success') as BadgeTone };
};
const PAIRS = [pair('#1C1A18', '#FBFAF7', 'Ink on Paper', 'All text'), pair('#5C5751', '#FBFAF7', 'Graphite on Paper', 'Secondary text'), pair('#736D65', '#FBFAF7', 'Slate on Paper', 'Small metadata'), pair('#FFFFFF', '#285B57', 'White on Deep Sea', 'All text'), pair('#D3E6E3', '#285B57', 'Sea 100 on Deep Sea', 'Muted text'), pair('#FBFAF7', '#1C1A18', 'Paper on Ink', 'All text'), pair('#86B9B3', '#1C1A18', 'Sea 300 on Ink', 'Large text, accents'), pair('#285B57', '#FBFAF7', 'Deep Sea on Paper', 'Links, headings'), pair('#C98A12', '#FBFAF7', 'Amber on Paper', 'Lines and icons only'), pair('#9C968A', '#FBFAF7', 'Ash on Paper', 'Disabled only')];
const CHECKLIST = ['The right logo for the background, with clear space', 'Only Paper, Ink and Deep Sea as layout colours; semantic hues used for meaning', 'Geist / Geist Mono only; sentence case; no emoji', 'Every figure is confirmed or labelled illustrative, with currency and basis', 'No [bracketed] placeholders left', 'Text contrast meets 4.5:1 (3:1 for large text)', 'Images are the agency\'s own work, with alt text', 'Actions are named exactly ("Create proposal", not "Click here")'];

function Chapter({ id, num, label, title, children }: { id: string; num: number; label: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="st-section">
      <span className="st-overline">{String(num).padStart(2, '0')} · {label}</span>
      <h2 className="st-h2">{title}</h2>
      {children}
    </section>
  );
}

function Rules({ rows }: { rows: string[][] }) {
  return (
    <div>
      {rows.map(([a, b]) => (
        <div key={a} className={s.rule}><span className={s.ruleA}>{a}</span><span className={s.ruleB}>{b}</span></div>
      ))}
    </div>
  );
}

function Content() {
  const [active, setActive] = useScrollSpy(CH_IDS, 'brand');
  const { copied, copyText } = useCopy();

  return (
    <div className="st-doc" style={{ '--doc-max': '1280px', '--side-w': '210px', '--doc-gap': '80px' } as CSSProperties}>
      <SectionNav links={LINKS} title="Brand playbook" active={active} onJump={setActive} />
      <main className="st-doc-main">
        {/* 01 */}
        <section id="brand" className="st-section">
          <div className={s.hero}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={LOGO_DIR + 'hali-lockup-horizontal-reverse.svg'} alt="Hali" className={s.heroLogo} />
            <h1 className={s.heroTitle}>Help agencies protect their margins and give clients a clearer, more professional project experience.</h1>
            <span className={s.heroOver}>Core promise · from Hali source documents</span>
          </div>
          <div className={s.overview}>
            {OVERVIEW.map(([a, b]) => (
              <div key={a} className={s.overviewItem}><span className="st-overline">{a}</span><span className={s.overviewBody}>{b}</span></div>
            ))}
          </div>
          <Alert tone="info" title="This identity is a proposal">The visual identity has not been approved as a final brand. Mission, vision, pricing, customers and channel details still need confirmation — see the Voice &amp; knowledge page.</Alert>
        </section>

        {/* 02 */}
        <Chapter id="logo" num={2} label="Logo, symbol and mark" title="Choose the logo by background first">
          <div>
            {LOGO_RULES.map(([name, file, bg, use]) => (
              <div key={file} className={s.logoRule}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <div className={s.logoPrev} style={{ background: bg }}><img src={LOGO_DIR + file} alt={name} /></div>
                <span className={s.logoText}><span className={s.strong}>{name}</span><span className="st-small">{use}</span></span>
                <a href={LOGO_DIR + file} download={file} className={s.dl} aria-label={'Download ' + name + ' SVG'}><Icon name="download" size={14} />SVG</a>
              </div>
            ))}
          </div>
          <div className="st-grid-fit" style={{ '--min': '300px', '--gap': '20px' } as CSSProperties}>
            <div className={'st-card ' + s.cardStack}>
              <h3 className="st-h4">Favicon, app icon and avatar</h3>
              {/* eslint-disable @next/next/no-img-element */}
              <div className={s.iconRow}>
                <img src={ICON_DIR + 'favicon-16.png'} alt="16px favicon" width={16} height={16} />
                <img src={ICON_DIR + 'favicon-32.png'} alt="32px favicon" width={32} height={32} />
                <img src={ICON_DIR + 'apple-touch-icon-180.png'} alt="App icon" width={56} height={56} style={{ borderRadius: 12 }} />
                <img src={ICON_DIR + 'social-avatar-400.png'} alt="Social avatar" width={64} height={64} style={{ borderRadius: '50%' }} />
              </div>
              {/* eslint-enable @next/next/no-img-element */}
              <span className="st-small">Use the symbol alone below 24px. Social avatars are cropped to a circle — keep the symbol inside the central 70%. <Link href={ROUTES.editor + '#new=avatar'}>Make an avatar</Link> · <Link href={ROUTES.assets}>All files</Link></span>
            </div>
            <div className={'st-card ' + s.cardStack}>
              <h3 className="st-h4">Hali beside an agency brand</h3>
              <div className={s.agency}>
                <AgencyMark name="Studio North" />
                <span className={s.powered}>Powered by Hali</span>
              </div>
              <span className="st-small">On agency pages and client portals the agency&apos;s mark, colour and favicon lead. Hali appears only as a small mono attribution in the footer.</span>
            </div>
          </div>
        </Chapter>

        {/* 03 */}
        <Chapter id="colour" num={3} label="Colour" title="Mostly paper and ink. Deep Sea when something is agreed.">
          <div className={s.proportion}>
            {PROPORTION.map(([name, hex, flex, fg, share]) => (
              <button key={name} type="button" data-touch-dup="" title={'Copy ' + hex} aria-label={'Copy ' + name + ' ' + hex} className={s.band} style={{ flex, background: hex, color: fg }} onClick={() => copyText(hex)}>
                <span className={s.bandText}>{copied === hex ? <Icon name="check" size={12} /> : name}</span>
                <span className={s.bandText} style={{ opacity: 0.8 }}>{share}</span>
              </button>
            ))}
          </div>
          <ul className={s.legend} aria-label="Colour proportion">
            {PROPORTION.map(([name, hex, , , share]) => (
              <li key={name}>
                <button type="button" className={s.legendBtn} onClick={() => copyText(hex)} aria-label={'Copy ' + name + ' ' + hex}>
                  <span className={s.legendDot} style={{ background: hex }} />{name} <span className="st-mono">{copied === hex ? 'Copied' : share}</span>
                </button>
              </li>
            ))}
          </ul>
          <span className="st-small">Approximate share of a typical layout. Tap a colour to copy its value. Full values, RGB/HSL and dark-theme equivalents are on the <Link href={ROUTES.designSystem + '#colour'}>design system colour page</Link>.</span>
          <div>
            {COLOUR_RULES.map(([hex, name, rule]) => (
              <div key={hex} className={s.colourRule}>
                <span className={s.colourDot} style={{ background: hex }} />
                <span className={s.strong}>{name}</span>
                <span className="st-small">{rule}</span>
                <CopyChip text={hex} />
              </div>
            ))}
          </div>
        </Chapter>

        {/* 04 */}
        <Chapter id="type" num={4} label="Typography" title="One family, tight headlines, quiet references">
          <div className={s.specimen}>
            <span style={{ font: "500 12px/1.2 'Geist Mono', monospace", letterSpacing: '.06em', textTransform: 'uppercase', color: '#5C5751' }}>Overline · Geist Mono 500 · uppercase +0.06em</span>
            <span style={{ font: '600 clamp(32px, 6vw, 64px)/1.02 Geist, sans-serif', letterSpacing: '-0.035em' }}>Headline · Geist 600 −0.03em</span>
            <span style={{ font: '400 clamp(17px, 2vw, 22px)/1.4 Geist, sans-serif', color: '#5C5751', maxWidth: 640 }}>Subtitle · Geist 400, muted. Tells the reader what they will get, in one sentence.</span>
            <span style={{ font: '400 16px/1.6 Geist, sans-serif', maxWidth: 640 }}>Body · Geist 400 at 16px, 1.6 line height for clients and public pages. Keep lines between 55 and 75 characters. Left-align body text; justify only in book pages with hyphenation.</span>
            <span style={{ font: "400 13px/1.3 'Geist Mono', monospace", color: '#5C5751' }}>Reference · SN-0142 · Scope v2 · 14 Mar · 14:32</span>
            <span style={{ font: '500 clamp(18px, 4vw, 22px)/1.2 Geist, sans-serif', fontVariantNumeric: 'tabular-nums' }}>$6,000 agreed → $7,800 if approved</span>
          </div>
          <Rules rows={TYPE_RULES} />
        </Chapter>

        {/* 05 */}
        <Chapter id="layout" num={5} label="Spacing, grids, radii, shadows" title="Generous margins, aligned edges, borders not shadows">
          <div className="st-grid-fit" style={{ '--min': '260px', '--gap': '16px' } as CSSProperties}>
            {LAYOUT_CARDS.map((c) => (
              <div key={c.title} className={'st-card ' + s.cardStack} style={{ '--pad': '18px' } as CSSProperties}>
                <h3 className="st-h4">{c.title}</h3>
                <span className="st-small" style={{ lineHeight: 1.55 }}>{c.body}</span>
                <div className="st-chips">{c.chips.map(([t, l]) => <CopyChip key={t} text={t} label={l}>{l}</CopyChip>)}</div>
              </div>
            ))}
          </div>
        </Chapter>

        {/* 06 */}
        <Chapter id="motif" num={6} label="Motif, imagery, icons, illustration" title="The record line is the only graphic device">
          <div className="st-grid-fit" style={{ '--min': '240px', '--gap': '16px' } as CSSProperties}>
            {LINES.map(([dash, color, name, use]) => (
              <div key={name} className={'st-card ' + s.cardStack} style={{ '--pad': '20px', gap: 12 } as CSSProperties}>
                <span style={{ display: 'block', borderTop: `4px ${dash} ${color}` }} />
                <h3 className="st-h4">{name}</h3>
                <span className="st-small">{use}</span>
              </div>
            ))}
          </div>
          <Rules rows={IMAGERY_RULES} />
        </Chapter>

        {/* 07 */}
        <Chapter id="patterns" num={7} label="Components and patterns" title="A change, shown the Hali way">
          <div className="st-grid-fit" style={{ '--min': '320px', '--gap': '16px', alignItems: 'start' } as CSSProperties}>
            <Card title="Packaging artwork · proposed change" description="Requested 12 Mar by the client. Falls outside Scope v2.">
              <div className={s.cardStack} style={{ gap: 10 }}>
                <div className={s.inline}><CommercialState state="proposed" /><Money amount={1800} currency="USD" basis="Proposed" /></div>
                <span className="st-small">$6,000 agreed → $7,800 if approved · illustrative</span>
                <div className={s.inline}><Button variant="commit" size="sm">Approve change</Button><Button variant="secondary" size="sm">Ask a question</Button></div>
              </div>
            </Card>
            <div>
              {PATTERN_RULES.map((r) => (
                <div key={r} className={s.check}><Icon name="check" size={16} style={{ color: 'var(--icon-secondary)', marginTop: 3 }} />{r}</div>
              ))}
              <Link href={ROUTES.designSystem + '#components'} className={s.more}>Every component and state →</Link>
            </div>
          </div>
        </Chapter>

        {/* 08 */}
        <Chapter id="social" num={8} label="Social and marketing" title="One idea per post, set like a record">
          <div className="st-grid-fit" style={{ '--min': '200px', '--gap': '16px' } as CSSProperties}>
            <div className={s.post} style={{ background: '#FBFAF7', color: '#1C1A18', border: '1px solid var(--border-default)' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={LOGO_DIR + 'hali-lockup-horizontal.svg'} alt="" style={{ position: 'absolute', left: '7.5cqw', top: '7.5cqw', height: '4.4cqw' }} />
              <div style={{ position: 'absolute', left: '7.5cqw', right: '7.5cqw', top: '32cqw', display: 'flex', flexDirection: 'column', gap: '3cqw' }}>
                <span style={{ font: '600 8.4cqw/1.05 Geist, sans-serif', letterSpacing: '-0.03em' }}>Three lines that keep scope honest</span>
                <span style={{ display: 'flex', flexDirection: 'column', gap: '2cqw', font: '400 3.2cqw/1.2 Geist, sans-serif' }}>
                  {[['dotted', 'Suggested'], ['dashed', 'Not yet agreed'], ['solid', 'Recorded']].map(([d, l]) => (
                    <span key={d} style={{ display: 'flex', gap: '2cqw', alignItems: 'center' }}><span style={{ width: '10cqw', borderTop: `0.5cqw ${d} #285B57` }} />{l}</span>
                  ))}
                </span>
              </div>
            </div>
            <div className={s.post} style={{ background: '#285B57', color: '#FFFFFF' }}>
              <span style={{ position: 'absolute', left: '7.5cqw', top: '7.5cqw', font: "500 2.4cqw/1 'Geist Mono', monospace", letterSpacing: '.06em', textTransform: 'uppercase', color: '#D3E6E3' }}>Client words</span>
              <span style={{ position: 'absolute', left: '7.5cqw', right: '7.5cqw', top: '26cqw', font: '500 6cqw/1.2 Geist, sans-serif', letterSpacing: '-0.02em' }}>“Clients see exactly what changed and what it costs before they approve.”</span>
              <span style={{ position: 'absolute', left: '7.5cqw', bottom: '7.5cqw', font: "500 2.4cqw/1 'Geist Mono', monospace", textTransform: 'uppercase', color: '#D3E6E3' }}>Illustrative · [Client name]</span>
            </div>
            <div className={s.post} style={{ background: '#1C1A18', color: '#FBFAF7' }}>
              <span style={{ position: 'absolute', left: '7.5cqw', top: '22cqw', font: '600 22cqw/1 Geist, sans-serif', letterSpacing: '-0.045em', color: '#86B9B3' }}>$7,800</span>
              <span style={{ position: 'absolute', left: '7.5cqw', top: '50cqw', font: "400 3.2cqw/1.3 'Geist Mono', monospace", color: '#C6C1B6' }}>$6,000 agreed → $7,800 if approved</span>
              <span style={{ position: 'absolute', left: '7.5cqw', bottom: '7.5cqw', font: "500 2.4cqw/1 'Geist Mono', monospace", textTransform: 'uppercase', color: '#C6C1B6' }}>Illustrative example</span>
            </div>
          </div>
          <Rules rows={SOCIAL_RULES} />
          <div className="st-pills">{SOCIAL_LINKS.map(([c, label]) => <Link key={c} href={ROUTES.editor + '#new=' + c} className="st-pill">{label}</Link>)}</div>
        </Chapter>

        {/* 09 */}
        <Chapter id="documents" num={9} label="Presentations and documents" title="Paper pages, clear hierarchy, numbers with their basis">
          <Rules rows={DOC_RULES} />
          <div className="st-pills">{DOC_LINKS.map(([t, label]) => <Link key={t} href={ROUTES.documents + '#type=' + t} className="st-pill">{label}</Link>)}</div>
        </Chapter>

        {/* 10 */}
        <Chapter id="themes" num={10} label="Light and dark" title="Dark is for the workspace. Clients always see light.">
          <div className="st-grid-fit" style={{ '--min': '300px', '--gap': '16px' } as CSSProperties}>
            <div className={s.themeCard} style={{ background: '#FBFAF7', color: '#1C1A18', border: '1px solid #DDD9D0' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={LOGO_DIR + 'hali-lockup-horizontal.svg'} alt="Hali on light" className={s.themeLogo} />
              <span style={{ font: '600 18px/1.3 Geist, sans-serif' }}>Light · default everywhere</span>
              <span style={{ font: '400 13px/1.5 Geist, sans-serif', color: '#5C5751' }}>Public pages, client portals, emails, documents, social and print.</span>
              <span className={s.themeBtn} style={{ background: '#285B57' }}>Approve change</span>
            </div>
            <div className={s.themeCard} style={{ background: '#161514', color: '#F5F3EE', border: '1px solid #3A3734' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={LOGO_DIR + 'hali-lockup-horizontal-reverse.svg'} alt="Hali on dark" className={s.themeLogo} />
              <span style={{ font: '600 18px/1.3 Geist, sans-serif' }}>Dark · agency workspace only</span>
              <span style={{ font: '400 13px/1.5 Geist, sans-serif', color: '#B8B2A9' }}>Neutral and hue scales invert so every semantic alias follows. Use reverse logos. Deep Sea lightens to #6FBDB4 for text and lines.</span>
              <span className={s.themeBtn} style={{ background: '#2F6E69' }}>Approve change</span>
            </div>
          </div>
          <span className="st-small">This studio follows your theme setting (top right). Exported artwork and documents always use the brand colours you chose, whatever the interface theme.</span>
        </Chapter>

        {/* 11 */}
        <Chapter id="usage" num={11} label="Correct and incorrect usage" title="Do and don't">
          <div className="st-grid-fit" style={{ '--min': '300px', '--gap': '16px' } as CSSProperties}>
            {DOS.map((d) => (
              <div key={d.yesNote} className={s.doPair}>
                <div className={s.doSide}>
                  <div className={s.doTile} style={{ background: d.yesBg, color: d.yesFg, font: d.yesFont, letterSpacing: d.yesLs }}>{d.yes}</div>
                  <span className={s.doNote}><Icon name="circle-check" size={14} style={{ color: 'var(--success-icon)', marginTop: 1 }} />{d.yesNote}</span>
                </div>
                <div className={s.doSide}>
                  <div className={s.doTile} style={{ background: d.noBg, color: d.noFg, font: d.noFont, letterSpacing: d.noLs }}>{d.no}</div>
                  <span className={s.doNote}><Icon name="circle-x" size={14} style={{ color: 'var(--error-icon)', marginTop: 1 }} />{d.noNote}</span>
                </div>
              </div>
            ))}
          </div>
        </Chapter>

        {/* 12 */}
        <Chapter id="access" num={12} label="Accessibility and contrast" title="Approved text and background pairs">
          <div role="table" aria-label="Contrast pairs" className={s.pairs}>
            <div role="row" className={s.pairHead}>
              <span role="columnheader">Sample · ratio</span><span role="columnheader">Pair</span><span role="columnheader">WCAG</span><span role="columnheader">Use</span>
            </div>
            {PAIRS.map((p) => (
              <div key={p.label} role="row" className={s.pairRow}>
                <span role="cell" className={s.pairSample} style={{ background: p.bg, color: p.fg }}>Aa · {p.ratio}</span>
                <span role="cell" className={s.pairLabel}>{p.label}</span>
                <span role="cell"><StatusBadge tone={p.tone} size="sm">{p.grade}</StatusBadge></span>
                <span role="cell" className={s.pairUse}>{p.use}</span>
              </div>
            ))}
          </div>
          <span className="st-small">Body text needs 4.5:1; text 24px and larger (or 18.66px bold) needs 3:1. Amber and Ash are for lines and icons only on light backgrounds. Never carry meaning by colour alone — pair it with line style, icon or words.</span>
        </Chapter>

        {/* 13 */}
        <Chapter id="governance" num={13} label="Governance and consistency" title="Before you publish">
          <div className={'st-card ' + s.cardStack} style={{ '--pad': '20px', gap: 8 } as CSSProperties}>
            {CHECKLIST.map((c) => <Checkbox key={c} label={c} />)}
          </div>
          <span className="st-small">Values on this page come from the same token file as the design system and the editors. To change a colour or type style, change the token once — see <Link href={ROUTES.designSystem + '#governance'}>governance</Link> for ownership and versioning.</span>
        </Chapter>
      </main>
    </div>
  );
}

export function PlaybookPage() {
  return (
    <CopyProvider>
      <div className={s.page}>
        <StudioHeader />
        <Content />
      </div>
    </CopyProvider>
  );
}
