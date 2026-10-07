import { notFound } from "next/navigation";
import { ProviderAdminDetail } from "@/components/admin/ProviderAdminDetail";

export default async function AdminProviderPage({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) notFound();
  return <ProviderAdminDetail id={id} />;
}
