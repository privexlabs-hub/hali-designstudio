import type { Metadata } from 'next';
import { PlaybookPage } from '@/components/pages/PlaybookPage';

export const metadata: Metadata = { title: 'Brand identity playbook' };
export default function Page() { return <PlaybookPage />; }
