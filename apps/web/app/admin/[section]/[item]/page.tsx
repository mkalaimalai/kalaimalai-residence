import { notFound } from "next/navigation";
import { ADMIN_ROUTES, findItem } from "@/lib/admin-nav";
import { AdminItemView } from "@/components/admin/AdminItemView";

/**
 * Every admin page is `/admin/<section>/<item>`. The pairs are a static list, so the
 * export can prerender all of them — no server, matching `output: "export"`.
 */
export function generateStaticParams() {
  return ADMIN_ROUTES;
}

export default async function AdminItemPage({
  params,
}: {
  params: Promise<{ section: string; item: string }>;
}) {
  const { section, item } = await params;
  if (!findItem(section, item)) notFound();
  return <AdminItemView section={section} item={item} />;
}
