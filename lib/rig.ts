// A tiny 3D dancer rig drawn on a 2D canvas.
// Joints live in "body space" (x = lateral, y = down, z = forward, hips at origin,
// floor at y = 88). A pose is projected by rotating around the vertical axis (spin),
// which is what makes twirls, skirt flare and side-on views read as 3D.

export type V3 = [number, number, number];

export const TAU = Math.PI * 2;
export const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const smoothstep = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};

const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const mul = (a: V3, s: number): V3 => [a[0] * s, a[1] * s, a[2] * s];
const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const len = (a: V3) => Math.hypot(a[0], a[1], a[2]);
const norm = (a: V3): V3 => {
  const l = len(a);
  return l > 1e-6 ? mul(a, 1 / l) : [0, 0, 1];
};
const mix = (a: V3, b: V3, t: number): V3 => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];

/** Two-bone IK: returns [elbow/knee, end] reaching toward target, bending toward pole. */
function ik(root: V3, target: V3, a: number, b: number, pole: V3): [V3, V3] {
  const d = sub(target, root);
  const dl = len(d);
  const L = clamp(dl, Math.abs(a - b) + 0.5, (a + b) * 0.999);
  const u = dl > 1e-6 ? mul(d, 1 / dl) : ([0, 1, 0] as V3);
  const end = add(root, mul(u, L));
  const x = (a * a - b * b + L * L) / (2 * L);
  const h = Math.sqrt(Math.max(0, a * a - x * x));
  const v = norm(sub(pole, mul(u, dot(pole, u))));
  return [add(add(root, mul(u, x)), mul(v, h)), end];
}

export type Pose = {
  hip: V3;
  lean: number; // sideways lean (radians)
  bend: number; // forward bend (radians)
  head: number; // extra head tilt
  lHand: V3;
  rHand: V3;
  lFoot: V3;
  rFoot: V3;
  spin: number; // rotation around vertical axis
  spinVel: number; // radians per beat, drives skirt + dupatta
  flare: number; // 0..1 skirt flare
  swirl: number; // skirt fold phase
  sway: number; // hem offset (body units)
  strike: number; // 0..1 dandiya hit flash
  strikeAt: "own" | "left" | "right";
};

export type Look = {
  kind: "ghagra" | "kediyu";
  skin: string;
  hair: string;
  top: string;
  trim: string;
  skirt: [string, string, string];
  dupatta?: string;
  headwear?: string;
  stick: [string, string];
};

// ---------------------------------------------------------------------------
// Choreography
// ---------------------------------------------------------------------------

const OPEN_L: V3 = [-44, -62, 8];
const OPEN_R: V3 = [44, -62, 8];
const WIDE_L: V3 = [-54, -80, -2];
const WIDE_R: V3 = [54, -80, -2];

