"use client";

import { useId, type ComponentPropsWithoutRef, type ReactNode } from "react";

// "Input - Text" — Figma design system (see docs/inputs-forms.md).
// 48px field, 10px radius, 1.5px border; background stays white in every state
// (only the border + helper text change). Label is H5 (16/22 semibold);
// helper/error text is Caption (13/17).
//
// Known deviation: Figma's value text is DM Sans; the app only ships Atkinson
// Hyperlegible Next, so the typed value uses Atkinson here too.

type TextInputProps = {
  label?: string;
  error?: string;
  helperText?: string;
  requiredMark?: boolean;
  /** Rendered inside the field box, right-aligned (e.g. a password eye toggle). */
  endAdornment?: ReactNode;
  containerClassName?: string;
} & Omit<ComponentPropsWithoutRef<"input">, "className">;

export function TextInput({
  label,
  error,
  helperText,
  requiredMark,
  endAdornment,
  containerClassName = "",
  id,
  disabled,
  ...inputProps
}: TextInputProps) {
  const reactId = useId();
  const inputId = id ?? reactId;
  const describedBy = error ? `${inputId}-error` : helperText ? `${inputId}-help` : undefined;

  const borderColor = error
    ? "border-error"
    : disabled
      ? "border-[#e5e5e5]"
      : "border-border-hairline focus-within:border-primary";

  return (
    <div className={`flex w-full flex-col gap-1 ${containerClassName}`}>
      {label && (
        <label
          htmlFor={inputId}
          className={`text-[16px] leading-[22px] font-semibold ${
            error ? "text-error" : disabled ? "text-text-muted" : "text-text-primary"
          }`}
        >
          {label}
          {requiredMark && <span className="text-error"> *</span>}
        </label>
      )}

      <div
        className={`flex h-12 items-center gap-3 rounded-input border-[1.5px] bg-bg-base pl-4 pr-5 ${borderColor}`}
      >
        <input
          id={inputId}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className="min-w-0 flex-1 bg-transparent text-[16px] leading-6 text-text-primary placeholder:text-text-muted focus:outline-none disabled:cursor-not-allowed"
          {...inputProps}
        />
        {endAdornment && <span className="flex shrink-0 items-center">{endAdornment}</span>}
      </div>

      {error ? (
        <p id={`${inputId}-error`} className="text-[13px] leading-[17px] text-error">
          {error}
        </p>
      ) : helperText ? (
        <p id={`${inputId}-help`} className="text-[13px] leading-[17px] text-text-tertiary">
          {helperText}
        </p>
      ) : null}
    </div>
  );
}

export default TextInput;
