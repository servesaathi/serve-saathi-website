import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

// Standard Buttons — Figma "Serve Saathi" design system (see docs/buttons.md).
// Every hierarchy is a 48px-tall control, 6px radius, label = Label style
// (16px / 22px). Design specifies weight 500, but the app only ships Atkinson
// Hyperletgible Next at 400/600/700 — the mobile team's resolution is to fall
// back to 600, mirrored here.
//
// Icon slots: both `leftIcon` and `rightIcon` are 24×24 boxes with an 8px gap
// to the label, matching the arrow-icon slots in the Figma spec.

export type ButtonVariant =
  | "primary" // filled brand green — the default CTA
  | "secondary" // filled deep green
  | "tertiary" // filled brand orange — "Notify Me"-style accent CTA
  | "light" // white fill, hairline border — social / alternate sign-in
  | "hyperlink" // text only, brand green, no underline
  | "destructive"; // filled red — irreversible actions

type ButtonBaseProps = {
  variant?: ButtonVariant;
  fullWidth?: boolean;
  /** Shows a spinner and blocks interaction; also sets `disabled`. */
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  children: ReactNode;
};

type ButtonAsButton = ButtonBaseProps &
  Omit<ComponentPropsWithoutRef<"button">, keyof ButtonBaseProps> & { href?: undefined };

type ButtonAsLink = ButtonBaseProps &
  Omit<ComponentPropsWithoutRef<typeof Link>, keyof ButtonBaseProps> & { href: string };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

const BASE =
  "inline-flex h-12 items-center justify-center gap-2 rounded-control px-4 text-[16px] leading-[22px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:pointer-events-none";

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-white hover:bg-primary-pressed active:bg-primary-pressed disabled:bg-primary-disabled",
  secondary:
    "bg-secondary text-white hover:bg-[#0d250f] active:bg-[#0d250f] disabled:bg-primary-disabled",
  tertiary:
    "bg-tertiary text-white hover:bg-[#e5661a] active:bg-[#e5661a] disabled:bg-[#f6c4a6]",
  light:
    "border border-border-hairline bg-bg-base text-text-primary hover:bg-bg-layout active:bg-bg-layout disabled:text-text-muted",
  hyperlink:
    "h-auto px-0 text-primary hover:underline active:text-primary-pressed disabled:text-text-muted",
  destructive:
    "bg-error text-white hover:bg-[#991b1b] active:bg-[#991b1b] disabled:bg-[#f6b9b9]",
};

function Spinner() {
  return (
    <span
      aria-hidden
      className="size-4 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent"
    />
  );
}

function Content({
  leftIcon,
  rightIcon,
  loading,
  children,
}: Pick<ButtonBaseProps, "leftIcon" | "rightIcon" | "loading" | "children">) {
  return (
    <>
      {loading ? (
        <Spinner />
      ) : (
        leftIcon != null && (
          <span aria-hidden className="flex size-6 shrink-0 items-center justify-center">
            {leftIcon}
          </span>
        )
      )}
      {children}
      {rightIcon != null && (
        <span aria-hidden className="flex size-6 shrink-0 items-center justify-center">
          {rightIcon}
        </span>
      )}
    </>
  );
}

export function Button(props: ButtonProps) {
  const {
    variant = "primary",
    fullWidth = false,
    loading = false,
    leftIcon,
    rightIcon,
    children,
    className = "",
    href,
    ...rest
  } = props;

  const classes = `${BASE} ${VARIANTS[variant]} ${fullWidth ? "w-full" : ""} ${className}`.trim();

  if (typeof href === "string") {
    return (
      <Link href={href} className={classes} {...(rest as Omit<ButtonAsLink, keyof ButtonBaseProps | "href">)}>
        <Content leftIcon={leftIcon} rightIcon={rightIcon} loading={loading}>
          {children}
        </Content>
      </Link>
    );
  }

  const { disabled, ...buttonRest } = rest as ButtonAsButton;
  return (
    <button className={classes} disabled={disabled || loading} aria-busy={loading || undefined} {...buttonRest}>
      <Content leftIcon={leftIcon} rightIcon={rightIcon} loading={loading}>
        {children}
      </Content>
    </button>
  );
}

export default Button;
