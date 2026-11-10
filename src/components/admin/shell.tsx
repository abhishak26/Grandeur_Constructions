import { Link, useRouter } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { logoutAdmin } from "@/lib/admin.functions";

const LINKS = [
  ["/admin", "Overview"],
  ["/admin/projects", "Projects"],
  ["/admin/services", "Services"],
  ["/admin/enquiries", "Enquiries"],
  ["/admin/consultations", "Consultations"],
  ["/admin/homepage", "Homepage"],
  ["/admin/media", "Media"],
  ["/admin/testimonials", "Testimonials"],
  ["/admin/team", "Team"],
  ["/admin/blog", "Blog"],
  ["/admin/settings", "Settings"],
] as const;

export function AdminShell({ name, children }: { name: string; children: ReactNode }) {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-surface">
      <header className="border-b border-line bg-secondary text-background">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <div>
            <p className="font-display text-lg tracking-wide">Studio desk</p>
            <p className="text-xs text-background/70">{name}</p>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Link to="/" className="text-background/80 hover:text-background">
              View site
            </Link>
            <button
              type="button"
              className="min-h-11 rounded-full bg-primary px-4 font-semibold text-secondary"
              onClick={async () => {
                await logoutAdmin();
                await router.invalidate();
                await router.navigate({ to: "/admin/login" });
              }}
            >
              Sign out
            </button>
          </div>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-2 overflow-x-auto px-4 pb-3" aria-label="Studio">
          {LINKS.map(([to, label]) => (
            <Link
              key={to}
              to={to}
              activeOptions={{ exact: true }}
              className="shrink-0 rounded-full px-3 py-2 text-sm text-background/80"
              activeProps={{ className: "shrink-0 rounded-full bg-primary px-3 py-2 text-sm font-semibold text-secondary" }}
            >
              {label}
            </Link>
          ))}
        </nav>
      </header>
      <div className="mx-auto max-w-6xl px-4 py-8">{children}</div>
    </div>
  );
}

export function Notice({ tone = "ok", children }: { tone?: "ok" | "bad"; children: ReactNode }) {
  return (
    <p className={`rounded-2xl px-4 py-3 text-sm ${tone === "ok" ? "bg-background text-success" : "bg-background text-danger"}`}>
      {children}
    </p>
  );
}

export const fieldClass = "input bg-background";
