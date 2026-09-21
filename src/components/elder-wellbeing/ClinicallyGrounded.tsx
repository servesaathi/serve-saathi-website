import Image from "next/image";

// "04. Assessment Section" — Figma node 3421:33674. Dark testimonial band
// with a decorative background image (rendered via next/image `fill` since
// it's a full-bleed texture, not content).
const TESTIMONIALS = [
  {
    quote: "“The quick check flagged Amma's fall risk we'd all missed. The saathi arranged a home audit the same week.”",
    name: "Priya Nair",
    role: "Daughter",
    place: "Kochi",
  },
  {
    quote: "“Finally one place that looks at everything,  his memory, his meds, even the loose rugs. It gave us a plan.”",
    name: "Rohan Mehta",
    role: "Son",
    place: "Pune",
  },
];

export function ClinicallyGrounded() {
  return (
    <section className="px-10 py-6">
      <div className="relative overflow-hidden rounded-2xl bg-secondary py-[60px]">
        <Image
          src="/images/elder-wellbeing/testimonial-bg.png"
          alt=""
          fill
          aria-hidden
          className="object-cover"
        />
        <div className="relative mx-auto flex max-w-[1236px] flex-col items-start gap-12 px-8 lg:flex-row lg:items-center lg:justify-center">
          <div className="flex w-full max-w-[502px] flex-col items-start gap-6">
            <h2 className="font-serif text-[32px] leading-[1.2] text-white sm:text-[40px] sm:leading-[48px]">
              How Clinically grounded, <span className="text-tertiary">not a quiz?</span>
            </h2>
            <p className="max-w-[464px] text-[18px] leading-7 text-[#e8e8e8]">
              Every assessment comes with a dedicated ServeSaathi, a trained care coordinator who
              explains your results and helps you act on them.
            </p>
            <div className="flex items-start gap-8 pt-2">
              <div className="flex flex-col items-center gap-1">
                <p className="font-serif text-[54px] leading-[60px] text-[#82b184]">1200+</p>
                <p className="text-[18px] leading-7 text-white">Families assessed</p>
              </div>
              <div className="flex flex-col items-center gap-1">
                <p className="font-serif text-[54px] leading-[60px] text-[#82b184]">4.5</p>
                <p className="text-[18px] leading-7 text-white">Out of 5 family rate</p>
              </div>
            </div>
          </div>

          <div className="flex w-full max-w-[376px] flex-col gap-12">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="relative flex flex-col gap-4 rounded-card bg-bg-base px-8 py-6">
                <Image
                  src="/icons/homepage/ewbs-quote-mark.svg"
                  alt=""
                  width={48}
                  height={48}
                  aria-hidden
                  className="absolute -top-6 -left-6"
                />
                <p className="font-serif text-[18px] leading-6 text-text-secondary italic">{t.quote}</p>
                <div className="flex flex-col gap-1 text-[16px] leading-[18px]">
                  <p className="font-semibold text-text-primary">{t.name}</p>
                  <p className="text-text-tertiary">
                    {t.role} <span className="text-primary">&middot;</span> {t.place}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default ClinicallyGrounded;
