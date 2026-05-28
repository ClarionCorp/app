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

export const themes = ['Ai.Mi', 'Clarion'];