import Image from "next/image";
import { Button } from "@/components/ui/Button";

// "05. Care Plan" (closing CTA) — Figma node 3421:33714.
export function ClosingCta() {
  return (
    <section className="bg-bg-layout py-6">
      <div className="mx-auto flex max-w-[1236px] flex-col items-center gap-4 px-8 text-center">
        <h2 className="max-w-[800px] font-serif text-[32px] leading-[1.2] text-text-primary sm:text-[40px] sm:leading-[48px]">
          <span className="text-tertiary">Peace of mind</span> starts with knowing where things
          stand.
        </h2>
        <p className="text-[18px] leading-7 text-text-secondary">
          Take the free assessment today and get a scored report plus a personalize care plan,
          free.
        </p>
        {/* Same not-yet-built assessment flow as Hero.tsx's buttons. */}
        <div className="flex flex-wrap items-center justify-center gap-10 pt-4">
          <Button type="button" rightIcon={<Image src="/icons/homepage/arrow-right.svg" alt="" width={24} height={24} />}>
            Start full assessment
          </Button>
          <Button type="button" variant="secondary">
            Take 2-min quick check
          </Button>
        </div>
      </div>
    </section>
  );
}

export default ClosingCta;
