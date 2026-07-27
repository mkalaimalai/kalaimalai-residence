import { getSpaces, getDomains, getDrawings, getVendors, getLessons } from "@/lib/repository";
import { V2DomainDetail } from "./V2DomainDetail";

// Slugs are unique per project, not globally (constitution §5), so the export needs the
// (projectId, slug) pair — a bare slug would collide across projects.
export async function generateStaticParams() {
  const domains = await getDomains();
  return domains.map((d) => ({ projectId: d.projectId, slug: d.slug }));
}

export default async function Page({ params }: { params: Promise<{ projectId: string; slug: string }> }) {
  const { slug } = await params;
  const [spaces, domains, drawings, vendors, lessons] =
    await Promise.all([getSpaces(), getDomains(), getDrawings(), getVendors(), getLessons()]);
  return <V2DomainDetail slug={slug} seed={{ spaces, domains, drawings, vendors, lessons }} />;
}
