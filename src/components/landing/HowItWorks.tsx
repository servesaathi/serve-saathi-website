import { Button } from "@/components/ui/Button";

// "How it works" — mirrors the real onboarding flow (Join → Verify → matched).

const STEPS = [
  {
    n: "1",
    title: "Choose your role",
    body: "Tell us whether you're a senior, a family member, a Saathi, or a partner organisation.",
  },
  {
    n: "2",
    title: "Verify your number",
    body: "A quick one-time code confirms it's really you. No long forms to start.",
  },
  {
    n: "3",
    title: "Meet your Saathi",
    body: "Set up a care profile and we match you with verified companions near you.",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="scroll-mt-24 bg-bg-base">
      <div className="mx-auto w-full max-w-[1180px] px-5 py-16 lg:py-24">
        <h2 className="text-[30px] leading-tight font-semibold text-text-primary sm:text-[36px]">
          Getting started takes minutes
        </h2>

        <ol className="mt-12 grid gap-8 sm:grid-cols-3">
          {STEPS.map((s) => (
            <li key={s.n} className="flex flex-col gap-3">
              <span className="flex size-11 items-center justify-center rounded-full bg-primary text-[18px] font-bold text-white">
                {s.n}
              </span>
              <h3 className="text-[18px] font-semibold text-text-primary">{s.title}</h3>
              <p className="text-[15px] leading-6 text-text-secondary">{s.body}</p>
            </li>
          ))}
        </ol>

        <div className="mt-10">
          <Button href="/join" className="px-6">
            Create your account
          </Button>
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;
