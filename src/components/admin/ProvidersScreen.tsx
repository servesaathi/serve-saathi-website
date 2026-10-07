"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import {
  adminSource,
  displayName,
  providerName,
  useAdminQuery,
  type AdminProvider,
  type ProviderUpdateInput,
  type VerificationStatus,
} from "@/lib/admin";
import { ConfirmDialog } from "./ConfirmDialog";
import { ProviderCreateModal, ProviderEditModal } from "./ProviderModals";
import { ActionButton, ActionLink, AdminPagination, Badge, Flash, PageHeader, TABLE } from "./parts";

// /admin/providers — GET /providers/admin (all providers incl. pending and
// inactive; filter by city, paged). Every action here is a live endpoint.

const LIMIT = 10;
const providers = adminSource.providers;

export function VerificationBadge({ status }: { status: VerificationStatus }) {
  const map = { verified: ["green", "Verified"], pending: ["orange", "Pending review"], rejected: ["red", "Rejected"] } as const;
  const [tone, label] = map[status];
  return <Badge tone={tone}>{label}</Badge>;
}

/** Active/inactive switch — PATCH /providers/{id}/status. Inactive providers are hidden from families. */
export function ActiveSwitch({ provider, onChange }: { provider: AdminProvider; onChange: (next: boolean) => Promise<void> }) {
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      role="switch"
      aria-checked={provider.isActive}
      aria-label={`${providerName(provider)} listed`}
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        try {
          await onChange(!provider.isActive);
        } finally {
          setBusy(false);
        }
      }}
      className="flex h-10 items-center gap-2 rounded-control px-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50"
    >
      <span className={`flex h-6 w-11 items-center rounded-full p-0.5 transition-colors ${provider.isActive ? "bg-primary" : "bg-[#c9c7c5]"}`}>
        <span className={`size-5 rounded-full bg-white shadow transition-transform ${provider.isActive ? "translate-x-5" : ""}`} />
      </span>
      <span className="text-[15px] text-text-secondary">{provider.isActive ? "Listed" : "Hidden"}</span>
    </button>
  );
}

/** Save from the edit modal: profile via PUT, commission via its own PATCH only if it changed. */
export async function saveProvider(p: AdminProvider, input: ProviderUpdateInput, commission: number) {
  await providers.update(p.id, input);
  if (commission !== p.commissionRatePercent) await providers.setCommission(p.id, commission);
}

type Dialog =
  | { type: "add" }
  | { type: "edit"; provider: AdminProvider }
  | { type: "delete"; provider: AdminProvider }
  | { type: "verify" | "reject"; provider: AdminProvider }
  | null;

