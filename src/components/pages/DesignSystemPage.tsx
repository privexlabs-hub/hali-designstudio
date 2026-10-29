'use client';
import Link from 'next/link';
import { useState, type CSSProperties, type ReactNode } from 'react';
import {
  Alert, Avatar, Button, Card, Checkbox, CommercialState, Icon, Money, ProgressBar, Spinner, StatusBadge, Switch, Tabs, TextInput,
  type AlertTone, type BadgeTone, type ButtonVariant, type ForceState,
} from '@/components/ds';
import { CopyChip, CopyProvider, useCopy } from '@/components/shell/CopyToast';
import { SectionNav, useScrollSpy } from '@/components/shell/SectionNav';
import { StudioHeader } from '@/components/shell/StudioHeader';
import {
  ALIASES, BREAKPOINTS, COLORS, LAYOUT, MOTION, RADII, SHADOWS, SIZES, SPACING, STATES, TYPE_ROLES, TYPE_SCALE, VERSION, ZINDEX,
  contrast, formats, grade, type BrandColor,
} from '@/lib/brand';
import { ICON_DIR, LOGO_DIR } from '@/lib/assets';
import { ROUTES } from '@/lib/nav';
import s from './designsystem.module.css';

const SEC: [string, string][] = [['overview', 'Overview'], ['logo', 'Logo'], ['colour', 'Colour'], ['type', 'Type'], ['spacing', 'Spacing'], ['radius', 'Radius & shadow'], ['motif', 'Motif'], ['voice', 'Voice'], ['components', 'Components'], ['slides', 'Slides'], ['ui-kits', 'UI kits'], ['governance', 'Governance']];
const SEC_IDS = SEC.map(([id]) => id);
const LINKS = SEC.map(([id, label]) => ({ id, label }));

const PRINCIPLES = [['Clear, not legalistic', 'Plain words; certainty only where something is recorded.'], ['Borders over shadows', 'Flat paper surfaces; 1px borders; shadows only for overlays.'], ['One accent', 'Deep Sea marks the brand and agreed states. Nothing else.'], ['Meaningful colour', 'Blue proposed, amber awaiting, red problem, green success.'], ['Works without colour', 'Line style carries certainty in greyscale and print.']];
const SURFACES = [['Public agency page & enquiry', 'Agency-branded. The agency colour leads CTAs; Hali appears only as a small attribution. Light only.'], ['Agency workspace', 'Hali chrome. 248px sidebar plus max 1080px content. Optional dark theme.'], ['Client portal', 'Agency-branded secure links. Centred 560–880px column, 16px body. Light only.']];
const LOGOS: [string, string, string, string, string][] = [['Horizontal lockup', 'hali-lockup-horizontal.svg', '#FBFAF7', '52px', 'Primary · light'], ['Lockup reverse', 'hali-lockup-horizontal-reverse.svg', '#1C1A18', '52px', 'Dark backgrounds'], ['Lockup mono', 'hali-lockup-horizontal-mono.svg', '#FFFFFF', '52px', 'One-colour print'], ['Stacked', 'hali-lockup-stacked.svg', '#FBFAF7', '92px', 'Square spaces'],
  ['Stacked reverse', 'hali-lockup-stacked-reverse.svg', '#285B57', '92px', 'On Deep Sea'], ['Wordmark', 'hali-wordmark.svg', '#FBFAF7', '40px', 'Where the symbol is shown nearby'], ['Wordmark reverse', 'hali-wordmark-reverse.svg', '#1C1A18', '40px', 'Dark backgrounds'], ['Symbol', 'hali-symbol.svg', '#FBFAF7', '72px', 'App icon, avatar, favicon'],
  ['Symbol light', 'hali-symbol-light.svg', '#285B57', '72px', 'On Deep Sea / Ink'], ['Symbol ink', 'hali-symbol-ink.svg', '#F5F3EE', '72px', 'Neutral contexts'], ['Symbol mono', 'hali-symbol-mono.svg', '#FFFFFF', '72px', 'One-colour'], ['Wordmark mono', 'hali-wordmark-mono.svg', '#FFFFFF', '40px', 'One-colour']];
