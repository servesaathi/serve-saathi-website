"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, type ReactNode } from "react";
import { startAssessment, type StartInput } from "@/lib/ews/ewsService";
import { useEws } from "@/lib/ews/useEws";
import { Overview } from "./Overview";
import { SetupDialog } from "./SetupDialog";

// /elder-wellbeing-score decides between the two Figma states:
//   - no result yet → "03_Homepage / Elder Wellbieng Score" (3344:198763),
//     the existing marketing sections passed in as `emptyState`, now with
//     working CTAs;
//   - has a result  → "03a … Overview" (3344:305666).
// "Has a result?" comes from ewsService.getLatestResult (localStorage until
// GET /ews/results/latest exists). `?start=1` opens the set-up pop-up — the
// CTAs link there so it also survives the round-trip through /login.

export function EwsHome({ emptyState }: { emptyState: ReactNode }) {
  const ews = useEws();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [setupOpen, setSetupOpen] = useState(false);
  const wantsStart = params.get("start") === "1" && ews.status === "ready";

  const closeSetup = () => {
    setSetupOpen(false);
    if (params.get("start")) router.replace(pathname, { scroll: false });
  };

  const start = async (input: StartInput) => {
    if (ews.status !== "ready") return;
    await startAssessment(ews.userId, input);
    router.push("/elder-wellbeing-score/check-in");
  };

  const setup = <SetupDialog open={setupOpen || wantsStart} onClose={closeSetup} onStart={start} />;

  if (ews.status === "loading") {
    return <div className="min-h-[60vh]" aria-busy="true" />;
  }

  if (ews.status === "ready" && ews.latest?.result) {
    return (
      <>
        <Overview
          userId={ews.userId}
          latest={ews.latest}
          history={ews.history}
          reminderSnoozedUntil={ews.reminderSnoozedUntil}
          onRetake={() => setSetupOpen(true)}
          onDeleted={ews.refresh}
          onSnoozed={ews.refresh}
        />
        {setup}
      </>
    );
  }

  return (
    <>
      {emptyState}
      {setup}
    </>
  );
}

export default EwsHome;
