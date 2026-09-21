import type { Metadata } from "next";
import localFont from "next/font/local";
import { Source_Serif_4 } from "next/font/google";
import "./globals.css";

// Brand typeface, chosen for legibility (this audience skews older /
// accessibility-dependent) — never substitute a "similar-looking" font.
// See CLAUDE.md. Same files the mobile app ships in ServeSaathi/assets/fonts.
const atkinson = localFont({
  variable: "--font-atkinson",
  display: "swap",
  src: [
    { path: "../fonts/AtkinsonHyperlegibleNext-Regular.ttf", weight: "400", style: "normal" },
    { path: "../fonts/AtkinsonHyperlegibleNext-SemiBold.ttf", weight: "600", style: "normal" },
    { path: "../fonts/AtkinsonHyperlegibleNext-Bold.ttf", weight: "700", style: "normal" },
  ],
});

// Display heading font for the 09/2026 website redesign (H1-H3 only). Figma
// specifies "Source Serif Pro"; Source Serif 4 is its actively-maintained
// Google Fonts successor (same design, current axis). Confirmed with the
// user — see CLAUDE.md's Atkinson-only rule this deviates from.
const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  display: "swap",
  weight: ["400", "600"],
  style: ["normal", "italic"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Serve Saathi",
  description:
    "Caring support for every senior, every day — companionship, daily assistance, and trusted care from your Saathi.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${atkinson.variable} ${sourceSerif.variable} h-full antialiased`}>
      <body className="min-h-full font-sans">{children}</body>
    </html>
  );
}