const ICONS: [string, string, string, string][] = [['favicon.svg', 'SVG', '32px', '6px'], ['favicon-32.png', '32px', '32px', '6px'], ['apple-touch-icon-180.png', '180', '56px', '12px'], ['icon-512.png', '512', '64px', '14px'], ['social-avatar-400.png', 'Avatar', '64px', '50%']];
const MISUSE: [string, string, string, string][] = [['Don\'t stretch or squash', 'scaleX(1.5)', 'none', '#FBFAF7'], ['Don\'t recolour', 'none', 'hue-rotate(140deg)', '#FBFAF7'], ['Don\'t rotate', 'rotate(-14deg)', 'none', '#FBFAF7'], ['Don\'t place on busy imagery', 'none', 'none', 'repeating-linear-gradient(45deg,#C98A12 0 6px,#3462B8 6px 12px)'], ['Don\'t use the default lockup on dark', 'none', 'none', '#1C1A18']];
const TYPE_MISC = [['Regular', '--weight-regular'], ['Medium', '--weight-medium'], ['Semibold', '--weight-semibold'], ['Bold', '--weight-bold'], ['Display tracking −0.03em', '--tracking-display'], ['Heading tracking −0.02em', '--tracking-heading'], ['Tight 1.15', '--leading-tight'], ['Snug 1.3', '--leading-snug'], ['Normal 1.5', '--leading-normal'], ['Relaxed 1.6', '--leading-relaxed']];
const ICON_SET = [['file-text', 'Agreement'], ['list-checks', 'Scope'], ['message-square', 'Feedback'], ['inbox', 'Requests'], ['scan-search', 'Assessment'], ['file-diff', 'Change order'], ['shield-check', 'Authorised'], ['receipt', 'Billing'], ['clock', 'Awaiting'], ['circle-help', 'Unknown'], ['layers', 'Superseded'], ['sparkle', 'Hali suggestion'], ['lock', 'Restricted']];
const CHART = [['Agreed', '72%', '1.5px solid #285B57', '#285B57', '$6,000'], ['Proposed', '22%', '1.5px dashed #3462B8', 'var(--blue-50)', '$1,800'], ['Invoiced', '48%', '1.5px solid var(--n-300)', 'var(--n-300)', '$4,000']];
const VOICE_PAIRS = [['This request may fall outside the agreed scope.', 'Scope creep detected!'], ['Your two included revision rounds are complete. This request can be handled as an additional change.', 'You exceeded your revision limit.'], ['$6,000 agreed → $7,800 if approved', 'Revenue recovered: $1,800'], ['Approve change', 'OK']];
const BTN_STATES = ['Default', 'Hover', 'Pressed', 'Focus', 'Disabled', 'Loading', 'Success'];
const BTN_ROWS: [string, ButtonVariant, string][] = [['Primary', 'primary', 'Create proposal'], ['Commit', 'commit', 'Approve change'], ['Secondary', 'secondary', 'Save draft'], ['Ghost', 'ghost', 'Cancel'], ['Danger', 'danger', 'Delete']];
const BTN_CELLS: (string | null)[] = [null, 'hover', 'pressed', 'focus', 'd', 'l', 's'];
const BADGES: [BadgeTone, string, string][] = [['neutral', 'Draft', 'pencil-line'], ['info', 'Sent', 'send'], ['attention', 'Due Friday', 'clock'], ['success', 'Exported', 'check'], ['error', 'Failed', 'circle-alert']];
const ALERTS: [AlertTone, string, string][] = [['info', 'Hali found a possible difference', 'This request may fall outside Scope v2. Review it before replying.'], ['attention', 'Awaiting client decision', 'Studio North sent a proposed change 3 days ago.'], ['success', 'Approved and recorded', 'The change is now part of the agreement.'], ['error', 'Export failed', 'The file could not be created. Try again, or export as PNG.']];
const DEMO_TABS = [{ id: 'scope', label: 'Scope' }, { id: 'requests', label: 'Requests', count: 3 }, { id: 'changes', label: 'Change orders', count: 1, attention: true }, { id: 'billing', label: 'Billing' }];
const SLIDE_RULES = [['Size', '1920 × 1080 (16:9). Export PDF for sharing, PPTX for editing.'], ['Type', 'Titles 64–96px Geist 600 −0.03em. Body ≥ 28px. Mono overlines 24px uppercase.'], ['Colour', 'Paper default; Deep Sea for section dividers; Ink for closing. Accent only for agreed or brand moments.'], ['Layout', '96px margins. Left-aligned titles. Centre only for single-statement slides.'], ['Data', 'One chart per slide; label values directly; currency and basis on every figure; mark illustrative data.']];
const KITS = [['Agency workspace', 'Commercial control and daily coordination. Dense rows, sidebar navigation.', 'sidebar 248px · content ≤ 1080px · body 14px', 'block', '100%', 'var(--n-900)'], ['Client portal', 'Informed decisions on agency-branded secure links.', 'column 560–880px · body 16px · light only', 'none', '70%', 'var(--sea-600)'], ['Public agency page', 'The agency\'s front door and enquiry form. Agency colour on CTAs.', 'column ≤ 880px · Hali attribution in footer', 'none', '78%', 'var(--amber-500)'], ['Brand studio', 'This tool: templates, editor and brand reference.', '3-panel editor · bottom sheets under 960px', 'block', '100%', 'var(--sea-600)']];
const GOVERNANCE = [['Ownership', 'One design-system owner approves token, component and logo changes. The brand owner approves voice and brand facts.'], ['Versioning', 'Semantic versioning. Current v1.4.0. Major = removed or renamed tokens/components; minor = additions; patch = fixes.'], ['Naming', 'Tokens: --{category}-{role}-{variant}, e.g. --action-commit-bg-hover, --text-secondary. Components: PascalCase nouns. Files: kebab-case.'], ['Contribution', 'Propose with the problem, the screens affected and an accessibility check. Prefer composing existing components before adding new ones.'], ['Deprecation', 'Keep a deprecated alias for one major version and note it in the changelog. Example: --font-serif now aliases --font-display and will be removed in v2.0.'], ['Consistency', 'Use semantic aliases in code, not raw scale values. Templates read the same tokens as this page — change a token in one place.']];
const A11Y = ['Text meets 4.5:1 (3:1 for 24px+ or 18.66px bold)', 'Every action reachable by keyboard; visible focus ring', 'Touch targets ≥ 44px on touch surfaces', 'Status never shown by colour alone — line style or text too', 'Motion respects prefers-reduced-motion', 'Errors say what happened and how to fix it', 'Images have alt text; decorative images are hidden'];

