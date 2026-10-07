"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { BackLink } from "@/components/services/BackLink";
import { adminSource, displayName, providerName, useAdminQuery } from "@/lib/admin";
import { ProviderEditModal } from "./ProviderModals";
import { ActiveSwitch, ProviderDecisionDialogs, VerificationBadge, saveProvider } from "./ProvidersScreen";
import { ActionButton, DetailList, Flash, ICONS, Identity, StatCard, formatDate } from "./parts";

// /admin/providers/[id] — GET /providers/{id} with every provider action.

const providers = adminSource.providers;

export function ProviderAdminDetail({ id }: { id: number }) {
  const router = useRouter();
  const { data: p, error, loading, reload } = useAdminQuery(`provider:${id}`, () => providers.get(id));
  const [dialog, setDialog] = useState<"edit" | "verify" | "reject" | "delete" | null>(null);
  const [flash, setFlash] = useState<{ message: string; tone: "success" | "error" }>();

  if (!p) {
    return (
      <div className="flex flex-col gap-6">
        <BackLink href="/admin/providers" label="All providers" />
        {error ? <Flash message={error} tone="error" onDismiss={reload} /> : <p aria-busy={loading}>Loading provider…</p>}
      </div>
    );
  }

  const done = (message: string) => {
    setFlash({ message, tone: "success" });
    reload();
  };

  return (
    <div className="flex flex-col gap-8">
      <BackLink href="/admin/providers" label="All providers" />

      <div className="flex flex-col gap-5 rounded-card bg-bg-base p-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-3">
          <Identity name={providerName(p)} sub={`Provider #${p.id} · joined ${formatDate(p.createdAt)}`} />
          <div className="flex flex-wrap items-center gap-3">
            <VerificationBadge status={p.verificationStatus} />
            <ActiveSwitch
              provider={p}
              onChange={async (next) => {
                try {
                  await providers.setActive(p.id, next);
                  done(next ? "Account active — they can sign in again." : "Account deactivated — their login is blocked.");
                } catch (err) {
                  setFlash({ message: err instanceof Error ? err.message : "Couldn't update listing.", tone: "error" });
                }
              }}
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {p.verificationStatus !== "verified" && (
            <ActionButton icon={ICONS.success} tone="primary" onClick={() => setDialog("verify")}>
              Verify
            </ActionButton>
          )}
          {p.verificationStatus !== "rejected" && (
            <ActionButton icon={ICONS.close} tone="danger" onClick={() => setDialog("reject")}>
              Reject
            </ActionButton>
          )}
          <ActionButton icon={ICONS.edit} onClick={() => setDialog("edit")}>
            Edit
          </ActionButton>
          <ActionButton icon={ICONS.delete} tone="danger" onClick={() => setDialog("delete")}>
            Delete
          </ActionButton>
        </div>
      </div>

      {flash && <Flash {...flash} onDismiss={() => setFlash(undefined)} />}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Rating" value={p.totalReviews ? p.averageRating.toFixed(1) : "—"} caption={`${p.totalReviews} reviews`} />
        <StatCard label="Experience" value={p.yearsOfExperience != null ? `${p.yearsOfExperience} yrs` : "—"} />
        <StatCard label="People served" value={p.experienceCount != null ? p.experienceCount.toLocaleString("en-IN") : "—"} />
        <StatCard label="Commission" value={`${p.commissionRatePercent}%`} />
      </div>

      <DetailList
        title="Contact"
        rows={[
          { label: "Contact person", value: displayName(p) },
          { label: "Email", value: p.email },
          { label: "Mobile", value: p.phone },
          { label: "Provider ID / user ID", value: `#${p.id} / #${p.userId}` },
        ]}
      />
      <DetailList
        title="Listing"
        rows={[
          { label: "City", value: p.city || null },
          { label: "Pincodes served", value: p.pincodes?.length ? p.pincodes.join(", ") : null },
          { label: "Registered address", value: p.registeredAddress },
          {
            label: "Website",
            value: p.websiteUrl ? (
              <a href={p.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-primary underline">
                {p.websiteUrl}
              </a>
            ) : null,
          },
          { label: "Categories", value: p.categories?.length ? p.categories.map((c) => c.name).join(", ") : null },
          { label: "Accepting new requests", value: p.isAvailable ? "Yes" : "No" },
          { label: "Beds available", value: p.bedsAvailable ? "Yes" : "No" },
          { label: "About", value: p.aboutText },
        ]}
      />

      {dialog === "edit" && (
        <ProviderEditModal
          provider={p}
          onClose={() => setDialog(null)}
          onSubmit={async (input, commission) => {
            await saveProvider(p, input, commission);
            done("Changes saved.");
          }}
        />
      )}
      <ProviderDecisionDialogs
        dialog={dialog && dialog !== "edit" ? { type: dialog, provider: p } : null}
        onClose={() => setDialog(null)}
        onDone={done}
        onDeleted={() => router.push("/admin/providers")}
      />
    </div>
  );
}

export default ProviderAdminDetail;
