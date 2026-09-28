import { event, phoneLink, whatsappLink } from "@/lib/event";
import { DandiyaMark } from "./DandiyaMark";

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-cream/10 px-4 pb-10 pt-24 md:px-10">
      <div className="glow-blob bottom-[-30%] left-1/2 -translate-x-1/2 bg-saffron/25" />
      <div className="relative mx-auto max-w-6xl">
        <p className="eyebrow">See you there</p>
        <p className="title-gradient font-display text-[16vw] font-black leading-[0.85] tracking-[-0.05em] md:text-[10rem]">
          In the <span className="font-serif font-normal italic">circle.</span>
        </p>

        <div className="mt-14 flex flex-wrap gap-3">
          <a href={event.burlamartUrl} target="_blank" rel="noreferrer" className="btn-primary">Buy on Burlamart ↗</a>
          <a href={whatsappLink("Hi! I have a question about Dandiya Nights.")} target="_blank" rel="noreferrer" className="btn-ghost">WhatsApp us</a>
          <a href={phoneLink} className="btn-ghost">Call us</a>
          <a href={event.contact.instagram} target="_blank" rel="noreferrer" className="btn-ghost">Instagram</a>
        </div>

        <div className="mt-20 flex flex-col justify-between gap-4 border-t border-cream/10 pt-6 text-xs text-cream/50 md:flex-row md:items-center">
          <span className="flex items-center gap-2">
            <DandiyaMark className="h-5 w-5" /> {event.name} · {event.city} · {event.dateLabel}
          </span>
          <span>Title sponsor {event.sponsors.title.name} · © 2026</span>
        </div>
      </div>
    </footer>
  );
}
