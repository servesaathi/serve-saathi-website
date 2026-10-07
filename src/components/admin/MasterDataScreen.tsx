"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { TextInput } from "@/components/ui/TextInput";
import { getErrorMessage } from "@/lib/api/types";
import { LOOKUP_GROUPS, adminSource, useAdminQuery, type LookupEntry, type LookupInput } from "@/lib/admin";
import { ConfirmDialog } from "./ConfirmDialog";
import { Flash, ICONS, Icon, IconButton, MobileCard, Notice, PageHeader, TABLE, TableState } from "./parts";

// /admin/master-data — every dropdown list the apps use, backed by the
// shared lookup controller: GET /{lookup} (public), POST /{lookup},
// PATCH /{lookup}/:id, DELETE /{lookup}/:id (admin). Same shape for all:
// { code, name, sortOrder }.

const lookups = adminSource.lookups;
const ALL = LOOKUP_GROUPS.flatMap((g) => g.items);

/** "Art & craft" → "art_and_craft" — matches the backend's existing codes. */
function toCode(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/'/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function EntryModal({
  listLabel,
  entry,
  nextOrder,
  existingCodes,
  onClose,
  onSubmit,
}: {
  listLabel: string;
  entry?: LookupEntry;
  nextOrder: number;
  existingCodes: string[];
  onClose: () => void;
  onSubmit: (input: LookupInput) => Promise<void>;
}) {
  const [name, setName] = useState(entry?.name ?? "");
  const [code, setCode] = useState(entry?.code ?? "");
  const [codeTouched, setCodeTouched] = useState(Boolean(entry));
  const [order, setOrder] = useState(String(entry?.sortOrder ?? nextOrder));
  const [errors, setErrors] = useState<{ name?: string; code?: string; order?: string }>({});
  const [formError, setFormError] = useState<string>();
  const [busy, setBusy] = useState(false);

  const effectiveCode = codeTouched ? code : toCode(name);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const found: typeof errors = {};
    if (!name.trim()) found.name = "Enter the label people will see.";
    if (!/^[a-z0-9_]+$/.test(effectiveCode)) found.code = "Use lowercase letters, numbers and underscores, e.g. per_hour.";
    else if (existingCodes.includes(effectiveCode) && effectiveCode !== entry?.code) found.code = "Another entry in this list already uses this code.";
    if (!/^\d+$/.test(order.trim())) found.order = "Enter a whole number (0 shows first).";
    setErrors(found);
    if (Object.keys(found).length) return;
    setBusy(true);
    setFormError(undefined);
    try {
      await onSubmit({ name: name.trim(), code: effectiveCode, sortOrder: Number(order) });
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
      title={entry ? `Edit ${entry.name}` : `Add to ${listLabel}`}
      description="Shows up in the apps' dropdowns straight away — no release needed."
      actions={
        <>
          <Button variant="light" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button type="submit" form="lookup-form" loading={busy}>
            {entry ? "Save changes" : "Add entry"}
          </Button>
        </>
      }
    >
      <form id="lookup-form" onSubmit={submit} noValidate className="flex flex-col gap-5">
        <TextInput label="Label" requiredMark value={name} onChange={(e) => setName(e.target.value)} error={errors.name} placeholder="e.g. Per Visit" />
        <TextInput
          label="Code"
          requiredMark
          value={effectiveCode}
          onChange={(e) => {
            setCodeTouched(true);
            setCode(e.target.value);
          }}
          error={errors.code}
          helperText={entry ? "Apps and saved records refer to this code — change it only if nothing uses it yet." : "Generated from the label; edit if you need a specific code."}
        />
        <TextInput label="Display order" inputMode="numeric" value={order} onChange={(e) => setOrder(e.target.value)} error={errors.order} helperText="Lower numbers appear first." />
        {formError && (
          <p role="alert" className="text-[14px] leading-5 text-error">
            {formError}
          </p>
        )}
      </form>
    </Modal>
  );
}

