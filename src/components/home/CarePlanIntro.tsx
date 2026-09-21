import Image from "next/image";
import { Button } from "@/components/ui/Button";

// "03. Care Plan" — Figma node 3395:29117.
const BENEFITS = [
  { title: "A shared place for the family", body: "Keep appointments and decisions in one gentle rhythm." },
  { title: "Advice you can use today", body: "Clear answers from care guides, not a wall of jargon." },
  { title: "Confidence for what comes next", body: "Your plan grows with your parent and with you." },
];

export function CarePlanIntro() {
  return (
    <section className="bg-bg-layout py-10">
      <div className="mx-auto flex max-w-[1236px] flex-col items-start gap-12 px-4 lg:flex-row">
        <div className="relative w-full lg:flex-1">
          <div className="relative aspect-[504/558] w-full overflow-hidden rounded-[24px] bg-[#d8d8c9]">
            <Image
              src="/images/homepage/care-plan-couple.png"
              alt="An older Indian couple walking together in a garden"
              fill
              sizes="(min-width: 1024px) 504px, 90vw"
              className="object-cover"
            />
          </div>
          <div className="relative mx-6 -mt-16 w-[calc(100%-3rem)] max-w-[228px] rounded-card bg-bg-base px-8 py-6 shadow-lg sm:absolute sm:right-6 sm:bottom-6 sm:mx-0 sm:mt-0">
            <Image
              src="/icons/homepage/quote-mark.svg"
              alt=""
              width={48}
              height={48}
              aria-hidden
              className="absolute -top-6 -left-6 hidden sm:block"
            />
            <p className="font-serif text-[18px] leading-6 text-text-primary italic">
              &ldquo;It helped us have the conversation we had been putting off.&rdquo;
            </p>
            <p className="mt-4 text-[16px] leading-5 text-text-secondary/60">— Meera, Pune</p>
          </div>
        </div>

        <div className="flex w-full flex-col items-start gap-6 pt-4 lg:flex-1">
          <h2 className="font-serif text-[32px] leading-[1.2] text-text-primary sm:text-[40px] sm:leading-[48px]">
            A plan that meets your family <span className="text-tertiary">where you are.</span>
          </h2>
          <p className="text-[18px] leading-7 text-text-secondary">
            Whether you live next door or in another time zone, good care starts with seeing the
            whole picture health, home, money, preferences, and the people who matter.
          </p>

          <div className="flex w-full flex-col gap-4">
            {BENEFITS.map((b) => (
              <div key={b.title} className="flex items-start gap-4">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-border-hairline">
                  <Image src="/icons/homepage/benefit-bullet.svg" alt="" width={24} height={24} aria-hidden />
                </span>
                <div>
                  <p className="text-[18px] leading-7 font-semibold text-text-secondary">{b.title}</p>
                  <p className="text-[18px] leading-7 text-text-muted">{b.body}</p>
                </div>
              </div>
            ))}
          </div>

          <Button
            href="/create-account"
            className="mt-2"
            rightIcon={<Image src="/icons/homepage/arrow-right.svg" alt="" width={24} height={24} />}
          >
            Build your care plan
          </Button>
        </div>
      </div>
    </section>
  );
}

export default CarePlanIntro;
