import { notFound } from "next/navigation";
import { ADMIN_ROUTES, findItem } from "@/lib/admin-nav";
import { AdminItemView } from "@/components/AdminItemView";

/**
 * Every admin page is `/<section>/<item>` — this app is its own endpoint, so there is
 * no `/admin` prefix in the path. The pairs are a static list, which is what
 * `output: "export"` needs to prerender them.
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
