import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { enquiryStatusLabel } from "@/lib/company";
import { formatWhen } from "@/lib/format";
import { getAdminEnquiries } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin/enquiries/")({
  loader: () => getAdminEnquiries({ data: { q: "", status: "" } }),
  head: () => ({ meta: [{ title: "Enquiries · Studio desk" }] }),
  component: EnquiriesPage,
});

function EnquiriesPage() {
  const data = Route.useLoaderData();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  if (!data.ok) return <p>{data.message}</p>;
  const rows = data.enquiries.filter((item) => {
    const hay = `${item.fullName} ${item.email} ${item.phone} ${item.reference}`.toLowerCase();
    const matchesQuery = !q || hay.includes(q.toLowerCase());
    const matchesStatus = !status || item.status === status;
    return matchesQuery && matchesStatus;
  });
  return (
    <div className="space-y-5">
      <h1 className="font-display text-4xl text-secondary">Enquiries</h1>
      <div className="flex flex-wrap gap-3">
        <input value={q} onChange={(event) => setQ(event.target.value)} placeholder="Search name, email, phone, reference" className="input max-w-sm" />
        <select value={status} onChange={(event) => setStatus(event.target.value)} className="input max-w-xs">
          <option value="">All statuses</option>
          {["new", "contacted", "in_progress", "completed", "archived"].map((value) => (
            <option key={value} value={value}>
              {enquiryStatusLabel(value)}
            </option>
          ))}
        </select>
      </div>
      {rows.length ? (
        <ul className="space-y-3">
          {rows.map((item) => (
            <li key={item.id}>
              <Link to="/admin/enquiries/$id" params={{ id: item.id }} className="block rounded-3xl bg-background p-4">
                <p className="font-semibold">{item.fullName}</p>
                <p className="text-sm text-ink-soft">
                  {item.reference} · {enquiryStatusLabel(item.status)} · {formatWhen(item.createdAt)}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-ink-soft">No enquiries match.</p>
      )}
    </div>
  );
}
