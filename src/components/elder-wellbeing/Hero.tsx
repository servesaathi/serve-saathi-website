import Image from "next/image";
import { StartCheckInButtons } from "@/components/ews/StartCheckInButtons";

// "01. Hero Section" — Figma node 3421:33517.
export function Hero() {
  return (
    <section className="bg-bg-layout px-10 py-10">
      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[500px_1fr]">
        <div className="flex max-w-[530px] flex-col items-start gap-6 pt-6">
          <h1 className="font-serif text-[36px] leading-[1.15] text-secondary sm:text-[44px] lg:text-[54px] lg:leading-[60px]">
            Care feels <span className="text-tertiary">lighter</span> when the next step is clear.
          </h1>
          <p className="max-w-[420px] text-[18px] leading-7 text-text-secondary">
            A simple, structured way to understand how your family member is really doing across
            daily living, health, social connection, and more. Takes a few minutes, and gives you
            a clear starting point for what kind of support might help.
          </p>
          <StartCheckInButtons />
          <div className="flex flex-wrap items-center gap-1 pt-2 text-[18px] leading-7 text-primary italic">
            <span>No cost, no obligation</span>
            <span className="text-tertiary not-italic">&bull;</span>
            <span>Results in minutes</span>
            <span className="text-tertiary not-italic">&bull;</span>
            <span>Private &amp; secure</span>
          </div>
        </div>

        <div className="relative">
          <div className="relative aspect-[524/555] w-full overflow-hidden rounded-[16px]">
            <Image
              src="/images/elder-wellbeing/hero.jpg"
              alt="A daughter reviewing a wellbeing report with her mother"
              fill
              sizes="(min-width: 1024px) 524px, 90vw"
              className="object-cover"
              priority
            />
            <span className="absolute top-6 right-6 flex h-8 items-center gap-2 rounded-full bg-tertiary px-4 text-[16px] text-white shadow-[0_12px_15px_rgba(24,63,59,0.1)]">
              <span className="size-2 rounded-full bg-white" />
              A calmer care conversation
            </span>
          </div>

          <div className="absolute inset-x-6 -bottom-10 flex divide-x divide-border-hairline rounded-card bg-bg-base text-center shadow-[0_4px_4px_rgba(0,0,0,0.08)] sm:inset-x-10">
            <div className="flex flex-1 flex-col items-center gap-1 px-2 py-2.5">
              <p className="font-serif text-[40px] leading-[48px] text-tertiary">4.6</p>
              <p className="text-[14px] leading-5 text-text-secondary">Dimensions score</p>
            </div>
            <div className="flex flex-1 flex-col items-center gap-1 px-2 py-2.5">
              <p className="font-serif text-[40px] leading-[48px] text-tertiary">48 hrs</p>
              <p className="text-[14px] leading-5 text-text-secondary">To a care plan</p>
            </div>
            <div className="flex flex-1 flex-col items-center gap-1 px-2 py-2.5">
              <p className="font-serif text-[40px] leading-[48px] text-tertiary">11.4k</p>
              <p className="text-[14px] leading-5 text-text-secondary">Families assessed</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
