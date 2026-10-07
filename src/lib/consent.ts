// DPDP Act 2023 / DPDP Rules 2025 consent bookkeeping.
//
// Every form that collects personal data shows a ConsentNotice (itemised data,
// purpose, rights) and requires an un-ticked-by-default checkbox before it can
// submit. The Data Fiduciary must be able to *prove* consent was given, for
// what, and against which notice version — so each submission records one.
//
// TODO(backend): there is no consent endpoint yet. Records are kept in
// localStorage so nothing is lost; send `record` alongside each form's API
// call (and POST withdrawals) once the backend accepts it.

/** Bump whenever /privacy changes materially; stored with every consent. */
export const PRIVACY_NOTICE_VERSION = "2026-10-07";

/** Grievance / Data Protection contact shown in notices and on /privacy. */
export const GRIEVANCE_EMAIL = "support@servesaathi.com";

export type ConsentPurpose =
  | "phone-verification"
  | "account-creation"
  | "callback-request"
  | "provider-application";

export type ConsentRecord = {
  purpose: ConsentPurpose;
  dataItems: string[];
  noticeVersion: string;
  givenAt: string;
};

const STORAGE_KEY = "servesaathi-consents";

export function recordConsent(purpose: ConsentPurpose, dataItems: string[]): ConsentRecord {
  const record: ConsentRecord = {
    purpose,
    dataItems,
    noticeVersion: PRIVACY_NOTICE_VERSION,
    givenAt: new Date().toISOString(),
  };
  try {
    const existing = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]") as ConsentRecord[];
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...existing, record]));
  } catch {
    // Storage blocked (private mode etc.) — the in-memory record is still returned.
  }
  return record;
}
