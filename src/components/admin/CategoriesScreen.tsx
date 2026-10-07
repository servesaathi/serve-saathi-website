"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { adminSource, useAdminQuery, type AdminCategory, type CategoryFilter } from "@/lib/admin";
import {
  AdminPagination,
  Badge,
  Flash,
  ICONS,
  IconButton,
  Identity,
  MobileCard,
  Notice,
  PageHeader,
  SearchBar,
  StatCard,
  StatGrid,
  TABLE,
  TableState,
} from "./parts";

// /admin/categories — GET /categories (search, isActive, paged).
// Backend status (2026-10): create/update/delete are disabled server-side
// (commit 93e238c, 2026-08-13), so the screen is read-only on purpose.
// Each category's filter schema comes from GET /categories/:slug/filters —
// "In progress" (design phase 2); the dialog says so while it 404s.

const LIMIT = 20;
const categories = adminSource.categories;

function filterLabel(f: CategoryFilter) {
  return f.label ?? f.name ?? f.key ?? "Untitled filter";
}

function FiltersDialog({ category, onClose }: { category: AdminCategory; onClose: () => void }) {
  const { data, error, loading } = useAdminQuery(`filters:${category.slug}`, () => categories.filters(category.slug));
  return (
    <Modal
      open
      onClose={onClose}
      title={`${category.name} filters`}
      description="The questions families filter by, and providers answer during onboarding."
      actions={<Button onClick={onClose}>Close</Button>}
    >
      {loading && <p aria-busy>Loading filters…</p>}
      {error && <p role="alert" className="text-error">{error}</p>}
      {!loading && !error && data === null && (
        <Notice tone="orange" title="Not available yet">
          The backend team is still building category filters (<code>GET /categories/:slug/filters</code>, design phase 2). This
          panel will list them automatically once the endpoint is live.
        </Notice>
      )}
      {!loading && data && data.length === 0 && <p className="text-text-muted">No filters are attached to this category.</p>}
      {!loading && data && data.length > 0 && (
        <ul className="flex flex-col gap-3">
          {data.map((f, i) => (
            <li key={f.key ?? f.id ?? i} className="flex flex-col gap-2 rounded-card bg-bg-base p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[17px] leading-6 font-semibold text-text-primary">{filterLabel(f)}</p>
                {f.type && <Badge tone="grey">{f.type.replace(/_/g, " ")}</Badge>}
              </div>
              {f.options && f.options.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {f.options.map((o, j) => (
                    <span key={j} className="rounded-full border border-border-hairline px-3 py-0.5 text-[15px] text-text-secondary">
                      {o.label ?? o.name ?? o.value}
                    </span>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
}

export function CategoriesScreen() {
  const [page, setPage] = useState(1);
  const [draft, setDraft] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"" | "active" | "inactive">("");
  const [open, setOpen] = useState<AdminCategory | null>(null);

  const isActive = status === "" ? undefined : status === "active";
  const { data, error, loading, reload } = useAdminQuery(`categories:${page}:${search}:${status}`, () =>
    categories.list({ page, limit: LIMIT, search, isActive })
  );
  const stats = useAdminQuery("category-stats", () =>
    Promise.all([undefined, true, false].map((a) => categories.list({ page: 1, limit: 1, isActive: a }).then((r) => r.meta.total)))
  );

  const filtersButton = (c: AdminCategory) => (
    <IconButton icon={ICONS.view} tone="primary" label={`View ${c.name} filters`} onClick={() => setOpen(c)} />
  );

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Categories"
        description="The care categories families browse and providers belong to."
        action={
          <Button disabled title="Category create/update/delete is disabled in the backend.">
            Add category
          </Button>
        }
      />

      <Notice tone="grey" title="Read-only for now">
        The backend has disabled creating, editing and deleting categories (since 13 Aug 2026). You can browse them and
        their filters here; link providers to categories from a provider&apos;s Edit dialog.
      </Notice>

      <StatGrid>
        {["All categories", "Active", "Inactive"].map((label, i) => (
          <StatCard key={label} label={label} value={stats.data ? stats.data[i] : "—"} loading={stats.loading} />
        ))}
      </StatGrid>

      <section className="flex flex-col gap-4" aria-labelledby="categories-title">
        <div className="flex items-center justify-between">
          <h2 id="categories-title" className="text-[24px] leading-8 font-semibold text-text-primary">
            All categories
          </h2>
          {data && <p className="text-[16px] text-text-muted" aria-live="polite">{data.meta.total} {search || status ? "matching" : "total"}</p>}
        </div>

        <SearchBar
          id="category-search"
          label="Search categories"
          value={draft}
          onChange={setDraft}
          onSubmit={() => {
            setPage(1);
            setSearch(draft.trim());
          }}
          placeholder="Search by name"
        >
          <label htmlFor="category-status" className="sr-only">
            Filter by status
          </label>
          <select
            id="category-status"
            value={status}
            onChange={(e) => {
              setPage(1);
              setStatus(e.target.value as typeof status);
            }}
            className="h-12 rounded-input border-[1.5px] border-border-hairline bg-bg-base px-4 text-[16px] text-text-primary focus:border-primary focus:outline-none md:w-[200px]"
          >
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </SearchBar>

        {error && <Flash message={`Couldn't load categories: ${error}`} tone="error" onDismiss={reload} />}

        <div className={TABLE.wrap} aria-busy={loading}>
          <table className={TABLE.table}>
            <caption className="sr-only">Categories</caption>
            <colgroup>
              <col className="w-[28%]" />
              <col />
              <col className="w-[12%]" />
              <col className="w-[10%]" />
              <col className="w-[110px]" />
            </colgroup>
            <thead>
              <tr>
                <th scope="col" className={TABLE.th}>Category</th>
                <th scope="col" className={TABLE.th}>Description</th>
                <th scope="col" className={TABLE.th}>Status</th>
                <th scope="col" className={TABLE.th}>Order</th>
                <th scope="col" className={`${TABLE.th} text-right`}>Filters</th>
              </tr>
            </thead>
            <tbody className={loading && data ? "opacity-60" : ""}>
              {data?.items.map((c) => (
                <tr key={c.id}>
                  <td className={TABLE.td}>
                    <Identity name={c.name} sub={c.slug} />
                  </td>
                  <td className={`${TABLE.td} text-[16px] leading-6`}>{c.description ?? <span className="text-text-muted">No description</span>}</td>
                  <td className={TABLE.td}>{c.isActive ? <Badge tone="green">Active</Badge> : <Badge tone="grey">Inactive</Badge>}</td>
                  <td className={TABLE.td}>{c.sortOrder}</td>
                  <td className={`${TABLE.td} py-1.5 text-right`}>{filtersButton(c)}</td>
                </tr>
              ))}
              {data && data.items.length === 0 && <TableState colSpan={5}>No categories match.</TableState>}
              {!data && !error && <TableState colSpan={5}>Loading categories…</TableState>}
            </tbody>
          </table>
        </div>

        <ul className="flex flex-col gap-3 md:hidden" aria-label="Categories">
          {data?.items.map((c) => (
            <MobileCard key={c.id}>
              <Identity name={c.name} sub={c.slug} />
              {c.description && <p className="text-[16px] leading-6 text-text-secondary">{c.description}</p>}
              <div className="flex items-center justify-between border-t border-border-hairline pt-2">
                {c.isActive ? <Badge tone="green">Active</Badge> : <Badge tone="grey">Inactive</Badge>}
                {filtersButton(c)}
              </div>
            </MobileCard>
          ))}
        </ul>

        {data && data.meta.totalPages > 1 && <AdminPagination meta={data.meta} onPage={setPage} />}
      </section>

      {open && <FiltersDialog key={open.slug} category={open} onClose={() => setOpen(null)} />}
    </div>
  );
}

export default CategoriesScreen;
