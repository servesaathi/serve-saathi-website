import Image from "next/image";
import { Button } from "@/components/ui/Button";

// Hero — headline carried over from the legacy landing ("Care for those who
// cared for us."), restyled in the app's design system, with the real auth
// CTAs and the warm onboarding photograph.
export function LandingHero() {
  return (
    <section
      id="top"
      className="relative overflow-hidden"
      style={{
        backgroundImage:
          "radial-gradient(circle at 10% 15%, rgba(255,117,31,0.10), transparent 34%), radial-gradient(circle at 92% 80%, rgba(46,125,50,0.10), transparent 34%)",
      }}
    >
      <div className="mx-auto grid w-full max-w-[1180px] items-center gap-12 px-5 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
        <div className="flex flex-col items-start gap-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-border-card bg-bg-base/70 px-4 py-1.5 text-[12px] font-bold tracking-[1.5px] text-primary">
            <span className="size-2 rounded-full bg-tertiary" />
            NOW WELCOMING EARLY MEMBERS
          </span>

          <h1 className="text-[40px] leading-[1.08] font-semibold tracking-tight text-primary sm:text-[56px] lg:text-[64px]">
            Care for those who <span className="text-tertiary">cared</span> for us.
          </h1>

          <p className="max-w-[520px] text-[18px] leading-7 text-text-secondary">
            ServeSaathi connects seniors and their families with trusted, verified
            companions — from daily assistance to genuine companionship, so life stays
            easier, warmer, and more connected.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button href="/join" className="px-6">
              Get Started
            </Button>
            <Button href="/login" variant="light" className="px-6">
              Log in
            </Button>
          </div>
        </div>

        <div className="relative mx-auto aspect-[4/3] w-full max-w-[520px] overflow-hidden rounded-3xl shadow-[0_8px_30px_rgba(11,59,44,0.12)]">
          <Image
            src="/images/hero-photo.png"
            alt="A Saathi companion sharing a warm moment with a senior"
            fill
            priority
            sizes="(min-width: 1024px) 520px, 90vw"
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}

export default LandingHero;
