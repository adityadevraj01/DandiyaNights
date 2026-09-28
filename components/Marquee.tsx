const words = ["Garba", "Dandiya", "Dhol", "Durga Puja", "Bhadrak", "17 — 19 Oct", "Raas", "Three Nights"];

function Row({ reverse, className }: { reverse?: boolean; className: string }) {
  const items = [...words, ...words];
  return (
    <div className={`flex overflow-hidden whitespace-nowrap py-3 md:py-4 ${className}`}>
      <div className={`marquee flex shrink-0 items-center gap-6 pr-6 md:gap-10 md:pr-10 ${reverse ? "marquee-reverse" : ""}`}>
        {items.map((w, i) => (
          <span key={i} className="flex items-center gap-6 font-display text-2xl font-black uppercase tracking-tight md:gap-10 md:text-5xl">
            {w}
            <span className="text-[0.6em]">✦</span>
          </span>
        ))}
      </div>
      <div aria-hidden className={`marquee flex shrink-0 items-center gap-6 pr-6 md:gap-10 md:pr-10 ${reverse ? "marquee-reverse" : ""}`}>
        {items.map((w, i) => (
          <span key={i} className="flex items-center gap-6 font-display text-2xl font-black uppercase tracking-tight md:gap-10 md:text-5xl">
            {w}
            <span className="text-[0.6em]">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export default function Marquee() {
  return (
    <div className="relative z-10 -my-8 overflow-hidden py-10" aria-hidden>
      <Row className="-rotate-2 bg-marigold text-night" />
      <Row reverse className="-mt-3 rotate-1 bg-rani text-cream" />
    </div>
  );
}
