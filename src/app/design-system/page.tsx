import type { Metadata } from 'next';
import { DesignSystemPage } from '@/components/pages/DesignSystemPage';

export const metadata: Metadata = { title: 'Design system' };
export default function Page() { return <DesignSystemPage />; }
