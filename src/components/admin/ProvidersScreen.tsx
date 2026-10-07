"use client";

import { useState } from "react";
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
import {
  AdminPagination,
  Badge,
  Flash,
  ICONS,
  Icon,
  IconButton,
  IconLink,
  Identity,
  MobileCard,
  PageHeader,
  SearchBar,
  StatCard,
  StatGrid,
  TABLE,
  TableState,
} from "./parts";

// /admin/providers — GET /providers/admin (all providers incl. pending and
// hidden; filter by city, paged). Every action here is a live endpoint.

const LIMIT = 10;
/** The API can't filter by verification status, so the summary counts the newest N. */
const STATS_SAMPLE = 100;
const providers = adminSource.providers;

export function VerificationBadge({ status }: { status: VerificationStatus }) {
  const map = { verified: ["green", "Verified"], pending: ["orange", "Pending review"], rejected: ["red", "Rejected"] } as const;
  const [tone, label] = map[status];
  return <Badge tone={tone}>{label}</Badge>;
}

/**
 * Active/Deactivated switch — PATCH /providers/{id}/status. Per the backend
 * (2026-10): this flips the provider's User.isBanned, i.e. blocks or restores
 * their login without deleting data. Public visibility is decided by
 * verification status, not this switch.
 */
export function ActiveSwitch({ provider, onChange }: { provider: AdminProvider; onChange: (next: boolean) => Promise<void> }) {
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      role="switch"
      aria-checked={provider.isActive}
      aria-label={`${providerName(provider)} account active`}
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        try {
          await onChange(!provider.isActive);
        } finally {
          setBusy(false);
        }
      }}
      className="flex h-11 items-center gap-2 rounded-control px-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50"
    >
      <span className={`flex h-6 w-11 items-center rounded-full p-0.5 transition-colors ${provider.isActive ? "bg-primary" : "bg-[#c9c7c5]"}`}>
        <span className={`size-5 rounded-full bg-white shadow transition-transform ${provider.isActive ? "translate-x-5" : ""}`} />
      </span>
      <span className="text-[16px] text-text-secondary">{provider.isActive ? "Active" : "Deactivated"}</span>
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
  | { type: "delete" | "verify" | "reject"; provider: AdminProvider }
  | null;

function rating(p: AdminProvider) {
  return p.totalReviews ? `${p.averageRating.toFixed(1)} (${p.totalReviews})` : "New";
}

