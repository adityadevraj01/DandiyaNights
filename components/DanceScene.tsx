"use client";

import { useRef } from "react";
import { motion, useTransform, type MotionValue } from "framer-motion";
import { HERO_LOOK, TAU, drawDancer, garbaPose } from "@/lib/rig";
import { beam, drawPetals, drawStars, makePetals, makeStars, mixColor, sprite, stringLights, track } from "@/lib/fx";
import { useStage } from "@/lib/useStage";
import { useSectionProgress } from "@/lib/useSectionProgress";
import { event, whatsappLink } from "@/lib/event";

const BEATS = 32; // four 8-beat phrases, each ending in a twirl

export default function DanceScene() {
  const section = useRef<HTMLElement>(null);
  const bg = useRef<HTMLCanvasElement>(null);
  const fg = useRef<HTMLCanvasElement>(null);
  const p = useSectionProgress(section);

  const world = useRef<{ smooth: number; stars: ReturnType<typeof makeStars>; petals: ReturnType<typeof makePetals> } | null>(null);

  useStage(section, [bg, fg], ({ ctx: [b, f], w, h, t, dt }) => {
    const s = (world.current ??= { smooth: 0, stars: makeStars(120), petals: makePetals(46) });
    s.smooth += (p.get() - s.smooth) * (1 - Math.exp(-dt * 7));
    const q = s.smooth;
    const mobile = w < 768;

    const pan = mobile ? 0 : track(q, [[0, 0], [0.2, 0], [0.27, 0.2], [0.43, 0.2], [0.5, -0.2], [0.7, -0.2], [0.78, 0], [1, 0]]) * w;
    const zoom = track(q, [[0, 1], [0.2, 1], [0.3, 1.08], [0.75, 1.1], [0.84, 0.8], [1, 0.8]]);
    const cx = w / 2 + pan;
    const floorY = h * (mobile ? 0.84 : 0.9);
    const k = Math.min((h * 0.58) / 190, (w * 0.92) / 200) * zoom;

    // ---- background
    const sky = b.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, mixColor("#07051a", "#10031c", q));
    sky.addColorStop(0.55, mixColor("#1d0b3f", "#3d0a33", q));
    sky.addColorStop(1, mixColor("#4a0f4f", "#7a1a1a", q));
    b.fillStyle = sky;
    b.fillRect(0, 0, w, h);
    drawStars(b, s.stars, w, h, t, q * 0.15);

    // halo behind the dancer
    b.globalCompositeOperation = "lighter";
    const halo = b.createRadialGradient(cx, h * 0.5, 0, cx, h * 0.5, h * 0.62);
    halo.addColorStop(0, "rgba(255,140,50,0.42)");
    halo.addColorStop(0.45, "rgba(255,45,135,0.16)");
    halo.addColorStop(1, "rgba(0,0,0,0)");
    b.fillStyle = halo;
    b.fillRect(0, 0, w, h);
    b.globalCompositeOperation = "source-over";

    mandala(b, cx, h * 0.5, Math.min(w, h) * 0.44, q * TAU * 0.6 + t * 0.04);

    // fairy lights (parallax up as you scroll)
    const ly = -q * h * 0.12;
    stringLights(b, -40, h * 0.05 + ly, w * 0.56, h * 0.01 + ly, h * 0.13, t, { spacing: mobile ? 30 : 40, r: mobile ? 10 : 15 });
    stringLights(b, w * 0.44, h * 0.0 + ly, w + 40, h * 0.07 + ly, h * 0.12, t, { spacing: mobile ? 30 : 40, r: mobile ? 10 : 15, phase: 3 });
    stringLights(b, -40, h * 0.22 + ly * 1.6, w + 40, h * 0.17 + ly * 1.6, h * 0.09, t, { spacing: 30, r: 8, phase: 1, chase: 3 });

    // sweeping beams
    const sweep = Math.sin(t * 0.7) * w * 0.12;
    beam(b, w * 0.04, -10, cx + sweep, floorY, 0.1, "#ff4d94", 0.2);
    beam(b, w * 0.96, -10, cx - sweep, floorY, 0.1, "#ffb020", 0.2);

    // stage floor
    const fl = b.createLinearGradient(0, floorY - h * 0.1, 0, h);
    fl.addColorStop(0, "rgba(10,3,16,0)");
    fl.addColorStop(0.4, "rgba(10,3,16,0.75)");
    fl.addColorStop(1, "rgba(5,2,10,1)");
    b.fillStyle = fl;
    b.fillRect(0, floorY - h * 0.1, w, h);
    b.globalCompositeOperation = "lighter";
    const pool = b.createRadialGradient(cx, floorY, 0, cx, floorY, 220 * k);
    pool.addColorStop(0, "rgba(255,170,70,0.5)");
    pool.addColorStop(1, "rgba(255,90,60,0)");
    b.fillStyle = pool;
    b.beginPath();
    b.ellipse(cx, floorY, 220 * k, 34 * k, 0, 0, TAU);
    b.fill();
    b.globalCompositeOperation = "source-over";

    // ---- dancer
    f.clearRect(0, 0, w, h);
    drawDancer(f, garbaPose(q * BEATS, t), HERO_LOOK, { x: cx, y: floorY - 88 * k, k, time: t });
    drawPetals(f, s.petals, w, h, t, q);
  });

  const titleOpacity = useTransform(p, [0, 0.1, 0.18], [1, 1, 0]);
  const titleY = useTransform(p, [0, 0.18], [0, -140]);
  const titleScale = useTransform(p, [0, 0.18], [1, 1.1]);
  const hintOpacity = useTransform(p, [0, 0.04], [1, 0]);

  return (
    <section ref={section} id="top" className="relative h-[560vh]" aria-label="Dandiya Nights intro">
      <div className="sticky top-0 h-svh w-full overflow-hidden">
        <canvas ref={bg} className="absolute inset-0 h-full w-full" aria-hidden />

        {/* Title sits between the background and the dancer so she dances in front of it */}
        <motion.div
          style={{ opacity: titleOpacity, y: titleY, scale: titleScale }}
          className="pointer-events-none absolute inset-x-0 top-[13svh] z-10 flex flex-col items-center px-4 text-center md:top-[11svh]"
        >
          <p className="mb-4 font-sans text-[11px] font-semibold uppercase tracking-[0.35em] text-cream/80 md:text-xs">
            {event.occasion} · {event.city}, {event.state}
          </p>
          <h1 className="title-gradient font-display text-[16vw] font-black leading-[0.8] tracking-[-0.05em] md:text-[15.5vw]">
            DANDIYA
            <span className="block font-serif text-[0.55em] font-normal italic tracking-[-0.02em]">Nights</span>
          </h1>
        </motion.div>

        <canvas ref={fg} className="dancer-glow absolute inset-0 z-20 h-full w-full" aria-hidden />

        <motion.div style={{ opacity: titleOpacity }} className="absolute inset-x-0 bottom-[7svh] z-30 flex items-end justify-between gap-4 px-4 md:px-10">
          <div>
            <p className="font-display text-2xl font-bold text-cream md:text-4xl">17 · 18 · 19</p>
            <p className="text-xs uppercase tracking-[0.3em] text-cream/70">October 2026</p>
          </div>
          <a href={event.sponsors.title.url} target="_blank" rel="noreferrer" className="pr-16 text-right md:pr-20">
            <p className="text-[10px] uppercase tracking-[0.3em] text-cream/60">Presented by</p>
            <p className="font-display text-lg font-bold tracking-tight text-marigold md:text-2xl">{event.sponsors.title.name}</p>
          </a>
        </motion.div>

        <Chapter p={p} range={[0.22, 0.27, 0.4, 0.45]} side="left" eyebrow="01 — The Rhythm">
          When the dhol drops, <em>Bhadrak</em> moves.
          <Sub>Three nights of garba and dandiya under Durga Puja lights — live dhol, big sound and a circle that never stops.</Sub>
        </Chapter>

        <Chapter p={p} range={[0.49, 0.54, 0.67, 0.72]} side="right" eyebrow="02 — The Colours">
          Mirror-work, mehendi &amp; a <em>thousand</em> dandiyas.
          <Sub>Chaniya choli, kediyu or your most festive fit. We bring the lights, the beats and the sticks.</Sub>
        </Chapter>

        <Chapter p={p} range={[0.76, 0.81, 0.99, 1]} side="center" eyebrow="03 — The Nights">
          Three nights. <em>One</em> circle.
          <span className="mt-6 flex flex-wrap justify-center gap-3">
            <a href="#passes" className="btn-primary">Get passes</a>
            <a href={whatsappLink("Hi! I want Dandiya Nights passes.")} target="_blank" rel="noreferrer" className="btn-ghost">
              Book on WhatsApp
            </a>
          </span>
        </Chapter>

        <Scrubber p={p} hint={hintOpacity} />
      </div>
    </section>
  );
}

