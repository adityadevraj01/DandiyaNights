"use client";

import { RefObject, useEffect } from "react";
import { useMotionValue } from "framer-motion";

/**
 * 0 → 1 progress of a tall section scrolling past a sticky viewport
 * (0 when its top hits the top of the screen, 1 when its bottom hits the bottom).
 *
 * Deliberately a plain motion value: framer-motion's useScroll({ target }) hands
 * opacity/transform to native ViewTimelines, which ignore custom offsets and
 * mistime the fades.
 */
export function useSectionProgress(ref: RefObject<HTMLElement | null>) {
  const p = useMotionValue(0);
  useEffect(() => {
    const update = () => {
      const el = ref.current;
      if (!el) return;
      const total = el.offsetHeight - window.innerHeight;
      const v = total > 0 ? -el.getBoundingClientRect().top / total : 0;
      p.set(Math.min(1, Math.max(0, v)));
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [ref, p]);
  return p;
}
