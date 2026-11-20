import { useEffect, useId, useRef, useState } from 'react';
import { ENAMELS, resolveEnamel, useTheme } from '../theme.jsx';
import { DropIcon } from './Icons.jsx';

const swatch = (e) => `oklch(${e.l} ${e.c} ${e.h})`;

// Control «Esmalte»: cuatro esmaltes de fábrica y un dial para pintar la nevera de cualquier tono
export default function EnamelPicker() {
  const { theme, chooseEnamel, setHue } = useTheme();
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const wrapRef = useRef(null);
  const current = resolveEnamel(theme);

  // Se cierra con Escape o al hacer clic fuera
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    const onClick = (e) => !wrapRef.current?.contains(e.target) && setOpen(false);
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onClick);
    };
  }, [open]);

  return (
    <div className="enamel" ref={wrapRef}>
      <button
        type="button"
        className="enamel-trigger"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="enamel-dot" style={{ background: swatch(current) }} aria-hidden="true" />
        <span>Esmalte</span>
        <span className="enamel-name">{current.label}</span>
      </button>

      {open && (
        <div className="enamel-panel" id={panelId} role="group" aria-label="Color de la nevera">
          <p className="enamel-title">Pinta la nevera</p>
          <div className="enamel-swatches" role="radiogroup" aria-label="Esmaltes de fábrica">
            {Object.entries(ENAMELS).map(([id, enamel]) => (
              <button
                key={id}
                type="button"
                role="radio"
                aria-checked={theme.id === id}
                className="enamel-swatch"
                onClick={() => chooseEnamel(id)}
              >
                <span className="swatch-magnet" style={{ background: swatch(enamel) }} aria-hidden="true" />
                {enamel.label}
              </button>
            ))}
          </div>

          <label className={`enamel-dial ${theme.id === 'custom' ? 'is-active' : ''}`}>
            <span className="enamel-dial-label">
              <DropIcon size={16} />
              A tu gusto
              <output>{theme.id === 'custom' ? `${Math.round(theme.hue)}°` : '—'}</output>
            </span>
            <input
              type="range"
              min="0"
              max="360"
              step="1"
              value={theme.hue}
              onChange={(e) => setHue(Number(e.target.value))}
              aria-label="Tono del esmalte"
            />
          </label>
        </div>
      )}
    </div>
  );
}
