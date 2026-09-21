"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { SiteShell } from "@/components/site/SiteShell";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { useLogout } from "@/lib/useLogout";
import useAuthStore from "@/store/auth.store";

// Profile Account module — Figma node 1756:59521 (Basic Info / Medical /
// History, each a 920-wide form with a tab switcher).
//
// STATUS: the full three-tab profile editor is NOT built yet — it needs the
// Select-chip input, a date field, avatar upload, and the Field Card list from
// the History tab. This page currently shows read-only account details from the
// session plus the Log out action (which the Figma design actually places in
// the Settings module, per docs/sidebar.md).

export default function ProfilePage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();

  useEffect(() => {
    if (!user) router.replace("/login");
  }, [user, router]);

  function handleLogout() {
    void logout();
  }

  const name = user ? `${user.firstName} ${user.lastName}`.trim() : "";
  const rows: { label: string; value: string }[] = user
    ? [
        { label: "Name", value: name },
        { label: "Email", value: user.email },
        { label: "Phone", value: user.phone ?? "—" },
        { label: "Role", value: user.roles?.join(", ") || "—" },
      ]
    : [];

  return (
    <SiteShell>
      <div className="flex max-w-[920px] flex-col gap-8 py-10">
        <div className="flex items-center gap-5">
          <Avatar name={name || "User"} size={64} />
          <div className="flex flex-col gap-0.5">
            <h1 className="text-[26px] leading-tight font-semibold text-text-primary sm:text-[30px]">
              {name || "Your profile"}
            </h1>
            {user?.email && (
              <p className="text-[16px] leading-[22px] text-text-secondary">{user.email}</p>
            )}
          </div>
        </div>

        <section className="flex flex-col overflow-hidden rounded-card border border-border-hairline bg-bg-base">
          <div className="flex items-center justify-between border-b border-border-hairline px-5 py-4">
            <h2 className="text-[18px] font-semibold text-text-primary">Account details</h2>
            <span className="text-[13px] text-text-muted">Editing coming soon</span>
          </div>
          <dl className="divide-y divide-border-hairline">
            {rows.map((r) => (
              <div key={r.label} className="flex justify-between gap-4 px-5 py-4">
                <dt className="text-[15px] text-text-tertiary">{r.label}</dt>
                <dd className="text-right text-[15px] font-medium text-text-primary">{r.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <div className="flex flex-col gap-3 rounded-card border border-border-hairline bg-bg-base p-5">
          <div>
            <h2 className="text-[18px] font-semibold text-text-primary">Log out</h2>
            <p className="text-[14px] leading-[20px] text-text-secondary">
              You&apos;ll need to sign in again to access your account.
            </p>
          </div>
          <Button
            variant="destructive"
            onClick={handleLogout}
            className="self-start px-6"
          >
            Log out
          </Button>
        </div>
      </div>
    </SiteShell>
  );
}
