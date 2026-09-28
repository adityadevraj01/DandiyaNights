"use client";

import { useState } from "react";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { event } from "@/lib/event";
import { DandiyaMark } from "./DandiyaMark";

const links = [
  { href: "#venue", label: "Venue" },
  { href: "#passes", label: "Passes" },
  { href: "#sponsors", label: "Sponsors" },
  { href: "#faq", label: "FAQ" },
];

export default function Navbar() {
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setHidden(y > prev && y > 200 && !open);
  });

  return (
    <motion.header
      animate={{ y: hidden ? -100 : 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-x-0 top-0 z-50 px-3 pt-3 md:px-6 md:pt-4"
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-3 rounded-full border border-cream/10 bg-night/45 py-2 pl-4 pr-2 backdrop-blur-xl">
        <a href="#top" className="flex items-center gap-2 text-cream">
          <DandiyaMark className="h-6 w-6" />
          <span className="whitespace-nowrap font-display text-xs font-bold tracking-tight sm:text-sm">
            {event.name} <span className="hidden text-marigold sm:inline">’26</span>
          </span>
        </a>
        <ul className="hidden items-center gap-7 text-sm text-cream/75 md:flex">
          {links.map((l) => (
            <li key={l.href}>
              <a href={l.href} className="transition hover:text-marigold">
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-2">
          <a href={event.burlamartUrl} target="_blank" rel="noreferrer" className="btn-primary whitespace-nowrap px-4! py-2! text-xs md:text-sm">
            Get passes
          </a>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="grid h-9 w-9 place-items-center rounded-full border border-cream/15 text-cream md:hidden"
            aria-label="Menu"
            aria-expanded={open}
          >
            <span className="relative block h-3 w-4">
              <span className={`absolute left-0 h-px w-4 bg-current transition ${open ? "top-1.5 rotate-45" : "top-0"}`} />
              <span className={`absolute left-0 h-px w-4 bg-current transition ${open ? "top-1.5 -rotate-45" : "top-3"}`} />
            </span>
          </button>
        </div>
      </nav>
      {open && (
        <motion.ul
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto mt-2 max-w-6xl rounded-3xl border border-cream/10 bg-night/85 p-4 backdrop-blur-xl md:hidden"
        >
          {links.map((l) => (
            <li key={l.href}>
              <a href={l.href} onClick={() => setOpen(false)} className="block py-3 font-display text-lg text-cream">
                {l.label}
              </a>
            </li>
          ))}
        </motion.ul>
      )}
    </motion.header>
  );
}
