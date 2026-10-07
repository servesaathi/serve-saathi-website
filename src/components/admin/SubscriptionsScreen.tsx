"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { TextInput } from "@/components/ui/TextInput";
import { getErrorMessage } from "@/lib/api/types";
import {
  adminSource,
  formatINR,
  useAdminQuery,
  type AdminSubscription,
  type PlanInput,
  type SubscriptionPlan,
  type SubscriptionStatus,
} from "@/lib/admin";
import { ConfirmDialog } from "./ConfirmDialog";
import {
  ActionButton,
  AdminPagination,
  Badge,
  Flash,
  ICONS,
  Icon,
  MobileCard,
  Notice,
  PageHeader,
  TABLE,
  TableState,
  Tabs,
  formatDate,
} from "./parts";

// /admin/subscriptions — Plans: GET /subscription-plans/admin, POST
// /subscription-plans, PATCH /subscription-plans/:id (incl. isActive).
// There is no delete endpoint: retiring a plan = deactivating it.
// Subscribers: GET /subscriptions (paged, includes the plan relation).

const plans = adminSource.plans;

const SUB_STATUS: Record<SubscriptionStatus, { tone: "green" | "orange" | "red" | "grey"; label: string }> = {
  active: { tone: "green", label: "Active" },
  past_due: { tone: "orange", label: "Payment due" },
  cancelled: { tone: "grey", label: "Cancelled" },
  expired: { tone: "red", label: "Expired" },
};

function savings(p: SubscriptionPlan) {
  const full = p.monthlyPrice * 12;
  if (!full || p.annualPrice >= full) return null;
  return Math.round(((full - p.annualPrice) / full) * 100);
}

/* ---------------- plan form ---------------- */

