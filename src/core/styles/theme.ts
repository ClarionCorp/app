import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Inlined into <head> in layout.tsx to run before React hydrates.
// Prevents a flash of the default dark theme when the user has a different preference stored.
export const themeScript = `
(function () {
  try {
    var theme = localStorage.getItem('theme');
    if (theme === 'Ai.Mi' || theme === 'Clarion') {
      document.documentElement.setAttribute('data-theme', theme);
    }
  } catch (_) {}
})();
`.trim();

export type ThemeType = 'dark' | 'light';

export interface ThemeMeta {
  label: string;
  description: string;
  icon: string;
  type: ThemeType;
}

export const themes = ['Ai.Mi', 'Ai.Mi-L', 'Clarion', 'Clarion-L', 'Beach', 'Obscura', 'Maelstrom', 'Kazan'];

export const themeMeta: Record<string, ThemeMeta> = {
  'Ai.Mi': {
    label: 'Ai.Mi',
    description: 'The signature dark theme, with vivid pink accents.',
    icon: '/aimi/Laser.png',
    type: 'dark',
  },
  'Ai.Mi-L': {
    label: 'Ai.Mi Light',
    description: 'A light take on Ai.Mi. Work in progress.',
    icon: '/aimi/Pat.png',
    type: 'light',
  },
  'Clarion': {
    label: 'Clarion',
    description: 'Sleek dark theme with a punchy green accent.',
    icon: '/emoticons/ClarionCorp.webp',
    type: 'dark',
  },
  'Clarion-L': {
    label: 'Clarion Light',
    description: 'A light take on Clarion. Work in progress.',
    icon: '/emoticons/ClarionCorp.webp',
    type: 'light',
  },
  'Beach': {
    label: 'Beach',
    description: 'Warm sand tones with a breezy blue accent.',
    icon: '/emoticons/JunoHappy.webp',
    type: 'light',
  },
  'Obscura': {
    label: 'Obscura',
    description: 'Moody purple theme, loosely based on Catppuccin.',
    icon: '/emoticons/RuneCreepy.webp',
    type: 'dark',
  },
  'Maelstrom': {
    label: 'Maelstrom',
    description: 'Stormy neutral tones with a golden accent.',
    icon: '/emoticons/TeamTech.webp',
    type: 'dark',
  },
  'Kazan': {
    label: 'Kazan',
    description: 'Gunmetal and orange, built for late-night sets.',
    icon: '/emoticons/KazanLosinIt.webp',
    type: 'dark',
  },
};