"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { PhoneInput } from "@/components/ui/PhoneInput";
import { TextInput } from "@/components/ui/TextInput";
import { adminSource, providerName, useAdminQuery, type AdminProvider, type NewProviderInput, type ProviderUpdateInput } from "@/lib/admin";
import { getErrorMessage } from "@/lib/api/types";

// Add provider = POST /providers (RegisterProviderDto: the login account).
// Edit provider = PUT /providers/{id} (UpdateProviderDto profile fields) +
// PATCH /providers/{id}/commission when the rate changes. The API can't
// change a provider's name/email/phone after creation, so edit doesn't offer them.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function useSubmit(onClose: () => void) {
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string>();
  async function run(fn: () => Promise<void>) {
    setBusy(true);
    setFormError(undefined);
    try {
      await fn();
      onClose();
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }
  return { busy, formError, run };
}

function FormError({ message }: { message?: string }) {
  return message ? (
    <p role="alert" className="text-[14px] leading-5 text-error">
      {message}
    </p>
  ) : null;
}

export function ProviderCreateModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: (input: NewProviderInput) => Promise<void> }) {
  const [v, setV] = useState({ firstName: "", lastName: "", email: "", phone: "", password: "" });
  const [attest, setAttest] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof typeof v | "attest", string>>>({});
  const { busy, formError, run } = useSubmit(onClose);

  const set = (k: keyof typeof v) => (e: { target: { value: string } }) => {
    setV((p) => ({ ...p, [k]: e.target.value }));
    setErrors((p) => ({ ...p, [k]: undefined }));
  };

  function submit(e: FormEvent) {
    e.preventDefault();
    const digits = v.phone.replace(/\D/g, "");
    const found: typeof errors = {};
    if (!v.firstName.trim()) found.firstName = "Enter the contact person's first name.";
    if (!v.lastName.trim()) found.lastName = "Enter the contact person's last name.";
    if (!EMAIL_RE.test(v.email.trim())) found.email = "Enter a valid email address.";
    if (digits && digits.length !== 10) found.phone = "Enter a 10-digit mobile number, or leave it blank.";
    if (v.password.length < 8) found.password = "Use at least 8 characters.";
    if (!attest) found.attest = "Confirm the provider agreed to being added.";
    setErrors(found);
    if (Object.keys(found).length) return;
    run(() =>
      onSubmit({
        firstName: v.firstName.trim(),
        lastName: v.lastName.trim(),
        email: v.email.trim(),
        phone: digits ? `+91${digits}` : undefined,
        password: v.password,
      })
    );
  }

  return (
    <Modal
      open
      onClose={() => !busy && onClose()}
      title="Add provider"
      description="Creates the provider's sign-in account. They start as “Pending” until verified; fill in their profile with Edit afterwards."
      actions={
        <>
          <Button variant="light" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button type="submit" form="provider-create" loading={busy}>
            Add provider
          </Button>
        </>
      }
    >
      <form id="provider-create" onSubmit={submit} noValidate className="flex flex-col gap-5">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <TextInput label="Contact first name" requiredMark value={v.firstName} onChange={set("firstName")} error={errors.firstName} autoComplete="off" />
          <TextInput label="Contact last name" requiredMark value={v.lastName} onChange={set("lastName")} error={errors.lastName} autoComplete="off" />
        </div>
        <TextInput label="Email" requiredMark type="email" value={v.email} onChange={set("email")} error={errors.email} autoComplete="off" />
        <PhoneInput label="Mobile number (optional)" value={v.phone} onChange={set("phone")} error={errors.phone} maxLength={12} />
        <PasswordInput
          label="Temporary password"
          requiredMark
          autoComplete="new-password"
          helperText="Share it with the provider securely and ask them to change it."
          value={v.password}
          onChange={set("password")}
          error={errors.password}
        />
        <label className="flex cursor-pointer items-start gap-3 rounded-card border border-orange-line bg-bg-orange p-4 text-[15px] leading-[21px] text-text-secondary">
          <input
            type="checkbox"
            checked={attest}
            onChange={(e) => {
              setAttest(e.target.checked);
              setErrors((x) => ({ ...x, attest: undefined }));
            }}
            className="mt-0.5 size-5 shrink-0 accent-[var(--color-tertiary)]"
          />
          <span>
            I confirm the provider&apos;s contact person agreed to these details being added and has been shown our
            Privacy Notice (DPDP Act, 2023).
            {errors.attest && <span className="mt-1 block text-[13px] text-error">{errors.attest}</span>}
          </span>
        </label>
        <FormError message={formError} />
      </form>
    </Modal>
  );
}