const ratio = (r: number) => r.toFixed(2) + ':1 ' + grade(r);
const v = (t: string) => 'var(' + t + ')';

function Section({ id, num, label, title, h1, gap, children }: { id: string; num: number; label: string; title: string; h1?: boolean; gap?: number; children: ReactNode }) {
  return (
    <section id={id} className="st-section" style={gap ? { gap } : undefined}>
      <span className="st-overline">{String(num).padStart(2, '0')} · {label}</span>
      {h1 ? <h1 className="st-h1" style={{ maxWidth: 820 }}>{title}</h1> : <h2 className="st-h2">{title}</h2>}
      {children}
    </section>
  );
}

function Pairs({ rows, preLine }: { rows: string[][]; preLine?: boolean }) {
  return (
    <div>
      {rows.map(([a, b]) => (
        <div key={a} className={s.pair}>
          <span className={s.pairA}>{a}</span>
          <span className={s.pairB} style={preLine ? { whiteSpace: 'pre-line' } : undefined}>{b}</span>
        </div>
      ))}
    </div>
  );
}

function Swatch({ c }: { c: BrandColor }) {
  const { copied, copyText } = useCopy();
  const ink = contrast(c.hex, '#1C1A18'), wh = contrast(c.hex, '#FFFFFF');
  const f = formats(c.hex);
  return (
    <div className={s.color}>
      <button type="button" className={s.swatch} onClick={() => copyText(c.hex)} title={'Copy ' + c.hex} aria-label={'Copy ' + c.name + ' ' + c.hex} style={{ background: c.hex, color: ink >= wh ? '#1C1A18' : '#FFFFFF' }}>
        {copied === c.hex ? <Icon name="check" size={12} /> : 'Aa'}
      </button>
      <div className={s.colorBody}>
        <div className={s.colorHead}><span className={s.colorName}>{c.name}</span><span className="st-small">{c.role}</span></div>
        <div className="st-chips">
          <CopyChip text={v(c.token)} label={c.token}>{c.token}</CopyChip>
          <CopyChip text={f.hex} /><CopyChip text={f.rgb} /><CopyChip text={f.hsl} />
        </div>
        <span className={s.usage}>{c.usage}</span>
        <div className={s.contrast}>
          <span>Ink text {ratio(ink)}</span><span>White text {ratio(wh)}</span><span>On Paper {ratio(contrast(c.hex, '#FBFAF7'))}</span>
          <span className={s.darkVal}>Dark theme <span className={s.darkDot} style={{ background: c.dark }} />{c.dark}</span>
        </div>
      </div>
    </div>
  );
}

