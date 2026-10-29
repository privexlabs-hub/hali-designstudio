/* Hali Brand Studio — design document model shared by the template library and the editor. */

export type ElType = 'text' | 'shape' | 'line' | 'image' | 'logo';
export type LogoVariant = 'lockup' | 'stacked' | 'wordmark' | 'symbol' | 'appicon';
export type SchemeId = 'paper' | 'ink' | 'sea';

/** Element style. Every key is optional because each element type uses a subset. */
export interface ElStyle {
  font?: 'sans' | 'mono';
  size?: number;
  weight?: number;
  color?: string;
  align?: 'left' | 'center' | 'right' | 'justify';
  valign?: 'top' | 'center' | 'bottom';
  lh?: number;
  ls?: number;
  upper?: boolean;
  italic?: boolean;
  bg?: string;
  radius?: number;
  border?: string;
  pad?: number;
  opacity?: number;
  dash?: 'solid' | 'dashed' | 'dotted';
  thick?: number;
  fit?: 'cover' | 'contain';
  hatch?: string;
  label?: string;
  overlay?: number;
}

/** Override flags: which properties the user changed (re-applied when the layout re-flows). */
export type Overrides = Partial<Record<string, boolean>>;

export interface El {
  id: string;
  role: string;
  type: ElType;
  x: number;
  y: number;
  w: number;
  h: number;
  text?: string;
  src?: string;
  logo?: LogoVariant;
  tone?: string;
  auto?: 'pagenum';
  hidden?: boolean;
  rot?: number;
  custom?: boolean;
  ov?: Overrides;
  s: ElStyle;
}

export interface Page { id: string; key: string; name: string; els: El[]; bg?: string; custom?: boolean }

export interface Design {
  id: string;
  v: 1;
  name: string;
  cat: string;
  tpl: string;
  fmt: string;
  scheme: SchemeId;
  w: number;
  h: number;
  pages: Page[];
  updated: number;
  /** Template variables chosen when the design was created (for example the month of a new-month post). */
  vars?: TemplateVars;
}

export interface Box { x: number; y: number; w: number; h: number }

export interface Format { id: string; name: string; w: number; h: number; group: string; safe?: Box }

export interface Scheme {
  name: string; bg: string; fg: string; muted: string; accent: string; line: string; surface: string; border: string;
  ctaBg: string; ctaFg: string; tone: string; hatch: string;
}

export interface Ctx {
  W: number; H: number; c: Scheme; o: 'wide' | 'land' | 'square' | 'tall'; u: number; pad: number; F: Box; fmt: Format; scheme: string; vars: TemplateVars;
}

export interface PageSpec { key: string; name: string; els: El[] }

export type TemplateVars = Partial<Record<'month' | 'year', string>>;

export interface Template {
  id: string; name: string; scheme: SchemeId; multi?: boolean;
  /** Gallery filter group (celebrations). */
  group?: string;
  /** Variables this template reads from `ctx.vars`. */
  vars?: ('month' | 'year')[];
  build: (ctx: Ctx) => PageSpec[];
}

export interface Category { id: string; name: string; desc: string; formats: string[]; templates: Template[] }
