"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { event } from "@/lib/event";
import Reveal from "./Reveal";

export default function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="px-4 py-24 md:px-10 md:py-32">
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[1fr_1.4fr]">
        <Reveal>
          <p className="eyebrow">FAQ</p>
          <h2 className="section-title">
            Good <em>questions</em>.
          </h2>
        </Reveal>
        <ul className="divide-y divide-cream/10 border-y border-cream/10">
          {event.faq.map((f, i) => (
            <li key={f.q}>
              <button
                type="button"
                onClick={() => setOpen(open === i ? null : i)}
                className="flex w-full items-center justify-between gap-6 py-6 text-left"
                aria-expanded={open === i}
              >
                <span className="font-display text-lg font-semibold text-cream md:text-xl">{f.q}</span>
                <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border border-cream/20 text-marigold transition ${open === i ? "rotate-45" : ""}`}>+</span>
              </button>
              <AnimatePresence initial={false}>
                {open === i && (
                  <motion.p
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden pb-6 pr-12 text-cream/70"
                  >
                    {f.a}
                  </motion.p>
                )}
              </AnimatePresence>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
