"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { useLogout } from "@/lib/useLogout";
import useAuthStore from "@/store/auth.store";

// Persistent left nav — Figma "Sidebar - My Care" (node 3395:29065), the
// 09/2026 website redesign. Visible to every visitor, signed in or not:
// primary links always work; the "Your account" section is locked with a
// sign-in prompt + Create Account card until authenticated.
//
// In Figma, this component's own height (1024px) equals the viewport frame
// it sits in ("Main Screen"), not its content's natural height — it's
// designed to always span the full window height below the header and stay
// pinned there while the rest of the page scrolls past. `h-[calc(100dvh-5rem)]`
// (5rem = the SiteHeader's h-20) reproduces that fixed viewport-height box;
// `sticky top-20` pins it at the header's bottom edge. This only has room to
// stay stuck for the full page scroll because SiteShell's row doesn't use
// `items-start` — the wrapper below stretches to match <main>'s height.

const PRIMARY = [{ label: "Overview", href: "/" }];

const TRAILING = [
  { label: "Elder Wellbeing Score", href: "/elder-wellbeing-score" },
  { label: "Community & Resources", href: "/community", expandable: true },
];

// Figma "Sidebar - My Care" instance on the Explore Service page
// (node 3388:82692, child I3388:82692;2649:3024 "Expand On") — Explore
// Services opens into these six category filters, first one carrying the
// active-item dot when its slug matches ?category=.
const SERVICE_CATEGORIES = [
  { label: "Care Facilities", slug: "care-facilities" },
  { label: "Care Services", slug: "care-services" },
  { label: "Health & Wellness", slug: "health-wellness" },
  { label: "Legal & Financial", slug: "legal-financial" },
  { label: "Daily Living & Lifestyle", slug: "daily-living-lifestyle" },
  { label: "Family Support", slug: "family-support" },
];

// Figma "Sidebar - My Care" instance on "01a_MyCare / Overview" (node
// 3355:416665) — the signed-in sidebar is a different, flatter nav
// entirely (no Explore Services submenu, no Community & Resources), not
// just the marketing sidebar with its bottom section swapped.
const SIGNED_IN_NAV = [
  { label: "Overview", href: "/dashboard" },
  { label: "Elder Wellbeing", href: "/elder-wellbeing-score" },
  { label: "Care Plan", href: "/care-plan" },
  { label: "Service History", href: "/service-history" },
  { label: "Family & Elder", href: "/family-elder" },
  { label: "Payment", href: "/payment" },
];

