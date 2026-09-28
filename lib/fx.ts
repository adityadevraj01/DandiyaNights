// Shared canvas effects: glow sprites, string lights, stars, petals, beams.

import { TAU, clamp, lerp } from "./rig";

const glowCache = new Map<string, HTMLCanvasElement>();

/** Pre-rendered soft radial glow; drawing sprites is far cheaper than gradients per bulb. */
export function glow(color: string, size = 64): HTMLCanvasElement {
  const key = `${color}-${size}`;
  const hit = glowCache.get(key);
  if (hit) return hit;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d")!;
  const r = size / 2;
  const grad = g.createRadialGradient(r, r, 0, r, r, r);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(0.12, color);
  grad.addColorStop(0.4, withAlpha(color, 0.35));
  grad.addColorStop(1, withAlpha(color, 0));
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  glowCache.set(key, c);
  return c;
}

function withAlpha(hex: string, a: number) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

export const BULBS = ["#ffd166", "#ff4d94", "#ff8a1f", "#3ddc84", "#ffe9a8", "#b197fc"];

export function sprite(ctx: CanvasRenderingContext2D, color: string, x: number, y: number, r: number, a = 1) {
  ctx.globalAlpha = a;
  ctx.drawImage(glow(color), x - r, y - r, r * 2, r * 2);
  ctx.globalAlpha = 1;
}

/** A sagging string of fairy lights between two points. */
export function stringLights(
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  sag: number,
  t: number,
  opts: { spacing: number; r: number; wire?: string; phase?: number; chase?: number },
) {
  const cx = (x0 + x1) / 2;
  const cy = (y0 + y1) / 2 + sag;
  const at = (s: number) => ({
    x: (1 - s) * (1 - s) * x0 + 2 * (1 - s) * s * cx + s * s * x1,
    y: (1 - s) * (1 - s) * y0 + 2 * (1 - s) * s * cy + s * s * y1,
  });
  ctx.strokeStyle = opts.wire ?? "rgba(255,220,160,0.18)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.quadraticCurveTo(cx, cy, x1, y1);
  ctx.stroke();
  const length = Math.hypot(x1 - x0, y1 - y0 + sag);
  const n = Math.max(2, Math.floor(length / opts.spacing));
  ctx.globalCompositeOperation = "lighter";
  for (let i = 0; i <= n; i++) {
    const p = at(i / n);
    const c = BULBS[(i + (opts.phase ?? 0)) % BULBS.length];
    const chase = opts.chase ?? 0;
    const tw = chase
      ? 0.45 + 0.55 * Math.max(0, Math.sin(i * 0.9 - t * chase))
      : 0.65 + 0.35 * Math.sin(t * 2.2 + i * 1.7 + (opts.phase ?? 0));
    sprite(ctx, c, p.x, p.y, opts.r * (0.8 + tw * 0.5), tw);
  }
  ctx.globalCompositeOperation = "source-over";
}

export type Star = { x: number; y: number; r: number; s: number };
export const makeStars = (n: number): Star[] =>
  Array.from({ length: n }, () => ({ x: Math.random(), y: Math.random() * 0.6, r: Math.random() * 1.3 + 0.2, s: Math.random() * TAU }));

export function drawStars(ctx: CanvasRenderingContext2D, stars: Star[], w: number, h: number, t: number, drift = 0) {
  ctx.fillStyle = "#fff";
  for (const st of stars) {
    const a = 0.25 + 0.75 * (0.5 + 0.5 * Math.sin(t * 1.5 + st.s));
    ctx.globalAlpha = a * 0.8;
    ctx.beginPath();
    ctx.arc(st.x * w, ((st.y + drift) % 0.6) * h, st.r, 0, TAU);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

export type Petal = { x: number; y: number; z: number; rot: number; spin: number; sway: number; c: string };
const PETAL_COLORS = ["#ffb020", "#ff8a1f", "#ffd166", "#ff4d94", "#e8590c"];
export const makePetals = (n: number): Petal[] =>
  Array.from({ length: n }, () => ({
    x: Math.random(),
    y: Math.random(),
    z: Math.random() * 0.8 + 0.2,
    rot: Math.random() * TAU,
    spin: (Math.random() - 0.5) * 3,
    sway: Math.random() * TAU,
    c: PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)],
  }));

/** Marigold petals falling; `scroll` pushes them upward so scrolling feels like camera travel. */
export function drawPetals(ctx: CanvasRenderingContext2D, petals: Petal[], w: number, h: number, t: number, scroll: number) {
  for (const p of petals) {
    const fall = (p.y + t * 0.035 * p.z - scroll * 1.6 * p.z) % 1;
    const y = (fall < 0 ? fall + 1 : fall) * (h + 40) - 20;
    const x = (p.x * w + Math.sin(t * 0.8 + p.sway) * 30 * p.z) % w;
    const s = 3 + p.z * 5;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(p.rot + t * p.spin);
    ctx.globalAlpha = 0.35 + p.z * 0.55;
    ctx.fillStyle = p.c;
    ctx.beginPath();
    ctx.ellipse(0, 0, s, s * 0.55, 0, 0, TAU);
    ctx.fill();
    ctx.restore();
  }
  ctx.globalAlpha = 1;
}

/** Soft stage beam from (x, y) toward (tx, ty). */
export function beam(ctx: CanvasRenderingContext2D, x: number, y: number, tx: number, ty: number, spread: number, color: string, a: number) {
  const ang = Math.atan2(ty - y, tx - x);
  const L = Math.hypot(tx - x, ty - y) * 1.25;
  const g = ctx.createLinearGradient(x, y, x + Math.cos(ang) * L, y + Math.sin(ang) * L);
  g.addColorStop(0, withAlpha(color, a));
  g.addColorStop(1, withAlpha(color, 0));
  ctx.globalCompositeOperation = "lighter";
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + Math.cos(ang - spread) * L, y + Math.sin(ang - spread) * L);
  ctx.lineTo(x + Math.cos(ang + spread) * L, y + Math.sin(ang + spread) * L);
  ctx.closePath();
  ctx.fill();
  ctx.globalCompositeOperation = "source-over";
}

/** Piecewise interpolation through [at, value] stops with eased segments. */
export function track(p: number, stops: [number, number][]) {
  if (p <= stops[0][0]) return stops[0][1];
  for (let i = 1; i < stops.length; i++) {
    const [a, va] = stops[i - 1];
    const [b, vb] = stops[i];
    if (p <= b) {
      const t = clamp((p - a) / (b - a || 1), 0, 1);
      return lerp(va, vb, t * t * (3 - 2 * t));
    }
  }
  return stops[stops.length - 1][1];
}

export function mixColor(a: string, b: string, t: number) {
  const na = parseInt(a.slice(1), 16), nb = parseInt(b.slice(1), 16);
  const r = Math.round(lerp((na >> 16) & 255, (nb >> 16) & 255, t));
  const g = Math.round(lerp((na >> 8) & 255, (nb >> 8) & 255, t));
  const bl = Math.round(lerp(na & 255, nb & 255, t));
  return `rgb(${r},${g},${bl})`;
}
