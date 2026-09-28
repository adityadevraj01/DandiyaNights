# Dandiya Nights · Bhadrak

Scroll-driven event site for Dandiya Nights, Durga Puja 2026 (17–19 Oct), Bhadrak. Title sponsor: Burlamart.

Next.js 16 · Tailwind CSS 4 · framer-motion · Lenis smooth scroll · hand-drawn canvas animation.

## Run

```bash
npm install
npm run dev
```

## Editing event details

Everything (venue, prices, Burlamart link, phone/WhatsApp, nights, sponsors, FAQ) lives in `lib/event.ts`.
Add sponsors to `sponsors.partners` — empty slots show "Your brand here" until filled.

## How the scenes work

- `components/DanceScene.tsx` — pinned hero. Scroll position is mapped to dance beats, so scrolling
  scrubs the dancer like a video (32 beats, a twirl every 8). Copy "chapters" fade in over her.
- `components/VenueScene.tsx` — pinned venue. A ring of dandiya pairs circles the garbo lamp under a
  pandal; the three nights slide across as you scroll.
- `lib/rig.ts` — the dancer: a small 3D skeleton (IK arms/legs, spin, skirt flare, dupatta) drawn on
  canvas. `garbaPose` / `dandiyaPose` are the choreography; `RING_LOOKS` / `HERO_LOOK` the outfits.
- `lib/fx.ts` — fairy lights, petals, stars, beams.
- `lib/useSectionProgress.ts` — 0→1 progress for a pinned section.
# DandiyaNights
