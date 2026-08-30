"use client";

import { useId, type ComponentPropsWithoutRef } from "react";

// Select dropdown styled to match TextInput — Figma "Select Input" field
// (48px, 10px radius, 1.5px border; hairline → green on focus → red on error).

export type SelectOption = { value: string; label: string };

type SelectProps = {
  label?: string;
  error?: string;
  requiredMark?: boolean;
  options: SelectOption[];
  placeholder?: string;
  containerClassName?: string;
} & Omit<ComponentPropsWithoutRef<"select">, "className">;

export function Select({
  label,
  error,
  requiredMark,
  options,
  placeholder,
  containerClassName = "",
  id,
  disabled,
  ...rest
}: SelectProps) {
  const reactId = useId();
  const selectId = id ?? reactId;

  const border = error
    ? "border-error"
    : disabled
      ? "border-[#e5e5e5]"
      : "border-border-hairline focus-within:border-primary";

  return (
    <div className={`flex w-full flex-col gap-1 ${containerClassName}`}>
      {label && (
        <label
          htmlFor={selectId}
          className={`text-[16px] leading-[22px] font-semibold ${
            error ? "text-error" : disabled ? "text-text-muted" : "text-text-primary"
          }`}
        >
          {label}
          {requiredMark && <span className="text-error"> *</span>}
        </label>
      )}

      <div className={`relative flex h-12 items-center rounded-input border-[1.5px] bg-bg-base ${border}`}>
        <select
          id={selectId}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          className="h-full w-full appearance-none bg-transparent pr-11 pl-4 text-[16px] text-text-primary focus:outline-none disabled:cursor-not-allowed"
          {...rest}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <svg
          className="pointer-events-none absolute right-4 size-4 text-text-muted"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden
        >
          <path
            d="m4 6 4 4 4-4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {error && <p className="text-[13px] leading-[17px] text-error">{error}</p>}
    </div>
  );
}

export default Select;
