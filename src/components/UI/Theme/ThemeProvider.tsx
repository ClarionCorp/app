import { createContext, useContext, useEffect, useState } from 'react';
import { themes } from '../../../core/styles/theme';

interface ThemeContextValue {
  theme: string;
  setTheme: (theme: string) => void;
}

// Context
const ThemeContext = createContext<ThemeContextValue | null>(null);
const STORAGE_KEY = 'theme';
const DEFAULT_THEME = themes[0];

// Provider
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<string>(DEFAULT_THEME);

  // On mount, read from localStorage (or initialize it with the default)
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as string | null;
    const active = stored && themes.includes(stored) ? stored : DEFAULT_THEME;
    if (!stored) localStorage.setItem(STORAGE_KEY, active);
    applyTheme(active);
    setThemeState(active);
  }, []);

  function applyTheme(next: string) {
    document.documentElement.setAttribute('data-theme', next);
  }

  function setTheme(next: string) {
    applyTheme(next);
    setThemeState(next);
    localStorage.setItem(STORAGE_KEY, next);
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Hook
export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
}