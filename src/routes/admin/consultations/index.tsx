import { createFileRoute, Link } from "@tanstack/react-router";
import { enquiryStatusLabel } from "@/lib/company";
import { formatWhen } from "@/lib/format";
import { getAdminConsultations } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin/consultations/")({
  loader: () => getAdminConsultations({ data: { q: "", status: "" } }),
  head: () => ({ meta: [{ title: "Consultations · Studio desk" }] }),
  component: ConsultationsPage,
});

function ConsultationsPage() {
  const data = Route.useLoaderData();
  if (!data.ok) return <p>{data.message}</p>;
  return (
    <div className="space-y-5">
      <h1 className="font-display text-4xl text-secondary">Consultations</h1>
      <p className="text-sm text-ink-soft">These are requests. Nothing here is a confirmed appointment.</p>
      {data.consultations.length ? (
        <ul className="space-y-3">
          {data.consultations.map((item) => (
            <li key={item.id}>
              <Link to="/admin/consultations/$id" params={{ id: item.id }} className="block rounded-3xl bg-background p-4">
                <p className="font-semibold">{item.fullName}</p>
                <p className="text-sm text-ink-soft">
                  {item.reference} · {enquiryStatusLabel(item.status)} · {formatWhen(item.createdAt)}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-ink-soft">No consultation requests yet.</p>
      )}
    </div>
  );
}