/** Solo garba: side-to-side "taali" strikes for 6 beats, then a full twirl. 8-beat loop. */
export function garbaPose(beat: number, time: number): Pose {
  const cyc = ((beat % 8) + 8) % 8;
  const loops = Math.floor(beat / 8);

  // twirl on beats 6..8 (smootherstep so it accelerates and settles)
  const u = clamp((cyc - 6) / 2, 0, 1);
  const e = u * u * u * (u * (u * 6 - 15) + 10);
  const spin = (loops + e) * TAU;
  const spinVel = (30 * u * u * (1 - u) * (1 - u) * TAU) / 2;
  const w = smoothstep(5.3, 6.2, cyc) * (1 - smoothstep(7.5, 8, cyc));

  // strikes: hands meet high on alternating sides on odd beats
  const s = Math.floor(beat / 2) % 2 === 0 ? 1 : -1;
  const p = (((beat % 2) + 2) % 2) / 2;
  const open = 0.5 + 0.5 * Math.cos(TAU * p);
  const shut = 1 - open;
  const hitPoint: V3 = [s * 20, -100, 16];
  const breathe = Math.sin(time * 1.6) * 1.2;

  const lStrike = mix(add(hitPoint, [-3, 0, 0]), OPEN_L, open);
  const rStrike = mix(add(hitPoint, [3, 0, 0]), OPEN_R, open);
  const lHand = add(mix(lStrike, WIDE_L, w), [0, breathe, 0]);
  const rHand = add(mix(rStrike, WIDE_R, w), [0, breathe, 0]);

  const dip = 3.5 * (0.5 + 0.5 * Math.cos(TAU * beat));
  const still = 1 - w;
  const liftL = Math.max(0, Math.sin(Math.PI * beat)) * 7 * still;
  const liftR = Math.max(0, -Math.sin(Math.PI * beat)) * 7 * still;
  const stepX = s * shut * 4 * still;

  return {
    hip: [-s * 5 * shut * still, dip * still - 2 * w, 0],
    lean: s * 0.17 * shut * still,
    bend: (0.04 + shut * 0.08) * still - 0.05 * w,
    head: s * 0.14 * shut * still - 0.12 * w + Math.sin(time * 1.3) * 0.02,
    lHand,
    rHand,
    lFoot: [lerp(-11 + stepX, -5, w), 88 - liftL, 3],
    rFoot: [lerp(11 + stepX, 5, w), 88 - liftR, 3],
    spin,
    spinVel,
    flare: clamp(0.08 + 0.12 * shut * still + (0.9 * spinVel) / 5.9, 0, 1),
    swirl: spin - (spinVel / 5.9) * 0.8 + beat * 0.15,
    sway: s * shut * 7 * still,
    strike: shut > 0.9 ? (shut - 0.9) * 10 * still : 0,
    strikeAt: "own",
  };
}

type Key = { l: V3; r: V3; at: Pose["strikeAt"]; lean: number; bend: number };
const DANDIYA: Key[] = [
  { l: [-4, -70, 22], r: [4, -70, 22], at: "own", lean: 0, bend: 0.04 },
  { l: [-26, -54, 6], r: [4, -90, 42], at: "right", lean: 0.08, bend: 0.12 },
  { l: [-4, -70, 22], r: [4, -70, 22], at: "own", lean: 0, bend: 0.04 },
  { l: [-4, -90, 42], r: [26, -54, 6], at: "left", lean: -0.08, bend: 0.12 },
];

/** Pair dandiya: own strike, partner-right, own, partner-left, with a twirl every 16 beats. */
export function dandiyaPose(beat: number, time: number): Pose {
  const f = ((beat % 4) + 4) % 4;
  const i = Math.floor(f);
  const fr = f - i;
  const a = DANDIYA[i];
  const b = DANDIYA[(i + 1) % 4];
  const e = smoothstep(0.2, 0.9, fr);
  const arc: V3 = [0, -8 * Math.sin(Math.PI * e), -12 * Math.sin(Math.PI * e)];

  const cyc = ((beat % 16) + 16) % 16;
  const u = clamp((cyc - 14) / 2, 0, 1);
  const eu = u * u * u * (u * (u * 6 - 15) + 10);
  const spin = (Math.floor(beat / 16) + eu) * TAU;
  const spinVel = (30 * u * u * (1 - u) * (1 - u) * TAU) / 2;
  const w = smoothstep(13.4, 14.2, cyc) * (1 - smoothstep(15.5, 16, cyc));

  const dip = 3 * (0.5 + 0.5 * Math.cos(TAU * beat));
  const sideLift = Math.max(0, Math.sin(Math.PI * beat)) * 5;
  const breathe = Math.sin(time * 1.7) * 1;

  return {
    hip: [Math.sin(Math.PI * beat) * 3 * (1 - w), dip, 0],
    lean: lerp(a.lean, b.lean, e) * (1 - w),
    bend: lerp(a.bend, b.bend, e) * (1 - w),
    head: lerp(a.lean, b.lean, e) * 0.8,
    lHand: add(mix(add(mix(a.l, b.l, e), arc), WIDE_L, w), [0, breathe, 0]),
    rHand: add(mix(add(mix(a.r, b.r, e), arc), WIDE_R, w), [0, breathe, 0]),
    lFoot: [-10, 88 - sideLift * (1 - w), 4],
    rFoot: [10, 88 - (5 - sideLift) * 0.6 * (1 - w), 4],
    spin,
    spinVel,
    flare: clamp(0.1 + 0.08 * Math.abs(Math.sin(Math.PI * beat)) + (0.9 * spinVel) / 5.9, 0, 1),
    swirl: spin + Math.sin(beat * Math.PI) * 0.35 - (spinVel / 5.9) * 0.8,
    sway: Math.sin(Math.PI * beat) * -4,
    strike: Math.max(0, 1 - fr / 0.22) * (1 - w),
    strikeAt: a.at,
  };
}

