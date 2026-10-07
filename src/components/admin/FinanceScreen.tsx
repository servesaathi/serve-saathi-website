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
  type AdminPayment,
  type AdminWallet,
  type PaymentStatus,
  type WalletTransaction,
  type WalletTransactionReason,
} from "@/lib/admin";
import {
  AdminPagination,
  Badge,
  FilterSelect,
  Flash,
  ICONS,
  Icon,
  MobileCard,
  Notice,
  PageHeader,
  StatCard,
  StatGrid,
  TABLE,
  TableState,
  Tabs,
  formatDate,
} from "./parts";

// /admin/finance — Payments: GET /payments (?status). Wallets: GET
// /wallet/:id, GET /wallet/:id/transactions, POST /wallet/:id/adjust.
// The backend has no "list wallets" endpoint, so wallets are opened by ID
// (support usually has it from a payment, payout or ticket).

const LIMIT = 15;
const finance = adminSource.finance;

const REASONS: Record<WalletTransactionReason, string> = {
  booking_payout: "Provider payout",
  booking_payment: "Payment",
  refund: "Refund",
  admin_adjustment: "Manual adjustment",
};

function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return status === "refunded" ? <Badge tone="orange">Refunded</Badge> : <Badge tone="green">Succeeded</Badge>;
}

/* ---------------- Payments ---------------- */

function PaymentsTab() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<"" | PaymentStatus>("");
  const { data, error, loading, reload } = useAdminQuery(`payments:${page}:${status}`, () =>
    finance.payments({ page, limit: LIMIT, status: status || undefined })
  );
  const stats = useAdminQuery("payment-stats", () =>
    Promise.all([undefined, "succeeded", "refunded"].map((s) => finance.payments({ page: 1, limit: 1, status: s as PaymentStatus | undefined }).then((r) => r.meta.total)))
  );

  const row = (p: AdminPayment) => ({
    amount: formatINR(p.amount, p.currency),
    source: p.source === "wallet" ? "Wallet" : "Payment gateway",
  });

  return (
    <div className="flex flex-col gap-6">
      <StatGrid>
        {["All payments", "Succeeded", "Refunded"].map((label, i) => (
          <StatCard key={label} label={label} value={stats.data ? stats.data[i] : "—"} loading={stats.loading} />
        ))}
      </StatGrid>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h2 className="text-[24px] leading-8 font-semibold text-text-primary">Payments</h2>
        <FilterSelect
          id="payment-status"
          label="Filter payments by status"
          value={status}
          onChange={(v) => {
            setPage(1);
            setStatus(v as typeof status);
          }}
          options={[
            { value: "", label: "All statuses" },
            { value: "succeeded", label: "Succeeded" },
            { value: "refunded", label: "Refunded" },
          ]}
        />
      </div>

      {error && <Flash message={`Couldn't load payments: ${error}`} tone="error" onDismiss={reload} />}

      <div className={TABLE.wrap} aria-busy={loading}>
        <table className={TABLE.table}>
          <caption className="sr-only">Payments</caption>
          <colgroup>
            <col className="w-[17%]" />
            <col className="w-[14%]" />
            <col className="w-[13%]" />
            <col className="w-[13%]" />
            <col className="w-[15%]" />
            <col className="w-[15%]" />
            <col className="w-[13%]" />
          </colgroup>
          <thead>
            <tr>
              <th scope="col" className={TABLE.th}>Payment</th>
              <th scope="col" className={TABLE.th}>Booking</th>
              <th scope="col" className={TABLE.th}>Customer</th>
              <th scope="col" className={TABLE.th}>Provider</th>
              <th scope="col" className={`${TABLE.th} text-right`}>Amount</th>
              <th scope="col" className={TABLE.th}>Paid via</th>
              <th scope="col" className={TABLE.th}>Status</th>
            </tr>
          </thead>
          <tbody className={loading && data ? "opacity-60" : ""}>
            {data?.items.map((p) => (
              <tr key={p.id}>
                <td className={TABLE.td}>
                  <span className="block font-semibold text-text-primary">#{p.id}</span>
                  <span className="block text-[15px] text-text-muted">{formatDate(p.createdAt)}</span>
                </td>
                <td className={TABLE.td}>#{p.bookingId}</td>
                <td className={TABLE.td}>#{p.customerId}</td>
                <td className={TABLE.td}>#{p.providerId}</td>
                <td className={`${TABLE.td} text-right font-semibold text-text-primary tabular-nums`}>{row(p).amount}</td>
                <td className={TABLE.td}>
                  <span className="block">{row(p).source}</span>
                  {p.gatewayTransactionId && <span className="block truncate text-[14px] text-text-muted" title={p.gatewayTransactionId}>{p.gatewayTransactionId}</span>}
                </td>
                <td className={TABLE.td}>
                  <PaymentStatusBadge status={p.status} />
                  {p.refundedAt && <span className="mt-1 block text-[14px] text-text-muted">{formatDate(p.refundedAt)}</span>}
                </td>
              </tr>
            ))}
            {data && data.items.length === 0 && <TableState colSpan={7}>No payments{status ? ` with status “${status}”` : " yet"}.</TableState>}
            {!data && !error && <TableState colSpan={7}>Loading payments…</TableState>}
          </tbody>
        </table>
      </div>

      <ul className="flex flex-col gap-3 md:hidden" aria-label="Payments">
        {data?.items.map((p) => (
          <MobileCard key={p.id}>
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-text-primary">Payment #{p.id}</p>
                <p className="text-[15px] text-text-muted">{formatDate(p.createdAt)} · booking #{p.bookingId}</p>
              </div>
              <p className="text-[20px] font-semibold text-text-primary tabular-nums">{row(p).amount}</p>
            </div>
            <div className="flex items-center justify-between border-t border-border-hairline pt-2 text-[15px] text-text-secondary">
              <span>{row(p).source}</span>
              <PaymentStatusBadge status={p.status} />
            </div>
          </MobileCard>
        ))}
      </ul>

      {data && data.meta.totalPages > 1 && <AdminPagination meta={data.meta} onPage={setPage} />}
    </div>
  );
}

