"use client";

import Image from "next/image";
import { useId, useState, type ComponentPropsWithoutRef } from "react";

// "Input - Phone number Text" — Figma design system (see docs/inputs-forms.md).
// Two visually-joined segments sharing one border colour per state:
//   [ (+91) ▾ ][ number …………………… ]
// The country code is static "+91" for now (a real country picker is a bigger
// feature — same call the mobile app made). Borders: enabled #d5e5d6,
// focus = brand green, error = red; background stays white in every state.

type PhoneInputProps = {
  label?: string;
  countryCode?: string;
  error?: string;
  className?: string;
} & Omit<ComponentPropsWithoutRef<"input">, "className" | "type" | "prefix">;

export function PhoneInput({
  label = "Mobile Number",
  countryCode = "+91",
  error,
  className = "",
  id,
  disabled,
  onFocus,
  onBlur,
  placeholder = "000-000-0000",
  ...inputProps
}: PhoneInputProps) {
  const reactId = useId();
  const inputId = id ?? reactId;
  const [focused, setFocused] = useState(false);

  const borderColor = error
    ? "border-error"
    : focused
      ? "border-primary"
      : disabled
        ? "border-[#e5e5e5]"
        : "border-border-hairline";

  return (
    <div className={`flex w-full flex-col ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className={`pb-2 text-[16px] leading-[22px] font-semibold ${
            error ? "text-error" : disabled ? "text-text-muted" : "text-text-primary"
          }`}
        >
          {label}
        </label>
      )}

      <div className="flex w-full items-stretch">
        {/* Country-code segment */}
        <div
          className={`flex h-12 shrink-0 items-center gap-1 rounded-l-control border-y-[1.5px] border-l-[1.5px] bg-bg-base px-4 ${borderColor}`}
        >
          <span className="text-[16px] leading-[22px] font-medium text-text-primary">
            ({countryCode})
          </span>
          <Image src="/icons/chevron-down.svg" alt="" width={14} height={14} aria-hidden />
        </div>

        {/* Number segment */}
        <input
          id={inputId}
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          placeholder={placeholder}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${inputId}-error` : undefined}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          className={`h-12 min-w-0 flex-1 rounded-r-control border-[1.5px] bg-bg-base px-4 text-[16px] leading-[22px] font-medium text-text-primary placeholder:text-text-muted focus:outline-none disabled:cursor-not-allowed ${borderColor}`}
          {...inputProps}
        />
      </div>

      {error && (
        <p id={`${inputId}-error`} className="pt-1 text-[13px] leading-[17px] text-error">
          {error}
        </p>
      )}
    </div>
  );
}

export default PhoneInput;