export function MasterDataScreen() {
  const [path, setPath] = useState(ALL[0].path);
  const [version, setVersion] = useState(0);
  const [dialog, setDialog] = useState<{ type: "add" } | { type: "edit" | "delete"; entry: LookupEntry } | null>(null);
  const [flash, setFlash] = useState<string>();
  const current = ALL.find((l) => l.path === path)!;

  const { data, error, loading, reload } = useAdminQuery(`lookup:${path}:${version}`, () => lookups.list(path));
  const entries = data ?? [];
  const done = (m: string) => {
    setFlash(m);
    setVersion((x) => x + 1);
  };

  const actions = (e: LookupEntry) => (
    <div className="flex justify-end gap-1">
      <IconButton icon={ICONS.edit} label={`Edit ${e.name}`} onClick={() => setDialog({ type: "edit", entry: e })} />
      <IconButton icon={ICONS.delete} tone="danger" label={`Delete ${e.name}`} onClick={() => setDialog({ type: "delete", entry: e })} />
    </div>
  );

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Master data" description="The dropdown lists used across the apps — languages, conditions, price types and more." />

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        {/* List picker */}
        <div className="lg:hidden">
          <label htmlFor="lookup-picker" className="mb-1 block text-[16px] font-semibold text-text-primary">
            List
          </label>
          <select
            id="lookup-picker"
            value={path}
            onChange={(e) => {
              setFlash(undefined);
              setPath(e.target.value);
            }}
            className="h-12 w-full rounded-input border-[1.5px] border-border-hairline bg-bg-base px-4 text-[16px] text-text-primary focus:border-primary focus:outline-none"
          >
            {LOOKUP_GROUPS.map((g) => (
              <optgroup key={g.title} label={g.title}>
                {g.items.map((l) => (
                  <option key={l.path} value={l.path}>
                    {l.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
        <nav aria-label="Master data lists" className="hidden w-[280px] shrink-0 flex-col gap-5 rounded-card bg-bg-base p-4 lg:flex">
          {LOOKUP_GROUPS.map((g) => (
            <div key={g.title}>
              <p className="px-3 pb-1.5 text-[14px] leading-5 font-semibold tracking-wide text-text-muted uppercase">{g.title}</p>
              <ul className="flex flex-col gap-0.5">
                {g.items.map((l) => {
                  const active = l.path === path;
                  return (
                    <li key={l.path}>
                      <button
                        type="button"
                        aria-current={active ? "true" : undefined}
                        onClick={() => {
                          setFlash(undefined);
                          setPath(l.path);
                        }}
                        className={`flex min-h-11 w-full items-center rounded-control px-3 text-left text-[16px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                          active ? "bg-bg-orange font-semibold text-[#a84c12]" : "text-text-secondary hover:bg-bg-layout"
                        }`}
                      >
                        {l.label}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Entries */}
        <section className="flex min-w-0 flex-1 flex-col gap-4" aria-labelledby="lookup-title">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 id="lookup-title" className="text-[24px] leading-8 font-semibold text-text-primary">
                {current.label}
              </h2>
              <p className="text-[16px] text-text-muted">
                {current.hint} · <code className="text-[15px]">/{current.path}</code>
                {data && ` · ${entries.length} ${entries.length === 1 ? "entry" : "entries"}`}
              </p>
            </div>
            <Button onClick={() => setDialog({ type: "add" })} leftIcon={<Icon src={ICONS.add} size={22} />}>
              Add entry
            </Button>
          </div>

          {flash && <Flash message={flash} tone="success" onDismiss={() => setFlash(undefined)} />}
          {error && <Flash message={`Couldn't load ${current.label.toLowerCase()}: ${error}`} tone="error" onDismiss={reload} />}
          {data && entries.length === 0 && (
            <Notice tone="orange" title="This list is empty">
              Nothing to choose from in the apps yet — add the first entry.
            </Notice>
          )}

          <div className={TABLE.wrap} aria-busy={loading}>
            <table className={TABLE.table}>
              <caption className="sr-only">{current.label}</caption>
              <colgroup>
                <col className="w-[90px]" />
                <col />
                <col className="w-[34%]" />
                <col className="w-[120px]" />
              </colgroup>
              <thead>
                <tr>
                  <th scope="col" className={TABLE.th}>Order</th>
                  <th scope="col" className={TABLE.th}>Label</th>
                  <th scope="col" className={TABLE.th}>Code</th>
                  <th scope="col" className={`${TABLE.th} text-right`}>Actions</th>
                </tr>
              </thead>
              <tbody className={loading && data ? "opacity-60" : ""}>
                {entries.map((e) => (
                  <tr key={e.id}>
                    <td className={`${TABLE.td} tabular-nums`}>{e.sortOrder}</td>
                    <td className={`${TABLE.td} font-semibold text-text-primary`}>{e.name}</td>
                    <td className={TABLE.td}>
                      <code className="rounded bg-bg-layout px-2 py-0.5 text-[15px]">{e.code}</code>
                    </td>
                    <td className={`${TABLE.td} py-1.5`}>{actions(e)}</td>
                  </tr>
                ))}
                {!data && !error && <TableState colSpan={4}>Loading…</TableState>}
              </tbody>
            </table>
          </div>

          <ul className="flex flex-col gap-3 md:hidden" aria-label={current.label}>
            {entries.map((e) => (
              <MobileCard key={e.id}>
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-text-primary">{e.name}</p>
                    <p className="text-[15px] text-text-muted">
                      <code>{e.code}</code> · order {e.sortOrder}
                    </p>
                  </div>
                  {actions(e)}
                </div>
              </MobileCard>
            ))}
          </ul>
        </section>
      </div>

      {(dialog?.type === "add" || dialog?.type === "edit") && (
        <EntryModal
          key={`${path}:${dialog.type === "edit" ? dialog.entry.id : "new"}`}
          listLabel={current.label}
          entry={dialog.type === "edit" ? dialog.entry : undefined}
          nextOrder={entries.reduce((m, e) => Math.max(m, e.sortOrder + 1), 0)}
          existingCodes={entries.map((e) => e.code)}
          onClose={() => setDialog(null)}
          onSubmit={async (input) => {
            if (dialog.type === "edit") {
              await lookups.update(path, dialog.entry.id, input);
              done(`Saved “${input.name}”.`);
            } else {
              await lookups.create(path, input);
              done(`Added “${input.name}” to ${current.label}.`);
            }
          }}
        />
      )}
      <ConfirmDialog
        open={dialog?.type === "delete"}
        onClose={() => setDialog(null)}
        title="Delete entry?"
        confirmLabel="Delete"
        destructive
        message={
          dialog?.type === "delete" && (
            <p>
              <strong>{dialog.entry.name}</strong> will disappear from the {current.label.toLowerCase()} dropdown. Profiles or
              records that already use it may lose that value — if you only need different wording, edit the label instead.
            </p>
          )
        }
        onConfirm={async () => {
          if (dialog?.type !== "delete") return;
          await lookups.remove(path, dialog.entry.id);
          done(`Deleted “${dialog.entry.name}”.`);
        }}
      />
    </div>
  );
}

export default MasterDataScreen;
