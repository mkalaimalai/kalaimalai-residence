/**
 * Bare shell for the 2.0 tree. Project chrome (header, nav, footer) lives in
 * `[projectId]/V2ProjectChrome.tsx` because it only makes sense once a project is in the
 * URL — the portfolio index at `/2.0` has no project and carries its own heading.
 */
export default function V2Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {children}
    </div>
  );
}