export function ProviderEditModal({
  provider,
  onClose,
  onSubmit,
}: {
  provider: AdminProvider;
  onClose: () => void;
  onSubmit: (input: ProviderUpdateInput, commission: number) => Promise<void>;
}) {
  const [v, setV] = useState({
    legalName: provider.legalName ?? "",
    city: provider.city ?? "",
    pincodes: (provider.pincodes ?? []).join(", "),
    registeredAddress: provider.registeredAddress ?? "",
    websiteUrl: provider.websiteUrl ?? "",
    yearsOfExperience: provider.yearsOfExperience?.toString() ?? "",
    aboutText: provider.aboutText ?? "",
    commission: String(provider.commissionRatePercent),
  });
  const [isAvailable, setIsAvailable] = useState(provider.isAvailable);
  // Categories (onboarding step 4). Sent only if the admin changes them, so an
  // edit can never silently unlink categories the API didn't return to us.
  const allCategories = useAdminQuery("edit-provider-categories", () => adminSource.categories.list({ page: 1, limit: 100 }));
  const [categoryIds, setCategoryIds] = useState<number[]>(() => provider.categories?.map((c) => c.id) ?? []);
  const [categoriesTouched, setCategoriesTouched] = useState(false);
  const [bedsAvailable, setBedsAvailable] = useState(provider.bedsAvailable);
  const [errors, setErrors] = useState<Partial<Record<keyof typeof v, string>>>({});
  const { busy, formError, run } = useSubmit(onClose);

  const set = (k: keyof typeof v) => (e: { target: { value: string } }) => {
    setV((p) => ({ ...p, [k]: e.target.value }));
    setErrors((p) => ({ ...p, [k]: undefined }));
  };

  function submit(e: FormEvent) {
    e.preventDefault();
    const pincodes = v.pincodes.split(/[,\s]+/).filter(Boolean);
    const years = v.yearsOfExperience.trim();
    const commission = Number(v.commission);
    const found: typeof errors = {};
    if (pincodes.some((p) => !/^\d{6}$/.test(p))) found.pincodes = "Each pincode must be 6 digits, separated by commas.";
    if (years && (!/^\d+$/.test(years) || Number(years) > 150)) found.yearsOfExperience = "Enter whole years, e.g. 12.";
    if (v.websiteUrl.trim() && !/^https?:\/\/\S+\.\S+/.test(v.websiteUrl.trim()))
      found.websiteUrl = "Start with https:// — e.g. https://example.org";
    if (!Number.isFinite(commission) || commission < 0 || commission > 100) found.commission = "Enter a percentage from 0 to 100.";
    setErrors(found);
    if (Object.keys(found).length) return;

    run(() =>
      onSubmit(
        {
          legalName: v.legalName.trim() || undefined,
          city: v.city.trim() || undefined,
          pincodes,
          registeredAddress: v.registeredAddress.trim() || undefined,
          websiteUrl: v.websiteUrl.trim() || undefined,
          yearsOfExperience: years ? Number(years) : undefined,
          aboutText: v.aboutText.trim() || undefined,
          isAvailable,
          bedsAvailable,
          ...(categoriesTouched ? { categoryIds } : {}),
        },
        commission
      )
    );
  }

  const toggle = (label: string, checked: boolean, onChange: (v: boolean) => void) => (
    <label className="flex h-12 cursor-pointer items-center gap-3 text-[16px] text-text-primary">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="size-5 accent-[var(--color-primary)]" />
      {label}
    </label>
  );

  return (
    <Modal
      open
      size="lg"
      onClose={() => !busy && onClose()}
      title="Edit provider"
      description={`${providerName(provider)} · #${provider.id}`}
      actions={
        <>
          <Button variant="light" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button type="submit" form="provider-edit" loading={busy}>
            Save changes
          </Button>
        </>
      }
    >
      <form id="provider-edit" onSubmit={submit} noValidate className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <TextInput label="Organisation (legal) name" value={v.legalName} onChange={set("legalName")} containerClassName="sm:col-span-2" />
        <TextInput label="City" value={v.city} onChange={set("city")} />
        <TextInput label="Pincodes served" placeholder="110024, 110016" value={v.pincodes} onChange={set("pincodes")} error={errors.pincodes} />
        <TextInput label="Registered address" value={v.registeredAddress} onChange={set("registeredAddress")} containerClassName="sm:col-span-2" />
        <TextInput label="Website" type="url" placeholder="https://" value={v.websiteUrl} onChange={set("websiteUrl")} error={errors.websiteUrl} />
        <TextInput label="Years of experience" inputMode="numeric" value={v.yearsOfExperience} onChange={set("yearsOfExperience")} error={errors.yearsOfExperience} />
        <div className="flex flex-col gap-1 sm:col-span-2">
          <label htmlFor="provider-about" className="text-[16px] leading-[22px] font-semibold text-text-primary">
            About
          </label>
          <textarea
            id="provider-about"
            rows={3}
            value={v.aboutText}
            onChange={set("aboutText")}
            className="w-full rounded-input border-[1.5px] border-border-hairline bg-bg-base px-4 py-3 text-[16px] leading-[22px] text-text-primary focus:border-primary focus:outline-none"
          />
        </div>
        <fieldset className="flex flex-col gap-2 sm:col-span-2">
          <legend className="pb-2 text-[16px] leading-[22px] font-semibold text-text-primary">Categories</legend>
          {allCategories.loading && <p className="text-[15px] text-text-muted">Loading categories…</p>}
          {allCategories.error && <p className="text-[15px] text-error">Couldn&apos;t load categories: {allCategories.error}</p>}
          <div className="flex flex-wrap gap-2">
            {allCategories.data?.items.map((c) => {
              const on = categoryIds.includes(c.id);
              return (
                <label
                  key={c.id}
                  className={`flex h-10 cursor-pointer items-center gap-2 rounded-full border-[1.5px] px-4 text-[15px] has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-primary ${
                    on ? "border-tertiary bg-bg-orange text-text-primary" : "border-border-hairline bg-bg-base text-text-secondary"
                  }`}
                >
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={on}
                    onChange={() => {
                      setCategoriesTouched(true);
                      setCategoryIds((ids) => (ids.includes(c.id) ? ids.filter((x) => x !== c.id) : [...ids, c.id]));
                    }}
                  />
                  {c.name}
                  {!c.isActive && <span className="text-[13px] text-text-muted">(inactive)</span>}
                </label>
              );
            })}
          </div>
          {!provider.categories && (
            <p className="text-[14px] leading-5 text-text-muted">
              Current categories aren&apos;t included in this provider&apos;s data, so none are pre-selected. Leave them untouched to keep
              what&apos;s saved; picking any replaces the saved set.
            </p>
          )}
        </fieldset>
        <TextInput label="Commission rate (%)" inputMode="decimal" value={v.commission} onChange={set("commission")} error={errors.commission} />
        <div className="flex flex-col justify-end">
          {toggle("Accepting new requests", isAvailable, setIsAvailable)}
          {toggle("Beds available", bedsAvailable, setBedsAvailable)}
        </div>
        <div className="sm:col-span-2">
          <FormError message={formError} />
        </div>
      </form>
    </Modal>
  );
}
