import { notFound } from "next/navigation";
import { UserDetail } from "@/components/admin/UserDetail";

export default async function AdminUserPage({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) notFound();
  return <UserDetail id={id} />;
}
