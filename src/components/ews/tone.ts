import type { DimBand } from "@/lib/ews/questionnaire";

// Band → colour treatment, from the Figma overview rows (3344:332988): green
// tile/number for good areas, orange for "Need attention", red for
// "Critical". Spec F's words replace Figma's chip labels (Going well / Worth a
// closer look / Needs attention), and every chip carries the band's symbol so
// colour is never the only signal. Chip text on the orange tint uses
// vivid-orange/700 (#994613, the colour Figma's own tag chips use) rather than
// #FF751F, which is too faint on #FFF5EF for 18px text.

export type Tone = {
  tile: string;
  number: string;
  chip: string;
  icon: string;
  /** Desaturate the icon for not-applicable / not-enough-info rows. */
  muted?: boolean;
};

const NEUTRAL: Tone = {
  tile: "bg-bg-layout",
  number: "text-text-muted",
  chip: "bg-bg-layout text-text-tertiary",
  icon: "/icons/ews/dim-green.svg",
  muted: true,
};

export const DIM_TONE: Record<DimBand, Tone> = {
  going_well: {
    tile: "bg-border-hairline",
    number: "text-primary",
    chip: "bg-border-hairline text-primary",
    icon: "/icons/ews/dim-green.svg",
  },
  closer_look: {
    tile: "bg-bg-orange",
    number: "text-tertiary",
    chip: "bg-bg-orange text-[#994613]",
    icon: "/icons/ews/dim-orange.svg",
  },
  needs_attention: {
    tile: "bg-error-light/75",
    number: "text-error",
    chip: "bg-error-light text-error",
    icon: "/icons/ews/dim-red.svg",
  },
  not_applicable: NEUTRAL,
  insufficient: NEUTRAL,
};