export function ProvidersScreen() {
  const [page, setPage] = useState(1);
  const [cityDraft, setCityDraft] = useState("");
  const [city, setCity] = useState("");
  const [dialog, setDialog] = useState<Dialog>(null);
  const [flash, setFlash] = useState<{ message: string; tone: "success" | "error" }>();
  const [version, setVersion] = useState(0);

  const { data, error, loading, reload } = useAdminQuery(`providers:${page}:${city}:${version}`, () =>
    providers.list({ page, limit: LIMIT, city })
  );
  const stats = useAdminQuery(`provider-stats:${version}`, () => providers.list({ page: 1, limit: STATS_SAMPLE }));

  function done(message: string) {
    setFlash({ message, tone: "success" });
    setVersion((v) => v + 1);
  }

  async function toggleListing(p: AdminProvider, next: boolean) {
    try {
      await providers.setActive(p.id, next);
      done(next ? `${providerName(p)} can sign in again.` : `${providerName(p)} is deactivated — their login is blocked.`);
    } catch (err) {
      setFlash({ message: err instanceof Error ? err.message : "Couldn't update listing.", tone: "error" });
    }
  }

  const sample = stats.data?.items ?? [];
  const count = (s: VerificationStatus) => sample.filter((p) => p.verificationStatus === s).length;
  const sampled = (stats.data?.meta.total ?? 0) > STATS_SAMPLE ? `Of the newest ${STATS_SAMPLE}` : undefined;

  function verificationCell(p: AdminProvider) {
    return (
      <div className="flex items-center gap-1">
        <VerificationBadge status={p.verificationStatus} />
        {p.verificationStatus === "pending" && (
          <>
            <IconButton icon={ICONS.success} tone="primary" label={`Verify ${providerName(p)}`} onClick={() => setDialog({ type: "verify", provider: p })} />
            <IconButton icon={ICONS.close} tone="danger" label={`Reject ${providerName(p)}`} onClick={() => setDialog({ type: "reject", provider: p })} />
          </>
        )}
      </div>
    );
  }

  function rowActions(p: AdminProvider) {
    const name = providerName(p);
    return (
      <div className="flex items-center justify-end gap-1">
        <IconLink icon={ICONS.view} label={`View ${name}`} href={`/admin/providers/${p.id}`} />
        <IconButton icon={ICONS.edit} label={`Edit ${name}`} onClick={() => setDialog({ type: "edit", provider: p })} />
        <IconButton icon={ICONS.delete} tone="danger" label={`Delete ${name}`} onClick={() => setDialog({ type: "delete", provider: p })} />
      </div>
    );
  }

  const sub = (p: AdminProvider) => [p.legalName ? displayName(p) : null, p.email].filter(Boolean).join(" · ") || "No contact details";

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Providers"
        description="Care organisations on ServeSaathi — verify applications (only verified providers are public) and manage their accounts."
        action={
          <Button onClick={() => setDialog({ type: "add" })} leftIcon={<Icon src={ICONS.add} size={22} />}>
            Add provider
          </Button>
        }
      />

      <StatGrid>
        <StatCard label="All providers" value={stats.data ? stats.data.meta.total : "—"} loading={stats.loading} />
        <StatCard label="Verified" value={stats.data ? count("verified") : "—"} caption={sampled} loading={stats.loading} />
        <StatCard label="Pending review" value={stats.data ? count("pending") : "—"} caption={sampled} loading={stats.loading} />
        <StatCard label="Rejected" value={stats.data ? count("rejected") : "—"} caption={sampled} loading={stats.loading} />
      </StatGrid>

      <section className="flex flex-col gap-4" aria-labelledby="providers-list-title">
        <div className="flex items-center justify-between">
          <h2 id="providers-list-title" className="text-[24px] leading-8 font-semibold text-text-primary">
            All providers
          </h2>
          {data && (
            <p className="text-[16px] text-text-muted" aria-live="polite">
              {data.meta.total} {city ? `in “${city}”` : "total"}
            </p>
          )}
        </div>

        <SearchBar
          id="provider-city"
          label="Filter providers by city"
          value={cityDraft}
          onChange={setCityDraft}
          onSubmit={() => {
            setPage(1);
            setCity(cityDraft.trim());
          }}
          placeholder="Filter by city, e.g. Mumbai"
        />

        {flash && <Flash {...flash} onDismiss={() => setFlash(undefined)} />}
        {error && <Flash message={`Couldn't load providers: ${error}`} tone="error" onDismiss={reload} />}

        <div className={TABLE.wrap} aria-busy={loading}>
          <table className={TABLE.table}>
            <caption className="sr-only">Providers</caption>
            <colgroup>
              <col className="w-[27%]" />
              <col className="w-[11%]" />
              <col className="w-[26%]" />
              <col className="w-[13%]" />
              <col className="w-[9%]" />
              <col className="w-[160px]" />
            </colgroup>
            <thead>
              <tr>
                <th scope="col" className={TABLE.th}>Provider</th>
                <th scope="col" className={TABLE.th}>City</th>
                <th scope="col" className={TABLE.th}>Verification</th>
                <th scope="col" className={TABLE.th}>Account</th>
                <th scope="col" className={TABLE.th}>Rating</th>
                <th scope="col" className={`${TABLE.th} text-right`}>Actions</th>
              </tr>
            </thead>
            <tbody className={`transition-opacity ${loading && data ? "opacity-60" : ""}`}>
              {data?.items.map((p) => (
                <tr key={p.id} className="group/row">
                  <td className={`${TABLE.td} group-hover/row:bg-[#fbfdfb]`}>
                    <Identity name={providerName(p)} sub={sub(p)} href={`/admin/providers/${p.id}`} />
                  </td>
                  <td className={`${TABLE.td} group-hover/row:bg-[#fbfdfb]`}>{p.city || "—"}</td>
                  <td className={`${TABLE.td} py-1.5 group-hover/row:bg-[#fbfdfb]`}>{verificationCell(p)}</td>
                  <td className={`${TABLE.td} py-1.5 group-hover/row:bg-[#fbfdfb]`}>
                    <ActiveSwitch provider={p} onChange={(next) => toggleListing(p, next)} />
                  </td>
                  <td className={`${TABLE.td} whitespace-nowrap group-hover/row:bg-[#fbfdfb]`}>{rating(p)}</td>
                  <td className={`${TABLE.td} py-1.5 group-hover/row:bg-[#fbfdfb]`}>{rowActions(p)}</td>
                </tr>
              ))}
              {data && data.items.length === 0 && <TableState colSpan={6}>No providers{city ? ` in “${city}”` : ""} yet.</TableState>}
              {!data && !error && <TableState colSpan={6}>Loading providers…</TableState>}
            </tbody>
          </table>
        </div>

        <ul className={`flex flex-col gap-3 md:hidden ${loading && data ? "opacity-60" : ""}`} aria-label="Providers">
          {data?.items.map((p) => (
            <MobileCard key={p.id}>
              <Identity name={providerName(p)} sub={sub(p)} href={`/admin/providers/${p.id}`} />
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[15px] text-text-muted">
                <span>{p.city || "No city"}</span>
                <span>{rating(p)}</span>
                <span>{p.commissionRatePercent}% commission</span>
              </div>
              {verificationCell(p)}
              <div className="flex items-center justify-between border-t border-border-hairline pt-2">
                <ActiveSwitch provider={p} onChange={(next) => toggleListing(p, next)} />
                {rowActions(p)}
              </div>
            </MobileCard>
          ))}
          {data && data.items.length === 0 && <li className="py-8 text-center text-text-muted">No providers yet.</li>}
          {!data && !error && <li className="py-8 text-center text-text-muted">Loading providers…</li>}
        </ul>

        {data && data.meta.totalPages > 1 && <AdminPagination meta={data.meta} onPage={setPage} />}
      </section>

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
        message={<p>{name} will appear in the public provider listing with the “Verified Partner” badge. Only verify after checking their documents and profile.</p>}
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
        message={<p>{name}&apos;s application will be marked rejected and they stay hidden from families. You can verify them later if they resubmit.</p>}
        onConfirm={async () => {
          await providers.reject(p!.id);
          onDone(`${name} was rejected.`);
        }}
      />
      <ConfirmDialog
        open={dialog?.type === "delete"}
        onClose={onClose}
        title="Remove provider?"
        confirmLabel="Remove provider"
        destructive
        message={
          <p>
            Removes <strong>{name}</strong>&apos;s provider profile from the platform. Their login account itself is kept. To
            block them temporarily instead, switch their account to Deactivated.
          </p>
        }
        onConfirm={async () => {
          await providers.remove(p!.id);
          if (onDeleted) onDeleted();
          else onDone(`Removed ${name}.`);
        }}
      />
    </>
  );
}

export default ProvidersScreen;