/* ---------------- Wallets ---------------- */

function AdjustWalletModal({ wallet, onClose, onDone }: { wallet: AdminWallet; onClose: () => void; onDone: (t: WalletTransaction) => void }) {
  const [direction, setDirection] = useState<"credit" | "debit">("credit");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<{ amount?: string; note?: string }>({});
  const [formError, setFormError] = useState<string>();
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const value = Number(amount);
    const found: typeof errors = {};
    if (!Number.isFinite(value) || value <= 0) found.amount = "Enter an amount greater than 0.";
    else if (Math.round(value * 100) !== value * 100) found.amount = "Use at most 2 decimal places.";
    else if (direction === "debit" && value > wallet.balance) found.amount = `Can't debit more than the balance (${formatINR(wallet.balance)}).`;
    if (note.trim().length < 3) found.note = "Add a reason of at least 3 characters — it's saved on the transaction.";
    setErrors(found);
    if (Object.keys(found).length) return;
    setBusy(true);
    setFormError(undefined);
    try {
      onDone(await finance.adjustWallet(wallet.id, { direction, amount: value, note: note.trim() }));
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
      title="Adjust wallet balance"
      description={`Wallet #${wallet.id} · current balance ${formatINR(wallet.balance)}`}
      actions={
        <>
          <Button variant="light" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button type="submit" form="adjust-wallet" loading={busy} variant={direction === "debit" ? "destructive" : "primary"}>
            {direction === "credit" ? "Credit wallet" : "Debit wallet"}
          </Button>
        </>
      }
    >
      <form id="adjust-wallet" onSubmit={submit} noValidate className="flex flex-col gap-5">
        <fieldset className="flex flex-col gap-2">
          <legend className="pb-2 text-[16px] leading-[22px] font-semibold text-text-primary">Direction</legend>
          <div className="grid grid-cols-2 gap-3">
            {(["credit", "debit"] as const).map((d) => (
              <label
                key={d}
                className={`flex h-12 cursor-pointer items-center justify-between rounded-control border-[1.5px] px-4 text-[16px] has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-primary ${
                  direction === d ? "border-tertiary bg-bg-orange text-text-primary" : "border-border-hairline bg-bg-base text-text-secondary"
                }`}
              >
                {d === "credit" ? "Credit (add money)" : "Debit (take money)"}
                <input type="radio" name="direction" className="size-5 accent-[var(--color-tertiary)]" checked={direction === d} onChange={() => setDirection(d)} />
              </label>
            ))}
          </div>
        </fieldset>
        <TextInput label="Amount (₹)" requiredMark inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} error={errors.amount} />
        <div className="flex flex-col gap-1">
          <label htmlFor="adjust-note" className={`text-[16px] leading-[22px] font-semibold ${errors.note ? "text-error" : "text-text-primary"}`}>
            Reason <span className="text-error">*</span>
          </label>
          <textarea
            id="adjust-note"
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Goodwill credit for delayed callback (ticket #4821)"
            aria-invalid={Boolean(errors.note) || undefined}
            className={`w-full rounded-input border-[1.5px] bg-bg-base px-4 py-3 text-[16px] leading-[22px] text-text-primary focus:outline-none ${errors.note ? "border-error" : "border-border-hairline focus:border-primary"}`}
          />
          {errors.note && <p className="text-[13px] leading-[17px] text-error">{errors.note}</p>}
        </div>
        {formError && (
          <p role="alert" className="text-[14px] leading-5 text-error">
            {formError}
          </p>
        )}
      </form>
    </Modal>
  );
}

