'use client';
import { IconButton } from '@/components/ds';
import { useTheme } from '@/lib/theme';

export function ThemeToggle({ size = 'sm' }: { size?: 'sm' | 'md' }) {
  const [theme, toggle] = useTheme();
  return <IconButton icon={theme === 'dark' ? 'sun' : 'moon'} label="Switch light or dark theme" size={size} onClick={toggle} />;
}
