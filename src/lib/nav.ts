export interface NavItem { href: string; label: string }

/** Studio navigation (shared by every page header). */
export const STUDIO_NAV: NavItem[] = [
  { href: '/', label: 'Studio' },
  { href: '/playbook/', label: 'Playbook' },
  { href: '/design-system/', label: 'Design system' },
  { href: '/voice/', label: 'Voice & knowledge' },
  { href: '/assets/', label: 'Assets' },
  { href: '/editor/', label: 'Templates' },
  { href: '/documents/', label: 'Documents' },
];

export const ROUTES = {
  hub: '/',
  playbook: '/playbook/',
  designSystem: '/design-system/',
  voice: '/voice/',
  assets: '/assets/',
  editor: '/editor/',
  documents: '/documents/',
} as const;
