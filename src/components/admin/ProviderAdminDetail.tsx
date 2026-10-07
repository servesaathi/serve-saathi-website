"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { BackLink } from "@/components/services/BackLink";
import { adminSource, displayName, providerName, useAdminQuery } from "@/lib/admin";
import { ProviderEditModal } from "./ProviderModals";
import { ActiveSwitch, ProviderDecisionDialogs, VerificationBadge, saveProvider } from "./ProvidersScreen";
import { ActionButton, DetailList, Flash, PageHeader, formatDate } from "./parts";

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
    <div className="flex flex-col gap-6">
      <BackLink href="/admin/providers" label="All providers" />
      <PageHeader
        title={providerName(p)}
        description={<VerificationBadge status={p.verificationStatus} />}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <ActiveSwitch
              provider={p}
              onChange={async (next) => {
                try {
                  await providers.setActive(p.id, next);
                  done(next ? "Listing is visible to families." : "Listing hidden from families.");
                } catch (err) {
                  setFlash({ message: err instanceof Error ? err.message : "Couldn't update listing.", tone: "error" });
                }
              }}
            />
            {p.verificationStatus !== "verified" && (
              <ActionButton tone="primary" onClick={() => setDialog("verify")}>
                Verify
              </ActionButton>
            )}
            {p.verificationStatus !== "rejected" && (
              <ActionButton tone="danger" onClick={() => setDialog("reject")}>
                Reject
              </ActionButton>
            )}
            <ActionButton onClick={() => setDialog("edit")}>Edit</ActionButton>
            <ActionButton tone="danger" onClick={() => setDialog("delete")}>
              Delete
            </ActionButton>
          </div>
        }
      />
      {flash && <Flash {...flash} onDismiss={() => setFlash(undefined)} />}

      <h2 className="text-[22px] leading-[30px] font-semibold text-text-primary">Contact</h2>
      <DetailList
        rows={[
          { label: "Contact person", value: displayName(p) },
          { label: "Email", value: p.email },
          { label: "Mobile", value: p.phone },
          { label: "Provider ID / user ID", value: `#${p.id} / #${p.userId}` },
        ]}
      />

      <h2 className="text-[22px] leading-[30px] font-semibold text-text-primary">Listing</h2>
      <DetailList
        rows={[
          { label: "City", value: p.city || null },
          { label: "Pincodes served", value: p.pincodes.length ? p.pincodes.join(", ") : null },
          { label: "Registered address", value: p.registeredAddress },
          {
            label: "Website",
            value: p.websiteUrl ? (
              <a href={p.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-primary underline">
                {p.websiteUrl}
              </a>
            ) : null,
          },
          { label: "Years of experience", value: p.yearsOfExperience?.toString() ?? null },
          { label: "Rating", value: p.totalReviews ? `${p.averageRating.toFixed(1)} from ${p.totalReviews} reviews` : "No reviews yet" },
          { label: "Accepting new requests", value: p.isAvailable ? "Yes" : "No" },
          { label: "Beds available", value: p.bedsAvailable ? "Yes" : "No" },
          { label: "Commission", value: `${p.commissionRatePercent}%` },
          { label: "Joined", value: formatDate(p.createdAt) },
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
