import type { Metadata } from 'next';
import { AssetsPage } from '@/components/pages/AssetsPage';

export const metadata: Metadata = { title: 'Asset library' };
export default function Page() { return <AssetsPage />; }
