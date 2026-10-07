"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";

// Centered dialog on the native <dialog> element, so focus trapping, Esc to
// close and the inert backdrop come from the browser. Styling follows the
// Figma "Pop up - Emergency Contacts" frame (3354:397952): pale-green card,
// white fields on top, and a filled primary close circle with the
// design-system "Close" glyph in white.

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: ReactNode;
  children: ReactNode;
  /** Footer actions, right-aligned on desktop. */
  actions?: ReactNode;
  size?: "sm" | "md" | "lg";
};

const WIDTH = { sm: "max-w-[440px]", md: "max-w-[600px]", lg: "max-w-[760px]" };

export function Modal({ open, onClose, title, description, children, actions, size = "md" }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  // Sync the `open` prop to the dialog's imperative API.
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(e) => {
        // Click on the backdrop (the dialog element itself, outside the card) closes.
        if (e.target === e.currentTarget) onClose();
      }}
      className={`m-auto w-[calc(100%-32px)] ${WIDTH[size]} rounded-card bg-transparent p-0 backdrop:bg-black/40`}
    >
      {open && (
        <div className="flex max-h-[calc(100dvh-48px)] flex-col rounded-card bg-bg-layout shadow-[0_8px_24px_rgba(30,27,24,0.16)]">
          <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-2">
            <div className="flex flex-col gap-1">
              <h2 id={titleId} className="text-[22px] leading-[30px] font-semibold text-text-primary">
                {title}
              </h2>
              {description && <div className="text-[16px] leading-[22px] text-text-secondary">{description}</div>}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-white transition-colors hover:bg-primary-pressed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <span
                aria-hidden
                className="size-5 bg-current"
                style={{ WebkitMask: "url(/icons/admin/close.svg) center / contain no-repeat", mask: "url(/icons/admin/close.svg) center / contain no-repeat" }}
              />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
          {actions && (
            <div className="flex flex-col-reverse gap-3 px-6 pt-2 pb-6 sm:flex-row sm:justify-end">
              {actions}
            </div>
          )}
        </div>
      )}
    </dialog>
  );
}

export default Modal;
