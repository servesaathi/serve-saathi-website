import Image from "next/image";

// Serve Saathi primary wordmark. Figma "Primary Logo" (English).
//  - "white": white-on-dark lockup (auth onboarding panel)
//  - "color": full-colour lockup (light headers)

type LogoProps = {
  /** Rendered height in px; width scales to the 299:80 aspect ratio. */
  height?: number;
  tone?: "white" | "color";
  className?: string;
  priority?: boolean;
};

const SRC: Record<NonNullable<LogoProps["tone"]>, string> = {
  white: "/images/logo-white.svg",
  color: "/images/logo-color.svg",
};

export function Logo({ height = 40, tone = "white", className = "", priority = false }: LogoProps) {
  return (
    <Image
      src={SRC[tone]}
      alt="Serve Saathi"
      width={Math.round((299 / 80) * height)}
      height={height}
      className={className}
      priority={priority}
    />
  );
}

export default Logo;
