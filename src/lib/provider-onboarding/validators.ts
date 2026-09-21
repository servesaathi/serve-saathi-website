// Shared email/phone validation for the provider onboarding flow (account
// step + schema-driven form fields), so both apply the same rules and
// messages. Phone rules are Indian numbers, matching the +91 default used
// when the account is registered.

/** Basic RFC-ish check: a real domain with a 2+ letter TLD, no spaces, no "..", no leading/trailing dot in the local part. */
export function isValidEmail(value: string): boolean {
  const v = value.trim();
  if (v.length > 254 || v.includes("..")) return false;
  if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/.test(v)) return false;
  const local = v.split("@")[0];
  return !local.startsWith(".") && !local.endsWith(".");
}

/**
 * Strips spaces, hyphens, parentheses and a leading +91 / 91 / 0, returning
 * the bare 10 digits, or null when what's left isn't 10 digits.
 */
export function normalizeIndianPhone(value: string): string | null {
  let d = value.replace(/[\s\-().]/g, "");
  if (!/^\+?\d+$/.test(d)) return null;
  d = d.replace(/^\+/, "");
  if (d.length === 12 && d.startsWith("91")) d = d.slice(2);
  else if (d.length === 11 && d.startsWith("0")) d = d.slice(1);
  return /^\d{10}$/.test(d) ? d : null;
}

/**
 * Input filter for phone fields: digits only, capped at 10. A pasted number
 * with a country/trunk prefix ("+91 98765 43210", "098765 43210") is reduced
 * to its 10 digits instead of being truncated from the wrong end.
 */
export function sanitizePhoneInput(raw: string): string {
  let d = raw.replace(/\D/g, "");
  if (d.length === 12 && d.startsWith("91")) d = d.slice(2);
  else if (d.length === 11 && d.startsWith("0")) d = d.slice(1);
  return d.slice(0, 10);
}

/** Indian mobile: 10 digits starting 6–9. */
export function isValidMobile(value: string): boolean {
  const d = normalizeIndianPhone(value);
  return !!d && /^[6-9]/.test(d);
}

/** Mobile, or a landline written as STD code + number (10 digits, first digit 1–9). */
export function isValidContactPhone(value: string): boolean {
  const d = normalizeIndianPhone(value);
  return !!d && /^[1-9]/.test(d);
}

/** "+91XXXXXXXXXX" for the API, or undefined if it isn't a valid number. */
export function toE164(value: string): string | undefined {
  const d = normalizeIndianPhone(value);
  return d ? `+91${d}` : undefined;
}

// Message helpers: return undefined when valid (or when empty — "required"
// is the caller's concern).
export function emailError(value: string): string | undefined {
  if (!value.trim()) return undefined;
  return isValidEmail(value) ? undefined : "Enter a valid email address, like name@example.com.";
}

export function mobileError(value: string): string | undefined {
  if (!value.trim()) return undefined;
  return isValidMobile(value) ? undefined : "Enter a 10-digit mobile number starting with 6, 7, 8 or 9.";
}

export function contactPhoneError(value: string): string | undefined {
  if (!value.trim()) return undefined;
  return isValidContactPhone(value)
    ? undefined
    : "Enter a 10-digit phone number (mobile, or landline with STD code).";
}