// ---------------------------------------------------------------------------
// Drawing
// ---------------------------------------------------------------------------

type Pt = { x: number; y: number; z: number };
type XY = { x: number; y: number; z?: number };

export type DrawOpts = {
  x: number; // screen x of hips
  y: number; // screen y of hips
  k: number; // pixels per body unit
  time: number;
  shadow?: boolean;
};

export type DrawResult = { lTip: Pt; rTip: Pt };

export function drawDancer(ctx: CanvasRenderingContext2D, pose: Pose, look: Look, o: DrawOpts): DrawResult {
  const cs = Math.cos(pose.spin);
  const sn = Math.sin(pose.spin);
  const { k } = o;
  const P = (p: V3): Pt => ({ x: o.x + (p[0] * cs + p[2] * sn) * k, y: o.y + p[1] * k, z: -p[0] * sn + p[2] * cs });

  const hip = pose.hip;
  const up = norm([Math.sin(pose.lean), -Math.cos(pose.lean), Math.sin(pose.bend)]);
  const lat: V3 = [Math.cos(pose.lean), Math.sin(pose.lean), 0];
  const waist = add(hip, mul(up, 7));
  const neck = add(hip, mul(up, 60));
  const sL = add(neck, add(mul(lat, -15), mul(up, -4)));
  const sR = add(neck, add(mul(lat, 15), mul(up, -4)));
  const hUp = norm([Math.sin(pose.lean + pose.head), -Math.cos(pose.lean + pose.head), Math.sin(pose.bend) * 0.5]);
  const headC = add(neck, mul(hUp, 17));

  const [eL, hL] = ik(sL, pose.lHand, 29, 27, [-1, 0.9, -0.6]);
  const [eR, hR] = ik(sR, pose.rHand, 29, 27, [1, 0.9, -0.6]);
  const [kL, fL] = ik(add(hip, [-8, 4, 0]), pose.lFoot, 44, 42, [0, 0, 1]);
  const [kR, fR] = ik(add(hip, [8, 4, 0]), pose.rFoot, 44, 42, [0, 0, 1]);

  const stickDir = (e: V3, h: V3) => norm(add(norm(sub(h, e)), [0, -1.1, 0.35]));
  const dL = stickDir(eL, hL);
  const dR = stickDir(eR, hR);
  const lTip = P(add(hL, mul(dL, 26)));
  const rTip = P(add(hR, mul(dR, 26)));

  const skin = look.skin;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  // floor shadow
  if (o.shadow !== false) {
    const fy = o.y + 88 * k;
    const g = ctx.createRadialGradient(o.x, fy, 0, o.x, fy, 46 * k);
    g.addColorStop(0, "rgba(0,0,0,0.55)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(o.x, fy, 46 * k, 9 * k, 0, 0, TAU);
    ctx.fill();
  }

  const drawArm = (s: V3, e: V3, h: V3, d: V3) => {
    const S = P(s), E = P(e), H = P(h);
    line(ctx, S, E, 7.5 * k, skin);
    line(ctx, E, H, 6.2 * k, skin);
    // sleeve
    line(ctx, S, lerpPt(S, E, 0.42), 8.6 * k, look.top);
    // bangles
    line(ctx, lerpPt(E, H, 0.7), lerpPt(E, H, 0.88), 7.4 * k, look.trim);
    // dandiya stick
    const A = P(sub(h, mul(d, 6)));
    const B = P(add(h, mul(d, 26)));
    line(ctx, A, B, 3.4 * k, look.stick[0]);
    ctx.setLineDash([3 * k, 3 * k]);
    line(ctx, A, B, 3.4 * k, look.stick[1]);
    ctx.setLineDash([]);
    dotAt(ctx, B, 2.4 * k, "#ffe9a8");
    dotAt(ctx, H, 3.6 * k, skin);
  };

  const armZ = (e: V3, h: V3) => (P(e).z + P(h).z) / 2;
  const leftBack = armZ(eL, hL) < -1;
  const rightBack = armZ(eR, hR) < -1;

  // --- back layer
  if (look.kind === "ghagra" && look.dupatta) drawDupattaTail(ctx, P, sL, pose, look, k, o.time);
  if (leftBack) drawArm(sL, eL, hL, dL);
  if (rightBack) drawArm(sR, eR, hR, dR);

  // --- legs / feet
  if (look.kind === "kediyu") {
    for (const [hj, kn, ft] of [
      [add(hip, [-8, 4, 0]), kL, fL],
      [add(hip, [8, 4, 0]), kR, fR],
    ] as [V3, V3, V3][]) {
      line(ctx, P(hj), P(kn), 10 * k, look.skirt[0]);
      line(ctx, P(kn), P(ft), 8 * k, look.skirt[1]);
      foot(ctx, P(ft), k, look.skirt[2]);
    }
  } else {
    foot(ctx, P(fL), k, "#2a1208");
    foot(ctx, P(fR), k, "#2a1208");
  }

  // --- skirt / kediyu flare
  const W = P(waist);
  if (look.kind === "ghagra") {
    drawFlare(ctx, {
      top: { x: W.x, y: W.y },
      topHalf: 12.5 * k,
      hemX: W.x + pose.sway * k,
      hemY: o.y + (82 - pose.flare * 18) * k,
      hemR: (30 + pose.flare * 54) * k,
      swirl: pose.swirl,
      flare: pose.flare,
      colors: look.skirt,
      trim: look.trim,
      k,
      time: o.time,
      bands: 2,
    });
  }

  // --- torso
  const wf = Math.abs(cs) + Math.abs(sn) * 0.62;
  const N = P(neck);
  const torso = (t0: number, t1: number, fill: string) => {
    const a = spinePt(W, N, t0);
    const b = spinePt(W, N, t1);
    const ha = lerp(10.5, 15.5, t0) * k * wf;
    const hb = lerp(10.5, 15.5, t1) * k * wf;
    const dx = N.x - W.x, dy = N.y - W.y;
    const l = Math.hypot(dx, dy) || 1;
    const px = -dy / l, py = dx / l;
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.moveTo(a.x - px * ha, a.y - py * ha);
    ctx.lineTo(b.x - px * hb, b.y - py * hb);
    ctx.lineTo(b.x + px * hb, b.y + py * hb);
    ctx.lineTo(a.x + px * ha, a.y + py * ha);
    ctx.closePath();
    ctx.fill();
  };

  torso(0, 1, skin);
  torso(0.42, 1.02, look.top);
  // choli / kediyu yoke trim
  {
    const a = spinePt(W, N, 0.42);
    const hw = lerp(10.5, 15.5, 0.42) * k * wf;
    const dx = N.x - W.x, dy = N.y - W.y;
    const l = Math.hypot(dx, dy) || 1;
    line(ctx, { x: a.x + (dy / l) * hw, y: a.y - (dx / l) * hw, z: 0 }, { x: a.x - (dy / l) * hw, y: a.y + (dx / l) * hw, z: 0 }, 2.6 * k, look.trim);
  }

  if (look.kind === "kediyu") {
    // kediyu: short flared frock from chest to mid-thigh
    const C = spinePt(W, N, 0.55);
    drawFlare(ctx, {
      top: C,
      topHalf: 14 * k * wf,
      hemX: C.x + pose.sway * 0.6 * k,
      hemY: o.y + (30 - pose.flare * 8) * k,
      hemR: (24 + pose.flare * 26) * k,
      swirl: pose.swirl,
      flare: pose.flare,
      colors: [look.top, look.top, look.trim],
      trim: look.trim,
      k,
      time: o.time,
      bands: 1,
    });
  }

  // dupatta drape across the chest
  if (look.kind === "ghagra" && look.dupatta) {
    ctx.globalAlpha = 0.9;
    line(ctx, P(sL), spinePt(W, N, 0.12), 5.5 * k, look.dupatta);
    ctx.globalAlpha = 1;
  }

  // --- neck + head
  line(ctx, N, P(add(neck, mul(hUp, 8))), 6.5 * k, skin);
  const Hc = P(headC);
  const back = P(add(headC, [0, -1, -9]));
  const bunBehind = back.z < Hc.z;
  const drawBun = () => {
    if (look.kind !== "ghagra") return;
    dotAt(ctx, back, 7.5 * k, look.hair);
    // gajra
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * TAU + o.time * 0.2;
      dotAt(ctx, { x: back.x + Math.cos(a) * 7.6 * k, y: back.y + Math.sin(a) * 7.6 * k, z: 0 }, 1.5 * k, "#fff8e6");
    }
  };
  if (bunBehind) drawBun();
  dotAt(ctx, { x: Hc.x - sn * 0.6 * k, y: Hc.y - 0.6 * k, z: 0 }, 11.6 * k, look.hair);
  dotAt(ctx, { x: Hc.x + sn * 1.8 * k, y: Hc.y + 1.4 * k, z: 0 }, 9.8 * k, skin);
  // hairline over the forehead
  ctx.fillStyle = look.hair;
  ctx.beginPath();
  ctx.ellipse(Hc.x + sn * 1.2 * k, Hc.y - 3.2 * k, 10.4 * k, 7 * k, pose.lean + pose.head, Math.PI, TAU);
  ctx.fill();
  if (!bunBehind) drawBun();
  // earrings
  for (const side of [-1, 1]) {
    const e = P(add(headC, [side * 10, 7, 0]));
    if (e.z > -6) dotAt(ctx, e, 2 * k, look.trim);
  }
  if (look.kind === "kediyu" && look.headwear) {
    ctx.fillStyle = look.headwear;
    ctx.beginPath();
    ctx.ellipse(Hc.x, Hc.y - 7 * k, 12.5 * k, 7 * k, pose.lean + pose.head, 0, TAU);
    ctx.fill();
    line(ctx, { x: Hc.x - 11 * k, y: Hc.y - 6 * k, z: 0 }, { x: Hc.x + 11 * k, y: Hc.y - 8 * k, z: 0 }, 2 * k, look.trim);
  }

  // --- front layer
  if (!leftBack) drawArm(sL, eL, hL, dL);
  if (!rightBack) drawArm(sR, eR, hR, dR);

  // --- strike sparks
  if (pose.strike > 0.02) {
    const at = pose.strikeAt === "own" ? lerpPt(lTip, rTip, 0.5) : pose.strikeAt === "left" ? lTip : rTip;
    spark(ctx, at, pose.strike, k);
  }

  return { lTip, rTip };
}

