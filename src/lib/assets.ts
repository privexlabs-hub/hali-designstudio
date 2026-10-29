/* Brand asset inventory — one list shared by the Asset Library, Design System and Playbook. */

export const LOGO_DIR = '/assets/logo/';
export const ICON_DIR = '/assets/icons/';

/** [name, file, preview background] */
export const LOGO_FILES: [string, string, string][] = [
  ['Horizontal lockup', 'hali-lockup-horizontal.svg', '#FBFAF7'], ['Horizontal lockup · reverse', 'hali-lockup-horizontal-reverse.svg', '#1C1A18'], ['Horizontal lockup · mono', 'hali-lockup-horizontal-mono.svg', '#FFFFFF'], ['Stacked lockup', 'hali-lockup-stacked.svg', '#FBFAF7'], ['Stacked lockup · reverse', 'hali-lockup-stacked-reverse.svg', '#285B57'],
  ['Wordmark', 'hali-wordmark.svg', '#FBFAF7'], ['Wordmark · reverse', 'hali-wordmark-reverse.svg', '#1C1A18'], ['Wordmark · mono', 'hali-wordmark-mono.svg', '#FFFFFF'], ['Wordmark · mono reverse', 'hali-wordmark-mono-reverse.svg', '#1C1A18'],
  ['Symbol', 'hali-symbol.svg', '#FBFAF7'], ['Symbol · Deep Sea', 'hali-symbol-sea.svg', '#FBFAF7'], ['Symbol · light', 'hali-symbol-light.svg', '#285B57'], ['Symbol · ink', 'hali-symbol-ink.svg', '#F5F3EE'], ['Symbol · mono', 'hali-symbol-mono.svg', '#FFFFFF'], ['Symbol · mono reverse', 'hali-symbol-mono-reverse.svg', '#1C1A18'],
];

/** [name, file] */
export const ICON_FILES: [string, string][] = [
  ['Favicon (SVG source)', 'favicon.svg'], ['Favicon 16', 'favicon-16.png'], ['Favicon 32', 'favicon-32.png'], ['Favicon 48', 'favicon-48.png'], ['Apple touch icon 180', 'apple-touch-icon-180.png'], ['PWA icon 192', 'icon-192.png'], ['PWA icon 512', 'icon-512.png'], ['Maskable icon 512', 'icon-maskable-512.png'],
  ['App icon · full bleed', 'app-icon-full-bleed.svg'], ['App icon · maskable', 'app-icon-maskable.svg'], ['Social avatar 400', 'social-avatar-400.png'], ['Social avatar (SVG)', 'social-avatar.svg'], ['Open Graph image 1200×630', 'og-image-1200x630.png'], ['Open Graph image (SVG)', 'og-image.svg'], ['Web app manifest', 'site.webmanifest'],
];

const svg = (w: number, h: number, body: string) =>
  '<svg xmlns="http://www.w3.org/2000/svg" width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + ' ' + h + '">' + body + '</svg>';

/** Template graphics generated from the brand tokens. [name, file, svg source] */
export const GRAPHICS: [string, string, string][] = [
  ['Record lines · motif', 'hali-motif-record-lines.svg', svg(480, 120, '<rect width="480" height="120" fill="#FBFAF7"/><line x1="24" y1="30" x2="456" y2="30" stroke="#736D65" stroke-width="4" stroke-dasharray="0 10" stroke-linecap="round"/><line x1="24" y1="60" x2="456" y2="60" stroke="#3462B8" stroke-width="4" stroke-dasharray="16 10"/><line x1="24" y1="90" x2="456" y2="90" stroke="#285B57" stroke-width="4"/>')],
  ['Image hatch · paper', 'hali-hatch-paper.svg', svg(400, 300, '<defs><pattern id="h" width="18" height="18" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="2.5" height="18" fill="#DDD9D0"/></pattern></defs><rect width="400" height="300" fill="#FBFAF7"/><rect width="400" height="300" fill="url(#h)"/>')],
  ['Image hatch · ink', 'hali-hatch-ink.svg', svg(400, 300, '<defs><pattern id="h" width="18" height="18" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="2.5" height="18" fill="#44403B"/></pattern></defs><rect width="400" height="300" fill="#1C1A18"/><rect width="400" height="300" fill="url(#h)"/>')],
  ['Background · Paper', 'hali-bg-paper.svg', svg(1080, 1080, '<rect width="1080" height="1080" fill="#FBFAF7"/>')],
  ['Background · Ink', 'hali-bg-ink.svg', svg(1080, 1080, '<rect width="1080" height="1080" fill="#1C1A18"/>')],
  ['Background · Deep Sea', 'hali-bg-deep-sea.svg', svg(1080, 1080, '<rect width="1080" height="1080" fill="#285B57"/>')],
  ['Image overlay · Ink 45%', 'hali-overlay-ink-45.svg', svg(1080, 1080, '<rect width="1080" height="1080" fill="#1C1A18" fill-opacity="0.45"/>')],
];
