// Schema types for the provider onboarding form. Ported from the Google
// Forms the team currently uses to onboard providers — one form per
// category, all sharing the same "Common Provider Information" + "Trust &
// Verification" sections. Google's page-jump branching (go to section X
// based on an answer) is modelled as `showIf` on a field/section instead,
// so the renderer stays a plain "visible sections, in order" stepper.

export type FieldType =
  | "text"
  | "email"
  | "tel"
  | "url"
  | "textarea"
  | "select"
  | "radio"
  | "checkbox"
  | "time";

export type FieldValue = string | string[];
export type Answers = Record<string, FieldValue>;

export interface Condition {
  /** Field id whose answer is tested. */
  field: string;
  /** Visible when the field's answer equals (or, for checkbox, includes) any of these. */
  in: string[];
}

export interface Field {
  id: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  helperText?: string;
  options?: string[];
  showIf?: Condition;
}

export interface Section {
  id: string;
  title: string;
  description?: string;
  showIf?: Condition;
  fields: Field[];
}

export interface CategoryForm {
  /** Stable key stored with the application. */
  slug: string;
  /** Slug of the matching backend /categories row, when one exists. */
  backendCategorySlug?: string;
  title: string;
  blurb: string;
  /** Sections specific to this category; appended after the shared ones. */
  sections: Section[];
}
