import Link from "next/link";
import { ADMIN_NAV } from "@/lib/admin-nav";

export const metadata = { title: "Home" };

/**
 * Admin landing page — a map of the sections rather than a dashboard. Counts would
 * need live, project-scoped fetches; the sections themselves are static, so this page
 * stays a server component and renders instantly while the app shell hydrates.
 */
export default function AdminHome() {
  return (
    <div className="max-w-4xl space-y-6">
      <header className="space-y-1">
        <h1 className="font-serif text-3xl text-foreground">Admin</h1>
        <p className="text-sm text-muted-foreground">
          Manage the projects and every record inside them. Writes are validated
          server-side and require the admin role.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {ADMIN_NAV.map((section) => (
          <section
            key={section.key}
            className="rounded-xl border border-border p-5"
          >
            <h2 className="font-serif text-lg text-foreground">
              {section.label}
            </h2>
            <p className="mt-1 text-xs leading-snug text-muted-foreground">
              {section.description}
            </p>
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {section.items.map((item) => (
                <li key={item.key}>
                  <Link
                    href={`/admin/${section.key}/${item.key}`}
                    className="inline-block rounded-md border border-border px-2.5 py-1 text-xs text-foreground transition-colors hover:bg-muted"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
