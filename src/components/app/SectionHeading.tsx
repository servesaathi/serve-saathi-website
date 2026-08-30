import Image from "next/image";
import Link from "next/link";

// "Topic Headline" — Figma node 487:1101/487:1102. Section title with an
// optional right-aligned "View All →" link.

type SectionHeadingProps = {
  title: string;
  action?: { label: string; href: string };
  className?: string;
};

export function SectionHeading({ title, action, className = "" }: SectionHeadingProps) {
  return (
    <div className={`flex items-center justify-between gap-6 ${className}`}>
      <h2 className="text-[20px] leading-[28px] font-semibold text-text-primary">{title}</h2>
      {action && (
        <Link
          href={action.href}
          className="flex shrink-0 items-center gap-1 text-[16px] leading-[22px] font-medium text-primary hover:underline"
        >
          {action.label}
          <Image src="/icons/dashboard/chevron-right.svg" alt="" width={24} height={24} aria-hidden />
        </Link>
      )}
    </div>
  );
}

export default SectionHeading;
