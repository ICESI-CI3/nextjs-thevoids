'use client';

import { useEffect } from 'react';
import { useThemeContext } from './ThemeContext';

export default function ThemeUpdater() {
  const { mode } = useThemeContext();

  useEffect(() => {
    const root = document.documentElement;

    if (mode === 'dark') {
      // Modo oscuro
      root.style.setProperty('--background', '#0a0a0a');
      root.style.setProperty('--foreground', '#f0fdf4');
    } else {
      // Modo claro
      root.style.setProperty('--background', '#ffffff');
      root.style.setProperty('--foreground', '#064e3b');
    }
  }, [mode]);

  return null;
}
