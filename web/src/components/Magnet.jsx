import { useId } from 'react';

// Imán de nevera dibujado en SVG: domo con borde, sombra propia y reflejo.
// El color sale de --cat (currentColor), así un mismo dibujo sirve para las tres categorías.
export default function Magnet({ label, children, size = 'md', className = '' }) {
  const id = useId().replace(/:/g, '');
  return (
    <span
      className={`magnet magnet-${size} ${className}`}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : 'true'}
    >
      <svg viewBox="0 0 64 64" aria-hidden="true" focusable="false">
        <defs>
          <radialGradient id={`dome-${id}`} cx="42%" cy="36%" r="68%">
            <stop offset="0" stopColor="currentColor" stopOpacity="1" />
            <stop offset="0.62" stopColor="currentColor" stopOpacity="1" />
            <stop offset="1" stopColor="#000" stopOpacity="0.38" />
          </radialGradient>
          <linearGradient id={`rim-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity="0.55" />
            <stop offset="0.5" stopColor="#fff" stopOpacity="0" />
            <stop offset="1" stopColor="#000" stopOpacity="0.35" />
          </linearGradient>
          <filter id={`soft-${id}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.6" />
          </filter>
        </defs>
        {/* Sombra que proyecta el imán sobre el papel */}
        <ellipse cx="33" cy="38" rx="27" ry="24" fill="#000" opacity="0.28" filter={`url(#soft-${id})`} />
        {/* Cuerpo: color base, oscurecido hacia el borde */}
        <circle cx="32" cy="32" r="27" fill="currentColor" />
        <circle cx="32" cy="32" r="27" fill={`url(#dome-${id})`} />
        {/* Borde biselado del plástico */}
        <circle cx="32" cy="32" r="26.2" fill="none" stroke={`url(#rim-${id})`} strokeWidth="1.6" />
        {/* Reflejo principal y uno secundario */}
        <ellipse cx="23.5" cy="20.5" rx="9.5" ry="6" fill="#fff" opacity="0.55" transform="rotate(-28 23.5 20.5)" filter={`url(#soft-${id})`} />
        <ellipse cx="21.5" cy="19" rx="3.2" ry="2" fill="#fff" opacity="0.9" transform="rotate(-28 21.5 19)" />
        <ellipse cx="44" cy="46" rx="6" ry="2.4" fill="#fff" opacity="0.16" transform="rotate(-35 44 46)" />
      </svg>
      {children != null && <span className="magnet-mark">{children}</span>}
    </span>
  );
}
