// Delte ikoner til salgs-sektionerne. Inline SVG, ingen ikon-pakke: siden bruger
// under ti symboler, og et library ville koste mere i bundle end det sparer.
// Farverne er tokens, sat via `stroke`/`fill` på kaldestedet hvor de varierer.

export function Flueben({ farve = "#00B3A6", size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" aria-hidden="true">
      <circle cx="10" cy="10" r="10" fill={farve} />
      <path d="M6 10.5l2.5 2.5L14 7" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Kryds({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" aria-hidden="true">
      <circle cx="10" cy="10" r="10" fill="#E4E9F0" />
      <path d="M7 7l6 6M13 7l-6 6" stroke="#5A6678" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/** Birdlys fugl i miniature — samme streg som i forsidens SMS-mockup. */
export function Fugl({ size = 15 }) {
  return (
    <svg width={size} viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <path d="M4 17C8 11 11 11 14 15" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M14 15C17 11 20 11 24 17" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

export function Oeje({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6-10-6-10-6z" stroke="#2EB7FF" strokeWidth="1.9" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="2.6" stroke="#2EB7FF" strokeWidth="1.9" />
    </svg>
  );
}

export function Bunke({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="4" width="18" height="5" rx="1.6" stroke="#2EB7FF" strokeWidth="1.9" />
      <rect x="3" y="11" width="18" height="5" rx="1.6" stroke="#2EB7FF" strokeWidth="1.9" />
      <path d="M6 19h12" stroke="#2EB7FF" strokeWidth="1.9" strokeLinecap="round" />
    </svg>
  );
}

export function Ur({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="#2EB7FF" strokeWidth="1.9" />
      <path d="M12 7v5.4l3.4 2" stroke="#2EB7FF" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