function Sub({ children }: { children: React.ReactNode }) {
  return <span className="mt-4 block max-w-md font-sans text-sm font-normal leading-relaxed tracking-normal text-cream/75 md:text-base">{children}</span>;
}

function Chapter({
  p,
  range,
  side,
  eyebrow,
  children,
}: {
  p: MotionValue<number>;
  range: [number, number, number, number];
  side: "left" | "right" | "center";
  eyebrow: string;
  children: React.ReactNode;
}) {
  const opacity = useTransform(p, range, [0, 1, 1, range[3] === 1 ? 1 : 0]);
  const y = useTransform(p, range, [60, 0, 0, -60]);
  const pos =
    side === "left"
      ? "md:left-10 md:top-1/2 md:-translate-y-1/2 md:max-w-[34rem] md:text-left"
      : side === "right"
        ? "md:right-10 md:top-1/2 md:-translate-y-1/2 md:max-w-[34rem] md:text-left"
        : "md:left-1/2 md:top-[7svh] md:-translate-x-1/2 md:max-w-[46rem] md:text-center";
  return (
    <motion.div
      style={{ opacity, y }}
      className={`chapter absolute inset-x-0 bottom-0 z-30 px-5 pb-[9svh] pt-24 text-center md:inset-x-auto md:bottom-auto md:bg-none md:p-0 ${pos}`}
    >
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.35em] text-marigold">{eyebrow}</p>
      <h2 className="font-display text-3xl font-bold leading-[1.05] tracking-tight text-cream md:text-6xl">{children}</h2>
    </motion.div>
  );
}

