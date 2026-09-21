import type { ReactNode } from "react";
import { Sidebar } from "@/components/site/Sidebar";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";

// Shared chrome for the 09/2026 website redesign — persistent Header +
// Sidebar + Footer, Figma "01_Homepage / Overview" node 3395:29062's shell.
// Use on any page reachable from the sidebar's own nav (Overview, Explore
// Services, Elder Wellbeing Score, Community & Resources, ...) instead of
// the legacy AppShell, so the sidebar stays present across navigation.
//
// No `items-start` on the row below: the row must stretch to the height of
// its tallest child (<main>) so Sidebar's own `sticky` wrapper has scroll
// room to stay pinned for the full page height, not just its own content
// height.
//
// This row is deliberately full-width (no `mx-auto max-w-[1440px]`) so
// Sidebar sits flush against the true left edge of the viewport at any
// screen width, app-shell style — Figma's 1440 frame doesn't define
// wider-viewport behaviour, and centering the whole row inside a fixed
// 1440 column left a dead margin next to the sidebar that grew with screen
// width (e.g. ~264px at 1920px). `max-w-[1136px]` on <main> preserves the
// Figma "Left Container" content width (home sections have no max-width
// safety net of their own, so an unbounded <main> would stretch them);
// `justify-center` centers that column within whatever space remains once
// Sidebar is pinned, so it still sits flush next to Sidebar at ~1440px
// viewports and gets balanced margins beyond that instead of a lopsided gap.
export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-bg-layout">
      <SiteHeader />
      <div className="flex w-full flex-1">
        <Sidebar />
        <div className="flex w-full flex-1 justify-center">
          <main className="min-w-0 w-full max-w-[1136px] px-2 sm:px-6 lg:px-10">{children}</main>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}

export default SiteShell;
