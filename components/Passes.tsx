"use client";

import { useRef } from "react";
import { event, formatPrice, phoneLink, whatsappLink } from "@/lib/event";
import Reveal from "./Reveal";

export default function Passes() {
  return (
    <section id="passes" className="relative overflow-hidden px-4 pb-10 pt-28 md:px-10 md:pb-16 md:pt-40">
      <div className="glow-blob left-[-10%] top-10 bg-rani/30" />
      <div className="glow-blob bottom-0 right-[-10%] bg-marigold/25" />

      <div className="relative mx-auto max-w-6xl">
        <Reveal>
          <p className="eyebrow">Passes</p>
          <h2 className="section-title">
            Get on the <em>floor</em>.
          </h2>
          <p className="mt-5 max-w-xl text-cream/70">
            Buy online on <strong className="text-cream">Burlamart</strong>, or grab offline passes by calling or WhatsApping us.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {event.passes.map((pass, i) => (
            <Reveal key={pass.id} delay={i * 0.08}>
              <TiltCard featured={pass.featured}>
                {pass.featured && (
                  <span className="absolute right-5 top-5 rounded-full bg-marigold px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-night">
                    Most loved
                  </span>
                )}
                <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-cream/60">{pass.name}</p>
                <p className="mt-6 font-display text-6xl font-black tracking-tighter text-cream">{formatPrice(pass.price)}</p>
                <p className="mt-1 text-sm text-cream/60">{pass.price === null ? "Price announcing soon" : pass.per}</p>
                <ul className="mt-6 space-y-2.5 text-sm text-cream/85">
                  {pass.perks.map((perk) => (
                    <li key={perk} className="flex items-center gap-3">
                      <span className="h-1.5 w-1.5 rotate-45 bg-marigold" />
                      {perk}
                    </li>
                  ))}
                </ul>
                <div className="mt-8 grid gap-2">
                  <a href={event.burlamartUrl} target="_blank" rel="noreferrer" className="btn-primary justify-center">
                    Buy on Burlamart ↗
                  </a>
                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href={whatsappLink(`Hi! I'd like to book the ${pass.name} for Dandiya Nights.`)}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-ghost justify-center"
                    >
                      WhatsApp
                    </a>
                    <a href={phoneLink} className="btn-ghost justify-center">
                      Call us
                    </a>
                  </div>
                </div>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function TiltCard({ children, featured }: { children: React.ReactNode; featured: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const onMove = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el || e.pointerType !== "mouse") return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty("--rx", `${-y * 8}deg`);
    el.style.setProperty("--ry", `${x * 10}deg`);
    el.style.setProperty("--mx", `${(x + 0.5) * 100}%`);
    el.style.setProperty("--my", `${(y + 0.5) * 100}%`);
  };
  const reset = () => {
    ref.current?.style.setProperty("--rx", "0deg");
    ref.current?.style.setProperty("--ry", "0deg");
  };
  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={reset}
      className={`tilt-card relative h-full rounded-[28px] border p-7 ${
        featured ? "border-marigold/50 bg-linear-to-b from-rani/25 to-night/60" : "border-cream/10 bg-cream/[0.03]"
      }`}
    >
      {children}
    </div>
  );
}
