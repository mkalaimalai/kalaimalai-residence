"use client";

/**
 * Users tab — who has signed up, and what they can do.
 *
 * Purpose-built rather than generated from `lib/admin-schema.ts` like most tabs: the
 * flat field registry assumes a CRUD entity, and this is not one. There is no create
 * (Supabase Auth owns signup), no delete, and the single writable field goes through a
 * bespoke endpoint rather than a PATCH of the row.
 *
 * The role shown here is `user_profiles.role`, a **mirror** of `app_metadata.role` on
 * the token, which is what actually decides authorization. Changing it here calls
 * `PATCH /users/{id}/role`, which writes the real claim first and the mirror second, so
 * the two cannot drift apart.
 */
import { useCallback, useEffect, useState } from "react";
import { Loader2, ShieldCheck, User } from "lucide-react";
import { api, ApiError } from "@/lib/api-client";
import type { UserProfile, UserRole } from "@/types/api";
import { cn } from "@/lib/utils";

const ROLES: { value: UserRole; label: string; hint: string }[] = [
  { value: "viewer", label: "Viewer", hint: "Read-only access to every project." },
  { value: "admin", label: "Admin", hint: "Can create, edit and delete everything." },
];

export function UsersAdmin() {
  const [users, setUsers] = useState<UserProfile[] | null>(null);
  // Own id, to mark "you" and to disable the self-demotion control. Fetched here rather
  // than threaded through props: `useAuth` exposes email and isAdmin but not the id.
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  // Which row is mid-write, so only that row's control disables.
  const [saving, setSaving] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      setUsers(await api.users());
    } catch (err) {
      setUsers([]);
      setError(
        err instanceof ApiError && err.status === 403
          ? "Only admins can see the user list."
          : err instanceof Error
            ? err.message
            : "Could not load users",
      );
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
    // Failure is tolerable — worst case the "you" marker is missing and the server
    // still refuses a self-demotion.
    api.me().then((p) => setCurrentUserId(p.id)).catch(() => undefined);
  }, [load]);

  const changeRole = async (user: UserProfile, role: UserRole) => {
    if (role === user.role) return;
    setSaving(user.id);
    setError(null);
    setNote(null);
    try {
      const updated = await api.setUserRole(user.id, role);
      setUsers((prev) =>
        (prev ?? []).map((u) => (u.id === updated.id ? updated : u)),
      );
      setNote(
        `${label(updated)} is now ${role}. It takes effect for them when their ` +
          `session token refreshes — within the hour, or immediately if they sign out ` +
          `and back in.`,
      );
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.status === 501
            ? "The server has no SUPABASE_SERVICE_ROLE_KEY configured, so roles cannot " +
              "be changed from here. Set it on the API, or use the Supabase dashboard."
            : err.message
          : "Could not change that role",
      );
    } finally {
      setSaving(null);
    }
  };

  if (users === null) {
    return (
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 size={14} className="animate-spin" /> Loading users…
      </p>
    );
  }

  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h2 className="font-serif text-xl text-foreground">Users</h2>
        <p className="text-sm text-muted-foreground">
          Accounts are created by signing up — they cannot be added here. Roles decide
          what someone can do across every project.
        </p>
      </div>

      {error && (
        <p className="rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}
      {note && !error && <p className="text-sm text-muted-foreground">{note}</p>}

      {users.length === 0 && !error ? (
        <p className="text-sm text-muted-foreground">Nobody has signed up yet.</p>
      ) : (
        <ul className="divide-y divide-border rounded-xl border border-border">
          {users.map((u) => {
            const isSelf = u.id === currentUserId;
            return (
              <li
                key={u.id}
                className="flex flex-wrap items-center justify-between gap-4 p-4"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border",
                      u.role === "admin"
                        ? "text-foreground"
                        : "text-muted-foreground",
                    )}
                  >
                    {u.role === "admin" ? (
                      <ShieldCheck size={16} />
                    ) : (
                      <User size={16} />
                    )}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm text-foreground">
                      {label(u)}
                      {isSelf && (
                        <span className="ml-2 text-xs text-muted-foreground">you</span>
                      )}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {u.email ?? "no email"} · joined{" "}
                      {new Date(u.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {saving === u.id && (
                    <Loader2 size={14} className="animate-spin text-muted-foreground" />
                  )}
                  <select
                    value={u.role}
                    // An admin demoting themselves locks themselves out, and the server
                    // refuses it too — disabling here just avoids the pointless 422.
                    disabled={saving !== null || (isSelf && u.role === "admin")}
                    onChange={(e) =>
                      void changeRole(u, e.target.value as UserRole)
                    }
                    title={
                      isSelf && u.role === "admin"
                        ? "You cannot remove your own admin role"
                        : undefined
                    }
                    className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-foreground disabled:opacity-50"
                  >
                    {ROLES.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <dl className="space-y-1 text-xs text-muted-foreground">
        {ROLES.map((r) => (
          <div key={r.value} className="flex gap-2">
            <dt className="font-medium text-foreground">{r.label}</dt>
            <dd>{r.hint}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function label(u: UserProfile): string {
  return u.displayName || u.email || u.id;
}
