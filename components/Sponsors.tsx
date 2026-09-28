import { event, whatsappLink } from "@/lib/event";
import Reveal from "./Reveal";

export default function Sponsors() {
  const { title, partners } = event.sponsors;
  const slots = Math.max(0, 4 - partners.length);
  return (
    <section id="sponsors" className="relative px-4 py-24 md:px-10 md:py-32">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <p className="eyebrow">Sponsors</p>
          <h2 className="section-title">
            Powered by <em>people</em> who love the beat.
          </h2>
        </Reveal>

        <Reveal delay={0.1}>
          <a
            href={title.url}
            target="_blank"
            rel="noreferrer"
            className="sponsor-hero group relative mt-12 block overflow-hidden rounded-[32px] border border-marigold/30 p-8 md:p-14"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-marigold">Title Sponsor</p>
            <p className="title-gradient mt-4 font-display text-[clamp(2rem,9vw,8.5rem)] font-black leading-none tracking-[-0.05em] transition-transform duration-700 group-hover:scale-[1.02]">
              {title.name}
            </p>
            <p className="mt-4 text-sm text-cream/70 md:text-base">{title.tagline}</p>
          </a>
        </Reveal>

        <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-4">
          {partners.map((s) => (
            <a key={s.name} href={s.url} target="_blank" rel="noreferrer" className="grid h-28 place-items-center rounded-3xl border border-cream/10 bg-cream/[0.03] font-display text-lg text-cream">
              {s.name}
            </a>
          ))}
          {Array.from({ length: slots }).map((_, i) => (
            <a
              key={i}
              href={whatsappLink("Hi! We'd like to sponsor Dandiya Nights, Bhadrak.")}
              target="_blank"
              rel="noreferrer"
              className="group grid h-28 place-items-center rounded-3xl border border-dashed border-cream/20 text-center text-xs uppercase tracking-[0.25em] text-cream/45 transition hover:border-marigold/60 hover:text-marigold"
            >
              <span>
                Your brand here
                <span className="mt-1 block text-[10px] normal-case tracking-normal opacity-0 transition group-hover:opacity-100">Partner with us →</span>
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
