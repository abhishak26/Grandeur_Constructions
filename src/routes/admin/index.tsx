import { createFileRoute, Link } from "@tanstack/react-router";
import { enquiryStatusLabel } from "@/lib/company";
import { formatWhen } from "@/lib/format";
import { getOverview } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin/")({
  loader: () => getOverview(),
  head: () => ({ meta: [{ title: "Overview · Studio desk" }] }),
  component: OverviewPage,
});

function OverviewPage() {
  const data = Route.useLoaderData();
  if (!data.ok) return <p className="text-danger">{data.message}</p>;
  const cards = [
    ["Projects", data.stats.projects],
    ["Ongoing", data.stats.ongoing],
    ["Enquiries", data.stats.enquiries],
    ["New enquiries", data.stats.newEnquiries],
    ["Consultations", data.stats.consultations],
    ["Published testimonials", data.stats.testimonials],
  ] as const;
  return (
    <div className="space-y-8">
      <h1 className="font-display text-4xl text-secondary">Overview</h1>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(([label, value]) => (
          <li key={label} className="rounded-3xl bg-background p-5">
            <p className="text-sm text-ink-soft">{label}</p>
            <p className="mt-2 font-display text-4xl tabular-nums text-secondary">{value}</p>
          </li>
        ))}
      </ul>
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-3xl bg-background p-5">
          <h2 className="font-display text-2xl">Recent enquiries</h2>
          {data.recentEnquiries.length ? (
            <ul className="mt-4 space-y-3 text-sm">
              {data.recentEnquiries.map((item) => (
                <li key={item.reference} className="flex items-center justify-between gap-3">
                  <span>
                    <span className="font-semibold">{item.fullName}</span>
                    <span className="text-ink-soft"> · {item.reference}</span>
                  </span>
                  <span>{enquiryStatusLabel(item.status)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-ink-soft">No enquiries yet.</p>
          )}
          <Link to="/admin/enquiries" className="mt-4 inline-block text-sm font-semibold underline">
            Open enquiries
          </Link>
        </section>
        <section className="rounded-3xl bg-background p-5">
          <h2 className="font-display text-2xl">Recent activity</h2>
          {data.activity.length ? (
            <ul className="mt-4 space-y-3 text-sm">
              {data.activity.map((item, index) => (
                <li key={`${item.createdAt}-${index}`}>
                  <p>{item.action}</p>
                  <p className="text-ink-soft">{formatWhen(item.createdAt)}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-ink-soft">No studio activity yet.</p>
          )}
        </section>
      </div>
    </div>
  );
}
