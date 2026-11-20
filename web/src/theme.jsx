import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { flushSync } from 'react-dom';

// Esmaltes de la nevera: toda la paleta sale de estos tres números OKLCH (l, c, h)
export const ENAMELS = {
  menta: { label: 'Menta', l: 0.87, c: 0.075, h: 168, tone: 'light' },
  mantequilla: { label: 'Mantequilla', l: 0.905, c: 0.1, h: 95, tone: 'light' },
  cereza: { label: 'Cereza', l: 0.53, c: 0.17, h: 24, tone: 'bold' },
  medianoche: { label: 'Medianoche', l: 0.25, c: 0.035, h: 262, tone: 'dark' },
};

// El esmalte libre usa el tono que el usuario elige en el dial
const CUSTOM = { label: 'A tu gusto', l: 0.8, c: 0.115, tone: 'light' };
const STORAGE_KEY = 'contactbook.enamel';

const ThemeContext = createContext(null);

function prefersDark() {
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches;
}

function prefersReducedMotion() {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}

function loadTheme() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && (ENAMELS[saved.id] || saved.id === 'custom')) return saved;
  } catch {
    // se ignora un valor guardado corrupto
  }
  return { id: prefersDark() ? 'medianoche' : 'menta', hue: 300 };
}

export function resolveEnamel(theme) {
  if (theme.id === 'custom') return { ...CUSTOM, h: theme.hue };
  return ENAMELS[theme.id];
}

// Escribe el esmalte en el <html>: el CSS deriva de aquí todos los colores
function applyTheme(theme) {
  const enamel = resolveEnamel(theme);
  const root = document.documentElement;
  root.style.setProperty('--el', enamel.l);
  root.style.setProperty('--ec', enamel.c);
  root.style.setProperty('--eh', enamel.h);
  root.dataset.tone = enamel.tone;
  root.style.colorScheme = enamel.tone === 'dark' ? 'dark' : 'light';
}

// Ejecuta un cambio de estado dentro de una View Transition cuando el navegador la soporta
export function withViewTransition(update, rootClass) {
  if (!document.startViewTransition || prefersReducedMotion()) {
    update();
    return;
  }
  const root = document.documentElement;
  if (rootClass) root.classList.add(rootClass);
  const transition = document.startViewTransition(() => flushSync(update));
  transition.finished.finally(() => {
    if (rootClass) root.classList.remove(rootClass);
  });
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(loadTheme);

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(theme));
  }, [theme]);

  // Cambio de esmalte: se vierte de arriba abajo
  const chooseEnamel = useCallback((id) => {
    withViewTransition(() => {
      setTheme((current) => {
        const next = { ...current, id };
        applyTheme(next);
        return next;
      });
    }, 'enamel-pour');
  }, []);

  // El dial mueve el tono en continuo, sin transición
  const setHue = useCallback((hue) => {
    setTheme({ id: 'custom', hue });
  }, []);

  const value = useMemo(() => ({ theme, chooseEnamel, setHue }), [theme, chooseEnamel, setHue]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
