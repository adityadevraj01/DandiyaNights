import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Manrope, Unbounded } from "next/font/google";
import SmoothScroll from "@/components/SmoothScroll";
import "lenis/dist/lenis.css";
import "./globals.css";

const display = Unbounded({ variable: "--font-unbounded", subsets: ["latin"], weight: ["500", "700", "800", "900"] });
const serif = Instrument_Serif({ variable: "--font-instrument", subsets: ["latin"], weight: "400", style: ["normal", "italic"] });
const sans = Manrope({ variable: "--font-manrope", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Dandiya Nights · Bhadrak — Durga Puja 2026",
  description: "Three nights of garba & dandiya in Bhadrak this Durga Puja, 17–19 October 2026. Presented by Burlamart.",
  openGraph: {
    title: "Dandiya Nights · Bhadrak",
    description: "Garba & dandiya under Durga Puja lights — 17–19 Oct 2026. Passes on Burlamart.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#07051a",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${display.variable} ${serif.variable} ${sans.variable} antialiased`}>
      <body>
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
