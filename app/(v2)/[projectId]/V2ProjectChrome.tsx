"use client";

import { createContext, useContext, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, Menu, X } from "lucide-react";
import { api, type PublicProject } from "@/lib/api-v2";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SignOutButton } from "@/components/v2/SignOutButton";
import { cn } from "@/lib/utils";

const NAV = [
  { label: "Overview", segment: "" },
  { label: "Vision", segment: "vision" },
  { label: "Spaces", segment: "spaces" },
  { label: "Domains", segment: "domains" },
  { label: "Materials", segment: "materials" },
  { label: "Journey", segment: "journey" },
  { label: "Gallery", segment: "gallery" },
  { label: "Lessons", segment: "lessons" },
];

interface ProjectContextValue {
  project: PublicProject | null;
  /** The project whose data this subtree renders — always the one in the URL. */
  selectedId: string;
}

const ProjectContext = createContext<ProjectContextValue>({
  project: null,
  selectedId: "",
});

export const useProject = () => useContext(ProjectContext);

export function V2ProjectChrome({
  projectId,
  children,
}: {
  projectId: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [project, setProject] = useState<PublicProject | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    // Only the header/footer need the project record; every child page fetches its own
    // data scoped by `selectedId`, which comes from the route and never from storage.
    api
      .publicProjects()
      .then((ps) => setProject(ps.find((p) => p.id === projectId) ?? null))
      .catch(() => setProject(null));
  }, [projectId]);

  const href = (segment: string) =>
    segment ? `/${projectId}/${segment}` : `/${projectId}`;

  const isActive = (segment: string) => {
    const target = href(segment);
    const here = pathname.replace(/\/$/, "");
    return segment ? here.startsWith(target) : here === target;
  };

  return (
    <ProjectContext.Provider value={{ project, selectedId: projectId }}>
      <div className="flex min-h-screen flex-col bg-background text-foreground">
        <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur">
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-6">
            <div className="flex min-w-0 items-center gap-3">
              <Link
                href="/"
                className="flex shrink-0 items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <ArrowLeft size={16} />
                <span className="hidden sm:inline">All projects</span>
              </Link>
              <Link href={href("")} className="truncate font-serif text-lg tracking-tight">
                {project?.publicTitle ?? "Loading..."}
              </Link>
            </div>

            <div className="flex items-center gap-4">
              <nav className="hidden items-center gap-6 md:flex">
                {NAV.map((item) => (
                  <Link
                    key={item.segment}
                    href={href(item.segment)}
                    className={cn(
                      "text-sm transition-colors hover:text-foreground",
                      isActive(item.segment) ? "text-foreground" : "text-muted-foreground",
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
              <SignOutButton />
              <ThemeToggle />
              <button
                type="button"
                aria-label="Toggle menu"
                onClick={() => setOpen((v) => !v)}
                className="inline-flex h-9 w-9 items-center justify-center md:hidden"
              >
                {open ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
          {open && (
            <nav className="border-t border-border bg-background md:hidden">
              <div className="mx-auto flex max-w-6xl flex-col px-6 py-4">
                {NAV.map((item) => (
                  <Link
                    key={item.segment}
                    href={href(item.segment)}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "py-2 text-sm",
                      isActive(item.segment) ? "text-foreground" : "text-muted-foreground",
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </nav>
          )}
        </header>

        <div className="flex flex-1 flex-col">{children}</div>

        <footer className="border-t border-border bg-surface">
          <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-6 py-8 text-center text-sm text-muted-foreground sm:flex-row sm:justify-between">
            <span>{project?.publicTitle ?? "Residence"} · v2.0 (API-powered)</span>
            <span>Designed by {project?.designer ?? "..."}</span>
          </div>
        </footer>
      </div>
    </ProjectContext.Provider>
  );
}
