"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
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
import { ActionButton, ActionLink, AdminPagination, Badge, Flash, PageHeader, TABLE, formatDate } from "./parts";

// /admin/users — every account on the platform (GET /users: search, role
// filter, paging). Ban/unban are live endpoints; add/edit/delete only work
// against demo data until the backend adds admin endpoints for them.

const LIMIT = 10;
const users = adminSource.users;
const canWrite = { create: Boolean(users.create), update: Boolean(users.update), remove: Boolean(users.remove) };

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
    <span className="flex flex-wrap gap-1">
      {roles.map((r) => (
        <Badge key={r} tone={r === "admin" || r === "super_admin" ? "orange" : "grey"}>
          {ROLE_LABELS[r] ?? r}
        </Badge>
      ))}
    </span>
  );
}

export function UsersScreen() {
  const [page, setPage] = useState(1);
  const [searchDraft, setSearchDraft] = useState("");
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<AdminRole | "">("");
  const [dialog, setDialog] = useState<Dialog>(null);
  const [flash, setFlash] = useState<{ message: string; tone: "success" | "error" }>();

  const { data, error, loading, reload } = useAdminQuery(`users:${page}:${search}:${role}`, () =>
    users.list({ page, limit: LIMIT, search, role: role || undefined })
  );

  function applySearch(e: FormEvent) {
    e.preventDefault();
    setPage(1);
    setSearch(searchDraft.trim());
  }

  function done(message: string) {
    setFlash({ message, tone: "success" });
    reload();
  }

  const unsupported = (allowed: boolean) => (allowed ? undefined : USER_WRITE_UNSUPPORTED);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Users"
        description={data ? `${data.meta.total} accounts on ServeSaathi` : "Every account on ServeSaathi"}
        action={
          <Button onClick={() => setDialog({ type: "add" })} disabled={!canWrite.create} title={unsupported(canWrite.create)}>
            Add user
          </Button>
        }
      />
      {!canWrite.create && (
        <p className="text-[14px] leading-5 text-text-tertiary">
          Add, edit and delete are disabled: {USER_WRITE_UNSUPPORTED}
        </p>
      )}

      <div className="flex flex-col gap-4 md:flex-row md:items-end">
        <form onSubmit={applySearch} role="search" className="flex flex-1 items-end gap-3">
          <div className="flex flex-1 flex-col gap-1">
            <label htmlFor="user-search" className="text-[16px] leading-[22px] font-semibold text-text-primary">
              Search
            </label>
            <input
              id="user-search"
              type="search"
              value={searchDraft}
              onChange={(e) => setSearchDraft(e.target.value)}
              placeholder="Name, email or phone"
              className="h-12 w-full rounded-input border-[1.5px] border-border-hairline bg-bg-base px-4 text-[16px] text-text-primary placeholder:text-text-tertiary focus:border-primary focus:outline-none"
            />
          </div>
          <Button type="submit" variant="secondary">
            Search
          </Button>
        </form>
        <Select
          label="Role"
          containerClassName="md:w-[220px]"
          value={role}
          onChange={(e) => {
            setPage(1);
            setRole(e.target.value as AdminRole | "");
          }}
          options={[{ value: "", label: "All roles" }, ...ADMIN_ROLES.map((r) => ({ value: r, label: ROLE_LABELS[r] }))]}
        />
      </div>

      {flash && <Flash {...flash} onDismiss={() => setFlash(undefined)} />}
      {error && <Flash message={`Couldn't load users: ${error}`} tone="error" onDismiss={reload} />}

      <div className={TABLE.wrap} aria-busy={loading}>
        <table className={TABLE.table}>
          <caption className="sr-only">Users</caption>
          <thead>
            <tr>
              <th scope="col" className={TABLE.th}>Name</th>
              <th scope="col" className={TABLE.th}>Contact</th>
              <th scope="col" className={TABLE.th}>Roles</th>
              <th scope="col" className={TABLE.th}>Status</th>
              <th scope="col" className={TABLE.th}>Joined</th>
              <th scope="col" className={`${TABLE.th} text-right`}>Actions</th>
            </tr>
          </thead>
          <tbody className={loading ? "opacity-50" : ""}>
            {data?.items.map((u) => (
              <tr key={u.id}>
                <td className={TABLE.td}>
                  <span className="font-semibold text-text-primary">{displayName(u)}</span>
                  <span className="block text-[14px] text-text-tertiary">#{u.id}</span>
                </td>
                <td className={TABLE.td}>
                  <span className="block">{u.email ?? "—"}</span>
                  <span className="block text-[14px] text-text-tertiary">
                    {u.phone ?? "No phone"}
                    {u.phone && (u.phoneVerifiedAt ? " · verified" : " · unverified")}
                  </span>
                </td>
                <td className={TABLE.td}>
                  <RoleList roles={u.roles} />
                </td>
                <td className={TABLE.td}>
                  <UserStatus user={u} />
                </td>
                <td className={`${TABLE.td} whitespace-nowrap`}>{formatDate(u.createdAt)}</td>
                <td className={TABLE.td}>
                  <div className="flex justify-end gap-2">
                    <ActionLink href={`/admin/users/${u.id}`}>View</ActionLink>
                    <ActionButton
                      onClick={() => setDialog({ type: "edit", user: u })}
                      disabled={!canWrite.update}
                      title={unsupported(canWrite.update)}
                      aria-label={`Edit ${displayName(u)}`}
                    >
                      Edit
                    </ActionButton>
                    <ActionButton
                      tone="danger"
                      onClick={() => setDialog({ type: "ban", user: u })}
                      aria-label={`${u.isBanned ? "Unban" : "Ban"} ${displayName(u)}`}
                    >
                      {u.isBanned ? "Unban" : "Ban"}
                    </ActionButton>
                    <ActionButton
                      tone="danger"
                      onClick={() => setDialog({ type: "delete", user: u })}
                      disabled={!canWrite.remove}
                      title={unsupported(canWrite.remove)}
                      aria-label={`Delete ${displayName(u)}`}
                    >
                      Delete
                    </ActionButton>
                  </div>
                </td>
              </tr>
            ))}
            {data && data.items.length === 0 && (
              <tr>
                <td colSpan={6} className={`${TABLE.td} py-10 text-center`}>
                  No users match these filters.
                </td>
              </tr>
            )}
            {!data && !error && (
              <tr>
                <td colSpan={6} className={`${TABLE.td} py-10 text-center`}>
                  Loading users…
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {data && <AdminPagination meta={data.meta} onPage={setPage} />}

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
