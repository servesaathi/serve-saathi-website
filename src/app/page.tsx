import { AppDownload } from "@/components/landing/AppDownload";
import { FeatureGrid } from "@/components/landing/FeatureGrid";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { LandingHero } from "@/components/landing/LandingHero";

// Marketing landing page. Content carried over from legacy-landing/, restyled
// in the app's design system. "Get Started" → /join, "Log in" → /login.
export default function LandingPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-bg-layout">
      <LandingHeader />
      <main className="flex-1">
        <LandingHero />
        <FeatureGrid />
        <HowItWorks />
        <AppDownload />
      </main>
      <LandingFooter />
    </div>
  );
}
