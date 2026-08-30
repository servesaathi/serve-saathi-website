"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";

// Marketing site header. Brand + section anchors + auth CTAs. The nav links
// jump to sections on this page; "Log in" / "Get Started" hand off to the app.

const LINKS = [
  { label: "Home", href: "#top" },
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "How it works", href: "#how" },
  { label: "Contact", href: "#contact" },
];

export function LandingHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border-hairline bg-bg-base/90 backdrop-blur">
      <div className="mx-auto flex h-20 w-full max-w-[1180px] items-center justify-between px-5">
        <Link href="#top" aria-label="Serve Saathi home">
          <Logo tone="color" height={36} priority />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-[15px] font-medium text-text-secondary transition-colors hover:text-primary"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/login"
            className="text-[15px] font-semibold text-primary hover:underline"
          >
            Log in
          </Link>
          <Button href="/join" className="px-5">
            Get Started
          </Button>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          className="flex size-10 items-center justify-center rounded-input border border-border-hairline bg-bg-base md:hidden"
        >
          <span className="relative block h-0.5 w-5 bg-primary before:absolute before:-top-1.5 before:block before:h-0.5 before:w-5 before:bg-primary before:content-[''] after:absolute after:top-1.5 after:block after:h-0.5 after:w-5 after:bg-primary after:content-['']" />
        </button>
      </div>

      {open && (
        <div className="border-t border-border-hairline bg-bg-base px-5 py-4 md:hidden">
          <nav className="flex flex-col">
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="py-3 text-[16px] font-medium text-text-secondary"
              >
                {l.label}
              </a>
            ))}
          </nav>
          <div className="mt-3 flex flex-col gap-3">
            <Button href="/join" fullWidth onClick={() => setOpen(false)}>
              Get Started
            </Button>
            <Button href="/login" variant="light" fullWidth onClick={() => setOpen(false)}>
              Log in
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}

export default LandingHeader;
