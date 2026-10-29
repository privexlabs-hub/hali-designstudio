import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FlatCompat } from '@eslint/eslintrc';

const compat = new FlatCompat({ baseDirectory: dirname(fileURLToPath(import.meta.url)) });

// Mirrors the design system's adherence rules (_adherence.oxlintrc.json) for component code:
// tokens instead of raw hex, Geist families only, and barrel imports for DS components.
const adherence = {
  files: ['src/components/**/*.tsx', 'src/app/**/*.tsx'],
  rules: {
    'no-restricted-imports': ['warn', { patterns: [{ group: ['@/components/ds/*', '!@/components/ds/index'], message: 'Import design-system components from "@/components/ds".' }] }],
    'no-restricted-syntax': ['warn',
      { selector: "Literal[value=/font-family\\s*:(?![^;]*(Geist|var\\(--font))/i]", message: 'Use Geist or Geist Mono (var(--font-sans) / var(--font-mono)).' },
    ],
  },
};

const config = [
  { ignores: ['docs/**', 'out/**', '.next/**', 'node_modules/**', 'src/components/ds/icon-registry.ts', 'next-env.d.ts'] },
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  adherence,
  { files: ['src/components/ds/**'], rules: { 'no-restricted-imports': 'off' } },
];

export default config;