function Scrubber({ p, hint }: { p: MotionValue<number>; hint: MotionValue<number> }) {
  const tc = useTransform(p, (v) => {
    const frames = Math.round(v * 150 * 24);
    const sec = Math.floor(frames / 24);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `00:${pad(Math.floor(sec / 60))}:${pad(sec % 60)}:${pad(frames % 24)}`;
  });
  return (
    <div className="pointer-events-none absolute inset-x-4 bottom-3 z-30 md:inset-x-10 md:bottom-4">
      <div className="mb-1.5 flex items-center justify-between font-mono text-[10px] tracking-widest text-cream/60">
        <span className="flex items-center gap-2">
          <span className="rec-dot h-1.5 w-1.5 rounded-full bg-rani" /> REC
          <motion.span style={{ opacity: hint }} className="ml-1 flex items-center gap-2 text-cream/85">
            · scroll to play <span className="scroll-cue inline-block h-3 w-px bg-cream/70" />
          </motion.span>
        </span>
        <motion.span>{tc}</motion.span>
      </div>
      <div className="relative h-px w-full bg-cream/15">
        <motion.div style={{ scaleX: p }} className="absolute inset-0 origin-left bg-linear-to-r from-marigold to-rani" />
        {[0.25, 0.5, 0.78].map((m) => (
          <span key={m} className="absolute -top-[3px] h-[7px] w-px bg-cream/40" style={{ left: `${m * 100}%` }} />
        ))}
      </div>
    </div>
  );
}

function mandala(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, rot: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.globalCompositeOperation = "lighter";
  const rings = [
    { rr: r, n: 36, a: 0.13, dir: 1 },
    { rr: r * 0.78, n: 24, a: 0.1, dir: -1 },
    { rr: r * 0.56, n: 16, a: 0.08, dir: 1 },
  ];
  for (const ring of rings) {
    ctx.save();
    ctx.rotate(rot * ring.dir);
    ctx.strokeStyle = `rgba(255,209,102,${ring.a})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, 0, ring.rr, 0, TAU);
    ctx.stroke();
    for (let i = 0; i < ring.n; i++) {
      ctx.rotate(TAU / ring.n);
      ctx.beginPath();
      ctx.ellipse(0, -ring.rr, ring.rr * 0.035, ring.rr * 0.09, 0, 0, TAU);
      ctx.stroke();
      sprite(ctx, "#ffd166", 0, -ring.rr - ring.rr * 0.12, 3, ring.a * 3);
    }
    ctx.restore();
  }
  ctx.restore();
  ctx.globalCompositeOperation = "source-over";
}