export function Sidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();
  const onServices = pathname === "/services";
  const activeCategory = searchParams.get("category") ?? (onServices ? SERVICE_CATEGORIES[0].slug : null);
  const [servicesOpen, setServicesOpen] = useState(onServices);

  if (user) {
    const name = `${user.firstName} ${user.lastName}`.trim();
    return (
      <div className="hidden w-[304px] shrink-0 lg:block">
        <div className="sticky top-20 h-[calc(100dvh-5rem)] pl-6 py-6">
          <div
            className="flex h-full w-full flex-col items-start gap-6 overflow-y-auto rounded-card border-r-[1.5px] border-primary-pressed px-6 pt-10 pb-4 shadow-[0_60px_45px_rgba(72,85,99,0.1)]"
            style={{
              backgroundImage:
                "linear-gradient(146deg, var(--color-primary) 0%, var(--color-secondary) 62.5%)",
            }}
          >
            <nav className="flex w-full flex-col gap-1.5">
              {SIGNED_IN_NAV.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`flex w-full items-center rounded-control py-2 pr-2 pl-4 text-[18px] leading-7 ${
                      active ? "bg-bg-layout text-primary" : "text-white hover:bg-white/10"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-auto flex w-full flex-col gap-2">
              <div className="flex w-full items-center gap-2 py-2">
                <Avatar name={name || "User"} size={48} />
                <div className="flex flex-col text-white">
                  <p className="text-[18px] leading-7 font-semibold">{name || "Your account"}</p>
                  <p className="text-[16px] leading-5">Yourself</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => void logout()}
                className="flex w-full items-center gap-2 rounded-control p-2 text-[18px] leading-7 font-medium text-white hover:bg-white/10"
              >
                <Image src="/icons/homepage/arrow-right.svg" alt="" width={24} height={24} aria-hidden />
                Log out
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="hidden w-[304px] shrink-0 lg:block">
      <div className="sticky top-20 h-[calc(100dvh-5rem)] pl-6 py-6">
        <div
          className="flex h-full w-full flex-col items-center justify-between gap-6 overflow-y-auto rounded-card border-r-[1.5px] border-primary-pressed px-6 pt-10 pb-6 shadow-[0_60px_45px_rgba(72,85,99,0.1)]"
          style={{
            backgroundImage:
              "linear-gradient(132.5deg, var(--color-primary) 0%, var(--color-secondary) 62.5%)",
          }}
        >
          <nav className="flex w-full flex-col gap-1.5">
            {PRIMARY.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex w-full items-center justify-between rounded-control py-2 pr-2 pl-4 text-[18px] leading-7 ${
                    active ? "bg-bg-layout text-primary" : "text-white hover:bg-white/10"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}

            <div className="flex w-full flex-col gap-1.5">
              <div
                className={`flex w-full items-center justify-between rounded-control ${
                  servicesOpen ? "bg-bg-layout" : ""
                }`}
              >
                <Link
                  href="/services"
                  className={`flex-1 px-4 py-2 text-[18px] leading-7 ${
                    servicesOpen ? "text-primary" : "text-white hover:bg-white/10"
                  }`}
                >
                  Explore Services
                </Link>
                <button
                  type="button"
                  aria-expanded={servicesOpen}
                  aria-controls="sidebar-explore-services-submenu"
                  aria-label={servicesOpen ? "Collapse Explore Services" : "Expand Explore Services"}
                  onClick={() => setServicesOpen((v) => !v)}
                  className="flex size-8 shrink-0 items-center justify-center"
                >
                  <Image
                    src={
                      servicesOpen
                        ? "/icons/homepage/chevron-down-primary.svg"
                        : "/icons/homepage/chevron-down-white.svg"
                    }
                    alt=""
                    width={16}
                    height={16}
                    aria-hidden
                    className={servicesOpen ? "-scale-y-100" : ""}
                  />
                </button>
              </div>
              {servicesOpen && (
                <div id="sidebar-explore-services-submenu" className="flex w-full flex-col gap-1.5 pl-4">
                  {SERVICE_CATEGORIES.map((category) => {
                    const active = onServices && activeCategory === category.slug;
                    return (
                      <Link
                        key={category.slug}
                        href={`/services?category=${category.slug}`}
                        className="flex items-center gap-2 py-1.5 text-[18px] leading-7 text-[#e8e8e8] hover:text-white"
                      >
                        {category.label}
                        {active && (
                          <Image
                            src="/icons/homepage/submenu-active-dot.svg"
                            alt=""
                            width={8}
                            height={8}
                            aria-hidden
                          />
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {TRAILING.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex w-full items-center justify-between rounded-control py-2 text-[18px] leading-7 ${
                    item.expandable ? "px-4" : "pr-2 pl-4"
                  } ${active ? "bg-bg-layout text-primary" : "text-white hover:bg-white/10"}`}
                >
                  {item.label}
                  {item.expandable && (
                    <Image
                      src="/icons/homepage/chevron-down-white.svg"
                      alt=""
                      width={16}
                      height={16}
                      aria-hidden
                      className={active ? "opacity-60" : ""}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Reached only when signed out — the `user` branch above returns
              its own signed-in sidebar early. */}
          <div
            className="relative flex w-full flex-col gap-4 overflow-hidden rounded-card bg-cover bg-center p-4"
            style={{ backgroundImage: "url('/images/homepage/create-account-card-pattern.svg')" }}
          >
            <p className="text-[16px] leading-6 text-white">
              New to Serve Saathi? Create a free account to save providers and track bookings
            </p>
            <Link
              href="/join"
              className="flex w-full items-center justify-center rounded-control bg-secondary px-4 py-2 text-[18px] font-medium text-white transition-colors hover:bg-[#0d250f]"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
