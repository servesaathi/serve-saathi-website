"use client";

import Image from "next/image";
import { useEffect, useId, useRef, type ReactNode } from "react";

// Pop-up shell for the EWS flow — Figma "01_2min Quick Check - Pop Up"
// (3343:184030) and "Full Welbeing Score - Pop up" (3344:322339): pale-green
// card, 16px radius, a Source Serif title with the filled green close circle.
// Differs from ui/Modal in the title treatment (serif 24 vs sans 22 semibold)
// and in supporting `dismissible={false}` — a Tier 1 safety card must be
// acknowledged, so Esc and backdrop clicks are ignored while it's open.

type EwsDialogProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  /** Centered, larger serif title — the score reveal pop-up. */
  titleSize?: "md" | "lg";
  /** Hide the close button and ignore Esc / backdrop clicks. */
  dismissible?: boolean;
  /** Accessible name when there's no visible title. */
  ariaLabel?: string;
  size?: "sm" | "md";
  children: ReactNode;
};

const WIDTH = { sm: "max-w-[480px]", md: "max-w-[640px]" };

export function EwsDialog({
  open,
  onClose,
  title,
  titleSize = "md",
  dismissible = true,
  ariaLabel,
  size = "md",
  children,
}: EwsDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={title ? titleId : undefined}
      aria-label={title ? undefined : ariaLabel}
      onCancel={(e) => {
        e.preventDefault();
        if (dismissible) onClose();
      }}
      onClick={(e) => {
        if (dismissible && e.target === e.currentTarget) onClose();
      }}
      className={`m-auto w-[calc(100%-32px)] ${WIDTH[size]} rounded-[16px] bg-transparent p-0 backdrop:bg-black/40`}
    >
      {open && (
        <div className="flex max-h-[calc(100dvh-32px)] flex-col gap-6 overflow-y-auto rounded-[16px] bg-bg-layout px-6 py-8 shadow-[0_8px_24px_rgba(30,27,24,0.16)] sm:px-[54px] sm:py-10">
          {(title || dismissible) && (
            <div className={`flex items-center gap-4 ${titleSize === "lg" ? "justify-center" : ""}`}>
              {title && (
                <h2
                  id={titleId}
                  className={
                    titleSize === "lg"
                      ? "flex-1 text-center font-serif text-[32px] leading-10 text-text-primary sm:text-[40px] sm:leading-[48px]"
                      : "flex-1 font-serif text-[24px] leading-8 text-text-primary"
                  }
                >
                  {title}
                </h2>
              )}
              {dismissible && (
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close"
                  className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary transition-colors hover:bg-primary-pressed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  <Image src="/icons/ews/close-white.svg" alt="" width={24} height={24} />
                </button>
              )}
            </div>
          )}
          {children}
        </div>
      )}
    </dialog>
  );
}

export default EwsDialog;
