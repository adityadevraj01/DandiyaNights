// Single source of truth for event details. Every section reads from here,
// so venue, prices, links and numbers can be updated in one place later.

export const event = {
  name: "Dandiya Nights",
  city: "Bhadrak",
  state: "Odisha",
  occasion: "Durga Puja 2026",
  dateLabel: "17 — 19 Oct 2026",

  venue: {
    name: "Venue reveal soon",
    address: "Bhadrak, Odisha",
  },

  // TODO: real Burlamart event link.
  burlamartUrl: "https://burlamart.com",

  contact: {
    // TODO: organisers' number (10 digits, no +91).
    phone: "9999999999",
    whatsapp: "9999999999",
    instagram: "https://instagram.com",
  },

  sponsors: {
    title: { name: "Burlamart", tagline: "Official ticketing partner of Dandiya Nights", url: "https://burlamart.com" },
    // Add partners here as they come on board: { name, url?, logo? }
    partners: [] as { name: string; url?: string; logo?: string }[],
  },

  nights: [
    {
      n: "01",
      day: "17",
      month: "Oct",
      weekday: "Saturday",
      theme: "Garba Raas",
      time: "7:00 PM — 11:00 PM",
      tags: ["Opening aarti", "Live dhol", "Classic garba"],
      accent: "from-marigold to-saffron",
    },
    {
      n: "02",
      day: "18",
      month: "Oct",
      weekday: "Sunday",
      theme: "Dandiya Dhamaka",
      time: "7:00 PM — 11:00 PM",
      tags: ["Dandiya raas", "Best dressed", "Live singers"],
      accent: "from-magenta to-rani",
    },
    {
      n: "03",
      day: "19",
      month: "Oct",
      weekday: "Monday",
      theme: "The Grand Finale",
      time: "7:00 PM — 11:30 PM",
      tags: ["Bollywood garba", "Prizes", "Fireworks"],
      accent: "from-parrot to-teal",
    },
  ],

  passes: [
    {
      id: "single",
      name: "Single Pass",
      price: 399 as number | null,
      per: "per person · per night",
      perks: ["Entry for one night", "Dandiya sticks on entry", "Food court access"],
      featured: true,
    },
    {
      id: "couple",
      name: "Couple Pass",
      price: null as number | null,
      per: "for two · per night",
      perks: ["Entry for two", "Couples' round", "Photo booth"],
      featured: false,
    },
    {
      id: "season",
      name: "All 3 Nights",
      price: null as number | null,
      per: "per person",
      perks: ["All three nights", "Priority entry lane", "Best value"],
      featured: false,
    },
  ],

  faq: [
    {
      q: "How do I get passes?",
      a: "Online on Burlamart, or offline by calling or WhatsApping us — our team confirms offline passes on WhatsApp.",
    },
    {
      q: "Is there a dress code?",
      a: "Traditional is the vibe — chaniya choli, kediyu, kurta or anything festive. Wear shoes you can dance in.",
    },
    {
      q: "Will dandiya sticks be provided?",
      a: "Yes, every pass gets a pair at entry. Bring your own decorated pair if you like.",
    },
    {
      q: "Can families and kids come?",
      a: "Absolutely. Dandiya Nights is a family celebration of Durga Puja.",
    },
    {
      q: "Where is the venue?",
      a: "We're revealing the venue soon — follow us on Instagram so you don't miss it.",
    },
  ],
};

export const whatsappLink = (text?: string) =>
  `https://wa.me/91${event.contact.whatsapp}${text ? `?text=${encodeURIComponent(text)}` : ""}`;

export const phoneLink = `tel:+91${event.contact.phone}`;

export const formatPrice = (price: number | null) =>
  price === null ? "Soon" : `₹${price.toLocaleString("en-IN")}`;
