import { getProjects } from "@/lib/repository";
import { V2ProjectChrome } from "./V2ProjectChrome";

/**
 * The export needs every project id up front. This reads the seed rather than the API
 * so `npm run build` stays runnable with no backend, matching how the other dynamic
 * segments resolve their params.
 */
export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.map((p) => ({ projectId: p.id }));
}

export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  return <V2ProjectChrome projectId={projectId}>{children}</V2ProjectChrome>;
}