function WalletPanel({ id }: { id: number }) {
  const [page, setPage] = useState(1);
  const [version, setVersion] = useState(0);
  const [adjusting, setAdjusting] = useState(false);
  const [flash, setFlash] = useState<string>();
  const wallet = useAdminQuery(`wallet:${id}:${version}`, () => finance.wallet(id));
  const txns = useAdminQuery(`wallet-txns:${id}:${page}:${version}`, () => finance.walletTransactions(id, { page, limit: LIMIT }));
  const w = wallet.data;

  if (!w) {
    return wallet.error ? <Flash message={wallet.error} tone="error" onDismiss={wallet.reload} /> : <p aria-busy>Loading wallet…</p>;
  }

  const owner = w.providerId ? `Provider #${w.providerId}` : `Customer #${w.customerId}`;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-5 rounded-card bg-bg-base p-6 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-1">
          <p className="text-[18px] leading-7 font-semibold text-text-secondary">
            Wallet #{w.id} · {owner}
          </p>
          <p className="text-[40px] leading-[48px] text-tertiary tabular-nums">{formatINR(w.balance)}</p>
          <p className="text-[16px] text-text-muted">Last updated {formatDate(w.updatedAt)}</p>
        </div>
        <Button onClick={() => setAdjusting(true)} leftIcon={<Icon src={ICONS.edit} size={22} />}>
          Adjust balance
        </Button>
      </div>

      {flash && <Flash message={flash} tone="success" onDismiss={() => setFlash(undefined)} />}

      <h3 className="text-[22px] leading-[30px] font-semibold text-text-primary">Transactions</h3>
      {txns.error && <Flash message={`Couldn't load transactions: ${txns.error}`} tone="error" onDismiss={txns.reload} />}

      <div className={TABLE.wrap} aria-busy={txns.loading}>
        <table className={TABLE.table}>
          <caption className="sr-only">Wallet transactions</caption>
          <colgroup>
            <col className="w-[16%]" />
            <col className="w-[20%]" />
            <col className="w-[16%]" />
            <col className="w-[16%]" />
            <col />
          </colgroup>
          <thead>
            <tr>
              <th scope="col" className={TABLE.th}>Date</th>
              <th scope="col" className={TABLE.th}>Type</th>
              <th scope="col" className={`${TABLE.th} text-right`}>Amount</th>
              <th scope="col" className={`${TABLE.th} text-right`}>Balance after</th>
              <th scope="col" className={TABLE.th}>Note / reference</th>
            </tr>
          </thead>
          <tbody className={txns.loading && txns.data ? "opacity-60" : ""}>
            {txns.data?.items.map((t) => (
              <tr key={t.id}>
                <td className={`${TABLE.td} whitespace-nowrap`}>{formatDate(t.createdAt)}</td>
                <td className={TABLE.td}>{REASONS[t.reason] ?? t.reason}</td>
                <td className={`${TABLE.td} text-right font-semibold tabular-nums ${t.type === "credit" ? "text-primary-pressed" : "text-error"}`}>
                  {t.type === "credit" ? "+" : "−"}
                  {formatINR(t.amount)}
                  <span className="sr-only">{t.type === "credit" ? " credited" : " debited"}</span>
                </td>
                <td className={`${TABLE.td} text-right tabular-nums`}>{formatINR(t.balanceAfter)}</td>
                <td className={`${TABLE.td} text-[16px]`}>
                  {t.note ?? (t.referenceType ? `${t.referenceType} #${t.referenceId}` : <span className="text-text-muted">—</span>)}
                </td>
              </tr>
            ))}
            {txns.data && txns.data.items.length === 0 && <TableState colSpan={5}>No transactions yet.</TableState>}
          </tbody>
        </table>
      </div>

      <ul className="flex flex-col gap-3 md:hidden" aria-label="Wallet transactions">
        {txns.data?.items.map((t) => (
          <MobileCard key={t.id}>
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-text-primary">{REASONS[t.reason] ?? t.reason}</p>
                <p className="text-[15px] text-text-muted">{formatDate(t.createdAt)}</p>
              </div>
              <p className={`text-[18px] font-semibold tabular-nums ${t.type === "credit" ? "text-primary-pressed" : "text-error"}`}>
                {t.type === "credit" ? "+" : "−"}
                {formatINR(t.amount)}
              </p>
            </div>
            {t.note && <p className="text-[15px] text-text-secondary">{t.note}</p>}
          </MobileCard>
        ))}
      </ul>

      {txns.data && txns.data.meta.totalPages > 1 && <AdminPagination meta={txns.data.meta} onPage={setPage} />}

      {adjusting && (
        <AdjustWalletModal
          wallet={w}
          onClose={() => setAdjusting(false)}
          onDone={(t) => {
            setFlash(`${t.type === "credit" ? "Credited" : "Debited"} ${formatINR(t.amount)}. New balance ${formatINR(t.balanceAfter)}.`);
            setPage(1);
            setVersion((v) => v + 1);
          }}
        />
      )}
    </div>
  );
}

