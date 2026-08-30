import Image from "next/image";
import { Logo } from "@/components/ui/Logo";

// Left-hand hero panel shared across the account-setup flow — Figma
// "Onboarding View" (fileKey dreRLvM7kEty4p5sNhup0I). A dark gradient panel
// with a faint leaf texture, the wordmark, a photo, a headline/body, and a
// 3-dot carousel indicator. Each flow screen shows a different slide; pass
// `activeSlide` to pick which.
//
// On lg+ the panel is exactly viewport-tall (`lg:h-dvh`) and never scrolls —
// the photo flexes to fill whatever height is left after the fixed bits, so
// short laptop viewports don't push the page into a scroll.

type Slide = {
  image: string;
  alt: string;
  titleTop: string;
  titleBottom: string;
  body: string;
};

const SLIDES: Slide[] = [
  {
    image: "/images/hero-photo.png",
    alt: "A Saathi companion sharing a warm moment with a senior",
    titleTop: "Caring Support for",
    titleBottom: "Every Senior, Every Day",
    body: "From companionship to daily assistance, your Saathi is here to make life easier, warmer, and more connected.",
  },
  {
    image: "/images/hero-photo-2.jpg",
    alt: "A Saathi helping a senior use a mobile phone",
    titleTop: "Warm Care,",
    titleBottom: "Smart Technology",
    body: "Verified Saathi help with errands, visits, and conversations while the app keeps everything organized and effortless.",
  },
  {
    image: "/images/hero-photo-3.jpg",
    alt: "A Saathi walking arm-in-arm with a senior using a walker",
    titleTop: "Safety You Can Trust",
    titleBottom: "",
    body: "Every Saathi is trained and background verified, and every visit is tracked giving seniors comfort and families peace of mind.",
  },
];

type OnboardingPanelProps = {
  /** Index into SLIDES; also the highlighted carousel dot. */
  activeSlide?: number;
  /** Carousel dots to render (Figma shows 3 across the flow). */
  totalDots?: number;
};

export function OnboardingPanel({ activeSlide = 0, totalDots = 3 }: OnboardingPanelProps) {
  const slide = SLIDES[Math.min(activeSlide, SLIDES.length - 1)];

  return (
    <div
      className="relative isolate flex w-full shrink-0 flex-col gap-5 overflow-hidden p-6 sm:gap-8 sm:p-10 lg:h-dvh lg:w-[480px]"
      style={{ backgroundImage: "linear-gradient(160deg, #2e7d32 0%, #123214 100%)" }}
    >
      {/* Faint leaf texture across the whole panel, 10% opacity — matches Figma */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden opacity-10">
        <Image
          src="/images/hero-texture.png"
          alt=""
          fill
          sizes="480px"
          className="object-cover"
          priority
        />
      </div>

      <Logo height={40} tone="white" priority className="shrink-0" />

      <div className="relative w-full shrink-0 overflow-hidden rounded-2xl aspect-[4/3] sm:aspect-[3/2] lg:aspect-auto lg:min-h-0 lg:flex-1">
        <Image
          src={slide.image}
          alt={slide.alt}
          fill
          sizes="(min-width: 1024px) 400px, 90vw"
          className="object-cover"
        />
      </div>

      <div className="flex shrink-0 flex-col items-center gap-3 text-center">
        <h2 className="text-[22px] leading-[30px] font-semibold text-white sm:text-[26px] sm:leading-[34px]">
          {slide.titleTop}
          {slide.titleBottom && (
            <>
              <br />
              {slide.titleBottom}
            </>
          )}
        </h2>
        <p className="max-w-[363px] text-[15px] leading-5 text-[#e8e8e8] sm:text-[18px] sm:leading-6">
          {slide.body}
        </p>
      </div>

      {/* Carousel indicator — the flow advances the active dot; it is not an
          interactive carousel, so it's decorative. */}
      <div className="flex shrink-0 items-center justify-center gap-1" aria-hidden="true">
        {Array.from({ length: totalDots }).map((_, i) =>
          i === activeSlide ? (
            <span key={i} className="h-2 w-7 rounded-full bg-tertiary" />
          ) : (
            <span key={i} className="h-2 w-2 rounded-full bg-[#ffc8a5]" />
          )
        )}
      </div>
    </div>
  );
}

export default OnboardingPanel;
