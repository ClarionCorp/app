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

export const themeMeta: Record<string, ThemeMeta> = {
  'Ai.Mi': {
    label: 'Ai.Mi',
    description: 'The signature dark theme, with lots of colorful pink accents.',
    icon: '/aimi/Laser.png',
    type: 'dark',
  },
  'Ai.Mi-L': {
    label: 'Ai.Mi Light',
    description: 'A light take on the dark Ai.Mi theme.',
    icon: '/aimi/Pat.png',
    type: 'light',
  },
  'Clarion': {
    label: 'Clarion Dark',
    description: 'A green variant of the Ai.Mi theme.',
    icon: '/emoticons/ClarionCorp.webp',
    type: 'dark',
  },
  'Clarion-L': {
    label: 'Clarion Light',
    description: 'A light version of Clarion Dark.',
    icon: '/emoticons/RasmusGlasses.webp',
    type: 'light',
  },
  'Beach': {
    label: 'Beach',
    description: 'Warm sand tones with an ocean blue vibe.',
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
    description: 'Gray, neutral tones with a yellow accent.',
    icon: '/emoticons/TeamTech.webp',
    type: 'dark',
  },
  'Kazan': {
    label: 'Kazan',
    description: 'Dark gray with slices of orange. Also works for Halloween!',
    icon: '/emoticons/KazanLosinIt.webp',
    type: 'dark',
  },
  // 'Dubu': {
  //   label: 'Rosie Dubu',
  //   description: 'Based on the Rosie Dubu skin for real dubers.',
  //   icon: '/emoticons/DubuHUH.webp',
  //   type: 'dark',
  // },
  'Zentaro': {
    label: 'Zen',
    description: "Based on Zen(taro)'s default skin. Dark gray with crimson accents.",
    icon: '/emoticons/ZentaroPause.webp',
    type: 'dark',
  },
  'Finii': {
    label: 'Finii',
    description: "Based on Finii's default skin. Cotton candy vibes.",
    icon: '/emoticons/FiniiTeehee.webp',
    type: 'dark',
  },
  'Solarized': {
    label: 'Solarized Dark',
    description: 'Based on the popular "Solarized" theme for terminals.',
    icon: '/emoticons/NaoRest.webp',
    type: 'dark',
  },
};

export const themes = Object.keys(themeMeta);