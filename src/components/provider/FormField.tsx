"use client";

import { useId } from "react";
import { Select } from "@/components/ui/Select";
import { TextInput } from "@/components/ui/TextInput";
import type { Field, FieldValue } from "@/lib/provider-onboarding";

// Renders one schema Field with the shared ui primitives. Text-ish/select
// fields reuse TextInput/Select; radio/checkbox groups and the textarea are
// the only bespoke bits (no equivalent primitive exists yet).

type Props = {
  field: Field;
  value: FieldValue | undefined;
  error?: string;
  onChange: (value: FieldValue) => void;
  /** Called when a text-style field loses focus, so the flow can validate it early. */
  onBlur?: () => void;
};

const LEGEND = "text-[16px] leading-[22px] font-semibold text-text-primary";

/** Radio/checkbox groups and the textarea span the full row; everything else sits in a 2-column grid. */
export function isWideField(field: Field): boolean {
  return field.type === "radio" || field.type === "checkbox" || field.type === "textarea";
}

// Selectable card with the orange square/round marker from the booking
// design: hairline white card → orange border + orange tint when selected.
export function OptionCard({
  name,
  label,
  description,
  multi,
  checked,
  hasError,
  onToggle,
}: {
  name: string;
  label: string;
  description?: string;
  multi: boolean;
  checked: boolean;
  hasError?: boolean;
  onToggle: () => void;
}) {
  return (
    <label
      className={`flex min-h-[52px] cursor-pointer items-center justify-between gap-4 rounded-control border-[1.5px] px-4 py-3 transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-tertiary ${
        checked
          ? "border-tertiary bg-bg-orange"
          : hasError
            ? "border-error bg-bg-base"
            : "border-border-hairline bg-bg-base hover:border-tertiary/60"
      }`}
    >
      <span className="flex min-w-0 flex-col">
        <span className={`text-[16px] leading-6 ${checked ? "font-semibold text-text-primary" : "text-text-secondary"}`}>{label}</span>
        {description && <span className="text-[14px] leading-5 text-text-tertiary">{description}</span>}
      </span>
      <input type={multi ? "checkbox" : "radio"} name={name} checked={checked} onChange={onToggle} className="peer sr-only" />
      <span
        aria-hidden
        className={`flex size-6 shrink-0 items-center justify-center border-[1.5px] border-tertiary text-white transition-colors ${
          multi ? "rounded-[6px]" : "rounded-full"
        } ${checked ? "bg-tertiary" : "bg-bg-base"}`}
      >
        {checked && (
          <svg viewBox="0 0 16 16" fill="none" className="size-4">
            <path d="m3.5 8.5 3 3 6-6.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
    </label>
  );
}

export function FormField({ field, value, error, onChange, onBlur }: Props) {
  const id = useId();

  if (field.type === "select") {
    return (
      <Select
        label={field.label}
        requiredMark={field.required}
        placeholder="Select an option"
        options={(field.options ?? []).map((o) => ({ value: o, label: o }))}
        value={typeof value === "string" ? value : ""}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        error={error}
      />
    );
  }

  if (field.type === "radio" || field.type === "checkbox") {
    const multi = field.type === "checkbox";
    const selected = multi ? (Array.isArray(value) ? value : []) : typeof value === "string" ? value : "";
    const describedBy = error ? `${id}-error` : field.helperText ? `${id}-help` : undefined;
    return (
      <fieldset className="flex flex-col gap-3" aria-describedby={describedBy}>
        <legend className={`text-[18px] leading-7 font-semibold ${error ? "text-error" : "text-text-primary"}`}>
          {field.label}
          {field.required && <span className="text-error"> *</span>}
        </legend>
        {field.helperText && (
          <p id={`${id}-help`} className="-mt-2 text-[14px] leading-5 text-text-tertiary">
            {field.helperText}
          </p>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          {(field.options ?? []).map((opt) => {
            const checked = multi ? (selected as string[]).includes(opt) : selected === opt;
            return (
              <OptionCard
                key={opt}
                name={id}
                label={opt}
                multi={multi}
                checked={checked}
                hasError={!!error}
                onToggle={() =>
                  multi
                    ? onChange(checked ? (selected as string[]).filter((x) => x !== opt) : [...(selected as string[]), opt])
                    : onChange(opt)
                }
              />
            );
          })}
        </div>
        {error && (
          <p id={`${id}-error`} className="text-[13px] leading-[17px] text-error">
            {error}
          </p>
        )}
      </fieldset>
    );
  }

  if (field.type === "textarea") {
    return (
      <div className="flex w-full flex-col gap-1">
        <label htmlFor={id} className={`${LEGEND} ${error ? "text-error" : ""}`}>
          {field.label}
          {field.required && <span className="text-error"> *</span>}
        </label>
        <textarea
          id={id}
          rows={4}
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          aria-invalid={error ? true : undefined}
          className={`rounded-input border-[1.5px] bg-bg-base px-4 py-3 text-[16px] leading-6 text-text-primary placeholder:text-text-muted focus:outline-none ${
            error ? "border-error" : "border-border-hairline focus:border-primary"
          }`}
        />
        {error && <p className="text-[13px] leading-[17px] text-error">{error}</p>}
      </div>
    );
  }

  return (
    <TextInput
      label={field.label}
      requiredMark={field.required}
      type={field.type}
      placeholder={field.placeholder}
      helperText={field.helperText}
      autoComplete={field.type === "email" ? "email" : field.type === "tel" ? "tel" : undefined}
      inputMode={field.type === "tel" ? "tel" : field.type === "email" ? "email" : field.type === "url" ? "url" : undefined}
      maxLength={field.type === "tel" ? 20 : field.type === "email" ? 254 : undefined}
      value={typeof value === "string" ? value : ""}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      error={error}
    />
  );
}

export default FormField;
