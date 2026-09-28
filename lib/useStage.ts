"use client";

import { RefObject, useEffect, useRef } from "react";

export type Frame = {
  ctx: CanvasRenderingContext2D[];
  w: number;
  h: number;
  t: number; // seconds since mount
  dt: number;
};

/**
 * Sizes a set of stacked canvases to their container (DPR-aware) and runs a
 * render loop only while the section is on screen.
 */
export function useStage(
  container: RefObject<HTMLElement | null>,
  canvases: RefObject<HTMLCanvasElement | null>[],
  render: (f: Frame) => void,
) {
  const renderRef = useRef(render);
  useEffect(() => {
    renderRef.current = render;
  });

  useEffect(() => {
    const el = container.current;
    const cvs = canvases.map((c) => c.current).filter(Boolean) as HTMLCanvasElement[];
    if (!el || cvs.length === 0) return;
    const ctxs = cvs.map((c) => c.getContext("2d")!);
    const host = cvs[0].parentElement!;

    let w = 0, h = 0, dpr = 1;
    const resize = () => {
      w = host.clientWidth;
      h = host.clientHeight;
      dpr = Math.min(window.devicePixelRatio || 1, w < 768 ? 1.5 : 2);
      for (const c of cvs) {
        c.width = Math.round(w * dpr);
        c.height = Math.round(h * dpr);
      }
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(host);

    let visible = false;
    let raf = 0;
    let last = performance.now();
    const start = last;
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      for (const c of ctxs) c.setTransform(dpr, 0, 0, dpr, 0, 0);
      renderRef.current({ ctx: ctxs, w, h, t: (now - start) / 1000, dt });
      if (visible) raf = requestAnimationFrame(loop);
    };
    const io = new IntersectionObserver(([entry]) => {
      const was = visible;
      visible = entry.isIntersecting;
      if (visible && !was) {
        last = performance.now();
        raf = requestAnimationFrame(loop);
      }
    });
    io.observe(el);

    return () => {
      visible = false;
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
    };
    // canvases are stable refs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [container]);
}
