import { createFileRoute } from "@tanstack/react-router";
import { EnquiryForm } from "@/components/site/forms";
import { PageIntro } from "@/components/site/bits";
import { COMPANY } from "@/lib/company";
import { phoneDigits, track } from "@/lib/format";
import { getChrome } from "@/lib/public.functions";

export const Route = createFileRoute("/_site/contact")({
  loader: () => getChrome(),
  head: () => ({
    meta: [
      { title: "Contact Us · Grandeur Constructions" },
      {
        name: "description",
        content: "Contact Grandeur Constructions in Perambur, Chennai, or send a project enquiry.",
      },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const { settings, services } = Route.useLoaderData();
  return (
    <>
      <PageIntro
        kicker="Contact"
        title="Tell us about the building."
        lede="The form saves an enquiry for the studio. It does not confirm a visit or a price."
      />
      <section className="contact-map-stage">
        <div className="contact-details-panel">
          <h2 className="font-display text-2xl text-secondary">Studio</h2>
          <p className="mt-3 text-ink-soft">{settings.address}</p>
          <div className="mt-6 space-y-2">
            <a
              className="block font-semibold"
              href={`tel:${phoneDigits(COMPANY.phone)}`}
              onClick={() => track("phone_click", { location: "contact" })}
            >
              {COMPANY.phone}
            </a>
            {settings.email ? (
              <a className="block font-semibold" href={`mailto:${settings.email}`}>
                {settings.email}
              </a>
            ) : (
              <p className="text-sm text-ink-soft">Email address not published yet.</p>
            )}
          </div>
        </div>
        {settings.mapsEmbedUrl ? (
          <div className="contact-map-panel">
            <iframe
              title="Map showing the Grandeur Constructions studio in Perambur"
              src={settings.mapsEmbedUrl}
              className="contact-map contact-map-full"
              width="100%"
              height="100%"
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        ) : null}
      </section>
      <div className="contact-form-wrap">
        <div className="contact-form-shell">
          <EnquiryForm projectTypes={services.map((service) => service.title)} />
        </div>
      </div>
    </>
  );
}
