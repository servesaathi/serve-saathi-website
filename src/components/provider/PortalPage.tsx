import type { ReactNode } from "react";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { Logo } from "@/components/ui/Logo";

// Centered card on the shared Site chrome (no sidebar) — same shell as
// /login, reused by the provider and admin entry pages.
export function PortalPage({
  tagline,
  width = 500,
  children,
}: {
  tagline?: string;
  width?: number;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col bg-bg-layout">
      <SiteHeader />
      <main className="flex flex-1 items-start justify-center px-6 py-12 sm:px-10 sm:py-16">
        <div className="flex w-full flex-col items-center gap-6" style={{ maxWidth: width }}>
          {tagline !== undefined && (
            <div className="flex w-full flex-col items-center gap-4">
              <Logo tone="color" height={80} priority />
              <p className="text-center text-[18px] leading-7 text-text-secondary">{tagline}</p>
            </div>
          )}
          {children}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

export default PortalPage;
