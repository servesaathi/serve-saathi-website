"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  ADMIN_ROLES,
  ROLE_LABELS,
  USER_WRITE_UNSUPPORTED,
  adminSource,
  displayName,
  useAdminQuery,
  type AdminRole,
  type AdminUser,
} from "@/lib/admin";
import { ConfirmDialog } from "./ConfirmDialog";
import { UserFormModal } from "./UserFormModal";
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
  formatDate,
} from "./parts";

// /admin/users — every account on the platform (GET /users: search, role
// filter, paging). Ban/unban are live endpoints; add/edit/delete only work
// against demo data until the backend adds admin endpoints for them.

const LIMIT = 10;
const users = adminSource.users;
const canWrite = { create: Boolean(users.create), update: Boolean(users.update), remove: Boolean(users.remove) };
const STAT_ROLES: { role?: AdminRole; label: string }[] = [
  { label: "All accounts" },
  { role: "customer", label: "Seniors" },
  { role: "family", label: "Family members" },
  { role: "provider", label: "Providers" },
];

type Dialog =
  | { type: "add" }
  | { type: "edit"; user: AdminUser }
  | { type: "delete"; user: AdminUser }
  | { type: "ban"; user: AdminUser }
  | null;

export function UserStatus({ user }: { user: AdminUser }) {
  if (user.isBanned) return <Badge tone="red">Banned</Badge>;
  if (!user.isActive) return <Badge tone="grey">Inactive</Badge>;
  return <Badge tone="green">Active</Badge>;
}

export function RoleList({ roles }: { roles: AdminRole[] }) {
  return (
    <span className="flex flex-wrap gap-1.5">
      {roles.map((r) => (
        <Badge key={r} tone={r === "admin" || r === "super_admin" ? "orange" : "grey"}>
          {ROLE_LABELS[r] ?? r}
        </Badge>
      ))}
    </span>
  );
}

function contactLine(u: AdminUser) {
  return u.email ?? u.phone ?? "No contact details";
}

