import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { Notice } from "@/components/admin/shell";
import { enquiryStatusLabel } from "@/lib/company";
import { deleteAdminEnquiry, getAdminEnquiry, updateAdminEnquiry } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin/enquiries/$id")({
  loader: ({ params }) => getAdminEnquiry({ data: params.id }),
  component: EnquiryDetail,
});

const STATUSES = ["new", "contacted", "in_progress", "completed", "archived"] as const;

function EnquiryDetail() {
  const data = Route.useLoaderData();
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  if (!data.ok) return <p>{data.message}</p>;
  const item = data.enquiry;
  return (
    <div className="space-y-6">
      <h1 className="font-display text-4xl text-secondary">{item.reference}</h1>
      <dl className="grid gap-3 rounded-3xl bg-background p-5 text-sm md:grid-cols-2">
        <div><dt className="text-ink-soft">Name</dt><dd>{item.fullName}</dd></div>
        <div><dt className="text-ink-soft">Email</dt><dd>{item.email}</dd></div>
        <div><dt className="text-ink-soft">Phone</dt><dd>{item.phone}</dd></div>
        <div><dt className="text-ink-soft">Project type</dt><dd>{item.projectType}</dd></div>
        <div><dt className="text-ink-soft">Location</dt><dd>{item.projectLocation}</dd></div>
        <div><dt className="text-ink-soft">Budget</dt><dd>{item.estimatedBudget || "Not given"}</dd></div>
        <div><dt className="text-ink-soft">Preferred contact</dt><dd>{item.preferredContact}</dd></div>
        <div className="md:col-span-2"><dt className="text-ink-soft">Description</dt><dd className="whitespace-pre-wrap">{item.projectDescription}</dd></div>
      </dl>
      <form
        className="space-y-4 rounded-3xl bg-background p-5"
        onSubmit={async (event) => {
          event.preventDefault();
          const form = new FormData(event.currentTarget);
          const result = await updateAdminEnquiry({
            data: {
              id: item.id,
              status: String(form.get("status") || "new"),
              internalNotes: String(form.get("internalNotes") || ""),
            },
          });
          setMessage(result.ok ? "Enquiry updated." : result.message);
          if (result.ok) await router.invalidate();
        }}
      >
        {message ? <Notice>{message}</Notice> : null}
        <label className="block space-y-2 text-sm">
          Status
          <select name="status" defaultValue={item.status} className="input">
            {STATUSES.map((status) => (
              <option key={status} value={status}>{enquiryStatusLabel(status)}</option>
            ))}
          </select>
        </label>
        <label className="block space-y-2 text-sm">
          Internal notes
          <textarea name="internalNotes" defaultValue={item.internalNotes} className="input min-h-28" />
        </label>
        <div className="flex gap-3">
          <button type="submit" className="min-h-11 rounded-full bg-primary px-5 text-sm font-semibold">Save</button>
          <button
            type="button"
            className="min-h-11 text-sm text-danger"
            onClick={async () => {
              if (!confirm("Delete this enquiry?")) return;
              await deleteAdminEnquiry({ data: item.id });
              await router.navigate({ to: "/admin/enquiries" });
            }}
          >
            Delete
          </button>
        </div>
      </form>
    </div>
  );
}
