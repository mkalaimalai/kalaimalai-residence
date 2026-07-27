import { getSpaces, getDomains, getDrawings, getVendors, getDecisions, getLessons, getMaterials, getGallery } from "@/lib/repository";
import { V2SpaceDetail } from "./V2SpaceDetail";

// Slugs are unique per project, not globally (constitution §5), so the export needs the
// (projectId, slug) pair — a bare slug would collide across projects.
export async function generateStaticParams() {
  const spaces = await getSpaces();
  return spaces.map((s) => ({ projectId: s.projectId, slug: s.slug }));
}

export default async function Page({ params }: { params: Promise<{ projectId: string; slug: string }> }) {
  const { slug } = await params;
  const [spaces, domains, drawings, vendors, decisions, lessons, materials, gallery] =
    await Promise.all([
      getSpaces(), getDomains(), getDrawings(), getVendors(),
      getDecisions(), getLessons(), getMaterials(), getGallery(),
    ]);
  return <V2SpaceDetail slug={slug} seed={{ spaces, domains, drawings, vendors, decisions, lessons, materials, gallery }} />;
}