// ---------------------------------------------------------------------------
// Drawing helpers
// ---------------------------------------------------------------------------

function line(ctx: CanvasRenderingContext2D, a: XY, b: XY, w: number, c: string) {
  ctx.strokeStyle = c;
  ctx.lineWidth = w;
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.stroke();
}

function dotAt(ctx: CanvasRenderingContext2D, p: XY, r: number, c: string) {
  ctx.fillStyle = c;
  ctx.beginPath();
  ctx.arc(p.x, p.y, r, 0, TAU);
  ctx.fill();
}

function lerpPt(a: Pt, b: Pt, t: number): Pt {
  return { x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t), z: lerp(a.z, b.z, t) };
}

function spinePt(w: { x: number; y: number }, n: { x: number; y: number }, t: number): Pt {
  return { x: lerp(w.x, n.x, t), y: lerp(w.y, n.y, t), z: 0 };
}

function foot(ctx: CanvasRenderingContext2D, p: Pt, k: number, c: string) {
  ctx.fillStyle = c;
  ctx.beginPath();
  ctx.ellipse(p.x, p.y - 1.5 * k, 6.5 * k, 3 * k, 0, 0, TAU);
  ctx.fill();
}

function spark(ctx: CanvasRenderingContext2D, p: Pt, s: number, k: number) {
  const r = (10 + 16 * s) * k;
  const prev = ctx.globalCompositeOperation;
  ctx.globalCompositeOperation = "lighter";
  const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r);
  g.addColorStop(0, `rgba(255,248,220,${0.95 * s})`);
  g.addColorStop(0.3, `rgba(255,190,70,${0.6 * s})`);
  g.addColorStop(1, "rgba(255,120,40,0)");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(p.x, p.y, r, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = `rgba(255,236,170,${0.9 * s})`;
  ctx.lineWidth = 1.2 * k;
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * TAU + 0.3;
    const r0 = r * 0.25, r1 = r * (0.7 + (i % 2) * 0.35);
    ctx.beginPath();
    ctx.moveTo(p.x + Math.cos(a) * r0, p.y + Math.sin(a) * r0);
    ctx.lineTo(p.x + Math.cos(a) * r1, p.y + Math.sin(a) * r1);
    ctx.stroke();
  }
  ctx.globalCompositeOperation = prev;
}

