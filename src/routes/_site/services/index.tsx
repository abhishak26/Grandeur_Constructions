import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { PageIntro } from "@/components/site/bits";
import { getServices } from "@/lib/public.functions";

export const Route = createFileRoute("/_site/services/")({
  loader: () => getServices(),
  head: () => ({
    meta: [
      { title: "Services · Grandeur Constructions" },
      {
        name: "description",
        content:
          "Residential and commercial construction, design, interiors, engineering, renovation and project management in Chennai.",
      },
    ],
  }),
  component: ServicesPage,
});

function ServicesPage() {
  const { servicesFull } = Route.useLoaderData();
  return (
    <>
      <PageIntro
        kicker="Services"
        title="The work the studio will take on."
        lede="Nine services. Each one is scoped in writing before construction starts."
      />
      <div className="mx-auto grid max-w-7xl gap-5 px-5 py-14 md:grid-cols-2 md:px-8 lg:grid-cols-3">
        {servicesFull.map((service) => (
          <Link key={service.id} to="/services/$slug" params={{ slug: service.slug }} className="group">
            <article className="h-full overflow-hidden rounded-3xl bg-surface">
              {service.imageUrl ? (
                <div className="frame-card overflow-hidden">
                  <img
                    src={service.imageUrl}
                    alt={service.imageAlt ?? ""}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
              ) : null}
              <div className="p-5">
                <h2 className="font-display text-2xl text-secondary">{service.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{service.summary}</p>
                <p className="mt-4 inline-flex items-center gap-1 text-sm font-semibold">
                  Learn more <ArrowUpRight className="size-4 text-primary" />
                </p>
              </div>
            </article>
          </Link>
        ))}
      </div>
    </>
  );
}
