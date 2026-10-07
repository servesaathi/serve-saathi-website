"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Logo } from "@/components/ui/Logo";
import { ADMIN_DATA_MODE } from "@/lib/admin";
import { useHydrated } from "@/lib/useHydrated";
import { useLogout } from "@/lib/useLogout";
import useAuthStore from "@/store/auth.store";
import { ICONS, Icon } from "./parts";

// Chrome for every /admin screen except login. No admin frame exists in
// Figma, so this mirrors the site chrome: SiteHeader's deep-green bar
// (bg-secondary, h-20, white logo) and the "Sidebar - My Care" card (green
// gradient, white items, active item = white pill with primary text, the
// signed-in person + "Log out" pinned to the bottom).
//
// Access: the backend enforces the admin role on every call; this guard is
// UX only — it sends anyone without an admin session to /admin/login.
// Exception: demo-data mode outside production, so the screens can be
// reviewed without an admin account.

const NAV = [
  { label: "Users", href: "/admin/users", icon: ICONS.users },
  { label: "Providers", href: "/admin/providers", icon: ICONS.providers },
];

const ADMIN_ROLES = ["admin", "super_admin"];
const DEMO_BYPASS = ADMIN_DATA_MODE === "mock" && process.env.NODE_ENV !== "production";
const SIDEBAR_BG = "linear-gradient(146deg, var(--color-primary) 0%, var(--color-secondary) 62.5%)";

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const hydrated = useHydrated();
  const user = useAuthStore((s) => s.user);
  const logout = useLogout("/admin/login");

  const isAdmin = Boolean(user?.roles.some((r) => ADMIN_ROLES.includes(r)));
  const allowed = isAdmin || DEMO_BYPASS;
  const ready = hydrated && allowed;

  useEffect(() => {
    if (hydrated && !allowed) router.replace("/admin/login");
  }, [hydrated, allowed, router]);

  const name = user ? `${user.firstName} ${user.lastName}`.trim() : "Demo admin";
  const roleLabel = user?.roles.includes("super_admin") ? "Super admin" : user ? "Admin" : "Demo mode";

  const navLinks = (compact: boolean) =>
    NAV.map((item) => {
      const active = pathname.startsWith(item.href);
      return (
        <li key={item.href} className={compact ? "flex-1" : undefined}>
          <Link
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`flex h-12 items-center gap-3 rounded-control px-4 text-[18px] leading-7 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
              compact ? "justify-center" : ""
            } ${active ? "bg-bg-base font-semibold text-primary" : "text-white hover:bg-white/10"}`}
          >
            <Icon src={item.icon} size={22} />
            {item.label}
          </Link>
        </li>
      );
    });

  return (
    <div className="flex min-h-dvh flex-col bg-bg-layout">
      <header className="sticky top-0 z-30 bg-secondary">
        <div className="flex h-20 items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link href="/admin/users" aria-label="Admin console home" className="rounded-control focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
              <Logo height={36} priority />
            </Link>
            <span className="rounded-full bg-orange-line px-3 py-0.5 text-[14px] leading-5 font-semibold text-[#a84c12]">Admin console</span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="hidden h-10 items-center rounded-control px-3 text-[16px] text-white hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-white sm:flex"
            >
              View site
            </Link>
            {ready && <Avatar name={name} size={40} className="lg:hidden" />}
          </div>
        </div>
      </header>

      {ADMIN_DATA_MODE === "mock" && (
        <p role="status" className="bg-orange-line px-4 py-2 text-center text-[14px] leading-5 text-text-primary">
          <strong>Demo data</strong> — changes aren&apos;t saved to the server and reset on reload. Set{" "}
          <code>NEXT_PUBLIC_ADMIN_DATA_SOURCE=api</code> for live data.
        </p>
      )}

      <div className="flex w-full flex-1">
        {/* Desktop sidebar */}
        <div className="hidden w-[280px] shrink-0 p-6 pr-0 lg:block">
          <aside
            aria-label="Admin navigation"
            className="sticky top-26 flex h-[calc(100dvh-8rem)] flex-col justify-between overflow-y-auto rounded-card p-5 shadow-[0_8px_8px_rgba(30,27,24,0.16)]"
            style={{ background: SIDEBAR_BG }}
          >
            <nav aria-label="Admin">
              <p className="px-4 pb-3 text-[14px] leading-5 tracking-wide text-white/75 uppercase">Manage</p>
              <ul className="flex flex-col gap-1">{navLinks(false)}</ul>
            </nav>
            {ready && (
              <div className="flex flex-col gap-3 border-t border-white/20 pt-5">
                <div className="flex items-center gap-3 px-1">
                  <Avatar name={name} size={44} />
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate text-[17px] leading-6 font-semibold text-white">{name}</span>
                    <span className="text-[15px] leading-5 text-white/80">{roleLabel}</span>
                  </div>
                </div>
                {user && (
                  <button
                    type="button"
                    onClick={logout}
                    className="flex h-11 items-center gap-3 rounded-control px-3 text-[17px] text-white hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-white"
                  >
                    <Icon src="/icons/settings/logout.svg" size={22} />
                    Log out
                  </button>
                )}
              </div>
            )}
          </aside>
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          {/* Mobile/tablet nav */}
          <nav aria-label="Admin" className="px-4 pt-4 sm:px-6 lg:hidden">
            <ul className="flex gap-2 rounded-card p-2" style={{ background: SIDEBAR_BG }}>
              {navLinks(true)}
            </ul>
          </nav>

          <main className="mx-auto w-full max-w-[1200px] flex-1 px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
            {ready ? children : <div className="min-h-[50vh]" aria-busy />}
          </main>

          {ready && user && (
            <div className="flex justify-center pb-8 lg:hidden">
              <button type="button" onClick={logout} className="h-11 rounded-control px-4 font-semibold text-primary underline">
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminShell;
