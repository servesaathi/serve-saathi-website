"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { SiteShell } from "@/components/site/SiteShell";
import { ProfileCard } from "@/components/app/ProfileCard";
import { SettingsSidebar, type SettingsSection } from "@/components/app/SettingsSidebar";
import { Button } from "@/components/ui/Button";
import { PhoneInput } from "@/components/ui/PhoneInput";
import { Select, type SelectOption } from "@/components/ui/Select";
import { TextInput } from "@/components/ui/TextInput";
import {
  careProfileService,
  getErrorMessage,
  masterdataService,
  userService,
  type CareProfile,
} from "@/lib/api";
import { useLogout } from "@/lib/useLogout";
import useAuthStore from "@/store/auth.store";

// "Setting - Edit Profile" — Figma node 1973:30903. Sidebar + a profile card +
// the Edit Profile form, wired to /users/me and /care-profiles/me.

type FormState = { firstName: string; lastName: string; phone: string; genderId: string };
const EMPTY: FormState = { firstName: "", lastName: "", phone: "", genderId: "" };

function ageFrom(dob?: string | null): number | null {
  if (!dob) return null;
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return null;
  const now = new Date();
  let a = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) a -= 1;
  return a >= 0 && a < 130 ? a : null;
}

function stripCc(phone?: string | null): string {
  if (!phone) return "";
  const digits = phone.replace(/\D/g, "");
  return digits.length > 10 ? digits.slice(-10) : digits;
}

export default function SettingsPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const logout = useLogout();

  const [section, setSection] = useState<SettingsSection>("edit-profile");
  const [loading, setLoading] = useState(true);
  const [genders, setGenders] = useState<SelectOption[]>([]);
  const [careProfile, setCareProfile] = useState<CareProfile | null>(null);
  const [initial, setInitial] = useState<FormState>(EMPTY);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>();
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!user) router.replace("/login");
  }, [user, router]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const [me, cp, gs] = await Promise.allSettled([
        userService.getMe(),
        careProfileService.getCareProfile(),
        masterdataService.getGenders(),
      ]);
      if (cancelled) return;

      const meData = me.status === "fulfilled" ? me.value : user;
      const cpData = cp.status === "fulfilled" ? cp.value : null;
      setCareProfile(cpData);
      if (gs.status === "fulfilled") {
        setGenders(gs.value.map((g) => ({ value: g.id, label: g.label })));
      }

      const next: FormState = {
        firstName: meData?.firstName ?? "",
        lastName: meData?.lastName ?? "",
        phone: stripCc(meData?.phone),
        genderId: cpData?.genderId ? String(cpData.genderId) : "",
      };
      setInitial(next);
      setForm(next);
      setLoading(false);
    }
    if (user) load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSelectSection = useCallback(
    (key: SettingsSection) => {
      if (key === "logout") {
        void logout();
        return;
      }
      setSection(key);
    },
    [logout]
  );

  const dirty = JSON.stringify(form) !== JSON.stringify(initial);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setError(undefined);
    setSaved(false);

    if (!form.firstName.trim() || !form.lastName.trim()) {
      setError("First and last name are required.");
      return;
    }
    if (form.phone && form.phone.replace(/\D/g, "").length !== 10) {
      setError("Enter a valid 10-digit mobile number.");
      return;
    }

    setSaving(true);
    try {
      const updated = await userService.updateMe({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        phone: form.phone ? `+91${form.phone.replace(/\D/g, "")}` : undefined,
      });
      setUser(updated);

      if (form.genderId && form.genderId !== initial.genderId) {
        const cp = await careProfileService.updateCareProfile({ genderId: Number(form.genderId) });
        setCareProfile(cp);
      }

      setInitial(form);
      setSaved(true);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  const fullName = `${form.firstName} ${form.lastName}`.trim() || "Your profile";
  const genderName =
    genders.find((g) => g.value === form.genderId)?.label ?? careProfile?.gender?.name ?? null;

  return (
    <SiteShell>
      <div className="flex flex-col gap-8 py-10 lg:flex-row lg:gap-16">
        <SettingsSidebar active={section} onSelect={onSelectSection} />

        <div className="flex min-w-0 flex-1 flex-col gap-8">
          <ProfileCard
            name={fullName}
            avatarUrl={careProfile?.avatarUrl}
            age={ageFrom(careProfile?.dateOfBirth)}
            gender={genderName}
          />

          {section === "edit-profile" ? (
            <form onSubmit={handleSave} className="flex w-full max-w-[920px] flex-col gap-4">
              <h1 className="text-[26px] leading-[34px] font-semibold text-primary">Edit Profile</h1>

              {loading ? (
                <p className="text-[15px] text-text-secondary">Loading your details…</p>
              ) : (
                <>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <TextInput
                      label="First Name"
                      requiredMark
                      value={form.firstName}
                      onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                    />
                    <TextInput
                      label="Last Name"
                      requiredMark
                      value={form.lastName}
                      onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Select
                      label="Sex"
                      requiredMark
                      placeholder="Select"
                      options={genders}
                      value={form.genderId}
                      onChange={(e) => setForm((f) => ({ ...f, genderId: e.target.value }))}
                    />
                    <PhoneInput
                      value={form.phone}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          phone: e.target.value.replace(/\D/g, "").slice(0, 10),
                        }))
                      }
                      maxLength={12}
                    />
                  </div>

                  {error && <p className="text-[13px] leading-[17px] text-error">{error}</p>}
                  {saved && !dirty && (
                    <p className="text-[13px] leading-[17px] text-primary">Changes saved.</p>
                  )}

                  <div className="flex gap-4 pt-6">
                    <Button
                      type="button"
                      variant="secondary"
                      fullWidth
                      disabled={!dirty || saving}
                      onClick={() => {
                        setForm(initial);
                        setError(undefined);
                        setSaved(false);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" fullWidth loading={saving} disabled={!dirty}>
                      Save Changes
                    </Button>
                  </div>
                </>
              )}
            </form>
          ) : (
            <div className="flex min-h-[240px] max-w-[920px] flex-col items-center justify-center gap-2 rounded-card border border-border-hairline bg-bg-base p-8 text-center">
              <p className="text-[18px] font-semibold text-text-primary">Coming soon</p>
              <p className="max-w-[420px] text-[15px] leading-6 text-text-secondary">
                This settings section isn&apos;t built yet. Use the sidebar to edit your profile.
              </p>
            </div>
          )}
        </div>
      </div>
    </SiteShell>
  );
}
