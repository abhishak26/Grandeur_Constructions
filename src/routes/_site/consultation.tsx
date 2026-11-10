import { createFileRoute } from "@tanstack/react-router";
import { PageIntro } from "@/components/site/bits";
import { ConsultationForm } from "@/components/site/forms";
import { getChrome } from "@/lib/public.functions";

export const Route = createFileRoute("/_site/consultation")({
  loader: () => getChrome(),
  head: () => ({
    meta: [
      { title: "Request a Consultation · Grandeur Constructions" },
      {
        name: "description",
        content:
          "Request a consultation with Grandeur Constructions. Submitting the form does not confirm an appointment.",
      },
    ],
  }),
  component: ConsultationPage,
});

function ConsultationPage() {
  const { services } = Route.useLoaderData();
  return (
    <>
      <PageIntro
        kicker="Consultation"
        title="Ask for a conversation. It is not booked until we reply."
        lede="Share enough for the studio to understand the site or the building. A reference number means the request was stored, not that a time is held."
      />
      <div className="mx-auto max-w-3xl px-5 py-14 md:px-8">
        <ConsultationForm projectTypes={services.map((service) => service.title)} />
      </div>
    </>
  );
}