function WalletsTab() {
  const [draft, setDraft] = useState("");
  const [walletId, setWalletId] = useState<number | null>(null);
  const [error, setError] = useState<string>();

  function open(e: FormEvent) {
    e.preventDefault();
    const id = Number(draft.trim().replace(/^#/, ""));
    if (!Number.isInteger(id) || id <= 0) {
      setError("Enter a wallet ID — a whole number, e.g. 12.");
      return;
    }
    setError(undefined);
    setWalletId(id);
  }

  return (
    <div className="flex flex-col gap-6">
      <Notice tone="grey" title="Open a wallet by ID">
        Every customer and provider has one wallet. The backend has no wallet search yet, so enter the wallet ID from the
        support ticket, payout or payment you&apos;re looking into.
      </Notice>
      <form onSubmit={open} className="flex flex-col gap-2 sm:flex-row sm:items-start" role="search">
        <div className="sm:w-[320px]">
          <TextInput label="Wallet ID" inputMode="numeric" placeholder="e.g. 12" value={draft} onChange={(e) => setDraft(e.target.value)} error={error} />
        </div>
        <Button type="submit" className="sm:mt-[26px]">
          Open wallet
        </Button>
      </form>
      {walletId !== null && <WalletPanel key={walletId} id={walletId} />}
    </div>
  );
}

export function FinanceScreen() {
  const [tab, setTab] = useState<"payments" | "wallets">("payments");
  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Finance" description="Reconcile payments and refunds, and look after customer and provider wallets." />
      <Tabs
        label="Finance views"
        value={tab}
        onChange={setTab}
        tabs={[
          { value: "payments", label: "Payments" },
          { value: "wallets", label: "Wallets" },
        ]}
      />
      <div role="tabpanel">{tab === "payments" ? <PaymentsTab /> : <WalletsTab />}</div>
    </div>
  );
}

export default FinanceScreen;
