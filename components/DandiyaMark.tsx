/** Crossed dandiya sticks with a spark — the event mark. */
export function DandiyaMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <defs>
        <linearGradient id="dm-a" x1="0" x2="1">
          <stop offset="0" stopColor="#ffb020" />
          <stop offset="1" stopColor="#ff2d87" />
        </linearGradient>
      </defs>
      <path d="M6 28 24 6" stroke="url(#dm-a)" strokeWidth="3.2" strokeLinecap="round" />
      <path d="M26 28 8 6" stroke="url(#dm-a)" strokeWidth="3.2" strokeLinecap="round" />
      <path d="M6 28 24 6" stroke="#fff4e0" strokeWidth="3.2" strokeLinecap="round" strokeDasharray="2 4" opacity=".6" />
      <circle cx="16" cy="15.8" r="2.4" fill="#fff4e0" />
      <path d="M16 8v3M16 20.5v3M9 15.8h3M20 15.8h3" stroke="#ffd166" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
