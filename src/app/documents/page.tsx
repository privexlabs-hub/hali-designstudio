import type { Metadata, Viewport } from 'next';
import { DocumentEditor } from '@/components/documents/DocumentEditor';

export const metadata: Metadata = { title: 'Document editor' };
/* Editors have their own zoom and pinch; locking page zoom stops iOS zooming into every focused field. */
export const viewport: Viewport = {
  width: 'device-width', initialScale: 1, maximumScale: 1, viewportFit: 'cover',
  themeColor: [{ media: '(prefers-color-scheme: light)', color: '#FBFAF7' }, { media: '(prefers-color-scheme: dark)', color: '#161514' }],
};

export default function Page() { return <DocumentEditor />; }
