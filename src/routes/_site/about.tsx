import { createFileRoute } from "@tanstack/react-router";
import { PageIntro, RichText } from "@/components/site/bits";
import { COMPANY } from "@/lib/company";
import { getHome } from "@/lib/public.functions";

export const Route = createFileRoute("/_site/about")({
  loader: () => getHome(),
  head: () => ({
    meta: [
      { title: "About Us · Grandeur Constructions" },
      {
        name: "description",
        content:
          "Grandeur Constructions is a residential and commercial building practice in Perambur, Chennai, with more than ten years of experience.",
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  const { home, settings, services } = Route.useLoaderData();
  return (
    <>
      <PageIntro
        kicker="About us"
        title="Building in Chennai, with the brief written down."
        lede={settings.tagline}
      />
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 md:px-8 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <p className="font-display text-5xl text-secondary">
            {COMPANY.years}
            <span className="text-primary">+</span>
          </p>
          <p className="text-sm text-ink-soft">years of experience</p>
          <h2 className="mt-8 font-display text-3xl text-secondary">{home.aboutHeading}</h2>
          <RichText text={home.aboutBody} className="mt-4" />
          <dl className="mt-8 space-y-4 text-sm">
            <div>
              <dt className="font-semibold text-secondary">Studio</dt>
              <dd className="text-ink-soft">{settings.address}</dd>
            </div>
            <div>
              <dt className="font-semibold text-secondary">Work</dt>
              <dd className="text-ink-soft">Residential and commercial construction.</dd>
            </div>
          </dl>
        </div>
        <div className="space-y-4 lg:col-span-6">
          <img
            src="/media/facade.jpg"
            alt="Reference photograph of a modern street-facing house."
            className="w-full rounded-3xl object-cover"
          />
          <div className="grid gap-4 md:grid-cols-2">
            <article className="rounded-3xl bg-surface p-6">
              <h3 className="font-display text-xl">Mission</h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                {home.mission || "Not published yet. Add the mission from the studio desk."}
              </p>
            </article>
            <article className="rounded-3xl bg-surface p-6">
              <h3 className="font-display text-xl">Vision</h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                {home.vision || "Not published yet. Add the vision from the studio desk."}
              </p>
            </article>
          </div>
          {home.founderName ? (
            <article className="rounded-3xl border border-line p-6">
              <p className="text-xs font-semibold tracking-widest text-ink-soft uppercase">Founder</p>
              <h3 className="mt-2 font-display text-2xl">{home.founderName}</h3>
              {home.founderBio ? <p className="mt-3 text-sm leading-relaxed text-ink-soft">{home.founderBio}</p> : null}
            </article>
          ) : null}
        </div>
      </div>
      <section className="bg-surface">
        <div className="mx-auto max-w-7xl px-5 py-14 md:px-8">
          <h2 className="font-display text-3xl text-secondary">Services offered</h2>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <li key={service.slug} className="rounded-2xl bg-background px-4 py-3 text-sm font-medium">
                {service.title}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
