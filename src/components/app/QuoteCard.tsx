import Image from "next/image";
import Link from "next/link";
import { PATTERN_BG } from "./PromoBanner";

// "Card View + Button" (quote variant) — Figma node 2318:1010. Same flat-green
// panel + circle pattern as PromoBanner, plus the "Quote of the day" copy and
// a white pill button. Caps at the Figma width (920px).

type QuoteCardProps = {
  label?: string;
  quote: string;
  action: { label: string; href: string };
};

export function QuoteCard({ label = "Quote of the day", quote, action }: QuoteCardProps) {
  return (
    <div
      className="relative flex w-full max-w-[920px] flex-col gap-4 overflow-hidden rounded-card px-5 py-5 text-white sm:px-6"
      style={PATTERN_BG}
    >
      <div className="flex flex-col gap-2">
        <p className="text-[16px] leading-tight">{label}</p>
        <p className="text-[16px] leading-6 sm:text-[18px]">{quote}</p>
      </div>
      <Link
        href={action.href}
        className="flex h-12 items-center justify-between rounded-control border-[1.35px] border-border-card bg-bg-base px-4 text-[15px] leading-[22px] font-medium text-text-secondary transition-colors hover:bg-bg-layout sm:text-[16px]"
      >
        {action.label}
        <Image src="/icons/dashboard/arrow-right.svg" alt="" width={24} height={24} aria-hidden />
      </Link>
    </div>
  );
}

export default QuoteCard;
