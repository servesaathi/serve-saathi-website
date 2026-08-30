"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Logo } from "@/components/ui/Logo";
import useAuthStore from "@/store/auth.store";

// "Header Nav for website" — Figma node 1914:31484. White bar, 1.5px bottom
// hairline. Desktop: logo · nav · search · notifications · profile.
// Below lg: logo · hamburger that discloses the nav + search.

const NAV = [
  { label: "Home", href: "/dashboard" },
  { label: "Service", href: "/services" },
  { label: "Profile", href: "/profile" },
  { label: "Settings", href: "/settings" },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function SearchField({ className = "" }: { className?: string }) {
  const router = useRouter();
  const [q, setQ] = useState("");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    router.push(q.trim() ? `/services?search=${encodeURIComponent(q.trim())}` : "/services");
  }

  return (
    <form
      onSubmit={onSubmit}
      className={`flex h-12 items-center gap-2 rounded-input border-[1.5px] border-border-hairline bg-bg-base pl-4 pr-5 ${className}`}
    >
      <Image src="/icons/search.svg" alt="" width={24} height={24} aria-hidden />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search"
        aria-label="Search services"
        className="min-w-0 flex-1 bg-transparent text-[16px] leading-6 text-text-primary placeholder:text-text-muted focus:outline-none"
      />
    </form>
  );
}

export function WebHeader() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const [open, setOpen] = useState(false);
  const name = user ? `${user.firstName} ${user.lastName}`.trim() : "";

  const navLinks = (onClick?: () => void) =>
    NAV.map((item) => (
      <Link
        key={item.href}
        href={item.href}
        onClick={onClick}
        className={`text-[16px] leading-[22px] ${
          isActive(pathname, item.href)
            ? "font-semibold text-tertiary"
            : "font-normal text-text-secondary hover:text-text-primary"
        }`}
      >
        {item.label}
      </Link>
    ));

  return (
    <header className="sticky top-0 z-40 border-b-[1.5px] border-[#eaf2ea] bg-bg-base">
      <div className="mx-auto flex h-20 w-full max-w-[1440px] items-center justify-between px-6 sm:px-12">
        <Link href="/dashboard" aria-label="Serve Saathi home">
          <Logo tone="color" height={40} priority />
        </Link>

        {/* Desktop cluster */}
        <div className="hidden items-center gap-8 lg:flex xl:gap-12">
          <nav className="flex items-center gap-8 xl:gap-12">{navLinks()}</nav>
          <div className="flex items-center gap-4">
            <SearchField className="w-[240px]" />
            <Link
              href="/notifications"
              aria-label="Notifications"
              className="flex size-10 items-center justify-center rounded-full bg-primary text-white transition-colors hover:bg-primary-pressed"
            >
              <Image src="/icons/bell.svg" alt="" width={24} height={24} aria-hidden />
            </Link>
            <Link href="/profile" className="flex items-center gap-3">
              <Avatar name={name || "User"} size={40} />
              {name && (
                <span className="text-[20px] leading-[30px] font-semibold text-primary">{name}</span>
              )}
            </Link>
          </div>
        </div>

        {/* Mobile trigger */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          className="flex size-10 items-center justify-center rounded-control bg-primary text-white lg:hidden"
        >
          <Image src="/icons/menu.svg" alt="" width={24} height={24} aria-hidden />
        </button>
      </div>

      {/* Mobile disclosure */}
      {open && (
        <div className="border-t border-border-hairline bg-bg-base px-6 py-4 lg:hidden">
          <nav className="flex flex-col gap-4">{navLinks(() => setOpen(false))}</nav>
          <div className="mt-4 flex items-center gap-3">
            <Link
              href="/notifications"
              onClick={() => setOpen(false)}
              aria-label="Notifications"
              className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-white"
            >
              <Image src="/icons/bell.svg" alt="" width={24} height={24} aria-hidden />
            </Link>
            <SearchField className="flex-1" />
          </div>
          {name && (
            <Link
              href="/profile"
              onClick={() => setOpen(false)}
              className="mt-4 flex items-center gap-3"
            >
              <Avatar name={name} size={40} />
              <span className="text-[18px] font-semibold text-primary">{name}</span>
            </Link>
          )}
        </div>
      )}
    </header>
  );
}

export default WebHeader;