type FlareSpec = {
  top: { x: number; y: number };
  topHalf: number;
  hemX: number;
  hemY: number;
  hemR: number;
  swirl: number;
  flare: number;
  colors: [string, string, string];
  trim: string;
  k: number;
  time: number;
  bands: number;
};

/** A spinning cone of cloth (ghagra or kediyu). Folds are placed around the
 *  vertical axis and rotate with `swirl`, which sells the twirl. */
function drawFlare(ctx: CanvasRenderingContext2D, f: FlareSpec) {
  const { top, topHalf, hemX, hemY, hemR, k } = f;
  const ry = hemR * 0.17;
  const folds = 10;
  const amp = (2.5 + f.flare * 6) * k;
  const hemPt = (phi: number) => {
    const alpha = phi + f.swirl;
    const ripple = (0.5 + 0.5 * Math.cos(alpha * folds)) * amp;
    return { x: hemX + Math.cos(phi) * hemR, y: hemY + Math.sin(phi) * ry + ripple };
  };
  const h = hemY - top.y;

  const outline = () => {
    ctx.beginPath();
    ctx.moveTo(top.x - topHalf, top.y);
    ctx.bezierCurveTo(
      top.x - topHalf * 1.15, top.y + h * 0.3,
      hemX - hemR * (0.82 - 0.25 * f.flare), hemY - h * 0.28,
      hemX - hemR, hemY,
    );
    for (let i = 1; i <= 36; i++) {
      const p = hemPt(Math.PI - (i / 36) * Math.PI);
      ctx.lineTo(p.x, p.y);
    }
    ctx.bezierCurveTo(
      hemX + hemR * (0.82 - 0.25 * f.flare), hemY - h * 0.28,
      top.x + topHalf * 1.15, top.y + h * 0.3,
      top.x + topHalf, top.y,
    );
    ctx.closePath();
  };

  const g = ctx.createLinearGradient(0, top.y, 0, hemY + ry);
  g.addColorStop(0, f.colors[0]);
  g.addColorStop(0.55, f.colors[1]);
  g.addColorStop(1, f.colors[2]);
  outline();
  ctx.fillStyle = g;
  ctx.fill();

  // cylindrical shading
  const s = ctx.createLinearGradient(hemX - hemR, 0, hemX + hemR, 0);
  s.addColorStop(0, "rgba(0,0,0,0.5)");
  s.addColorStop(0.3, "rgba(0,0,0,0)");
  s.addColorStop(0.55, "rgba(255,255,255,0.07)");
  s.addColorStop(0.8, "rgba(0,0,0,0)");
  s.addColorStop(1, "rgba(0,0,0,0.55)");
  outline();
  ctx.fillStyle = s;
  ctx.fill();

  // folds
  for (let i = 0; i < folds; i++) {
    const alpha = (i / folds) * TAU + f.swirl;
    const front = Math.sin(alpha);
    if (front < 0.08) continue;
    const c = Math.cos(alpha);
    const hx = hemX + c * hemR;
    const hy = hemY + front * ry;
    const tx = top.x + c * topHalf;
    ctx.strokeStyle = `rgba(0,0,0,${0.28 * front})`;
    ctx.lineWidth = 1.4 * k;
    ctx.beginPath();
    ctx.moveTo(tx, top.y + 2 * k);
    ctx.quadraticCurveTo(lerp(tx, hx, 0.35), lerp(top.y, hy, 0.6), hx, hy);
    ctx.stroke();
    ctx.strokeStyle = `rgba(255,255,255,${0.09 * front})`;
    ctx.beginPath();
    ctx.moveTo(tx + 2 * k, top.y + 2 * k);
    ctx.quadraticCurveTo(lerp(tx, hx, 0.35) + 3 * k, lerp(top.y, hy, 0.6), hx + 4 * k, hy);
    ctx.stroke();
  }

  // embroidered bands with mirror-work that catches the light
  for (let b = 0; b < f.bands; b++) {
    const lift = (7 + b * 13) * k;
    const shrink = 1 - (b * 13 * k) / Math.max(h, 1) * 0.55;
    ctx.strokeStyle = f.trim;
    ctx.lineWidth = (b === 0 ? 3.2 : 2) * k;
    ctx.beginPath();
    for (let i = 0; i <= 36; i++) {
      const phi = Math.PI - (i / 36) * Math.PI;
      const p = hemPt(phi);
      const x = hemX + (p.x - hemX) * shrink;
      const y = p.y - lift;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    for (let i = 0; i < 18; i++) {
      const alpha = (i / 18) * TAU + f.swirl;
      const front = Math.sin(alpha);
      if (front < 0.05) continue;
      const x = hemX + Math.cos(alpha) * hemR * shrink;
      const y = hemY + front * ry - lift - 4 * k;
      const glint = 0.35 + 0.65 * Math.max(0, Math.sin(alpha * 3 + f.time * 3 + b));
      ctx.fillStyle = `rgba(255,250,235,${glint * front})`;
      ctx.beginPath();
      ctx.arc(x, y, 1.5 * k, 0, TAU);
      ctx.fill();
    }
  }

  // waistband
  ctx.strokeStyle = f.trim;
  ctx.lineWidth = 2.6 * k;
  ctx.beginPath();
  ctx.moveTo(top.x - topHalf, top.y + 1.5 * k);
  ctx.lineTo(top.x + topHalf, top.y + 1.5 * k);
  ctx.stroke();
}

function drawDupattaTail(
  ctx: CanvasRenderingContext2D,
  P: (p: V3) => Pt,
  sL: V3,
  pose: Pose,
  look: Look,
  k: number,
  time: number,
) {
  const drift = clamp(pose.spinVel * 0.28, -1.6, 1.6) + pose.sway * 0.04;
  const pts: Pt[] = [];
  const widths: number[] = [];
  for (let i = 0; i <= 14; i++) {
    const t = i / 14;
    const wave = Math.sin(time * 2.6 - t * 6) * 5 * t;
    pts.push(P(add(sL, [-4 - drift * t * 48 + wave, t * (64 - Math.abs(drift) * 18), -9 - t * 10 - Math.abs(drift) * t * 20])));
    widths.push((5 + t * 7) * k);
  }
  ctx.fillStyle = look.dupatta!;
  ctx.globalAlpha = 0.8;
  ctx.beginPath();
  for (let i = 0; i < pts.length; i++) {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
    const dx = b.x - a.x, dy = b.y - a.y, l = Math.hypot(dx, dy) || 1;
    const x = pts[i].x - (dy / l) * widths[i], y = pts[i].y + (dx / l) * widths[i];
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  for (let i = pts.length - 1; i >= 0; i--) {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
    const dx = b.x - a.x, dy = b.y - a.y, l = Math.hypot(dx, dy) || 1;
    ctx.lineTo(pts[i].x + (dy / l) * widths[i], pts[i].y - (dx / l) * widths[i]);
  }
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;
  // gota border tassels
  const end = pts[pts.length - 1];
  for (let i = -2; i <= 2; i++) dotAt(ctx, { x: end.x + i * 3 * k, y: end.y + 2 * k, z: 0 }, 1.4 * k, look.trim);
}

// ---------------------------------------------------------------------------
// Looks
// ---------------------------------------------------------------------------

export const HERO_LOOK: Look = {
  kind: "ghagra",
  skin: "#8a5a3c",
  hair: "#120808",
  top: "#0e8f7e",
  trim: "#ffd166",
  skirt: ["#ff2d87", "#b0126b", "#ff8a1f"],
  dupatta: "#ffb627",
  stick: ["#e8590c", "#ffd166"],
};

export const RING_LOOKS: Look[] = [
  { kind: "ghagra", skin: "#8a5a3c", hair: "#120808", top: "#7b2cbf", trim: "#fff0a8", skirt: ["#ffb020", "#e8590c", "#b3124f"], dupatta: "#ff4d94", stick: ["#1c7ed6", "#ffe066"] },
  { kind: "kediyu", skin: "#6e4630", hair: "#0c0606", top: "#fff4e0", trim: "#e8590c", skirt: ["#efe6d6", "#e2d6c2", "#5a2a14"], headwear: "#e03131", stick: ["#e03131", "#ffd43b"] },
  { kind: "ghagra", skin: "#a06a45", hair: "#1a0c08", top: "#d6336c", trim: "#ffe066", skirt: ["#20c997", "#0b7a5c", "#ffd43b"], dupatta: "#ffd43b", stick: ["#ae3ec9", "#fff"] },
  { kind: "kediyu", skin: "#5c3a26", hair: "#0c0606", top: "#ffd6e8", trim: "#c2255c", skirt: ["#f8f0e3", "#eadfcd", "#3b1d0e"], headwear: "#f59f00", stick: ["#2f9e44", "#ffec99"] },
  { kind: "ghagra", skin: "#7a4e34", hair: "#120808", top: "#1c7ed6", trim: "#ffd166", skirt: ["#f03e3e", "#a50e2d", "#ffbf00"], dupatta: "#74c0fc", stick: ["#f76707", "#fff3bf"] },
  { kind: "kediyu", skin: "#8a5a3c", hair: "#0c0606", top: "#d3f9d8", trim: "#2b8a3e", skirt: ["#f4efe6", "#e6dccb", "#4a2410"], headwear: "#7048e8", stick: ["#d6336c", "#ffe066"] },
];
