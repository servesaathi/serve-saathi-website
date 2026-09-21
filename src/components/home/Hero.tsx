import Image from "next/image";
import { Button } from "@/components/ui/Button";

// "01.Hero Section" — Figma node 3395:29067.
export function Hero() {
  return (
    <section className="bg-bg-layout px-10 py-10">
      <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[500px_1fr]">
        <div className="flex max-w-[530px] flex-col items-start gap-6 pt-6">
          <h1 className="font-serif text-[36px] leading-[1.15] text-secondary sm:text-[44px] lg:text-[54px] lg:leading-[60px]">
            Care coordination for families who can&rsquo;t always be there
          </h1>
          <p className="max-w-[420px] text-[18px] leading-7 text-text-secondary">
            Serve Saathi helps you discover trusted providers, understand your parent&rsquo;s
            wellbeing, and stay connected to their care — wherever you are.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Button href="/services" rightIcon={<Image src="/icons/homepage/arrow-right.svg" alt="" width={24} height={24} />}>
              Explore Service
            </Button>
            <Button href="/elder-wellbeing-score" variant="secondary">
              Take Elder Wellbeing Score
            </Button>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[524px]">
          <div className="relative aspect-[524/555] w-full overflow-hidden rounded-[24px]">
            <Image
              src="/images/homepage/hero-photo.png"
              alt="A daughter sharing a warm moment with her father at home"
              fill
              priority
              sizes="(min-width: 1024px) 524px, 90vw"
              className="object-cover"
            />
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, rgba(38,38,38,0) 56.6%, rgba(46,125,50,0.5) 100%)",
              }}
            />
          </div>

          <div className="absolute top-[45px] right-6 flex h-8 items-center gap-2 rounded-full bg-bg-base px-4 py-2 shadow-[0_12px_15px_rgba(24,63,59,0.1)] sm:right-[46px]">
            <span className="size-2 shrink-0 rounded-full bg-tertiary" aria-hidden />
            <p className="text-[16px] leading-5 whitespace-nowrap text-tertiary">Guided by people who care</p>
          </div>

          <div className="absolute bottom-6 left-1/2 w-[216px] -translate-x-1/2 rounded-card bg-bg-base p-4 shadow-[0_18px_20px_rgba(24,63,59,0.13)] sm:bottom-10 sm:left-auto sm:right-[-16px] sm:translate-x-0">
            <div className="flex size-9 items-center justify-center rounded-full bg-border-hairline">
              <Image src="/icons/homepage/check-circle.svg" alt="" width={20} height={20} aria-hidden />
            </div>
            <p className="pt-3 text-[18px] leading-7 font-semibold text-tertiary">Your care map</p>
            <p className="text-[18px] leading-7 text-text-secondary">A little more ready, every day.</p>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-orange-line">
              <div className="h-full w-[55%] rounded-full bg-tertiary" />
            </div>
            <p className="mt-1 text-[14px] leading-5 text-[#58975b]">68% of your plan complete</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
