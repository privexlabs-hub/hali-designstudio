import type { Metadata } from 'next';
import { VoicePage } from '@/components/pages/VoicePage';

export const metadata: Metadata = { title: 'Brand voice & knowledge' };
export default function Page() { return <VoicePage />; }
