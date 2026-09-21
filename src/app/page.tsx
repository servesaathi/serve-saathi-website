import { AccessPortals } from "@/components/home/AccessPortals";
import { About } from "@/components/home/About";
import { AppPromo } from "@/components/home/AppPromo";
import { CarePlanIntro } from "@/components/home/CarePlanIntro";
import { Categories } from "@/components/home/Categories";
import { ClosingCta } from "@/components/home/ClosingCta";
import { Hero } from "@/components/home/Hero";
import { HowItWorks } from "@/components/home/HowItWorks";
import { JoinNetwork } from "@/components/home/JoinNetwork";
import { Resources } from "@/components/home/Resources";
import { Reviews } from "@/components/home/Reviews";
import { SiteShell } from "@/components/site/SiteShell";

// "01_Homepage / Overview" — Figma node 3395:29062, the 09/2026 website
// redesign (see CLAUDE.md heading-font note: H1-H3 use Source Serif Pro).
// Sidebar + Header are now shared site chrome (SiteShell), not app-only.
export default function HomePage() {
  return (
    <SiteShell>
      <Hero />
      <AccessPortals />
      <HowItWorks />
      <CarePlanIntro />
      <About />
      <Categories />
      <Resources />
      <Reviews />
      <JoinNetwork />
      <AppPromo />
      <ClosingCta />
    </SiteShell>
  );
}
