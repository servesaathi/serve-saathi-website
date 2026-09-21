import { ClinicallyGrounded } from "@/components/elder-wellbeing/ClinicallyGrounded";
import { ClosingCta } from "@/components/elder-wellbeing/ClosingCta";
import { Hero } from "@/components/elder-wellbeing/Hero";
import { NineDimensions } from "@/components/elder-wellbeing/NineDimensions";
import { SampleReport } from "@/components/elder-wellbeing/SampleReport";
import { SiteShell } from "@/components/site/SiteShell";

// "03_Homepage / Elder Wellbeing Score" — Figma node 3421:33512, the
// 09/2026 website redesign. Previously unbuilt (Sidebar/Header already
// linked here, so this route 404'd).
export default function ElderWellbeingScorePage() {
  return (
    <SiteShell>
      <Hero />
      <NineDimensions />
      <SampleReport />
      <ClinicallyGrounded />
      <ClosingCta />
    </SiteShell>
  );
}
