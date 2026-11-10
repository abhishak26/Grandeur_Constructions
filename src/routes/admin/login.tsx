import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { getAdminGate, loginAdmin, setupAdmin } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin/login")({
  loader: () => getAdminGate(),
  head: () => ({ meta: [{ title: "Studio desk · Grandeur Constructions" }] }),
  component: LoginPage,
});

function LoginPage() {
  const gate = Route.useLoaderData();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function afterSuccess() {
    await router.invalidate();
    await router.navigate({ to: "/admin" });
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-5 py-16">
      <p className="font-display text-sm tracking-widest text-ink-soft">GRANDEUR</p>
      <h1 className="mt-3 font-display text-4xl text-secondary">Studio desk</h1>
      <p className="mt-3 text-sm leading-relaxed text-ink-soft">
        {gate.configured
          ? "Sign in with the administrator account. There is no public registration."
          : "Create the only administrator. After this, registration stays closed."}
      </p>
      {gate.configured ? (
        <form
          className="mt-8 space-y-4"
          onSubmit={async (event) => {
            event.preventDefault();
            setPending(true);
            setError(null);
            const form = new FormData(event.currentTarget);
            const result = await loginAdmin({
              data: { email: String(form.get("email") || ""), password: String(form.get("password") || "") },
            });
            setPending(false);
            if (!result.ok) {
              setError(result.message);
              return;
            }
            await afterSuccess();
          }}
        >
          <label className="block space-y-2 text-sm">
            Email
            <input name="email" type="email" required className="input" autoComplete="username" />
          </label>
          <label className="block space-y-2 text-sm">
            Password
            <input name="password" type="password" required className="input" autoComplete="current-password" />
          </label>
          {error ? <p className="text-sm text-danger">{error}</p> : null}
          <button type="submit" disabled={pending} className="min-h-11 w-full rounded-full bg-primary font-semibold text-secondary">
            {pending ? "Signing in…" : "Sign in"}
          </button>
        </form>
      ) : (
        <form
          className="mt-8 space-y-4"
          onSubmit={async (event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            const password = String(form.get("password") || "");
            const confirm = String(form.get("confirm") || "");
            if (password !== confirm) {
              setError("Passwords do not match.");
              return;
            }
            setPending(true);
            setError(null);
            const result = await setupAdmin({
              data: {
                name: String(form.get("name") || ""),
                email: String(form.get("email") || ""),
                password,
              },
            });
            setPending(false);
            if (!result.ok) {
              setError(result.message);
              return;
            }
            await afterSuccess();
          }}
        >
          <label className="block space-y-2 text-sm">
            Your name
            <input name="name" required className="input" />
          </label>
          <label className="block space-y-2 text-sm">
            Email
            <input name="email" type="email" required className="input" autoComplete="username" />
          </label>
          <label className="block space-y-2 text-sm">
            Password
            <input name="password" type="password" required minLength={10} className="input" autoComplete="new-password" />
          </label>
          <label className="block space-y-2 text-sm">
            Confirm password
            <input name="confirm" type="password" required minLength={10} className="input" autoComplete="new-password" />
          </label>
          {error ? <p className="text-sm text-danger">{error}</p> : null}
          <button type="submit" disabled={pending} className="min-h-11 w-full rounded-full bg-secondary font-semibold text-background">
            {pending ? "Creating…" : "Create administrator"}
          </button>
        </form>
      )}
    </main>
  );
}