export function UsersScreen() {
  const [page, setPage] = useState(1);
  const [searchDraft, setSearchDraft] = useState("");
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<AdminRole | "">("");
  const [dialog, setDialog] = useState<Dialog>(null);
  const [flash, setFlash] = useState<{ message: string; tone: "success" | "error" }>();
  const [version, setVersion] = useState(0);

  const { data, error, loading, reload } = useAdminQuery(`users:${page}:${search}:${role}:${version}`, () =>
    users.list({ page, limit: LIMIT, search, role: role || undefined })
  );
  // Role totals for the summary cards: one limit=1 request per role, reading meta.total.
  const stats = useAdminQuery(`user-stats:${version}`, () =>
    Promise.all(STAT_ROLES.map((s) => users.list({ page: 1, limit: 1, role: s.role }).then((r) => r.meta.total)))
  );

  function done(message: string) {
    setFlash({ message, tone: "success" });
    setVersion((v) => v + 1);
  }

  const unsupported = (allowed: boolean) => (allowed ? undefined : USER_WRITE_UNSUPPORTED);

  function rowActions(u: AdminUser) {
    const name = displayName(u);
    return (
      <div className="flex items-center justify-end gap-1">
        <IconLink icon={ICONS.view} label={`View ${name}`} href={`/admin/users/${u.id}`} />
        <IconButton
          icon={ICONS.edit}
          label={`Edit ${name}`}
          hint={unsupported(canWrite.update)}
          disabled={!canWrite.update}
          onClick={() => setDialog({ type: "edit", user: u })}
        />
        <IconButton
          icon={u.isBanned ? ICONS.success : ICONS.close}
          tone={u.isBanned ? "primary" : "danger"}
          label={`${u.isBanned ? "Unban" : "Ban"} ${name}`}
          onClick={() => setDialog({ type: "ban", user: u })}
        />
        <IconButton
          icon={ICONS.delete}
          tone="danger"
          label={`Delete ${name}`}
          hint={unsupported(canWrite.remove)}
          disabled={!canWrite.remove}
          onClick={() => setDialog({ type: "delete", user: u })}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Users"
        description="Every account on ServeSaathi — seniors, families, providers and staff."
        action={
          <Button
            onClick={() => setDialog({ type: "add" })}
            disabled={!canWrite.create}
            title={unsupported(canWrite.create)}
            leftIcon={<Icon src={ICONS.add} size={22} />}
          >
            Add user
          </Button>
        }
      />

      <StatGrid>
        {STAT_ROLES.map((s, i) => (
          <StatCard
            key={s.label}
            label={s.label}
            value={stats.data ? stats.data[i].toLocaleString("en-IN") : "—"}
            loading={stats.loading}
          />
        ))}
      </StatGrid>

      {!canWrite.create && (
        <p className="-mt-4 text-[15px] leading-5 text-text-muted">Add, edit and delete are unavailable: {USER_WRITE_UNSUPPORTED}</p>
      )}

      <section className="flex flex-col gap-4" aria-labelledby="users-list-title">
        <div className="flex items-center justify-between">
          <h2 id="users-list-title" className="text-[24px] leading-8 font-semibold text-text-primary">
            All users
          </h2>
          {data && (
            <p className="text-[16px] text-text-muted" aria-live="polite">
              {data.meta.total} {search || role ? "matching" : "total"}
            </p>
          )}
        </div>

        <SearchBar
          id="user-search"
          label="Search users"
          value={searchDraft}
          onChange={setSearchDraft}
          onSubmit={() => {
            setPage(1);
            setSearch(searchDraft.trim());
          }}
          placeholder="Search by name, email or phone"
        >
          <label htmlFor="user-role" className="sr-only">
            Filter by role
          </label>
          <select
            id="user-role"
            value={role}
            onChange={(e) => {
              setPage(1);
              setRole(e.target.value as AdminRole | "");
            }}
            className="h-12 rounded-input border-[1.5px] border-border-hairline bg-bg-base px-4 text-[16px] text-text-primary focus:border-primary focus:outline-none md:w-[200px]"
          >
            <option value="">All roles</option>
            {ADMIN_ROLES.map((r) => (
              <option key={r} value={r}>
                {ROLE_LABELS[r]}
              </option>
            ))}
          </select>
        </SearchBar>

        {flash && <Flash {...flash} onDismiss={() => setFlash(undefined)} />}
        {error && <Flash message={`Couldn't load users: ${error}`} tone="error" onDismiss={reload} />}

        <div className={TABLE.wrap} aria-busy={loading}>
          <table className={TABLE.table}>
            <caption className="sr-only">Users</caption>
            <colgroup>
              <col className="w-[34%]" />
              <col className="w-[22%]" />
              <col className="w-[12%]" />
              <col className="w-[13%]" />
              <col className="w-[200px]" />
            </colgroup>
            <thead>
              <tr>
                <th scope="col" className={TABLE.th}>User</th>
                <th scope="col" className={TABLE.th}>Roles</th>
                <th scope="col" className={TABLE.th}>Status</th>
                <th scope="col" className={TABLE.th}>Joined</th>
                <th scope="col" className={`${TABLE.th} text-right`}>Actions</th>
              </tr>
            </thead>
            <tbody className={`transition-opacity ${loading && data ? "opacity-60" : ""}`}>
              {data?.items.map((u) => (
                <tr key={u.id} className="group/row">
                  <td className={`${TABLE.td} group-hover/row:bg-[#fbfdfb]`}>
                    <Identity name={displayName(u)} sub={contactLine(u)} href={`/admin/users/${u.id}`} />
                  </td>
                  <td className={`${TABLE.td} group-hover/row:bg-[#fbfdfb]`}>
                    <RoleList roles={u.roles} />
                  </td>
                  <td className={`${TABLE.td} group-hover/row:bg-[#fbfdfb]`}>
                    <UserStatus user={u} />
                  </td>
                  <td className={`${TABLE.td} whitespace-nowrap group-hover/row:bg-[#fbfdfb]`}>{formatDate(u.createdAt)}</td>
                  <td className={`${TABLE.td} py-1.5 group-hover/row:bg-[#fbfdfb]`}>{rowActions(u)}</td>
                </tr>
              ))}
              {data && data.items.length === 0 && <TableState colSpan={5}>No users match these filters.</TableState>}
              {!data && !error && <TableState colSpan={5}>Loading users…</TableState>}
            </tbody>
          </table>
        </div>

        <ul className={`flex flex-col gap-3 md:hidden ${loading && data ? "opacity-60" : ""}`} aria-label="Users">
          {data?.items.map((u) => (
            <MobileCard key={u.id}>
              <Identity name={displayName(u)} sub={contactLine(u)} href={`/admin/users/${u.id}`} />
              <div className="flex flex-wrap items-center gap-2">
                <UserStatus user={u} />
                <RoleList roles={u.roles} />
              </div>
              <div className="flex items-center justify-between border-t border-border-hairline pt-2">
                <span className="text-[15px] text-text-muted">Joined {formatDate(u.createdAt)}</span>
                {rowActions(u)}
              </div>
            </MobileCard>
          ))}
          {data && data.items.length === 0 && <li className="py-8 text-center text-text-muted">No users match these filters.</li>}
          {!data && !error && <li className="py-8 text-center text-text-muted">Loading users…</li>}
        </ul>

        {data && data.meta.totalPages > 1 && <AdminPagination meta={data.meta} onPage={setPage} />}
      </section>

      {(dialog?.type === "add" || dialog?.type === "edit") && (
        <UserFormModal
          key={dialog.type === "edit" ? dialog.user.id : "new"}
          user={dialog.type === "edit" ? dialog.user : undefined}
          onClose={() => setDialog(null)}
          onSubmit={async (input) => {
            if (dialog.type === "edit") {
              await users.update!(dialog.user.id, input);
              done(`Saved changes to ${input.firstName} ${input.lastName}.`);
            } else {
              await users.create!(input);
              setPage(1);
              done(`Added ${input.firstName} ${input.lastName}.`);
            }
          }}
        />
      )}

      <ConfirmDialog
        open={dialog?.type === "ban"}
        onClose={() => setDialog(null)}
        title={dialog?.type === "ban" && dialog.user.isBanned ? "Unban user?" : "Ban user?"}
        confirmLabel={dialog?.type === "ban" && dialog.user.isBanned ? "Unban" : "Ban user"}
        destructive={!(dialog?.type === "ban" && dialog.user.isBanned)}
        message={
          dialog?.type === "ban" &&
          (dialog.user.isBanned ? (
            <p>{displayName(dialog.user)} will be able to sign in and use ServeSaathi again.</p>
          ) : (
            <p>{displayName(dialog.user)} won&apos;t be able to sign in until you unban them. Their data is kept.</p>
          ))
        }
        onConfirm={async () => {
          if (dialog?.type !== "ban") return;
          const { user } = dialog;
          await (user.isBanned ? users.unban(user.id) : users.ban(user.id));
          done(`${displayName(user)} ${user.isBanned ? "unbanned" : "banned"}.`);
        }}
      />

      <ConfirmDialog
        open={dialog?.type === "delete"}
        onClose={() => setDialog(null)}
        title="Delete user?"
        confirmLabel="Delete permanently"
        destructive
        message={
          dialog?.type === "delete" && (
            <p>
              This permanently removes <strong>{displayName(dialog.user)}</strong> and can&apos;t be undone. To stop
              access but keep their data, ban them instead.
            </p>
          )
        }
        onConfirm={async () => {
          if (dialog?.type !== "delete") return;
          await users.remove!(dialog.user.id);
          done(`Deleted ${displayName(dialog.user)}.`);
        }}
      />
    </div>
  );
}

export default UsersScreen;
