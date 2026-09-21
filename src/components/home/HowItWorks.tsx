import Image from "next/image";

// "02. How it work Section" — Figma node 3395:29102.
const STEPS = [
  { n: "01", title: "Discover", body: "Find verified doctors and service near your parent vetted before they ever reach your family." },
  { n: "02", title: "Assess", body: "Elder Wellbeing Score" },
  { n: "03", title: "Plan", body: "Turn that understanding into personalized care plan you can actually act on." },
  { n: "04", title: "Coordinate", body: "Bring every provider, sibling and appointment into one shared view." },
  { n: "05", title: "Monitor", body: "Watch wellbeing over time, and catch small changes before they become emergencies." },
  { n: "06", title: "Thrive", body: "Community & Continuity" },
];

export function HowItWorks() {
  return (
    <section className="rounded-2xl bg-bg-base pt-6 pb-10">
      <div className="mx-auto flex max-w-[1236px] flex-col gap-10 px-8">
        <div>
          <h2 className="pt-4 font-serif text-[32px] leading-[1.2] text-secondary sm:text-[40px] sm:leading-[48px]">
            How Serve Saathi Helps
          </h2>
          <p className="mt-2 max-w-[720px] text-[18px] leading-7 text-text-secondary">
            The Same journey every family goes through with us.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {STEPS.map((step) => (
            <div key={step.n} className="flex flex-col gap-10 rounded-card bg-bg-orange p-6">
              <div className="flex w-full items-start justify-between">
                <p className="text-[54px] leading-[56px] font-medium text-[#ffc8a5]">{step.n}</p>
                <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-tertiary">
                  <Image src="/icons/homepage/step-calendar.svg" alt="" width={32} height={32} aria-hidden />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-[24px] leading-8 font-semibold text-text-primary">{step.title}</h3>
                <p className="text-[18px] leading-7 text-text-secondary">{step.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;
