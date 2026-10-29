import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import '@/styles/globals.css';
import { THEME_SCRIPT } from '@/lib/theme';
import { ThemeSync } from '@/components/shell/ThemeSync';

export const metadata: Metadata = {
  title: { default: 'Hali Brand Studio', template: '%s · Hali Brand Studio' },
  description: 'The design system, brand reference, assets and template editor for Hali — all reading the same tokens and files.',
  manifest: '/assets/icons/site.webmanifest',
  icons: {
    icon: [
      { url: '/assets/icons/favicon.svg', type: 'image/svg+xml' },
      { url: '/assets/icons/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/assets/icons/favicon-16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: '/assets/icons/apple-touch-icon-180.png',
  },
  openGraph: { title: 'Hali Brand Studio' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FBFAF7' },
    { media: '(prefers-color-scheme: dark)', color: '#161514' },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        <link rel="preload" href="/fonts/Geist-Regular.woff2" as="font" type="font/woff2" crossOrigin="" />
        <link rel="preload" href="/fonts/Geist-SemiBold.woff2" as="font" type="font/woff2" crossOrigin="" />
      </head>
      <body>
        <ThemeSync />
        {children}
      </body>
    </html>
  );
}