function PlanModal({ plan, onClose, onSaved }: { plan?: SubscriptionPlan; onClose: () => void; onSaved: (p: SubscriptionPlan, created: boolean) => void }) {
  const [v, setV] = useState({
    name: plan?.name ?? "",
    description: plan?.description ?? "",
    benefits: (plan?.benefits ?? []).join("\n"),
    monthly: plan ? String(plan.monthlyPrice) : "",
    annual: plan ? String(plan.annualPrice) : "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof typeof v, string>>>({});
  const [formError, setFormError] = useState<string>();
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof v) => (e: { target: { value: string } }) => {
    setV((p) => ({ ...p, [k]: e.target.value }));
    setErrors((p) => ({ ...p, [k]: undefined }));
  };

  async function submit(e: FormEvent) {
    e.preventDefault();
    const monthly = Number(v.monthly);
    const annual = Number(v.annual);
    const found: typeof errors = {};
    if (!v.name.trim()) found.name = "Give the plan a name.";
    if (v.monthly.trim() === "" || !Number.isFinite(monthly) || monthly < 0) found.monthly = "Enter a monthly price (0 or more).";
    if (v.annual.trim() === "" || !Number.isFinite(annual) || annual < 0) found.annual = "Enter an annual price (0 or more).";
    setErrors(found);
    if (Object.keys(found).length) return;

    const input: PlanInput = {
      name: v.name.trim(),
      description: v.description.trim() || undefined,
      benefits: v.benefits.split("\n").map((b) => b.trim()).filter(Boolean),
      monthlyPrice: monthly,
      annualPrice: annual,
    };
    setBusy(true);
    setFormError(undefined);
    try {
      const saved = plan ? await plans.update(plan.id, input) : await plans.create(input);
      onSaved(saved, !plan);
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
      size="lg"
      onClose={() => !busy && onClose()}
      title={plan ? "Edit plan" : "Add plan"}
      description={plan ? `Changes apply to new sign-ups and renewals.` : "New plans are active as soon as they're created."}
      actions={
        <>
          <Button variant="light" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button type="submit" form="plan-form" loading={busy}>
            {plan ? "Save changes" : "Add plan"}
          </Button>
        </>
      }
    >
      <form id="plan-form" onSubmit={submit} noValidate className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <TextInput label="Plan name" requiredMark value={v.name} onChange={set("name")} error={errors.name} containerClassName="sm:col-span-2" />
        <TextInput label="Monthly price (₹)" requiredMark inputMode="decimal" value={v.monthly} onChange={set("monthly")} error={errors.monthly} />
        <TextInput label="Annual price (₹)" requiredMark inputMode="decimal" value={v.annual} onChange={set("annual")} error={errors.annual} />
        <div className="flex flex-col gap-1 sm:col-span-2">
          <label htmlFor="plan-description" className="text-[16px] leading-[22px] font-semibold text-text-primary">
            Description
          </label>
          <textarea id="plan-description" rows={2} value={v.description} onChange={set("description")} className="w-full rounded-input border-[1.5px] border-border-hairline bg-bg-base px-4 py-3 text-[16px] leading-[22px] text-text-primary focus:border-primary focus:outline-none" />
        </div>
        <div className="flex flex-col gap-1 sm:col-span-2">
          <label htmlFor="plan-benefits" className="text-[16px] leading-[22px] font-semibold text-text-primary">
            Benefits <span className="font-normal text-text-tertiary">(one per line)</span>
          </label>
          <textarea id="plan-benefits" rows={4} value={v.benefits} onChange={set("benefits")} placeholder={"Helpline access\nMonthly care-plan review"} className="w-full rounded-input border-[1.5px] border-border-hairline bg-bg-base px-4 py-3 text-[16px] leading-[22px] text-text-primary focus:border-primary focus:outline-none" />
        </div>
        {formError && (
          <p role="alert" className="text-[14px] leading-5 text-error sm:col-span-2">
            {formError}
          </p>
        )}
      </form>
    </Modal>
  );
}

/* ---------------- plans tab ---------------- */

function PlanCard({ plan, onEdit, onToggle }: { plan: SubscriptionPlan; onEdit: () => void; onToggle: () => void }) {
  const save = savings(plan);
  return (
    <li className={`flex flex-col gap-4 rounded-card bg-bg-base p-6 ${plan.isActive ? "" : "opacity-80"}`}>
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-[22px] leading-[30px] font-semibold text-text-primary">{plan.name}</h3>
        {plan.isActive ? <Badge tone="green">Active</Badge> : <Badge tone="grey">Inactive</Badge>}
      </div>
      {plan.description && <p className="text-[16px] leading-[22px] text-text-secondary">{plan.description}</p>}
      <div className="flex flex-col gap-1 border-y border-border-hairline py-4">
        <p className="text-tertiary">
          <span className="text-[32px] leading-10 tabular-nums">{formatINR(plan.monthlyPrice)}</span>
          <span className="text-[16px] text-text-muted"> / month</span>
        </p>
        <p className="text-[16px] text-text-secondary">
          {formatINR(plan.annualPrice)} / year{save ? <span className="ml-2 font-semibold text-primary-pressed">save {save}%</span> : null}
        </p>
      </div>
      {plan.benefits.length > 0 ? (
        <ul className="flex flex-1 flex-col gap-2">
          {plan.benefits.map((b) => (
            <li key={b} className="flex items-start gap-2 text-[16px] leading-[22px] text-text-secondary">
              <Icon src={ICONS.success} size={20} className="mt-px text-primary" />
              {b}
            </li>
          ))}
        </ul>
      ) : (
        <p className="flex-1 text-[15px] text-text-muted">No benefits listed.</p>
      )}
      <div className="flex gap-2">
        <ActionButton icon={ICONS.edit} onClick={onEdit} className="flex-1">
          Edit
        </ActionButton>
        <ActionButton icon={plan.isActive ? ICONS.close : ICONS.success} tone={plan.isActive ? "danger" : "primary"} onClick={onToggle} className="flex-1">
          {plan.isActive ? "Deactivate" : "Activate"}
        </ActionButton>
      </div>
    </li>
  );
}

function PlansTab() {
  const [version, setVersion] = useState(0);
  const [editing, setEditing] = useState<SubscriptionPlan | "new" | null>(null);
  const [toggling, setToggling] = useState<SubscriptionPlan | null>(null);
  const [flash, setFlash] = useState<string>();
  const { data, error, loading, reload } = useAdminQuery(`plans:${version}`, () => plans.list({ page: 1, limit: 100 }));
  const done = (m: string) => {
    setFlash(m);
    setVersion((x) => x + 1);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-[24px] leading-8 font-semibold text-text-primary">
          Plans {data && <span className="text-[18px] font-normal text-text-muted">· {data.items.filter((p) => p.isActive).length} active</span>}
        </h2>
        <Button onClick={() => setEditing("new")} leftIcon={<Icon src={ICONS.add} size={22} />}>
          Add plan
        </Button>
      </div>
      <p className="-mt-3 text-[15px] text-text-muted">Plans can&apos;t be deleted — deactivate one to stop new sign-ups. Existing subscribers keep it until they cancel.</p>

      {flash && <Flash message={flash} tone="success" onDismiss={() => setFlash(undefined)} />}
      {error && <Flash message={`Couldn't load plans: ${error}`} tone="error" onDismiss={reload} />}
      {!data && !error && <p aria-busy>Loading plans…</p>}
      {data && data.items.length === 0 && (
        <Notice tone="orange" title="No plans yet">
          Add the first subscription plan — it appears to families as soon as it&apos;s saved.
        </Notice>
      )}
      <ul className={`grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 ${loading && data ? "opacity-60" : ""}`}>
        {data?.items.map((p) => (
          <PlanCard key={p.id} plan={p} onEdit={() => setEditing(p)} onToggle={() => setToggling(p)} />
        ))}
      </ul>

      {editing && (
        <PlanModal
          key={editing === "new" ? "new" : editing.id}
          plan={editing === "new" ? undefined : editing}
          onClose={() => setEditing(null)}
          onSaved={(p, created) => done(created ? `Added “${p.name}”.` : `Saved “${p.name}”.`)}
        />
      )}
      <ConfirmDialog
        open={Boolean(toggling)}
        onClose={() => setToggling(null)}
        title={toggling?.isActive ? "Deactivate plan?" : "Activate plan?"}
        confirmLabel={toggling?.isActive ? "Deactivate" : "Activate"}
        destructive={toggling?.isActive}
        message={
          toggling?.isActive ? (
            <p>
              Families won&apos;t be able to choose <strong>{toggling.name}</strong> any more. Existing subscribers keep it until
              they cancel.
            </p>
          ) : (
            <p>
              <strong>{toggling?.name}</strong> will be offered to families again.
            </p>
          )
        }
        onConfirm={async () => {
          if (!toggling) return;
          await plans.update(toggling.id, { isActive: !toggling.isActive });
          done(`“${toggling.name}” is now ${toggling.isActive ? "inactive" : "active"}.`);
        }}
      />
    </div>
  );
}

/* ---------------- subscribers tab ---------------- */

function SubscribersTab() {
  const [page, setPage] = useState(1);
  const { data, error, loading, reload } = useAdminQuery(`subscriptions:${page}`, () => plans.subscriptions({ page, limit: 15 }));
  const status = (s: AdminSubscription) => {
    const st = SUB_STATUS[s.status] ?? { tone: "grey" as const, label: s.status };
    return <Badge tone={st.tone}>{st.label}</Badge>;
  };
  const planName = (s: AdminSubscription) => s.plan?.name ?? `Plan #${s.planId}`;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-[24px] leading-8 font-semibold text-text-primary">Subscribers</h2>
        {data && <p className="text-[16px] text-text-muted">{data.meta.total} total</p>}
      </div>
      {error && <Flash message={`Couldn't load subscriptions: ${error}`} tone="error" onDismiss={reload} />}

      <div className={TABLE.wrap} aria-busy={loading}>
        <table className={TABLE.table}>
          <caption className="sr-only">Subscriptions</caption>
          <thead>
            <tr>
              <th scope="col" className={TABLE.th}>Customer</th>
              <th scope="col" className={TABLE.th}>Plan</th>
              <th scope="col" className={TABLE.th}>Billing</th>
              <th scope="col" className={TABLE.th}>Status</th>
              <th scope="col" className={TABLE.th}>Current period</th>
            </tr>
          </thead>
          <tbody className={loading && data ? "opacity-60" : ""}>
            {data?.items.map((s) => (
              <tr key={s.id}>
                <td className={TABLE.td}>
                  <span className="block font-semibold text-text-primary">Customer #{s.customerId}</span>
                  <span className="block text-[15px] text-text-muted">Since {formatDate(s.createdAt)}</span>
                </td>
                <td className={TABLE.td}>{planName(s)}</td>
                <td className={TABLE.td}>{s.billingCycle?.name ?? `Cycle #${s.billingCycleId}`}</td>
                <td className={TABLE.td}>
                  {status(s)}
                  {s.cancelledAt && <span className="mt-1 block text-[14px] text-text-muted">on {formatDate(s.cancelledAt)}</span>}
                </td>
                <td className={`${TABLE.td} text-[16px]`}>
                  {formatDate(s.currentPeriodStart)} – {formatDate(s.currentPeriodEnd)}
                </td>
              </tr>
            ))}
            {data && data.items.length === 0 && <TableState colSpan={5}>No subscriptions yet.</TableState>}
            {!data && !error && <TableState colSpan={5}>Loading subscriptions…</TableState>}
          </tbody>
        </table>
      </div>

      <ul className="flex flex-col gap-3 md:hidden" aria-label="Subscriptions">
        {data?.items.map((s) => (
          <MobileCard key={s.id}>
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-text-primary">Customer #{s.customerId}</p>
                <p className="text-[15px] text-text-muted">
                  {planName(s)} · {s.billingCycle?.name ?? "—"}
                </p>
              </div>
              {status(s)}
            </div>
            <p className="text-[15px] text-text-secondary">
              {formatDate(s.currentPeriodStart)} – {formatDate(s.currentPeriodEnd)}
            </p>
          </MobileCard>
        ))}
      </ul>

      {data && data.meta.totalPages > 1 && <AdminPagination meta={data.meta} onPage={setPage} />}
    </div>
  );
}

export function SubscriptionsScreen() {
  const [tab, setTab] = useState<"plans" | "subscribers">("plans");
  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Subscriptions" description="The plans families can subscribe to, and who is subscribed." />
      <Tabs
        label="Subscription views"
        value={tab}
        onChange={setTab}
        tabs={[
          { value: "plans", label: "Plans" },
          { value: "subscribers", label: "Subscribers" },
        ]}
      />
      <div role="tabpanel">{tab === "plans" ? <PlansTab /> : <SubscribersTab />}</div>
    </div>
  );
}

export default SubscriptionsScreen;
