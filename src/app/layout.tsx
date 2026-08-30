import type { Metadata } from "next";
import localFont from "next/font/local";
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

export const metadata: Metadata = {
  title: "Serve Saathi",
  description:
    "Caring support for every senior, every day — companionship, daily assistance, and trusted care from your Saathi.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${atkinson.variable} h-full antialiased`}>
      <body className="min-h-full font-sans">{children}</body>
    </html>
  );
}
