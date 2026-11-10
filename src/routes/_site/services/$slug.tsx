import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Button, RichText } from "@/components/site/bits";
import { COMPANY } from "@/lib/company";
import { getService } from "@/lib/public.functions";

export const Route = createFileRoute("/_site/services/$slug")({
  loader: async ({ params }) => {
    const data = await getService({ data: params.slug });
    if (!data) throw notFound();
    return data;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.service.title ?? "Service"} · Grandeur Constructions` },
      { name: "description", content: loaderData?.service.summary ?? "" },
    ],
  }),
  component: ServicePage,
});

function ServicePage() {
  const { service } = Route.useLoaderData();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.title,
    description: service.summary,
    provider: { "@type": "GeneralContractor", name: COMPANY.name },
    areaServed: "Chennai",
  };
  return (
    <article className="mx-auto max-w-7xl px-5 py-12 md:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <p className="text-xs font-semibold tracking-widest text-ink-soft uppercase">
        <Link to="/services" className="hover:text-secondary">
          Services
        </Link>
      </p>
      <div className="mt-6 grid items-start gap-10 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <h1 className="font-display text-4xl text-secondary md:text-6xl">{service.title}</h1>
          <p className="mt-5 text-lg text-ink-soft">{service.summary}</p>
          <RichText text={service.description} className="mt-6" />
          <div className="mt-8 flex flex-wrap gap-3">
            <Button to="/contact">Get a Quote</Button>
            <Button to="/consultation" variant="ghost">
              Get a Quote
            </Button>
          </div>
        </div>
        {service.imageUrl ? (
          <img
            src={service.imageUrl}
            alt={service.imageAlt ?? ""}
            className="w-full rounded-3xl object-cover lg:col-span-6"
          />
        ) : null}
      </div>
    </article>
  );
}
