import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

const COLUMNS: { heading: string; links: { label: string; href: string }[] }[] = [
  {
    heading: "Product",
    links: [
      { label: "How it works", href: "#how" },
      { label: "Services", href: "#services" },
      { label: "Get started", href: "/join" },
      { label: "Log in", href: "/login" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About", href: "#about" },
      { label: "Become a Saathi", href: "/join" },
      { label: "Partners", href: "/join" },
    ],
  },
  {
    heading: "Support",
    links: [
      { label: "Contact us", href: "mailto:support@servesaathi.com" },
      { label: "Help centre", href: "#contact" },
    ],
  },
];

export function LandingFooter() {
  return (
    <footer id="contact" className="scroll-mt-24 bg-secondary text-white">
      <div className="mx-auto w-full max-w-[1180px] px-5 py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="flex flex-col gap-4">
            <Logo tone="white" height={34} />
            <p className="max-w-[280px] text-[14px] leading-6 text-white/70">
              Care for those who cared for us. Trusted companionship and daily support
              for seniors, arranged by their families.
            </p>
            <a
              href="mailto:support@servesaathi.com"
              className="text-[14px] text-white/85 hover:underline"
            >
              support@servesaathi.com
            </a>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.heading} className="flex flex-col gap-3">
              <p className="text-[13px] font-semibold tracking-wide text-white/60 uppercase">
                {col.heading}
              </p>
              {col.links.map((l) =>
                l.href.startsWith("#") || l.href.startsWith("mailto:") ? (
                  <a key={l.label} href={l.href} className="text-[14px] text-white/85 hover:underline">
                    {l.label}
                  </a>
                ) : (
                  <Link
                    key={l.label}
                    href={l.href}
                    className="text-[14px] text-white/85 hover:underline"
                  >
                    {l.label}
                  </Link>
                )
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-white/15 pt-6 text-[13px] text-white/60 sm:flex-row sm:items-center sm:justify-between">
          <p>Copyright © {new Date().getFullYear()} Serve Saathi. All rights reserved.</p>
          <p className="flex gap-4">
            <Link href="/terms" className="hover:underline">
              Terms
            </Link>
            <Link href="/privacy" className="hover:underline">
              Privacy
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}

export default LandingFooter;
