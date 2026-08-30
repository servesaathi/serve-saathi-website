import Image from "next/image";
import Link from "next/link";

// "Organization Card Views" — Figma node 2319:1207 / 2018:9385. A list-row
// card: a round accent icon + title/subtitle/meta, plus either a status chip
// ("status" variant, accent left-border) or a coloured category bar along the
// bottom ("category" variant).

type Accent = "secondary" | "primary" | "forest";

const ACCENT_BG: Record<Accent, string> = {
  secondary: "bg-secondary", // #123214
  primary: "bg-primary", // #2e7d32
  forest: "bg-primary-pressed", // #256428
};
const ACCENT_BORDER: Record<Accent, string> = {
  secondary: "border-secondary",
  primary: "border-primary",
  forest: "border-primary-pressed",
};

type OrganizationCardProps = {
  variant?: "status" | "category";
  accent?: Accent;
  icon?: string;
  title: string;
  subtitle?: string;
  /** e.g. "23 April · 9:00 AM" or "9:00 AM". */
  meta?: string;
  /** Orange status pill, "status" variant only. */
  chip?: string;
  /** Bottom bar text, "category" variant only. */
  categoryLabel?: string;
  href?: string;
};

export function OrganizationCard({
  variant = "status",
  accent = "primary",
  icon,
  title,
  subtitle,
  meta,
  chip,
  categoryLabel,
  href,
}: OrganizationCardProps) {
  const isCategory = variant === "category";

  const body = (
    <div className="flex w-full flex-col">
      <div
        className={`flex gap-3 bg-bg-base px-4 py-2.5 ${
          isCategory ? "rounded-t-card" : `rounded-card border-l-4 ${ACCENT_BORDER[accent]}`
        }`}
      >
        <span
          className={`flex size-10 shrink-0 items-center justify-center rounded-full ${ACCENT_BG[accent]}`}
        >
          {icon && <Image src={icon} alt="" width={28} height={28} aria-hidden />}
        </span>

        <div className="flex min-w-0 flex-1 items-start gap-3">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <p className="truncate text-[16px] leading-[22px] text-text-secondary">{title}</p>
            {subtitle && (
              <p className="truncate text-[16px] leading-[22px] text-text-tertiary">{subtitle}</p>
            )}
            {meta && (
              <p className="text-[16px] leading-[22px] text-text-tertiary">{meta}</p>
            )}
          </div>
          {chip && (
            <span className="shrink-0 rounded-full bg-[#ffe3d2] px-4 py-0.5 text-[13px] leading-[17px] text-[#994613]">
              {chip}
            </span>
          )}
        </div>
      </div>

      {isCategory && categoryLabel && (
        <div
          className={`flex items-center justify-center rounded-b-card px-4 py-1 text-[14px] leading-[20px] text-white ${ACCENT_BG[accent]}`}
        >
          {categoryLabel}
        </div>
      )}
    </div>
  );

  return href ? (
    <Link href={href} className="block w-full">
      {body}
    </Link>
  ) : (
    body
  );
}

export default OrganizationCard;
