import type { FormEventHandler, ReactNode } from "react";

// One onboarding step: chip + serif title + intro, the step's content, and
// a full-width action row pinned to the bottom of the window — "Back" (dark)
// on the left and the primary action (green) on the right, each taking half
// the row, like the booking screen this is modelled on.
type Props = {
  onSubmit?: FormEventHandler<HTMLFormElement>;
  chip?: string;
  title: string;
  description?: string;
  actions: ReactNode;
  children: ReactNode;
};

export function StageLayout({ onSubmit, chip, title, description, actions, children }: Props) {
  return (
    <form onSubmit={onSubmit} noValidate className="flex min-w-0 flex-1 flex-col">
      <div className="flex-1 px-6 py-8 sm:px-10">
        {chip && (
          <span className="inline-flex items-center rounded-control bg-border-hairline px-3 py-1.5 text-[16px] leading-5 font-semibold text-primary">
            {chip}
          </span>
        )}
        <h1 className="mt-4 font-serif text-[32px] leading-[1.15] text-text-primary sm:text-[44px] sm:leading-[52px]">{title}</h1>
        {description && <p className="mt-2 max-w-[760px] text-[18px] leading-7 text-text-secondary">{description}</p>}
        <div className="mt-8 flex flex-col gap-8">{children}</div>
      </div>

      <div className="sticky bottom-0 z-10 grid grid-cols-1 gap-4 border-t border-border-hairline bg-bg-layout px-6 py-4 sm:grid-cols-2 sm:gap-6 sm:px-10">
        {actions}
      </div>
    </form>
  );
}

export default StageLayout;
