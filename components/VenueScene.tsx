"use client";

import { useEffect, useRef } from "react";
import { motion, useTransform } from "framer-motion";
import { RING_LOOKS, TAU, dandiyaPose, drawDancer } from "@/lib/rig";
import { beam, drawStars, makeStars, sprite, stringLights } from "@/lib/fx";
import { useStage } from "@/lib/useStage";
import { useSectionProgress } from "@/lib/useSectionProgress";
import { event } from "@/lib/event";

const BPM = 104;

type Fan = { x: number; s: number; ph: number; tone: number };

export default function VenueScene() {
  const section = useRef<HTMLElement>(null);
  const bg = useRef<HTMLCanvasElement>(null);
  const fg = useRef<HTMLCanvasElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const travel = useRef(0);
  const p = useSectionProgress(section);

  const world = useRef<{ smooth: number; stars: ReturnType<typeof makeStars>; crowd: Fan[] } | null>(null);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const measure = () => (travel.current = Math.max(0, el.scrollWidth - window.innerWidth + 32));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const x = useTransform(p, (v) => -Math.min(1, Math.max(0, (v - 0.06) / 0.8)) * travel.current);
  const headY = useTransform(p, [0, 0.15], [40, 0]);
  const headOpacity = useTransform(p, [0, 0.1], [0.2, 1]);

  useStage(section, [bg, fg], ({ ctx: [b, f], w, h, t, dt }) => {
    const s = (world.current ??= {
      smooth: 0,
      stars: makeStars(90),
      crowd: Array.from({ length: 90 }, (_, i) => ({ x: i / 90 + Math.random() * 0.01, s: 0.8 + Math.random() * 0.5, ph: Math.random() * TAU, tone: Math.random() })),
    });
    s.smooth += (p.get() - s.smooth) * (1 - Math.exp(-dt * 6));
    const q = s.smooth;
    const mobile = w < 768;

    const R = mobile ? 190 : 300;
    const pairs = mobile ? 5 : 7;
    const horizon = h * 0.42;
    const cx = w / 2;
    const cy = h * (mobile ? 0.6 : 0.6);
    const k0 = Math.min((w * (mobile ? 0.9 : 0.62)) / (2 * R), (h * 0.3) / 190);
    const tilt = 0.26;
    const beat = t * (BPM / 60) + q * 6;

    // ---- background: sky, pandal, lights, crowd, floor
    const sky = b.createLinearGradient(0, 0, 0, horizon);
    sky.addColorStop(0, "#06041a");
    sky.addColorStop(1, "#2a0b3d");
    b.fillStyle = sky;
    b.fillRect(0, 0, w, horizon + 2);
    drawStars(b, s.stars, w, h, t);

    pandal(b, cx, w, h, horizon, t, q);

    // canopy lights radiating from the crown
    const crownY = h * 0.03;
    for (let i = 0; i < 9; i++) {
      const e = 0.05 + (i / 8) * 0.4;
      stringLights(b, cx, crownY, -20, h * e, h * 0.05, t, { spacing: mobile ? 26 : 34, r: mobile ? 7 : 10, phase: i, chase: 4 });
      stringLights(b, cx, crownY, w + 20, h * e, h * 0.05, t, { spacing: mobile ? 26 : 34, r: mobile ? 7 : 10, phase: i + 2, chase: 4 });
    }

    // crowd along the back
    for (const c of s.crowd) {
      const bob = Math.abs(Math.sin(beat * Math.PI + c.ph)) * 3;
      const px = c.x * w;
      const sc = c.s * (mobile ? 0.7 : 1);
      const baseY = horizon + 6 - bob;
      b.fillStyle = c.tone > 0.5 ? "#140620" : "#1d0a2a";
      b.beginPath();
      b.ellipse(px, baseY - 14 * sc, 6 * sc, 7 * sc, 0, 0, TAU);
      b.fill();
      b.beginPath();
      b.ellipse(px, baseY + 6 * sc, 13 * sc, 12 * sc, 0, Math.PI, TAU);
      b.fill();
      if (c.tone > 0.9) sprite(b, "#b197fc", px + 4, baseY - 30 * sc, 5, 0.9); // phone lights
    }

    // floor
    const fl = b.createLinearGradient(0, horizon, 0, h);
    fl.addColorStop(0, "#1c0722");
    fl.addColorStop(1, "#070209");
    b.fillStyle = fl;
    b.fillRect(0, horizon, w, h - horizon);

    b.globalCompositeOperation = "lighter";
    const pool = b.createRadialGradient(cx, cy, 0, cx, cy, R * k0 * 1.5);
    pool.addColorStop(0, "rgba(255,150,60,0.55)");
    pool.addColorStop(0.5, "rgba(255,60,120,0.16)");
    pool.addColorStop(1, "rgba(0,0,0,0)");
    b.fillStyle = pool;
    b.save();
    b.translate(cx, cy);
    b.scale(1, tilt * 1.2);
    b.beginPath();
    b.arc(0, 0, R * k0 * 1.5, 0, TAU);
    b.fill();
    b.restore();
    b.globalCompositeOperation = "source-over";

    // rangoli rings painted on the floor
    b.save();
    b.translate(cx, cy);
    b.scale(1, tilt);
    for (const [rr, dash, col] of [
      [R * 1.18, 10, "rgba(255,209,102,0.45)"],
      [R * 0.62, 6, "rgba(255,77,148,0.45)"],
      [R * 0.3, 4, "rgba(61,220,132,0.45)"],
    ] as [number, number, string][]) {
      b.strokeStyle = col;
      b.lineWidth = 2 / tilt;
      b.setLineDash([dash * k0, dash * k0 * 0.8]);
      b.lineDashOffset = -t * 20 - q * 400;
      b.beginPath();
      b.arc(0, 0, rr * k0, 0, TAU);
      b.stroke();
    }
    b.setLineDash([]);
    b.restore();

    const sweep = Math.sin(t * 0.6);
    beam(b, 0, horizon * 0.2, cx + sweep * w * 0.2, cy, 0.09, "#3ddc84", 0.14);
    beam(b, w, horizon * 0.2, cx - sweep * w * 0.2, cy, 0.09, "#ff4d94", 0.16);

    // ---- the garba ring
    f.clearRect(0, 0, w, h);
    const rot = t * 0.12 + q * TAU * 0.75;
    const delta = 50 / R;
    const items: { z: number; draw: () => void }[] = [];

    for (let j = 0; j < pairs; j++) {
      const th = (j / pairs) * TAU + rot;
      for (const side of [-1, 1]) {
        const a = th + side * delta;
        const px = Math.cos(a) * R, pz = Math.sin(a) * R;
        const ox = Math.cos(th - side * delta) * R, oz = Math.sin(th - side * delta) * R;
        const face = Math.atan2(ox - px, oz - pz);
        const look = RING_LOOKS[(j * 2 + (side > 0 ? 1 : 0)) % RING_LOOKS.length];
        items.push({
          z: pz,
          draw: () => {
            const persp = 1 + (pz / R) * 0.3;
            const kk = k0 * persp;
            const pose = dandiyaPose(beat + (j % 4) * 4, t + j * 1.3);
            pose.spin += face;
            f.globalAlpha = 0.72 + 0.28 * ((pz / R + 1) / 2);
            drawDancer(f, pose, look, { x: cx + px * k0 * persp, y: cy + pz * k0 * tilt - 88 * kk, k: kk, time: t });
            f.globalAlpha = 1;
          },
        });
      }
    }
    items.push({ z: 0, draw: () => lamp(f, cx, cy, k0, t) });
    items.sort((m, n) => m.z - n.z).forEach((it) => it.draw());
  });

  return (
    <section ref={section} id="venue" className="relative h-[460vh]" aria-label="Venue and schedule">
      <div className="sticky top-0 h-svh w-full overflow-hidden">
        <canvas ref={bg} className="absolute inset-0 h-full w-full" aria-hidden />
        <canvas ref={fg} className="ring-glow absolute inset-0 h-full w-full" aria-hidden />

        <motion.div style={{ y: headY, opacity: headOpacity }} className="absolute left-0 top-[11svh] z-10 px-5 md:left-10 md:top-[14svh] md:px-0">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.35em] text-marigold">The Venue</p>
          <h2 className="max-w-[14ch] font-display text-3xl font-bold leading-[1.02] tracking-tight text-cream drop-shadow-[0_4px_30px_rgba(7,5,26,0.95)] md:text-5xl">
            Where the circle comes <em>alive</em>.
          </h2>
          <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-cream/15 bg-night/40 px-4 py-2 text-sm text-cream/85 backdrop-blur-md">
            <PinIcon /> {event.venue.name} · {event.venue.address}
          </p>
        </motion.div>

        <div className="absolute inset-x-0 bottom-[5svh] z-20">
          <motion.div ref={trackRef} style={{ x }} className="flex w-max gap-4 pl-[100vw] pr-8 md:gap-6">
            {event.nights.map((n) => (
              <article
                key={n.n}
                className="relative w-[80vw] shrink-0 overflow-hidden rounded-[28px] border border-cream/12 bg-night/55 p-5 backdrop-blur-xl md:w-[25rem] md:p-7"
              >
                <span className={`absolute inset-x-0 top-0 h-1 bg-linear-to-r ${n.accent}`} />
                <div className="flex items-start justify-between">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-cream/60">Night {n.n}</p>
                  <p className="text-[11px] uppercase tracking-[0.3em] text-cream/60">{n.weekday}</p>
                </div>
                <div className="mt-3 flex items-end gap-3">
                  <span className={`bg-linear-to-br ${n.accent} bg-clip-text font-display text-7xl font-black leading-none tracking-tighter text-transparent md:text-8xl`}>
                    {n.day}
                  </span>
                  <span className="pb-2 font-display text-xl font-bold uppercase text-cream/80">{n.month}</span>
                </div>
                <h3 className="mt-3 font-serif text-3xl italic text-cream md:text-4xl">{n.theme}</h3>
                <p className="mt-2 flex items-center gap-2 text-sm text-cream/80">
                  <ClockIcon /> {n.time}
                </p>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {n.tags.map((tag) => (
                    <li key={tag} className="rounded-full bg-cream/8 px-3 py-1 text-xs text-cream/80">
                      {tag}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/** Pandal backdrop: striped shamiana, scalloped valance, bulb-lit arch and a glowing chandmala. */
function pandal(ctx: CanvasRenderingContext2D, cx: number, w: number, h: number, horizon: number, t: number, q: number) {
  const half = Math.min(w * 0.48, 900);
  const top = h * 0.1;
  const L = cx - half, Rr = cx + half;

  // striped fabric wall
  const stripes = 22;
  for (let i = 0; i < stripes; i++) {
    ctx.fillStyle = i % 2 ? "rgba(122,20,52,0.55)" : "rgba(196,60,20,0.42)";
    ctx.fillRect(L + (i / stripes) * half * 2, top, (half * 2) / stripes + 1, horizon - top);
  }
  const shade = ctx.createLinearGradient(0, top, 0, horizon);
  shade.addColorStop(0, "rgba(6,4,26,0.2)");
  shade.addColorStop(1, "rgba(6,4,26,0.75)");
  ctx.fillStyle = shade;
  ctx.fillRect(L, top, half * 2, horizon - top);

  // scalloped valance
  const n = Math.round(half / 22);
  const sw = (half * 2) / n;
  for (let i = 0; i < n; i++) {
    ctx.fillStyle = i % 2 ? "#a3123f" : "#e8590c";
    ctx.beginPath();
    ctx.arc(L + sw * (i + 0.5), top, sw / 2, 0, Math.PI);
    ctx.fill();
    sprite(ctx, i % 2 ? "#ffd166" : "#ff4d94", L + sw * (i + 0.5), top + sw / 2 + 4, 7, 0.8 + 0.2 * Math.sin(t * 3 + i));
  }
  ctx.fillStyle = "#ffd166";
  ctx.fillRect(L, top - 3, half * 2, 3);

  // arch outlined in chasing bulbs
  const aw = half * 0.55;
  const archTop = top + (horizon - top) * 0.12;
  const pts: { x: number; y: number }[] = [];
  for (let i = 0; i <= 60; i++) {
    const s = i / 60;
    const u = s * 2 - 1; // -1..1
    const x = cx + u * aw;
    const y = archTop + Math.pow(Math.abs(u), 1.6) * (horizon - archTop) * 0.55 + (Math.abs(u) > 0.92 ? (Math.abs(u) - 0.92) * (horizon - archTop) * 5 : 0);
    pts.push({ x, y: Math.min(y, horizon) });
  }
  ctx.globalCompositeOperation = "lighter";
  pts.forEach((pt, i) => {
    const on = 0.35 + 0.65 * Math.max(0, Math.sin(i * 0.5 - t * 5));
    sprite(ctx, i % 3 ? "#ffd166" : "#ff8a1f", pt.x, pt.y, 9, on);
  });

  // chandmala — the halo ornament crowning the pandal
  const my = archTop + (horizon - archTop) * 0.34;
  const mr = Math.min(aw * 0.42, (horizon - archTop) * 0.36);
  const g = ctx.createRadialGradient(cx, my, 0, cx, my, mr * 1.6);
  g.addColorStop(0, "rgba(255,200,90,0.5)");
  g.addColorStop(0.5, "rgba(255,90,60,0.18)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(cx, my, mr * 1.6, 0, TAU);
  ctx.fill();
  ctx.save();
  ctx.translate(cx, my);
  ctx.rotate(t * 0.08 + q * 2);
  for (let r = 0; r < 3; r++) {
    const rr = mr * (1 - r * 0.28);
    const count = 24 - r * 6;
    ctx.strokeStyle = `rgba(255,220,140,${0.5 - r * 0.1})`;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(0, 0, rr, 0, TAU);
    ctx.stroke();
    for (let i = 0; i < count; i++) {
      const a = (i / count) * TAU * (r % 2 ? -1 : 1);
      sprite(ctx, r === 1 ? "#ff4d94" : "#ffd166", Math.cos(a) * rr, Math.sin(a) * rr, 5, 0.9);
    }
  }
  ctx.restore();
  ctx.globalCompositeOperation = "source-over";

  // pillars
  for (const px of [L + 10, Rr - 10]) {
    const pg = ctx.createLinearGradient(px - 12, 0, px + 12, 0);
    pg.addColorStop(0, "#3a0d1a");
    pg.addColorStop(0.5, "#b8860b");
    pg.addColorStop(1, "#3a0d1a");
    ctx.fillStyle = pg;
    ctx.fillRect(px - 10, top, 20, horizon - top);
  }
}

/** The garbo: a perforated pot with a lamp inside, on a brass stand, at the centre of the circle. */
function lamp(ctx: CanvasRenderingContext2D, x: number, floorY: number, k: number, t: number) {
  const stand = 70 * k;
  ctx.globalCompositeOperation = "lighter";
  sprite(ctx, "#ff8a1f", x, floorY - stand - 20 * k, 150 * k, 0.55 + 0.1 * Math.sin(t * 7));
  ctx.globalCompositeOperation = "source-over";

  const brass = ctx.createLinearGradient(x - 12 * k, 0, x + 12 * k, 0);
  brass.addColorStop(0, "#5c3b0a");
  brass.addColorStop(0.5, "#f2c14e");
  brass.addColorStop(1, "#5c3b0a");
  ctx.fillStyle = brass;
  ctx.beginPath();
  ctx.ellipse(x, floorY, 22 * k, 6 * k, 0, 0, TAU);
  ctx.fill();
  ctx.fillRect(x - 4 * k, floorY - stand, 8 * k, stand);
  ctx.beginPath();
  ctx.ellipse(x, floorY - stand, 16 * k, 4 * k, 0, 0, TAU);
  ctx.fill();

  // pot
  const py = floorY - stand - 16 * k;
  const pot = ctx.createRadialGradient(x - 5 * k, py - 5 * k, 2 * k, x, py, 18 * k);
  pot.addColorStop(0, "#ffb347");
  pot.addColorStop(1, "#8a3a0a");
  ctx.fillStyle = pot;
  ctx.beginPath();
  ctx.arc(x, py, 17 * k, 0, TAU);
  ctx.fill();
  ctx.globalCompositeOperation = "lighter";
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * TAU;
    const row = i % 2 ? 0.45 : 0.8;
    const hx = x + Math.cos(a) * 11 * k * row;
    const hy = py + Math.sin(a) * 9 * k * row;
    sprite(ctx, "#ffe9a8", hx, hy, 4 * k, 0.6 + 0.4 * Math.sin(t * 9 + i));
  }
  // flame
  const fy = py - 22 * k;
  const flick = 1 + Math.sin(t * 13) * 0.08 + Math.sin(t * 7.3) * 0.06;
  sprite(ctx, "#ff8a1f", x, fy, 26 * k * flick, 0.9);
  ctx.fillStyle = "#fff3c4";
  ctx.beginPath();
  ctx.moveTo(x, fy - 12 * k * flick);
  ctx.quadraticCurveTo(x + 6 * k, fy, x, fy + 5 * k);
  ctx.quadraticCurveTo(x - 6 * k, fy, x, fy - 12 * k * flick);
  ctx.fill();
  ctx.globalCompositeOperation = "source-over";
}

function PinIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}
