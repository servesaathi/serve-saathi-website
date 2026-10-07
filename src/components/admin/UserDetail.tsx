"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { BackLink } from "@/components/services/BackLink";
import { USER_WRITE_UNSUPPORTED, adminSource, displayName, useAdminQuery } from "@/lib/admin";
import { ConfirmDialog } from "./ConfirmDialog";
import { UserFormModal } from "./UserFormModal";
import { ActionButton, DetailList, Flash, ICONS, Identity, formatDate } from "./parts";
import { RoleList, UserStatus } from "./UsersScreen";

// /admin/users/[id] — GET /users/{id} plus the same actions as the list row.

const users = adminSource.users;

export function UserDetail({ id }: { id: number }) {
  const router = useRouter();
  const { data: user, error, loading, reload } = useAdminQuery(`user:${id}`, () => users.get(id));
  const [dialog, setDialog] = useState<"edit" | "ban" | "delete" | null>(null);
  const [flash, setFlash] = useState<string>();

  if (!user) {
    return (
      <div className="flex flex-col gap-6">
        <BackLink href="/admin/users" label="All users" />
        {error ? <Flash message={error} tone="error" onDismiss={reload} /> : <p aria-busy={loading}>Loading user…</p>}
      </div>
    );
  }

  const name = displayName(user);

  return (
    <div className="flex flex-col gap-8">
      <BackLink href="/admin/users" label="All users" />

      <div className="flex flex-col gap-5 rounded-card bg-bg-base p-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-3">
          <Identity name={name} sub={`User #${user.id} · joined ${formatDate(user.createdAt)}`} />
          <div className="flex flex-wrap items-center gap-2">
            <UserStatus user={user} />
            <RoleList roles={user.roles} />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <ActionButton
            icon={ICONS.edit}
            onClick={() => setDialog("edit")}
            disabled={!users.update}
            title={users.update ? undefined : USER_WRITE_UNSUPPORTED}
          >
            Edit
          </ActionButton>
          <ActionButton icon={user.isBanned ? ICONS.success : ICONS.close} tone={user.isBanned ? "default" : "danger"} onClick={() => setDialog("ban")}>
            {user.isBanned ? "Unban" : "Ban"}
          </ActionButton>
          <ActionButton
            icon={ICONS.delete}
            tone="danger"
            onClick={() => setDialog("delete")}
            disabled={!users.remove}
            title={users.remove ? undefined : USER_WRITE_UNSUPPORTED}
          >
            Delete
          </ActionButton>
        </div>
      </div>

      {flash && <Flash message={flash} tone="success" onDismiss={() => setFlash(undefined)} />}

      <DetailList
        title="Contact"
        rows={[
          { label: "Email", value: user.email },
          {
            label: "Mobile",
            value: user.phone ? `${user.phone} ${user.phoneVerifiedAt ? "(verified)" : "(not verified)"}` : null,
          },
        ]}
      />
      <DetailList
        title="Account"
        rows={[
          { label: "User ID", value: `#${user.id}` },
          { label: "Roles", value: <RoleList roles={user.roles} /> },
          { label: "Account active", value: user.isActive ? "Yes" : "No" },
          { label: "Banned", value: user.isBanned ? "Yes" : "No" },
          { label: "Joined", value: formatDate(user.createdAt) },
          { label: "Last updated", value: formatDate(user.updatedAt) },
        ]}
      />

      {dialog === "edit" && (
        <UserFormModal
          user={user}
          onClose={() => setDialog(null)}
          onSubmit={async (input) => {
            await users.update!(user.id, input);
            setFlash("Changes saved.");
            reload();
          }}
        />
      )}
      <ConfirmDialog
        open={dialog === "ban"}
        onClose={() => setDialog(null)}
        title={user.isBanned ? "Unban user?" : "Ban user?"}
        confirmLabel={user.isBanned ? "Unban" : "Ban user"}
        destructive={!user.isBanned}
        message={
          <p>
            {user.isBanned
              ? `${name} will be able to sign in again.`
              : `${name} won't be able to sign in until unbanned. Their data is kept.`}
          </p>
        }
        onConfirm={async () => {
          await (user.isBanned ? users.unban(user.id) : users.ban(user.id));
          setFlash(user.isBanned ? "User unbanned." : "User banned.");
          reload();
        }}
      />
      <ConfirmDialog
        open={dialog === "delete"}
        onClose={() => setDialog(null)}
        title="Delete user?"
        confirmLabel="Delete permanently"
        destructive
        message={<p>This permanently removes <strong>{name}</strong> and can&apos;t be undone.</p>}
        onConfirm={async () => {
          await users.remove!(user.id);
          router.push("/admin/users");
        }}
      />
    </div>
  );
}

export default UserDetail;
