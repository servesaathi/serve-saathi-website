"use client";

import { Avatar } from "@/components/ui/Avatar";
import useAuthStore from "@/store/auth.store";

// "Container" header block on "01a_MyCare / Overview" — Figma node
// 3344:339409. Distinct from the shared app/Greeting.tsx (used on
// /services): date sits above a serif H2 greeting, and the profile chip on
// the right is a real card, not just an avatar. The chip's chevron mirrors
// Figma's profile-switcher affordance, but there's no multi-profile data
// model in this app yet (no "caring for" concept beyond the signed-in user
// themselves) — it's decorative until that exists, always reading
// "Yourself".
function greeting(date: Date): string {
  const h = date.getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

type DashboardGreetingProps = {
  /** Replaces the time-of-day greeting, e.g. "Your Wellbeing View". */
  title?: string;
  subtitle?: string;
};

export function DashboardGreeting({ title, subtitle = "Here’s how your care is looking today." }: DashboardGreetingProps = {}) {
  const user = useAuthStore((s) => s.user);
  const now = new Date();
  const firstName = user?.firstName ?? "there";
  const name = user ? `${user.firstName} ${user.lastName}`.trim() : "";
  const dateLabel = now.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="flex w-full flex-col gap-6">
      <p className="text-[24px] leading-8 font-semibold text-primary">{dateLabel}</p>
      <div className="flex w-full flex-wrap items-center justify-between gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="font-serif text-[32px] leading-[1.2] text-text-primary sm:text-[40px] sm:leading-[48px]">
            {title ?? `${greeting(now)} ${firstName},`}
          </h1>
          <p className="text-[18px] leading-7 text-text-secondary">
            {subtitle}
          </p>
        </div>

        <div className="flex items-center gap-6 rounded-card bg-bg-base px-4 py-2">
          <div className="flex items-center gap-2">
            <Avatar name={name || "User"} size={40} />
            <div className="flex flex-col">
              <p className="text-[18px] leading-7 font-semibold text-text-primary">{name || "Your account"}</p>
              <p className="text-[16px] leading-5 text-tertiary">Yourself</p>
            </div>
          </div>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path d="m4 6 4 4 4-4" stroke="#787674" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </div>
  );
}

export default DashboardGreeting;