export function ProvidersScreen() {
  const [page, setPage] = useState(1);
  const [cityDraft, setCityDraft] = useState("");
  const [city, setCity] = useState("");
  const [dialog, setDialog] = useState<Dialog>(null);
  const [flash, setFlash] = useState<{ message: string; tone: "success" | "error" }>();

  const { data, error, loading, reload } = useAdminQuery(`providers:${page}:${city}`, () =>
    providers.list({ page, limit: LIMIT, city })
  );

  function done(message: string) {
    setFlash({ message, tone: "success" });
    reload();
  }

  function applyCity(e: FormEvent) {
    e.preventDefault();
    setPage(1);
    setCity(cityDraft.trim());
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Providers"
        description={data ? `${data.meta.total} providers, including pending and hidden` : "Every provider on ServeSaathi"}
        action={<Button onClick={() => setDialog({ type: "add" })}>Add provider</Button>}
      />

      <form onSubmit={applyCity} role="search" className="flex items-end gap-3 md:max-w-[520px]">
        <div className="flex flex-1 flex-col gap-1">
          <label htmlFor="provider-city" className="text-[16px] leading-[22px] font-semibold text-text-primary">
            City
          </label>
          <input
            id="provider-city"
            type="search"
            value={cityDraft}
            onChange={(e) => setCityDraft(e.target.value)}
            placeholder="e.g. Mumbai"
            className="h-12 w-full rounded-input border-[1.5px] border-border-hairline bg-bg-base px-4 text-[16px] text-text-primary placeholder:text-text-tertiary focus:border-primary focus:outline-none"
          />
        </div>
        <Button type="submit" variant="secondary">
          Filter
        </Button>
      </form>

      {flash && <Flash {...flash} onDismiss={() => setFlash(undefined)} />}
      {error && <Flash message={`Couldn't load providers: ${error}`} tone="error" onDismiss={reload} />}

      <div className={TABLE.wrap} aria-busy={loading}>
        <table className={TABLE.table}>
          <caption className="sr-only">Providers</caption>
          <thead>
            <tr>
              <th scope="col" className={TABLE.th}>Provider</th>
              <th scope="col" className={TABLE.th}>City</th>
              <th scope="col" className={TABLE.th}>Verification</th>
              <th scope="col" className={TABLE.th}>Listing</th>
              <th scope="col" className={TABLE.th}>Rating</th>
              <th scope="col" className={TABLE.th}>Commission</th>
              <th scope="col" className={`${TABLE.th} text-right`}>Actions</th>
            </tr>
          </thead>
          <tbody className={loading ? "opacity-50" : ""}>
            {data?.items.map((p) => (
              <tr key={p.id}>
                <td className={TABLE.td}>
                  <span className="font-semibold text-text-primary">{providerName(p)}</span>
                  <span className="block text-[14px] text-text-tertiary">
                    {p.legalName && <span className="block">{displayName(p)}</span>}
                    <span className="block break-all">{p.email ?? "No email"}</span>
                  </span>
                </td>
                <td className={TABLE.td}>{p.city || "—"}</td>
                <td className={TABLE.td}>
                  <div className="flex flex-col items-start gap-2">
                    <VerificationBadge status={p.verificationStatus} />
                    {p.verificationStatus === "pending" && (
                      <div className="flex gap-2">
                        <ActionButton tone="primary" onClick={() => setDialog({ type: "verify", provider: p })} aria-label={`Verify ${providerName(p)}`}>
                          Verify
                        </ActionButton>
                        <ActionButton tone="danger" onClick={() => setDialog({ type: "reject", provider: p })} aria-label={`Reject ${providerName(p)}`}>
                          Reject
                        </ActionButton>
                      </div>
                    )}
                  </div>
                </td>
                <td className={TABLE.td}>
                  <ActiveSwitch
                    provider={p}
                    onChange={async (next) => {
                      try {
                        await providers.setActive(p.id, next);
                        done(`${providerName(p)} is now ${next ? "listed" : "hidden"}.`);
                      } catch (err) {
                        setFlash({ message: err instanceof Error ? err.message : "Couldn't update listing.", tone: "error" });
                      }
                    }}
                  />
                </td>
                <td className={`${TABLE.td} whitespace-nowrap`}>
                  {p.totalReviews ? `${p.averageRating.toFixed(1)} (${p.totalReviews})` : "No reviews"}
                </td>
                <td className={TABLE.td}>{p.commissionRatePercent}%</td>
                <td className={TABLE.td}>
                  <div className="flex justify-end gap-2">
                    <ActionLink href={`/admin/providers/${p.id}`}>View</ActionLink>
                    <ActionButton onClick={() => setDialog({ type: "edit", provider: p })} aria-label={`Edit ${providerName(p)}`}>
                      Edit
                    </ActionButton>
                    <ActionButton tone="danger" onClick={() => setDialog({ type: "delete", provider: p })} aria-label={`Delete ${providerName(p)}`}>
                      Delete
                    </ActionButton>
                  </div>
                </td>
              </tr>
            ))}
            {data && data.items.length === 0 && (
              <tr>
                <td colSpan={7} className={`${TABLE.td} py-10 text-center`}>
                  No providers{city ? ` in “${city}”` : ""} yet.
                </td>
              </tr>
            )}
            {!data && !error && (
              <tr>
                <td colSpan={7} className={`${TABLE.td} py-10 text-center`}>
                  Loading providers…
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {data && <AdminPagination meta={data.meta} onPage={setPage} />}

      {dialog?.type === "add" && (
        <ProviderCreateModal
          onClose={() => setDialog(null)}
          onSubmit={async (input) => {
            await providers.create(input);
            setPage(1);
            done(`Added ${input.firstName} ${input.lastName} as a provider (pending verification).`);
          }}
        />
      )}
      {dialog?.type === "edit" && (
        <ProviderEditModal
          key={dialog.provider.id}
          provider={dialog.provider}
          onClose={() => setDialog(null)}
          onSubmit={async (input, commission) => {
            await saveProvider(dialog.provider, input, commission);
            done(`Saved ${input.legalName || providerName(dialog.provider)}.`);
          }}
        />
      )}
      <ProviderDecisionDialogs dialog={dialog} onClose={() => setDialog(null)} onDone={done} />
    </div>
  );
}

/** Verify / reject / delete confirmations, shared with the detail page. */
export function ProviderDecisionDialogs({
  dialog,
  onClose,
  onDone,
  onDeleted,
}: {
  dialog: { type: string; provider?: AdminProvider } | null;
  onClose: () => void;
  onDone: (message: string) => void;
  onDeleted?: () => void;
}) {
  const p = dialog && "provider" in dialog ? dialog.provider : undefined;
  const name = p ? providerName(p) : "";
  return (
    <>
      <ConfirmDialog
        open={dialog?.type === "verify"}
        onClose={onClose}
        title="Verify provider?"
        confirmLabel="Mark as verified"
        message={<p>{name} will show the “Verified Partner” badge to families. Only verify after checking their documents.</p>}
        onConfirm={async () => {
          await providers.verify(p!.id);
          onDone(`${name} is verified.`);
        }}
      />
      <ConfirmDialog
        open={dialog?.type === "reject"}
        onClose={onClose}
        title="Reject provider?"
        confirmLabel="Reject"
        destructive
        message={<p>{name}&apos;s application will be marked rejected. You can verify them later if they resubmit.</p>}
        onConfirm={async () => {
          await providers.reject(p!.id);
          onDone(`${name} was rejected.`);
        }}
      />
      <ConfirmDialog
        open={dialog?.type === "delete"}
        onClose={onClose}
        title="Delete provider?"
        confirmLabel="Delete permanently"
        destructive
        message={
          <p>
            This permanently removes <strong>{name}</strong> and their listing. It can&apos;t be undone — to take them
            off the site temporarily, switch their listing to Hidden instead.
          </p>
        }
        onConfirm={async () => {
          await providers.remove(p!.id);
          if (onDeleted) onDeleted();
          else onDone(`Deleted ${name}.`);
        }}
      />
    </>
  );
}

export default ProvidersScreen;
