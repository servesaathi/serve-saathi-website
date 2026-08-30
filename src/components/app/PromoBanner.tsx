// "Card View + Button" (text-only variant) — Figma node 2320:812 / 2015:18381.
// A flat brand-green banner (#2E7D32) with the decorative circle-cluster
// pattern anchored bottom-right (banner-pattern.svg, opacity baked in), an
// eyebrow, a large heading and a supporting line. Caps at the Figma width
// (920px) and stays ~145px tall on desktop, growing only if text wraps on
// narrow screens.

const PATTERN_BG = {
  backgroundColor: "#2e7d32",
  backgroundImage: "url(/images/banner-pattern.svg)",
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right center",
  backgroundSize: "auto 100%",
} as const;

type PromoBannerProps = {
  eyebrow: string;
  heading: string;
  subtext: string;
};

export function PromoBanner({ eyebrow, heading, subtext }: PromoBannerProps) {
  return (
    <div
      className="relative flex w-full max-w-[920px] flex-col justify-center gap-1.5 overflow-hidden rounded-card px-5 py-5 text-white sm:min-h-[145px] sm:px-6"
      style={PATTERN_BG}
    >
      <p className="text-[13px] leading-tight sm:text-[16px]">{eyebrow}</p>
      <p className="text-[22px] leading-[1.15] font-semibold sm:text-[26px] lg:text-[30px]">
        {heading}
      </p>
      <p className="text-[15px] leading-snug text-white/90 sm:text-[18px]">{subtext}</p>
    </div>
  );
}

export { PATTERN_BG };
export default PromoBanner;
