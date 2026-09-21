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
};

const LEGEND = "text-[16px] leading-[22px] font-semibold text-text-primary";

export function FormField({ field, value, error, onChange }: Props) {
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
        error={error}
      />
    );
  }

  if (field.type === "radio" || field.type === "checkbox") {
    const multi = field.type === "checkbox";
    const selected = multi ? (Array.isArray(value) ? value : []) : typeof value === "string" ? value : "";
    const describedBy = error ? `${id}-error` : field.helperText ? `${id}-help` : undefined;
    return (
      <fieldset className="flex flex-col gap-2" aria-describedby={describedBy}>
        <legend className={`${LEGEND} mb-1 ${error ? "text-error" : ""}`}>
          {field.label}
          {field.required && <span className="text-error"> *</span>}
        </legend>
        {field.helperText && (
          <p id={`${id}-help`} className="text-[13px] leading-[17px] text-text-tertiary">
            {field.helperText}
          </p>
        )}
        <div className="flex flex-col gap-2">
          {(field.options ?? []).map((opt) => {
            const checked = multi ? (selected as string[]).includes(opt) : selected === opt;
            return (
              <label
                key={opt}
                className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-input border-[1.5px] px-4 py-2 text-[16px] leading-6 text-text-primary transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-primary ${
                  checked ? "border-primary bg-bg-layout" : error ? "border-error bg-bg-base" : "border-border-hairline bg-bg-base hover:bg-bg-layout"
                }`}
              >
                <input
                  type={multi ? "checkbox" : "radio"}
                  name={id}
                  checked={checked}
                  onChange={() =>
                    multi
                      ? onChange(checked ? (selected as string[]).filter((x) => x !== opt) : [...(selected as string[]), opt])
                      : onChange(opt)
                  }
                  className="size-5 shrink-0 accent-primary"
                />
                {opt}
              </label>
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
      value={typeof value === "string" ? value : ""}
      onChange={(e) => onChange(e.target.value)}
      error={error}
    />
  );
}

export default FormField;
