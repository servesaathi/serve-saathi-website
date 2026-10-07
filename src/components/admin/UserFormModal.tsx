"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { PhoneInput } from "@/components/ui/PhoneInput";
import { TextInput } from "@/components/ui/TextInput";
import { ADMIN_ROLES, ROLE_LABELS, type AdminRole, type AdminUser, type UserInput } from "@/lib/admin";
import { getErrorMessage } from "@/lib/api/types";

// Add / edit user. Mounted fresh per open (keyed by the caller), so initial
// state comes straight from `user` without syncing effects.
//
// DPDP: an admin entering someone else's details must confirm that person
// agreed to it — ServeSaathi stays the Data Fiduciary either way.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
type Errors = Partial<Record<"firstName" | "lastName" | "email" | "phone" | "roles" | "attest", string>>;

export function UserFormModal({
  user,
  onClose,
  onSubmit,
}: {
  /** Undefined = add mode. */
  user?: AdminUser;
  onClose: () => void;
  onSubmit: (input: UserInput) => Promise<void>;
}) {
  const editing = Boolean(user);
  const [firstName, setFirstName] = useState(user?.firstName ?? "");
  const [lastName, setLastName] = useState(user?.lastName ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState((user?.phone ?? "").replace(/^\+91/, ""));
  const [roles, setRoles] = useState<AdminRole[]>(user?.roles ?? ["customer"]);
  const [attest, setAttest] = useState(editing);
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string>();
  const [busy, setBusy] = useState(false);

  function toggleRole(role: AdminRole) {
    setRoles((r) => (r.includes(role) ? r.filter((x) => x !== role) : [...r, role]));
    setErrors((e) => ({ ...e, roles: undefined }));
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    const digits = phone.replace(/\D/g, "");
    const found: Errors = {};
    if (!firstName.trim()) found.firstName = "Enter a first name.";
    if (!lastName.trim()) found.lastName = "Enter a last name.";
    if (!EMAIL_RE.test(email.trim())) found.email = "Enter a valid email address.";
    if (digits && digits.length !== 10) found.phone = "Enter a 10-digit mobile number, or leave it blank.";
    if (roles.length === 0) found.roles = "Pick at least one role.";
    if (!attest) found.attest = "Confirm this person agreed to their details being added.";
    setErrors(found);
    if (Object.keys(found).length) return;

    setBusy(true);
    setFormError(undefined);
    try {
      await onSubmit({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: digits ? `+91${digits}` : undefined,
        roles,
      });
      onClose();
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open
      onClose={() => !busy && onClose()}
      title={editing ? "Edit user" : "Add user"}
      description={editing ? `User #${user!.id}` : "Creates a new account on ServeSaathi."}
      actions={
        <>
          <Button variant="light" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button type="submit" form="user-form" loading={busy}>
            {editing ? "Save changes" : "Add user"}
          </Button>
        </>
      }
    >
      <form id="user-form" onSubmit={submit} noValidate className="flex flex-col gap-5">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <TextInput label="First name" requiredMark value={firstName} onChange={(e) => setFirstName(e.target.value)} error={errors.firstName} autoComplete="off" />
          <TextInput label="Last name" requiredMark value={lastName} onChange={(e) => setLastName(e.target.value)} error={errors.lastName} autoComplete="off" />
        </div>
        <TextInput label="Email" requiredMark type="email" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} autoComplete="off" />
        <PhoneInput label="Mobile number (optional)" value={phone} onChange={(e) => setPhone(e.target.value)} error={errors.phone} maxLength={12} />

        <fieldset className="flex flex-col gap-2">
          <legend className={`pb-2 text-[16px] leading-[22px] font-semibold ${errors.roles ? "text-error" : "text-text-primary"}`}>
            Roles <span className="text-error">*</span>
          </legend>
          <div className="flex flex-wrap gap-2">
            {ADMIN_ROLES.map((role) => {
              const on = roles.includes(role);
              return (
                <label
                  key={role}
                  className={`flex h-10 cursor-pointer items-center gap-2 rounded-full border-[1.5px] px-4 text-[15px] has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-primary ${
                    on ? "border-tertiary bg-bg-orange text-text-primary" : "border-border-hairline bg-bg-base text-text-secondary"
                  }`}
                >
                  <input type="checkbox" className="sr-only" checked={on} onChange={() => toggleRole(role)} />
                  {ROLE_LABELS[role]}
                </label>
              );
            })}
          </div>
          {errors.roles && <p className="text-[13px] leading-[17px] text-error">{errors.roles}</p>}
        </fieldset>

        {!editing && (
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
              I confirm this person has agreed to ServeSaathi holding these details, and has been shown our Privacy
              Notice (DPDP Act, 2023).
              {errors.attest && <span className="mt-1 block text-[13px] text-error">{errors.attest}</span>}
            </span>
          </label>
        )}

        {formError && (
          <p role="alert" className="text-[14px] leading-5 text-error">
            {formError}
          </p>
        )}
      </form>
    </Modal>
  );
}

export default UserFormModal;
