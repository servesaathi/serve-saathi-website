// "About" + "Services" — what ServeSaathi offers. Plain inline glyphs (this
// page isn't in Figma); everything else uses the design-system tokens.

type Feature = { title: string; body: string; icon: "heart" | "hands" | "shield" | "home" };

const FEATURES: Feature[] = [
  {
    title: "Companionship",
    body: "Regular visits and conversation from a Saathi who actually knows your parent — not a rotating stranger.",
    icon: "heart",
  },
  {
    title: "Daily assistance",
    body: "Errands, appointments, medication reminders, and help around the house, arranged in a few taps.",
    icon: "hands",
  },
  {
    title: "Verified Saathis",
    body: "Every companion is background-checked and trained. Every visit is tracked and reported.",
    icon: "shield",
  },
  {
    title: "Family peace of mind",
    body: "Share health notes, visit reports and upcoming events with the whole family from one place.",
    icon: "home",
  },
];

const PATHS: Record<Feature["icon"], string> = {
  heart:
    "M12 21s-6.7-4.3-9.3-8.3C.9 9.8 2.3 6 5.8 6c2 0 3.4 1.1 4.2 2.3C10.8 7.1 12.2 6 14.2 6 17.7 6 19.1 9.8 21.3 12.7 18.7 16.7 12 21 12 21Z",
  hands:
    "M4 12v5a3 3 0 0 0 3 3h7l5-5-1.4-1.4L15 17H9m-5-5 3-3 3 3m-3-3V4",
  shield: "M12 3l7 3v6c0 4.5-3 7.7-7 9-4-1.3-7-4.5-7-9V6l7-3Zm-1 10 4-4-1.4-1.4L11 10.2 9.4 8.6 8 10l3 3Z",
  home: "M4 11 12 4l8 7v8a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1v-8Z",
};

function Glyph({ icon }: { icon: Feature["icon"] }) {
  return (
    <svg viewBox="0 0 24 24" className="size-6" fill="none" aria-hidden>
      <path d={PATHS[icon]} stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  );
}

export function FeatureGrid() {
  return (
    <section id="services" className="scroll-mt-24">
      <div id="about" className="mx-auto w-full max-w-[1180px] scroll-mt-24 px-5 py-16 lg:py-24">
        <div className="max-w-[620px]">
          <h2 className="text-[30px] leading-tight font-semibold text-text-primary sm:text-[36px]">
            Everything your family needs, in one place
          </h2>
          <p className="mt-4 text-[18px] leading-7 text-text-secondary">
            ServeSaathi is a senior-care platform built for older adults and the families
            arranging their care — designed to be calm, legible, and genuinely helpful.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="flex flex-col gap-3 rounded-card border border-border-hairline bg-bg-base p-6"
            >
              <span className="flex size-11 items-center justify-center rounded-control bg-bg-orange text-tertiary">
                <Glyph icon={f.icon} />
              </span>
              <h3 className="text-[18px] font-semibold text-text-primary">{f.title}</h3>
              <p className="text-[15px] leading-6 text-text-secondary">{f.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FeatureGrid;
