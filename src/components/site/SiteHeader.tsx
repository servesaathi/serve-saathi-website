"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Logo } from "@/components/ui/Logo";
import useAuthStore from "@/store/auth.store";

// New site-wide header — Figma "Header Navigation", the 09/2026 website
// redesign. Dark green bar shared by every page. Two distinct states, per
// Figma's "Non User" (node 3395:29063: About Us/Contact Us, search →
// login glyph) vs "Existing User" (node 3344:334458, on "01a_MyCare /
// Overview": My Care/Find Care/Community & Resource/Account, search + a
// real notification bell + an avatar button) — not the same nav with a
// couple of items swapped.

const NAV_SIGNED_OUT = [
  { label: "About Us", href: "/about" },
  { label: "Contact Us", href: "/contact" },
];

const NAV_SIGNED_IN = [
  { label: "My Care", href: "/dashboard" },
  { label: "Find Care", href: "/services" },
  { label: "Community & Resource", href: "/community" },
  { label: "Account", href: "/profile" },
];

// Every route "My Care" owns, so it stays underlined while on any of its
// sub-pages, not just the exact /dashboard overview.
const MY_CARE_ROUTES = ["/dashboard", "/elder-wellbeing-score", "/care-plan", "/service-history", "/family-elder", "/payment"];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const NAV = user ? NAV_SIGNED_IN : NAV_SIGNED_OUT;
  const name = user ? `${user.firstName} ${user.lastName}`.trim() : "";

  function isActive(href: string) {
    return href === "/dashboard" ? MY_CARE_ROUTES.includes(pathname) : pathname === href;
  }

  return (
    <header className="sticky top-0 z-40 bg-secondary">
      <div className="mx-auto flex h-20 w-full max-w-[1440px] items-center justify-between px-6 sm:px-12">
        <Link href="/" aria-label="Serve Saathi home">
          <Logo tone="white" height={40} priority />
        </Link>

        <nav className="hidden items-center gap-12 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`border-b-3 py-2 text-[18px] leading-7 transition-colors ${
                isActive(item.href)
                  ? "border-tertiary text-white"
                  : "border-transparent text-white/90 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-4 lg:flex">
          <Link
            href="/services"
            aria-label="Search"
            className="flex size-10 items-center justify-center rounded-full bg-bg-layout transition-colors hover:bg-white"
          >
            <Image src="/icons/homepage/search.svg" alt="" width={24} height={24} aria-hidden />
          </Link>
          {user && (
            <Link
              href="/notifications"
              aria-label="Notifications"
              className="flex size-10 items-center justify-center rounded-full bg-bg-layout transition-colors hover:bg-white"
            >
              <Image src="/icons/homepage/notification-bell.svg" alt="" width={24} height={24} aria-hidden />
            </Link>
          )}
          <Link
            href="/contact"
            className="flex h-10 items-center gap-2 rounded-control bg-error px-4 py-2 text-[18px] font-medium text-white transition-colors hover:bg-[#991b1b]"
          >
            <Image src="/icons/homepage/helpline-heart.svg" alt="" width={24} height={24} aria-hidden />
            Helpline
          </Link>
          <Link
            href="/elder-wellbeing-score"
            className="flex h-10 items-center rounded-control bg-primary px-4 py-2 text-[18px] font-medium text-white transition-colors hover:bg-primary-pressed"
          >
            Elder Wellbeing Score
          </Link>
          {user ? (
            <Link href="/profile" aria-label="Your account">
              <Avatar name={name || "User"} size={40} />
            </Link>
          ) : (
            <Link
              href="/login"
              aria-label="Sign in"
              className="flex size-10 items-center justify-center rounded-control bg-primary transition-colors hover:bg-primary-pressed"
            >
              <Image src="/icons/homepage/profile.svg" alt="" width={24} height={24} aria-hidden />
            </Link>
          )}
        </div>

        {/* Mobile trigger */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          className="flex size-10 items-center justify-center rounded-control bg-primary lg:hidden"
        >
          <Image src="/icons/homepage/menu.svg" alt="" width={24} height={24} aria-hidden />
        </button>
      </div>

      {open && (
        <div className="border-t border-white/10 bg-secondary px-6 py-4 lg:hidden">
          <nav className="flex flex-col gap-4">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="text-[18px] leading-7 text-white/90"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-4 flex flex-col gap-3">
            <Link
              href="/contact"
              onClick={() => setOpen(false)}
              className="flex h-11 items-center justify-center gap-2 rounded-control bg-error px-4 text-[16px] font-medium text-white"
            >
              <Image src="/icons/homepage/helpline-heart.svg" alt="" width={20} height={20} aria-hidden />
              Helpline
            </Link>
            <Link
              href="/elder-wellbeing-score"
              onClick={() => setOpen(false)}
              className="flex h-11 items-center justify-center rounded-control bg-primary px-4 text-[16px] font-medium text-white"
            >
              Elder Wellbeing Score
            </Link>
            <Link
              href={user ? "/profile" : "/login"}
              onClick={() => setOpen(false)}
              className="flex h-11 items-center justify-center rounded-control border border-white/20 px-4 text-[16px] font-medium text-white"
            >
              {user ? "Your account" : "Sign in"}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

export default SiteHeader;
