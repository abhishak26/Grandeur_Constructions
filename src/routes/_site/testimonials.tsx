import { createFileRoute } from "@tanstack/react-router";
import { EmptyState, PageIntro } from "@/components/site/bits";
import { getTestimonialsPage } from "@/lib/public.functions";

export const Route = createFileRoute("/_site/testimonials")({
  loader: () => getTestimonialsPage(),
  head: () => ({
    meta: [
      { title: "Testimonials · Grandeur Constructions" },
      { name: "description", content: "Client notes published by Grandeur Constructions." },
    ],
  }),
  component: TestimonialsPage,
});

function TestimonialsPage() {
  const { testimonials } = Route.useLoaderData();
  return (
    <>
      <PageIntro
        kicker="Testimonials"
        title="Client notes, unembellished."
        lede="A quote appears only after it is entered and marked published."
      />
      <div className="mx-auto max-w-3xl px-5 py-14 md:px-8">
        {testimonials.length ? (
          <ul className="space-y-6">
            {testimonials.map((item) => (
              <li key={item.quote} className="rounded-3xl bg-surface p-8">
                <blockquote className="font-display text-2xl leading-snug text-secondary">“{item.quote}”</blockquote>
                <p className="mt-4 text-sm text-ink-soft">
                  <span className="font-semibold text-secondary">{item.authorName}</span>
                  {item.authorRole ? ` · ${item.authorRole}` : ""}
                  {item.location ? ` · ${item.location}` : ""}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            title="No testimonials published"
            body="When a client note is added in the studio desk and set to published, it will be listed here."
          />
        )}
      </div>
    </>
  );
}
