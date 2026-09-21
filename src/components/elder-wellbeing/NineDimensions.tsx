import Image from "next/image";

// "02. 9 Dimensions, Score" — Figma node 3421:33564. All nine cards share
// the same icon glyph in Figma itself (per-dimension icons aren't assigned
// yet) — same placeholder-icon pattern already used by the homepage's
// HowItWorks steps.
const DIMENSIONS = [
  { title: "Physical Health & Mobility", body: "Find verified doctors, caregivers, homes and services near your parents — vetted before they ever reach your family." },
  { title: "Cognitive & Memory Health", body: "Early signals in recall, orientation and everyday decision making." },
  { title: "Nutrition & Hydration", body: "Appetite, dietary balance and fluid intake through the week" },
  { title: "Daily Living Activities", body: "Independence in the tasks that make up a self-sufficient day." },
  { title: "Emotional & Mental Wellbeing", body: "Mood, motivation and the quiet loneliness families often miss." },
  { title: "Medication Management & Compliance", body: "Whether prescriptions are taken correctly, on time, everytime." },
  { title: "Financial & Legal Preparedness", body: "Paperwork and funds ready before a crisis forces the question." },
  { title: "Social Engagement & Community", body: "Contact with family, friends and the world outside the house." },
  { title: "Home Safety & Living Environment", body: "The hazards hiding in a home that was designed decades ago." },
];

export function NineDimensions() {
  return (
    <section className="bg-bg-base py-10">
      <div className="mx-auto flex max-w-[1236px] flex-col items-start gap-14 px-8">
        <div className="flex flex-col items-start gap-6">
          <h2 className="font-serif text-[32px] leading-[1.2] text-secondary sm:text-[40px] sm:leading-[48px]">
            The <span className="text-tertiary">Nine dimensions</span>, we score
          </h2>
          <p className="max-w-[720px] text-[18px] leading-7 text-text-secondary">
            Elder wellbeing is not captured by a single number in a lab report. It is the sum of
            how someone moves, thinks, feels, eats, manages their medicines, and lives in their
            home. To assess it, we look at the same factors a care manager considers during a
            home visit.
          </p>
        </div>

        <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {DIMENSIONS.map((d) => (
            <div key={d.title} className="flex flex-col items-start gap-6 rounded-card bg-bg-orange px-6 pb-6">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-t-card rounded-b-full bg-tertiary p-2">
                <Image src="/icons/homepage/ewbs-dimension-icon.svg" alt="" width={30} height={30} aria-hidden />
              </span>
              <div className="flex flex-col gap-1">
                <p className="text-[24px] leading-8 font-semibold text-text-primary">{d.title}</p>
                <p className="text-[18px] leading-7 text-text-secondary">{d.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default NineDimensions;
