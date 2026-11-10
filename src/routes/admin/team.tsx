import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { Notice } from "@/components/admin/shell";
import { deleteAdminTeam, getAdminTeam, saveAdminTeam } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin/team")({
  loader: () => getAdminTeam(),
  component: TeamAdmin,
});

function TeamAdmin() {
  const data = Route.useLoaderData();
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  if (!data.ok) return <p>{data.message}</p>;
  return (
    <div className="space-y-6">
      <h1 className="font-display text-4xl text-secondary">Team</h1>
      {message ? <Notice>{message}</Notice> : null}
      <ul className="space-y-3">
        {data.team.map((member) => (
          <li key={member.id} className="rounded-3xl bg-background p-4">
            <p className="font-semibold">{member.name}</p>
            <p className="text-sm text-ink-soft">{member.designation}</p>
            <button type="button" className="mt-2 text-sm text-danger" onClick={async () => {
              await deleteAdminTeam({ data: member.id });
              await router.invalidate();
            }}>
              Delete
            </button>
          </li>
        ))}
      </ul>
      <form
        className="space-y-3 rounded-3xl bg-background p-5"
        onSubmit={async (event) => {
          event.preventDefault();
          const form = new FormData(event.currentTarget);
          const result = await saveAdminTeam({
            data: {
              name: String(form.get("name") || ""),
              designation: String(form.get("designation") || ""),
              bio: String(form.get("bio") || ""),
              photoUrl: String(form.get("photoUrl") || ""),
              published: true,
              displayOrder: data.team.length,
            },
          });
          setMessage(result.ok ? "Team member saved." : result.message);
          if (result.ok) {
            event.currentTarget.reset();
            await router.invalidate();
          }
        }}
      >
        <h2 className="font-display text-2xl">Add a person</h2>
        <input name="name" required className="input" placeholder="Name" />
        <input name="designation" required className="input" placeholder="Designation" />
        <textarea name="bio" className="input min-h-24" placeholder="Short biography" />
        <input name="photoUrl" className="input" placeholder="Photograph address" />
        <button className="min-h-11 rounded-full bg-primary px-5 text-sm font-semibold">Save</button>
      </form>
    </div>
  );
}
