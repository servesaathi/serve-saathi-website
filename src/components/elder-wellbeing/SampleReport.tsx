import Image from "next/image";

// "03. Sample Report" — Figma node 3421:33583. The right panel's score-band
// legend is static (matches the "0-49 / Significant support needed" pairing
// shown in Figma) rather than an interactive picker — no per-band copy for
// the other two bands was in the design pull to make this a real toggle.
const SCORE_SEGMENTS = [
  { score: 68, label: "Mobility", tone: "bg-orange-line text-[#cc5e19]" },
  { score: 74, label: "Memory", tone: "bg-orange-line text-[#cc5e19]" },
  { score: 45, label: "Mood", tone: "bg-[#fee2e2] text-error" },
];

const SCORE_BANDS = [
  { range: "80-100", active: false },
  { range: "50-79", active: false },
  { range: "0-49", active: true },
];

export function SampleReport() {
  return (
    <section id="sample-report" className="scroll-mt-24 bg-bg-layout py-10">
      <div className="mx-auto flex max-w-[1236px] flex-col items-center gap-12 px-8 lg:flex-row lg:items-center">
        <div className="flex w-full max-w-[420px] flex-col items-center gap-6 rounded-card bg-bg-base px-6 py-9">
          <div className="flex flex-col items-center">
            <Image src="/icons/homepage/ewbs-radial-chart.svg" alt="" width={164} height={164} />
            <div className="flex flex-col items-center gap-2 pt-2">
              <p className="text-[24px] leading-8 font-semibold text-tertiary">68 out of 100</p>
              <span className="rounded-full bg-orange-line px-6 py-1 text-[14px] leading-5 text-[#994613]">
                Moderate support
              </span>
            </div>
          </div>

          <div className="flex flex-col items-center gap-2 text-center">
            <p className="max-w-[420px] text-[18px] leading-7 text-text-secondary">
              A score of <span className="font-bold text-text-primary">72</span> suggests moderate
              support needed mainly around <span className="font-bold text-text-primary">mobility</span> and{" "}
              <span className="font-bold text-text-primary">home safety</span>.
            </p>
            <div className="flex items-stretch gap-4 py-2">
              {SCORE_SEGMENTS.map((s) => (
                <div key={s.label} className={`flex w-20 flex-col items-center justify-center gap-1 rounded-[4px] p-2 ${s.tone}`}>
                  <p className="text-[24px] leading-8 font-semibold">{s.score}</p>
                  <p className="text-[16px] leading-5">{s.label}</p>
                </div>
              ))}
            </div>
            <p className="text-[16px] leading-5 text-text-tertiary italic">Last checked 3 days ago</p>
          </div>
        </div>

        <div className="flex w-full flex-1 flex-col items-start gap-6">
          <h2 className="font-serif text-[32px] leading-[1.2] text-secondary sm:text-[40px] sm:leading-[48px]">
            <span className="text-tertiary">One score.</span> Clear action.
          </h2>
          <p className="text-[18px] leading-7 text-text-secondary">
            The composite score is a weighted average of all nine dimension scores, with extra
            weight on anything in critical range - a serious fall risk pulls the whole number
            down, because it should. Pick a band to see what it means.
          </p>

          <div className="flex w-full flex-col items-stretch gap-8 rounded-card bg-secondary p-6 sm:flex-row">
            <div className="flex shrink-0 flex-row gap-4 sm:flex-col">
              {SCORE_BANDS.map((b) => (
                <span
                  key={b.range}
                  className={`flex w-[114px] items-center justify-center rounded-[4px] p-2 text-[24px] leading-8 font-semibold ${
                    b.active ? "bg-tertiary text-bg-orange" : "bg-border-hairline text-primary"
                  }`}
                >
                  {b.range}
                </span>
              ))}
            </div>
            <div className="flex flex-1 flex-col gap-2 rounded-[4px] bg-bg-base p-6">
              <p className="text-[24px] leading-8 font-semibold text-text-primary">Significant support needed</p>
              <p className="text-[18px] leading-7 text-text-secondary">
                Urgent gaps. ServeSaathi coordinator calls within 24 hours to help you triage and
                arrange care.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default SampleReport;
