import { COMMON_SECTIONS } from "./common";
import { ASSISTED_LIVING } from "./categories/assisted-living";
import { DAY_CARE } from "./categories/day-care";
import type { Answers, CategoryForm, Condition, Field, Section } from "./types";

import { contactPhoneError, emailError } from "./validators";

export * from "./types";
export * from "./validators";

// Category → form registry. To onboard a new category, add a CategoryForm
// under ./categories and list it here; the picker, stepper, validation and
// review screens are all driven from this.
export const CATEGORY_FORMS: CategoryForm[] = [ASSISTED_LIVING, DAY_CARE];

export function getCategoryForm(slug: string | null | undefined): CategoryForm | undefined {
  return CATEGORY_FORMS.find((c) => c.slug === slug);
}

export function isVisible(cond: Condition | undefined, answers: Answers): boolean {
  if (!cond) return true;
  const v = answers[cond.field];
  if (Array.isArray(v)) return v.some((x) => cond.in.includes(x));
  return v !== undefined && cond.in.includes(v);
}

/** Shared sections + the category's own, with `showIf` applied and empty sections dropped. */
export function visibleSections(form: CategoryForm, answers: Answers): Section[] {
  return [...COMMON_SECTIONS, ...form.sections]
    .filter((s) => isVisible(s.showIf, answers))
    .map((s) => ({ ...s, fields: s.fields.filter((f) => isVisible(f.showIf, answers)) }))
    .filter((s) => s.fields.length > 0);
}

export function validateField(field: Field, value: string | string[] | undefined): string | undefined {
  const empty = value === undefined || (Array.isArray(value) ? value.length === 0 : value.trim() === "");
  if (empty) return field.required ? "This field is required." : undefined;
  const v = Array.isArray(value) ? "" : value.trim();
  if (field.type === "email") return emailError(v);
  if (field.type === "tel") return contactPhoneError(v);
  if (field.type === "url" && !/^https?:\/\/\S+\.\S+/.test(v)) return "Enter a valid link starting with http:// or https://";
  return undefined;
}

export function validateSection(section: Section, answers: Answers): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const f of section.fields) {
    const err = validateField(f, answers[f.id]);
    if (err) errors[f.id] = err;
  }
  return errors;
}
