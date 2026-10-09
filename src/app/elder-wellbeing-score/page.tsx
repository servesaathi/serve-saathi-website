import { Suspense } from "react";
import { ClinicallyGrounded } from "@/components/elder-wellbeing/ClinicallyGrounded";
import { ClosingCta } from "@/components/elder-wellbeing/ClosingCta";
import { Hero } from "@/components/elder-wellbeing/Hero";
import { NineDimensions } from "@/components/elder-wellbeing/NineDimensions";
import { SampleReport } from "@/components/elder-wellbeing/SampleReport";
import { EwsHome } from "@/components/ews/EwsHome";
import { SiteShell } from "@/components/site/SiteShell";

// "03_Homepage / Elder Wellbeing Score" — Figma node 3421:33512 (and its
// copy in the EWS section, 3344:198763) is the "no scorecard yet" state.
// Users with a completed check-in see the Overview dashboard instead
// (3344:305666) — EwsHome decides on the client from stored results.
export default function ElderWellbeingScorePage() {
  const emptyState = (
    <>
      <Hero />
      <NineDimensions />
      <SampleReport />
      <ClinicallyGrounded />
      <ClosingCta />
    </>
  );
  return (
    <SiteShell>
      {/* useSearchParams (?start=1) needs a Suspense boundary to prerender. */}
      <Suspense fallback={emptyState}>
        <EwsHome emptyState={emptyState} />
      </Suspense>
    </SiteShell>
  );
}
