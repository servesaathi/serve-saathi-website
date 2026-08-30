import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

// "Icon Card" (half-pill variant) — Figma node 2037:480. A rounded-bottom
// colour block holding a 46px icon, with a caption below on a white card.
// Used in the dashboard's "What do you need help with?" / "Help & Support" grids.

type IconCardProps = {
  label: ReactNode;
  /** Icon asset path, rendered at 46px. */
  icon?: string;
  tone?: "orange" | "danger";
  href?: string;
  onClick?: () => void;
};

const TONE: Record<NonNullable<IconCardProps["tone"]>, string> = {
  orange: "bg-[#ffe3d2]", // vivid-orange/100
  danger: "bg-error",
};

export function IconCard({ label, icon, tone = "orange", href, onClick }: IconCardProps) {
  const inner = (
    <>
      <span
        className={`flex h-[72px] w-full items-center justify-center rounded-t-card rounded-b-full ${TONE[tone]}`}
      >
        {icon && <Image src={icon} alt="" width={46} height={46} aria-hidden />}
      </span>
      <span className="px-1 pb-2 text-center text-[14px] leading-[20px] text-text-secondary">
        {label}
      </span>
    </>
  );

  const className =
    "flex flex-col items-center gap-1 overflow-hidden rounded-card bg-bg-base transition-shadow hover:shadow-[0_1px_2px_rgba(30,27,24,0.08)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

  if (href) {
    return (
      <Link href={href} className={className}>
        {inner}
      </Link>
    );
  }
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={className}>
        {inner}
      </button>
    );
  }
  return <div className={className}>{inner}</div>;
}

export default IconCard;
