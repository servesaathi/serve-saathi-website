import Image from "next/image";
import { Button } from "@/components/ui/Button";

// "10. Care Plan" (closing CTA) — Figma node 3395:29495.
export function ClosingCta() {
  return (
    <section className="bg-bg-layout py-6">
      <div className="mx-auto flex max-w-[1236px] flex-col items-center gap-4 px-8 text-center">
        <h2 className="max-w-[800px] font-serif text-[32px] leading-[1.2] text-text-primary sm:text-[40px] sm:leading-[48px]">
          You don&rsquo;t have to figure out what&rsquo;s next <span className="text-tertiary">alone.</span>
        </h2>
        <p className="text-[18px] leading-7 text-text-secondary">
          Start wherever you are. We&rsquo;ll help you find the next right step and stay with you as
          the story changes.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-10 pt-4">
          <Button href="/join" rightIcon={<Image src="/icons/homepage/arrow-right.svg" alt="" width={24} height={24} />}>
            Find my next step
          </Button>
          <Button href="/contact" variant="secondary">
            Talk to someone
          </Button>
        </div>
      </div>
    </section>
  );
}

export default ClosingCta;