function Content() {
  const [active, setActive] = useScrollSpy(SEC_IDS, 'overview');
  const [switchOn, setSwitchOn] = useState(true);
  const [demoTab, setDemoTab] = useState('scope');
  const { copyText } = useCopy();
  const groups: Record<string, BrandColor[]> = {};
  COLORS.forEach((c) => { (groups[c.group] = groups[c.group] || []).push(c); });

  return (
    <div className="st-doc" style={{ '--doc-max': '1360px', '--side-w': '200px' } as CSSProperties}>
      <SectionNav links={LINKS} title="Design system" version={VERSION} active={active} onJump={setActive} />
      <main className="st-doc-main">
        {/* 01 OVERVIEW */}
        <Section id="overview" num={1} label="Overview" title="The record: quiet paper and ink, where certainty is visible in the line itself." h1>
          <p className="st-lede" style={{ fontSize: 16, maxWidth: 680 }}>Hali is a commercial operating platform for independent branding and design agencies. This system governs the product, the brand studio and every exported asset. Tokens on this page are the same values the editor and templates use. Click any value to copy it.</p>
          <div className={s.principles}>
            {PRINCIPLES.map(([a, b]) => (
              <div key={a} className={s.principle}><span className="st-h4">{a}</span><span className="st-small">{b}</span></div>
            ))}
          </div>
          <div>
            <h3 className={'st-h4 ' + s.subhead}>Three surfaces, one system</h3>
            <Pairs rows={SURFACES} />
          </div>
        </Section>

        {/* 02 LOGO */}
        <Section id="logo" num={2} label="Logo" title="The folded agreement">
          <p className={s.p}>A Deep Sea tile with its top-right corner folded — a page that has been read, marked and kept — holding a monoline h. The wordmark&apos;s i-dot is a tiny folded sheet. The identity is a proposal; an optical pass is needed before trademark filing.</p>
          <div className="st-grid" style={{ '--min': '240px', '--gap': '16px' } as CSSProperties}>
            {LOGOS.map(([name, file, bg, h, use]) => (
              <div key={file} className={s.logoCard}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <div className={s.logoPrev} style={{ background: bg }}><img src={LOGO_DIR + file} alt={name} style={{ maxHeight: h }} /></div>
                <div className={s.logoMeta}>
                  <span className={s.logoText}><span className={s.logoName}>{name}</span><span className="st-mono">{use}</span></span>
                  <a href={LOGO_DIR + file} download={file} aria-label={'Download ' + name + ' SVG'} className={s.dl}><Icon name="download" size={14} />SVG</a>
                </div>
              </div>
            ))}
          </div>
          <div className="st-grid-fit" style={{ '--min': '280px', '--gap': '24px' } as CSSProperties}>
            <div className="st-stack" style={{ '--stack-gap': '10px' } as CSSProperties}>
              <h3 className="st-h4">Clear space and minimum size</h3>
              <div className={s.clear}>
                <div className={s.clearBox}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={LOGO_DIR + 'hali-symbol.svg'} alt="Hali symbol with clear space" width={72} height={72} style={{ display: 'block' }} />
                  <span className={s.clearLabel}>0.3×</span>
                </div>
              </div>
              <span className="st-small">Clear space equals the folded corner (≈30% of symbol height) on every side. Minimum: symbol 16px, wordmark 14px, lockup 20px tall.</span>
            </div>
            <div className="st-stack" style={{ '--stack-gap': '10px' } as CSSProperties}>
              <h3 className="st-h4">Favicon and avatar</h3>
              <div className={s.icons}>
                {ICONS.map(([f, name, size, radius]) => (
                  <a key={f} href={ICON_DIR + f} download={f} className={s.iconLink}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={ICON_DIR + f} alt={name} style={{ width: size, height: size, borderRadius: radius, display: 'block' }} />{name}
                  </a>
                ))}
              </div>
              <span className="st-small">On agency pages and client portals the agency&apos;s own favicon and mark lead; Hali appears only as a mono footer attribution.</span>
            </div>
          </div>
          <div className="st-stack" style={{ '--stack-gap': '10px' } as CSSProperties}>
            <h3 className="st-h4">Don&apos;t</h3>
            <div className="st-grid" style={{ '--min': '180px' } as CSSProperties}>
              {MISUSE.map(([label, transform, filter, bg]) => (
                <div key={label} className={s.misuse}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <div className={s.misusePrev} style={{ background: bg }}><img src={LOGO_DIR + 'hali-lockup-horizontal.svg'} alt="" style={{ width: 120, transform, filter, display: 'block' }} /></div>
                  <div className={s.misuseLabel}><Icon name="circle-x" size={14} style={{ color: 'var(--error-icon)', marginTop: 1 }} /><span>{label}</span></div>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* 03 COLOUR */}
        <Section id="colour" num={3} label="Colour" title="Warm neutrals, one accent, hues for meaning">
          <p className={s.p}>Deep Sea is used for the brand mark and for committing or agreed states only. Blue, amber, red and green carry meaning and are never decoration. Contrast ratios are computed from the exact values. Dark values apply in the agency workspace and this studio only — public pages, client portals and emails stay light.</p>
          {Object.entries(groups).map(([name, items]) => (
            <div key={name}>
              <h3 className={'st-h4 ' + s.subhead}>{name}</h3>
              {items.map((c) => <Swatch key={c.token} c={c} />)}
            </div>
          ))}
          <div>
            <h3 className={'st-h4 ' + s.subhead}>Semantic aliases — use these in code, not raw scale values</h3>
            {ALIASES.map((a) => (
              <div key={a.token} className={s.alias}>
                <span className={s.aliasDot} style={{ background: v(a.token) }} />
                <span className={s.aliasMain}><CopyChip text={v(a.token)} label={a.token}>{a.token}</CopyChip><span className="st-small">{a.use}</span></span>
                <span className="st-mono">→ {a.ref}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* 04 TYPE */}
        <Section id="type" num={4} label="Type" title="One superfamily: Geist and Geist Mono">
          <div className="st-grid-fit" style={{ '--min': '300px', '--gap': '16px' } as CSSProperties}>
            {[
              { name: 'Geist', sample: '600 56px/1 var(--font-sans)', use: 'UI and display. 400 / 500 / 600 / 700. Neutral and precise, excellent tabular figures. SIL OFL.', chips: [['var(--font-sans)', '--font-sans'], ['"Geist", ui-sans-serif, system-ui, sans-serif', 'stack']] },
              { name: 'Geist Mono', sample: '500 52px/1 var(--font-mono)', use: 'References, versions, timestamps, overlines (uppercase, +0.04em). 400 / 500. SIL OFL.', chips: [['var(--font-mono)', '--font-mono'], ['"Geist Mono", ui-monospace, monospace', 'stack']] },
            ].map((f) => (
              <div key={f.name} className={'st-card ' + s.family}>
                <span className={s.familySample} style={{ font: f.sample }}>Aa Gg 0123</span>
                <span className="st-h4">{f.name}</span>
                <span className="st-small">{f.use}</span>
                <div className="st-chips">{f.chips.map(([t, l]) => <CopyChip key={l} text={t} label={l}>{l}</CopyChip>)}</div>
              </div>
            ))}
          </div>
          <div>
            <h3 className={'st-h4 ' + s.subhead}>Semantic type roles</h3>
            {TYPE_ROLES.map(([token, spec, , use]) => {
              const ls = token.includes('display') ? 'var(--tracking-display)' : token.includes('headline') ? 'var(--tracking-heading)' : token.includes('overline') ? '0.04em' : '0';
              const sample = token.includes('money') ? '$7,800 · If approved' : token.includes('reference') ? 'SN-0142 · Scope v2 · 14:32' : token.includes('overline') ? 'Not included' : 'Changes priced before work starts';
              return (
                <div key={token} className={s.role}>
                  <span className={s.roleSample} style={{ font: v(token), letterSpacing: ls, textTransform: token.includes('overline') ? 'uppercase' : 'none' }}>{sample}</span>
                  <span className={s.roleMeta}><CopyChip text={v(token)} label={token}>{token}</CopyChip><span className="st-mono">{spec} · {use}</span></span>
                </div>
              );
            })}
          </div>
          <div className="st-grid-fit" style={{ '--min': '260px', '--gap': '24px' } as CSSProperties}>
            <div>
              <h3 className={'st-h4 ' + s.subhead}>Size scale</h3>
              {TYPE_SCALE.map(([t, px]) => (
                <div key={t} className={s.scale}>
                  <CopyChip text={v(t)} label={t} className={s.fixedChip}>{t}</CopyChip>
                  <span className={s.px}>{px}px</span>
                  <span className={s.scaleSample} style={{ fontSize: px }}>Scope v2</span>
                </div>
              ))}
            </div>
            <div className="st-stack" style={{ '--stack-gap': '10px' } as CSSProperties}>
              <h3 className="st-h4">Weights, tracking and line height</h3>
              <div>
                {TYPE_MISC.map(([label, t]) => (
                  <div key={t} className={s.misc}><span className="st-small">{label}</span><CopyChip text={v(t)} label={t}>{t}</CopyChip></div>
                ))}
              </div>
              <span className="st-small">Headlines 600 with −0.02 to −0.03em. Body 14px in the agency app, 16px for clients and public pages, 17px in documents. Money uses tabular figures and is never below 13px.</span>
            </div>
          </div>
        </Section>

        {/* 05 SPACING */}
        <Section id="spacing" num={5} label="Spacing" title="4px base; 8, 12, 16 and 24 do most of the work">
          <div className="st-grid-fit" style={{ '--min': '320px', '--gap': '32px' } as CSSProperties}>
            <div>
              {SPACING.map(([t, px]) => (
                <div key={t} className={s.scale}>
                  <CopyChip text={v(t)} label={t} className={s.fixedChip}>{t}</CopyChip>
                  <span className={s.px}>{px}px</span>
                  <span className={s.bar} style={{ width: px }} />
                </div>
              ))}
            </div>
            <div className="st-stack" style={{ '--stack-gap': '16px' } as CSSProperties}>
              <h3 className="st-h4">Sizes and layout widths</h3>
              <div className="st-chips">
                {[...SIZES, ...LAYOUT.map((l): [string, string] => [l[0], l[1]])].map(([t, val]) => <CopyChip key={t} text={v(t)} label={t}>{t + ' · ' + val}</CopyChip>)}
              </div>
              <span className="st-small">Touch targets are at least 44px. Generous whitespace on public and client surfaces; denser lists in the agency app.</span>
            </div>
          </div>
          <div>
            <h3 className={'st-h4 ' + s.subhead}>Grid and breakpoints</h3>
            {BREAKPOINTS.map(([a, b, c, d, e]) => (
              <div key={a} className={s.bp}>
                <span className={s.bpName}>{a}</span>
                <span className="st-mono">{b}</span>
                <span className="st-small">{c} · {d} — {e}</span>
              </div>
            ))}
            <div className={s.liveGrid}>{Array.from({ length: 12 }, (_, i) => <span key={i} />)}</div>
            <span className="st-mono" style={{ display: 'block', paddingTop: 8 }}>Live grid for this window: var(--grid-columns) columns, var(--grid-gap) gap.</span>
          </div>
        </Section>

        {/* 06 RADIUS & SHADOW */}
        <Section id="radius" num={6} label="Radius & shadow" title="Borders over shadows">
          <p className={s.p}>Cards are 1px <code className={s.code}>--border-default</code>. Shadows are for overlays and floating previews only. The dialog scrim is the only transparency. No glass, no left-border accent cards.</p>
          <div className="st-grid" style={{ '--min': '150px', '--gap': '16px' } as CSSProperties}>
            {RADII.map(([t, val, use]) => (
              <div key={t} className="st-stack" style={{ '--stack-gap': '8px' } as CSSProperties}>
                <div className={s.radius} style={{ borderRadius: val }} />
                <CopyChip text={v(t)} label={t} className={s.selfStart}>{t}</CopyChip>
                <span className="st-small" style={{ fontSize: 12 }}>{val} · {use}</span>
              </div>
            ))}
          </div>
          <div className={'st-grid-fit ' + s.shadows} style={{ '--min': '220px', '--gap': '24px' } as CSSProperties}>
            {SHADOWS.map(([t, , use]) => (
              <div key={t} className="st-stack" style={{ '--stack-gap': '10px' } as CSSProperties}>
                <div className={s.shadow} style={{ boxShadow: v(t) }} />
                <CopyChip text={v(t)} label={t} className={s.selfStart}>{t}</CopyChip>
                <span className="st-small" style={{ fontSize: 12 }}>{use}</span>
              </div>
            ))}
          </div>
          <div className={s.zrow}>
            <span className={s.zlabel}>Elevation (z-index)</span>
            {[...ZINDEX, ...MOTION.map((m): [string, string] => [m[0], m[1]])].map(([t, val]) => <CopyChip key={t} text={v(t)} label={t}>{t + ' · ' + val}</CopyChip>)}
          </div>
        </Section>

        {/* 07 MOTIF */}
        <Section id="motif" num={7} label="Motif" title="The line carries certainty">
          <p className={s.p}>Dotted = suggested by Hali. Dashed = not yet agreed. Solid = recorded. Colour adds who must act. The motif works in greyscale and in print.</p>
          <div>
            {STATES.map((st) => (
              <div key={st.id} className={s.stateRow}>
                <span className={s.stateLine} style={{ borderTop: st.line + ' ' + st.color }} />
                <span><CommercialState state={st.id} /></span>
                <span className="st-small">{st.meaning}</span>
              </div>
            ))}
          </div>
          <div className="st-grid-fit" style={{ '--min': '280px', '--gap': '24px' } as CSSProperties}>
            <div className="st-stack" style={{ '--stack-gap': '10px' } as CSSProperties}>
              <h3 className="st-h4">Imagery and placeholders</h3>
              <div className={'st-hatch ' + s.hatch}>Agency work image</div>
              <span className="st-small">Imagery comes from the agency&apos;s own work only — no stock, illustration or gradients. Empty slots use the diagonal hatch. Crop to fill; keep subjects clear of text. For text on photos, use a flat Ink overlay of 30–60% so text reaches 4.5:1.</span>
            </div>
            <div className="st-stack" style={{ '--stack-gap': '10px' } as CSSProperties}>
              <h3 className="st-h4">Iconography — Lucide, 2px outline</h3>
              <div className={s.iconGrid}>
                {ICON_SET.map(([name, meaning]) => (
                  <button key={name} type="button" className={s.iconBtn} title={'Copy icon name ' + name} onClick={() => copyText(name)}>
                    <Icon name={name} size={18} style={{ color: 'var(--icon-secondary)' }} />
                    <span className={s.iconName}>{name}</span>
                    <span className={s.iconMeaning}>{meaning}</span>
                  </button>
                ))}
              </div>
              <span className="st-small">Sizes 14 / 16 / 18 / 22px. Colour <code className={s.code}>--icon-secondary</code> unless it carries state. Status icons always sit beside text. Sparkle is reserved for Hali suggestions.</span>
            </div>
          </div>
          <div className="st-stack">
            <h3 className="st-h4">Charts and data</h3>
            <div className="st-grid-fit" style={{ '--min': '300px', '--gap': '24px', alignItems: 'end' } as CSSProperties}>
              <div className={'st-card ' + s.chart}>
                <span className="st-overline">Illustrative · engagement value</span>
                {CHART.map(([label, w, line, bg, value]) => (
                  <div key={label} className={s.chartRow}>
                    <span className="st-small" style={{ fontSize: 12 }}>{label}</span>
                    <span className={s.chartBarTrack}><span className={s.chartBar} style={{ width: w, border: line, background: bg }} /></span>
                    <span className={s.chartValue}>{value}</span>
                  </div>
                ))}
              </div>
              <span className="st-small" style={{ lineHeight: 1.6 }}>Never sum potential and approved values together. Use solid fills for recorded figures and dashed outlines for proposed ones. Label axes and values directly; avoid legends where a label fits. Always show currency and basis. Charts never animate.</span>
            </div>
          </div>
        </Section>

        {/* 08 VOICE */}
        <Section id="voice" num={8} label="Voice" title="Clear, not legalistic. Firm, not aggressive." gap={20}>
          <div>
            {VOICE_PAIRS.map(([yes, no]) => (
              <div key={yes} className={s.voicePair}>
                <span className={s.yes}><Icon name="circle-check" size={16} style={{ color: 'var(--success-icon)', marginTop: 2 }} />{yes}</span>
                <span className={s.no}><Icon name="circle-x" size={16} style={{ color: 'var(--error-icon)', marginTop: 2 }} />{no}</span>
              </div>
            ))}
          </div>
          <Link href={ROUTES.voice} className={s.more}>Open the full brand voice and knowledge reference →</Link>
        </Section>

        {/* 09 COMPONENTS */}
        <Section id="components" num={9} label="Components" title="Components and states" gap={28}>
          <p className={s.p}>Live design-system components. Hover shifts one neutral step; press one further step; no scale or bounce. Focus is a 2px page-colour gap plus a 2px blue ring. Motion is 120–200ms on opacity and colour only, and nothing animates on records or money.</p>
          <div className={s.matrix} role="table" aria-label="Button variants and states">
            <div className={s.matrixHead} role="row">
              <span role="columnheader" />
              {BTN_STATES.map((l) => <span key={l} role="columnheader" className={s.matrixLabel}>{l}</span>)}
            </div>
            {BTN_ROWS.map(([name, variant, label]) => (
              <div key={variant} className={s.matrixRow} role="row">
                <span role="rowheader" className={s.matrixName}>{name}</span>
                {BTN_CELLS.map((k, i) => (
                  <span key={i} role="cell" className={s.matrixCell}>
                    <span className={s.matrixCellLabel}>{BTN_STATES[i]}</span>
                    <Button variant={variant} size="sm" forceState={(k && k.length > 1 ? k : undefined) as ForceState | undefined} disabled={k === 'd'} loading={k === 'l'} success={k === 's'}>{label}</Button>
                  </span>
                ))}
              </div>
            ))}
          </div>
          <div className="st-grid-fit" style={{ '--min': '280px', '--gap': '24px' } as CSSProperties}>
            <div className="st-stack" style={{ '--stack-gap': '14px' } as CSSProperties}>
              <h3 className="st-h4">Inputs</h3>
              <TextInput label="Agency name" placeholder="Studio North" help="Shown on your public page." />
              <TextInput label="Email" defaultValue="name@" error="Enter a full email address so the agency can reply." />
              <TextInput label="Project reference" defaultValue="SN-0142" valid />
              <TextInput label="Agreed fee" defaultValue="6,000" prefix="$" disabled help="Locked after the agreement is recorded." />
            </div>
            <div className="st-stack" style={{ '--stack-gap': '14px' } as CSSProperties}>
              <h3 className="st-h4">Selection</h3>
              <Checkbox label="Include two revision rounds" defaultChecked />
              <Checkbox label="Disabled option" disabled />
              <Switch label="Email the client when a round is sent" checked={switchOn} onChange={setSwitchOn} />
              <h3 className="st-h4" style={{ paddingTop: 8 }}>Badges and progress</h3>
              <div className="st-chips">{BADGES.map(([tone, label, icon]) => <StatusBadge key={label} tone={tone} icon={icon}>{label}</StatusBadge>)}</div>
              <ProgressBar value={66} label="Revision rounds used · 2 of 3" />
              <div className={s.avatars}>
                <Avatar name="Studio North" size="lg" kind="org" />
                <Avatar name="Ada Mensah" size="md" />
                <Spinner label="Loading" />
                <Money amount={7800} currency="USD" size="lg" basis="If approved" />
              </div>
            </div>
          </div>
          <div className="st-stack" style={{ '--stack-gap': '10px' } as CSSProperties}>
            <h3 className="st-h4">Feedback</h3>
            {ALERTS.map(([tone, title, body]) => <Alert key={tone} tone={tone} title={title}>{body}</Alert>)}
          </div>
          <div className="st-stack" style={{ '--stack-gap': '10px' } as CSSProperties}>
            <h3 className="st-h4">Navigation and cards</h3>
            <Tabs items={DEMO_TABS} value={demoTab} onChange={setDemoTab} label="Engagement" />
            <Card title="Brand identity · Scope v2" description="Logo suite, colour, typography and a 12-page guideline document.">
              <div className={s.cardRow}><CommercialState state="agreed" /><Money amount={6000} currency="USD" basis="Agreed" /></div>
            </Card>
            <span className="st-small">Cards are used only where a record is a unit (scope item, change order, decision). Lists are rows with dividers, not card grids. On phones, tables become stacked cards and dialogs become bottom sheets.</span>
          </div>
        </Section>

        {/* 10 SLIDES */}
        <Section id="slides" num={10} label="Slides" title="Presentations and documents">
          <p className={s.p}>16:9 at 1920×1080. Paper is the default slide background; Deep Sea marks section dividers; Ink for closing slides. Text never below 24px at full size. One idea per slide. Logo lockup top-left on title slides, symbol bottom-right elsewhere.</p>
          <div className="st-grid-fit" style={{ '--min': '300px', '--gap': '16px' } as CSSProperties}>
            <div className={s.slide} style={{ background: '#FBFAF7', color: '#1C1A18' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={LOGO_DIR + 'hali-lockup-horizontal.svg'} alt="" style={{ position: 'absolute', left: '6cqw', top: '6cqw', height: '4cqw' }} />
              <div style={{ position: 'absolute', left: '6cqw', right: '6cqw', bottom: '8cqw', display: 'flex', flexDirection: 'column', gap: '2cqw' }}>
                <span style={{ font: "500 1.6cqw/1 'Geist Mono', monospace", textTransform: 'uppercase', letterSpacing: '.06em', color: '#5C5751' }}>Title slide</span>
                <span style={{ font: '600 6cqw/1.05 Geist, sans-serif', letterSpacing: '-0.03em' }}>One record from proposal to invoice</span>
              </div>
            </div>
            <div className={s.slide} style={{ background: '#285B57', color: '#FFFFFF' }}>
              <span style={{ position: 'absolute', left: '6cqw', top: '6cqw', font: "500 8cqw/1 'Geist Mono', monospace", color: '#86B9B3' }}>02</span>
              <span style={{ position: 'absolute', left: '6cqw', right: '6cqw', bottom: '8cqw', font: '600 5.4cqw/1.08 Geist, sans-serif', letterSpacing: '-0.03em' }}>Section divider: how a change is priced</span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={LOGO_DIR + 'hali-symbol-light.svg'} alt="" style={{ position: 'absolute', right: '5cqw', top: '5cqw', height: '5cqw' }} />
            </div>
            <div className={s.slide} style={{ background: '#FBFAF7', color: '#1C1A18' }}>
              <span style={{ position: 'absolute', left: '6cqw', top: '6cqw', font: '600 3.6cqw/1.1 Geist, sans-serif', letterSpacing: '-0.02em' }}>Data slide</span>
              <div style={{ position: 'absolute', left: '6cqw', right: '6cqw', top: '18cqw', display: 'flex', flexDirection: 'column', gap: '2.4cqw' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '2cqw' }}><span style={{ width: '18cqw', font: '400 1.8cqw/1 Geist, sans-serif', color: '#5C5751' }}>Agreed</span><span style={{ height: '4cqw', width: '46cqw', background: '#285B57', borderRadius: '0.4cqw' }} /><span style={{ font: '500 2.2cqw/1 Geist, sans-serif' }}>$6,000</span></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '2cqw' }}><span style={{ width: '18cqw', font: '400 1.8cqw/1 Geist, sans-serif', color: '#5C5751' }}>Proposed</span><span style={{ height: '4cqw', width: '14cqw', border: '0.3cqw dashed #3462B8', background: '#EEF3FB', borderRadius: '0.4cqw', boxSizing: 'border-box' }} /><span style={{ font: '500 2.2cqw/1 Geist, sans-serif' }}>$1,800</span></div>
              </div>
              <span style={{ position: 'absolute', left: '6cqw', bottom: '5cqw', font: "400 1.4cqw/1 'Geist Mono', monospace", color: '#736D65', textTransform: 'uppercase', letterSpacing: '.05em' }}>Illustrative figures</span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={LOGO_DIR + 'hali-symbol.svg'} alt="" style={{ position: 'absolute', right: '5cqw', bottom: '4cqw', height: '4cqw' }} />
            </div>
          </div>
          <Pairs rows={SLIDE_RULES} />
        </Section>

        {/* 11 UI KITS */}
        <Section id="ui-kits" num={11} label="UI kits" title="Surfaces and their layout rules">
          <div className="st-grid-fit" style={{ '--min': '300px', '--gap': '16px' } as CSSProperties}>
            {KITS.map(([name, desc, spec, side, col, cta]) => (
              <div key={name} className={s.kit}>
                <div className={s.kitPrev}>
                  <span className={s.kitSide} style={{ display: side }} />
                  <span className={s.kitMain}>
                    <span className={s.kitCol} style={{ width: col }}>
                      <span className={s.kitTitle} />
                      <span className={s.kitBox} />
                      <span className={s.kitBox} data-proposed="" />
                      <span className={s.kitCta} style={{ background: cta }} />
                    </span>
                  </span>
                </div>
                <div className={s.kitMeta}>
                  <span className="st-h4">{name}</span>
                  <span className="st-small">{desc}</span>
                  <span className="st-mono">{spec}</span>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* 12 GOVERNANCE */}
        <Section id="governance" num={12} label="Governance" title="Keeping it consistent">
          <Pairs rows={GOVERNANCE} preLine />
          <div className={'st-card ' + s.checklist}>
            <h3 className="st-h4">Accessibility release checklist · WCAG 2.2 AA</h3>
            {A11Y.map((label) => <Checkbox key={label} label={label} />)}
          </div>
        </Section>
      </main>
    </div>
  );
}

export function DesignSystemPage() {
  return (
    <CopyProvider>
      <div className={s.page}>
        <StudioHeader />
        <Content />
      </div>
    </CopyProvider>
  );
}
