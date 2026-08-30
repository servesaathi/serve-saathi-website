"use client";

import { Avatar } from "@/components/ui/Avatar";
import useAuthStore from "@/store/auth.store";

// "Profile Text + Photo" greeting block — Figma node 1914:31354. 64px avatar +
// time-aware greeting + full date. Shared by the dashboard and Services pages.

function greeting(date: Date): string {
  const h = date.getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export function Greeting() {
  const user = useAuthStore((s) => s.user);
  const now = new Date();
  const firstName = user?.firstName ?? "there";
  const dateLabel = now.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="flex items-center gap-5">
      <Avatar name={user ? `${user.firstName} ${user.lastName}` : "User"} size={64} />
      <div className="flex flex-col gap-0.5">
        <h1 className="text-[30px] leading-[34px] font-semibold text-text-primary">
          {greeting(now)} {firstName},
        </h1>
        <p className="text-[18px] leading-[22px] text-text-secondary">{dateLabel}</p>
      </div>
    </div>
  );
}

export default Greeting;
