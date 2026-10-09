"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { CheckIn } from "@/components/ews/CheckIn";
import { START_HREF } from "@/components/ews/StartCheckInButtons";
import { useEws } from "@/lib/ews/useEws";

// The full-screen check-in (Figma "Personalized Question" frames). Needs a
// signed-in user with a started check-in; otherwise sends them to log in, or
// back to the Elder Wellbeing page with the set-up pop-up open.
export default function CheckInPage() {
  const ews = useEws();
  const router = useRouter();
  const draft = ews.status === "ready" ? ews.draft : null;

  useEffect(() => {
    if (ews.status === "signed_out") router.replace(`/login?next=${encodeURIComponent(START_HREF)}`);
    else if (ews.status === "ready" && !ews.draft) router.replace(START_HREF);
  }, [ews, router]);

  if (ews.status !== "ready" || !draft) return <div className="min-h-dvh bg-bg-layout" aria-busy="true" />;
  // Keyed by id so "Start again" remounts with fresh state.
  return <CheckIn key={draft.id} userId={ews.userId} initial={draft} />;
}
