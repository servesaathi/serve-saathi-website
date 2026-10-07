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

// Chrome for every /admin screen except login. There's no admin design in
// Figma yet, so this reuses the redesign's language: SiteHeader's deep-green
// bar (bg-secondary, h-20, white logo) and the Sidebar's green gradient card
// with white nav items, active item = white pill with primary text.
//
// Access: the backend enforces the admin role on every call; this guard is
// UX only — it sends anyone without an admin session to /admin/login.
// Exception: demo-data mode outside production, so the screens can be
// reviewed without an admin account.

const NAV = [
  { label: "Users", href: "/admin/users" },
  { label: "Providers", href: "/admin/providers" },
];

const ADMIN_ROLES = ["admin", "super_admin"];
const DEMO_BYPASS = ADMIN_DATA_MODE === "mock" && process.env.NODE_ENV !== "production";

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const hydrated = useHydrated();
  const user = useAuthStore((s) => s.user);
  const logout = useLogout("/admin/login");

  const isAdmin = Boolean(user?.roles.some((r) => ADMIN_ROLES.includes(r)));
  const allowed = isAdmin || DEMO_BYPASS;

  useEffect(() => {
    if (hydrated && !allowed) router.replace("/admin/login");
  }, [hydrated, allowed, router]);

  const name = user ? `${user.firstName} ${user.lastName}`.trim() : "Demo admin";

  return (
    <div className="flex min-h-dvh flex-col bg-bg-layout">
      <header className="sticky top-0 z-30 bg-secondary">
        <div className="flex h-20 items-center justify-between gap-4 px-4 sm:px-6 lg:px-10">
          <div className="flex items-center gap-3">
            <Link href="/admin/users" aria-label="Admin console home" className="rounded-control focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
              <Logo height={36} />
            </Link>
            <span className="rounded-full bg-orange-line px-3 py-0.5 text-[14px] leading-5 font-semibold text-[#cc5e19]">
              Admin
            </span>
          </div>
          {hydrated && allowed && (
            <div className="flex items-center gap-3">
              <Avatar name={name} size={40} />
              <span className="hidden text-[16px] leading-[22px] font-semibold text-white sm:inline">{name}</span>
              {user && (
                <button
                  type="button"
                  onClick={logout}
                  className="ml-2 h-10 rounded-control border border-white/40 px-4 text-[16px] font-semibold text-white hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  Log out
                </button>
              )}
            </div>
          )}
        </div>
      </header>

      {ADMIN_DATA_MODE === "mock" && (
        <p role="status" className="bg-orange-line px-4 py-2 text-center text-[14px] leading-5 text-text-primary">
          <strong>Demo data</strong> — changes here are not saved to the server and reset on reload. Set{" "}
          <code>NEXT_PUBLIC_ADMIN_DATA_SOURCE=api</code> to use live data.
        </p>
      )}

      <div className="flex w-full flex-1 flex-col lg:flex-row">
        <nav aria-label="Admin" className="lg:sticky lg:top-20 lg:h-[calc(100dvh-5rem)] lg:w-[260px] lg:shrink-0 lg:p-6">
          <ul
            className="flex gap-2 p-3 lg:h-full lg:flex-col lg:rounded-card lg:p-4"
            style={{ background: "linear-gradient(146deg, var(--color-primary) 0%, var(--color-secondary) 62.5%)" }}
          >
            {NAV.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <li key={item.href} className="flex-1 lg:flex-none">
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`flex h-12 items-center justify-center rounded-control px-4 text-[18px] leading-7 lg:justify-start ${
                      active ? "bg-bg-base font-semibold text-primary" : "text-white hover:bg-white/10"
                    } focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <main className="min-w-0 flex-1 px-4 py-8 sm:px-6 lg:px-10">
          {hydrated && allowed ? children : <div className="min-h-[50vh]" aria-busy />}
        </main>
      </div>
    </div>
  );
}

export default AdminShell;
