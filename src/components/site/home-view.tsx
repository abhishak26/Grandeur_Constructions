import { Link } from "@tanstack/react-router";
import * as Accordion from "@radix-ui/react-accordion";
import { ArrowUpRight, ChevronDown, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { Button, EmptyState, Highlight, Reveal, SectionLabel } from "@/components/site/bits";
import { EnquiryForm } from "@/components/site/forms";
import { COMPANY, categoryLabel, statusLabel } from "@/lib/company";
import { phoneDigits, track } from "@/lib/format";
import type { getHome } from "@/lib/public.functions";

type HomeData = Awaited<ReturnType<typeof getHome>>;
type Project = HomeData["featured"][number];

const LEAD_MODAL_SESSION_KEY = "grandeur-lead-modal-closed";

function LeadCaptureModal({ projectTypes }: { projectTypes: string[] }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (window.sessionStorage.getItem(LEAD_MODAL_SESSION_KEY) === "true") return;
    const timer = window.setTimeout(() => setOpen(true), 3000);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeModal();
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.classList.add("lead-modal-open");
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.classList.remove("lead-modal-open");
    };
  }, [open]);

  function closeModal() {
    window.sessionStorage.setItem(LEAD_MODAL_SESSION_KEY, "true");
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div className="lead-modal-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) closeModal();
    }}>
      <section
        className="lead-modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="lead-modal-title"
      >
        <button type="button" className="lead-modal-close" aria-label="Close quote form" onClick={closeModal}>
          <span aria-hidden="true">✕</span>
        </button>
        <div className="lead-modal-form">
          <div className="lead-modal-form-header">
            <p id="lead-modal-title">Get a free quote !!</p>
          </div>
          <div className="lead-modal-form-body">
            <EnquiryForm projectTypes={projectTypes} compact />
          </div>
        </div>
        <aside className="lead-modal-brand">
          <img src="/media/grandeur-logo.png" alt="Grandeur Constructions" />
          <h2>
            Home
            <br />
            Construction
            <strong>Experts</strong>
            <br />
            In
            <span>India</span>
          </h2>
          <p className="lead-modal-badge">Turnkey construction<br />services</p>
        </aside>
      </section>
    </div>
  );
}

const EXTRA_HERO_SLIDES = [
  {
    imageUrl: "/media/interior.jpg",
    alt: "Bright, finished interior with considered details.",
  },
  {
    imageUrl: "/media/commercial.jpg",
    alt: "Contemporary commercial space designed for modern work.",
  },
] as const;

function HeroMedia({
  slides,
  index,
  onIndexChange,
}: {
  slides: HomeData["slides"];
  index: number;
  onIndexChange: (nextIndex: number | ((currentIndex: number) => number)) => void;
}) {
  const reduce = useReducedMotion();
  const frames = (slides.length ? slides : [{ imageUrl: "/media/hero-home.jpg", alt: "Contemporary residence" }]).concat(
    EXTRA_HERO_SLIDES,
  );

  useEffect(() => {
    if (reduce || frames.length < 2) return;
    const timer = window.setInterval(() => onIndexChange((current) => (current + 1) % frames.length), 6800);
    return () => window.clearInterval(timer);
  }, [frames.length, onIndexChange, reduce]);

  return (
    <div className="absolute inset-0 overflow-hidden bg-secondary">
      {frames.map((slide, slideIndex) => (
        <img
          key={slide.imageUrl + slideIndex}
          src={slide.imageUrl}
          alt={slide.alt ?? ""}
          className={`pointer-events-none absolute inset-0 h-full w-full object-cover brightness-105 transition-opacity duration-700 ${
            slideIndex === index ? "opacity-100" : "opacity-0"
          }`}
          fetchPriority={slideIndex === 0 ? "high" : "auto"}
        />
      ))}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-secondary/80 via-secondary/35 to-secondary/10" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-secondary/35 via-transparent to-transparent" />
      {frames.length > 1 ? (
        <div className="pointer-events-auto absolute bottom-4 left-4 z-20 flex gap-2">
          {frames.map((slide, slideIndex) => (
            <button
              key={slide.imageUrl}
              type="button"
              aria-label={`Show photograph ${slideIndex + 1}`}
              aria-current={slideIndex === index}
              className={`h-2.5 w-8 rounded-full ${slideIndex === index ? "bg-primary" : "bg-background/70"}`}
              onClick={() => onIndexChange(slideIndex)}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

const HERO_SLIDE_COPY = [
  {
    heading: "Build the home you've been imagining",
    highlight: "home you've been imagining",
  },
  {
    heading: "Make your business stand out",
    highlight: "business stand out",
  },
  {
    heading: "Turn your vision into a space you'll love",
    highlight: "space you'll love",
  },
  {
    heading: "Create interiors that feel like you",
    highlight: "interiors that feel like you",
  },
  {
    heading: "Give your business a better space",
    highlight: "business a better space",
  },
] as const;

const PARTNER_LOGOS = [
  { name: "SAP", src: "https://cdn.simpleicons.org/sap" },
  { name: "Uber", src: "https://cdn.simpleicons.org/uber" },
  { name: "Verizon", src: "https://cdn.simpleicons.org/verizon" },
  { name: "Yale", src: "https://cdn.simpleicons.org/yale" },
  { name: "Panasonic", src: "https://cdn.simpleicons.org/panasonic" },
  { name: "Google", src: "https://cdn.simpleicons.org/google" },
  { name: "Siemens", src: "https://cdn.simpleicons.org/siemens" },
  { name: "Bosch", src: "https://cdn.simpleicons.org/bosch" },
  { name: "3M", src: "https://cdn.simpleicons.org/3m" },
  { name: "Tata", src: "https://cdn.simpleicons.org/tata" },
  { name: "Havells", src: "https://cdn.simpleicons.org/havells" },
  { name: "Caterpillar", src: "https://cdn.simpleicons.org/caterpillar" },
] as const;

function PartnerLogoMarquee() {
  const rows = [PARTNER_LOGOS, [...PARTNER_LOGOS].reverse()] as const;
  return (
    <section className="partner-marquee" aria-label="Trusted material and design partners">
      <div className="mx-auto max-w-7xl px-5 pt-16 text-center md:px-8">
        <p className="partner-marquee-kicker">Trusted &amp; quality</p>
        <h2 className="partner-marquee-title">Partnership</h2>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-ink-soft">
          We work with dependable materials and specialist brands to bring lasting quality to every space.
        </p>
      </div>
      <div className="partner-marquee-window mt-10">
        {rows.map((row, rowIndex) => (
          <div className={`partner-marquee-track ${rowIndex === 1 ? "partner-marquee-track-reverse" : ""}`} key={rowIndex}>
            {[...row, ...row].map((logo, index) => (
              <div className="partner-logo-tile" key={`${rowIndex}-${logo.name}-${index}`} aria-hidden={index >= row.length}>
                <img src={logo.src} alt={index >= row.length ? "" : logo.name} loading="lazy" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}

const COMPLETED_PROJECT_IMAGES = [
  { src: "https://picsum.photos/id/1018/1200/900", alt: "Completed contemporary home surrounded by greenery" },
  { src: "https://picsum.photos/id/1033/1200/900", alt: "Completed timber-clad residence in a wooded setting" },
  { src: "https://picsum.photos/id/1040/1200/900", alt: "Completed architectural exterior with a clean modern facade" },
  { src: "https://picsum.photos/id/1050/1200/900", alt: "Completed home overlooking a calm natural landscape" },
  { src: "https://picsum.photos/id/1067/1200/900", alt: "Completed residence with warm wood and stone details" },
  { src: "https://picsum.photos/id/1073/1200/900", alt: "Completed project with a light-filled architectural interior" },
  { src: "https://picsum.photos/id/1080/1200/900", alt: "Completed modern home beside a quiet forest" },
  { src: "https://picsum.photos/id/1084/1200/900", alt: "Completed architectural project with a bold geometric form" },
] as const;

function ProjectCard({ project, onOpen }: { project: Project; onOpen: (project: Project) => void }) {
  const image = project.images[0];

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl bg-surface text-left">
      <div className="aspect-[16/10] overflow-hidden bg-muted">
        <button type="button" onClick={() => onOpen(project)} className="block h-full w-full">
          {image ? (
            <img
              src={image.url}
              alt={image.alt ?? `${project.name} project photograph`}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="grid h-full place-items-center text-sm text-ink-soft">No photograph yet</div>
          )}
        </button>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-semibold tracking-widest text-ink-soft uppercase">
          {categoryLabel(project.category)} · {statusLabel(project.status)}
        </p>
        <button type="button" onClick={() => onOpen(project)} className="mt-2 text-left">
          <h3 className="font-display text-2xl text-secondary">{project.name}</h3>
          {project.location ? <p className="mt-1 text-sm text-ink-soft">{project.location}</p> : null}
        </button>
        <div className="mt-auto pt-5">
          <span className="text-xs text-ink-soft">Project detail</span>
        </div>
      </div>
    </article>
  );
}

const PROJECT_DETAILS: Record<string, { scope: string; area: string; status: string }> = {
  "adyar-courtyard-home": {
    scope: "Turnkey residential construction with courtyard planning, structural coordination and interiors.",
    area: "2,850 sq. ft.",
    status: "Completed · November 2024",
  },
  "anna-nagar-workplace": {
    scope: "Commercial fit-out including reception, workstations, meeting rooms and services coordination.",
    area: "4,200 sq. ft.",
    status: "Completed · March 2025",
  },
  "perambur-family-residence": {
    scope: "New family home with reinforced concrete structure, masonry, services and finish coordination.",
    area: "2,100 sq. ft.",
    status: "Foundation & slab casting complete · 68%",
  },
  "ecr-weekend-retreat": {
    scope: "Architectural design for a shaded coastal retreat with indoor-outdoor living and low-maintenance finishes.",
    area: "1,650 sq. ft. proposed",
    status: "Design development · 35%",
  },
};

function ProjectDetailModal({ project, onClose }: { project: Project; onClose: () => void }) {
  const details = PROJECT_DETAILS[project.slug] ?? {
    scope: project.description,
    area: "Details to be confirmed",
    status: statusLabel(project.status),
  };
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-secondary/70 p-5" role="presentation" onClick={onClose}>
      <article
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-dialog-title"
        className="project-detail-modal w-full max-w-2xl rounded-3xl bg-background p-6 shadow-2xl md:p-8"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="text-xs font-semibold tracking-widest text-ink-soft uppercase">
              {categoryLabel(project.category)} · {project.location}
            </p>
            <h2 id="project-dialog-title" className="mt-2 font-display text-3xl text-secondary">{project.name}</h2>
          </div>
          <button type="button" aria-label="Close project details" className="grid size-11 shrink-0 place-items-center rounded-full border border-line" onClick={onClose}>
            <X className="size-5" />
          </button>
        </div>
        <img src={project.images[0]?.url} alt={project.images[0]?.alt ?? `${project.name} project`} className="mt-6 aspect-[16/9] w-full rounded-2xl object-cover" />
        <dl className="mt-6 grid gap-4 sm:grid-cols-3">
          <div><dt className="text-xs font-semibold tracking-widest text-ink-soft uppercase">Scope</dt><dd className="mt-2 text-sm leading-relaxed text-secondary">{details.scope}</dd></div>
          <div><dt className="text-xs font-semibold tracking-widest text-ink-soft uppercase">Built-up area</dt><dd className="mt-2 text-sm text-secondary">{details.area}</dd></div>
          <div><dt className="text-xs font-semibold tracking-widest text-ink-soft uppercase">Current status</dt><dd className="mt-2 text-sm text-secondary">{details.status}</dd></div>
        </dl>
        {project.slug === "perambur-family-residence" ? (
          <div className="mt-7 rounded-2xl bg-surface p-5">
            <div className="flex items-center justify-between text-sm font-semibold text-secondary"><span>Build progress</span><span>68%</span></div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-line"><div className="h-full w-[68%] rounded-full bg-primary" /></div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-ink-soft"><span>✓ Structure</span><span>✓ Masonry</span><span>○ Finishing</span><span>○ MEP</span></div>
          </div>
        ) : null}
      </article>
    </div>
  );
}

export function HomeView({ data }: { data: HomeData }) {
  const { settings, home, services } = data;
  const projectTypes = services.map((service) => service.title);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [heroSlideIndex, setHeroSlideIndex] = useState(0);
  const heroCopy = HERO_SLIDE_COPY[heroSlideIndex] ?? HERO_SLIDE_COPY[0];
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "GeneralContractor",
    name: settings.companyName,
    slogan: settings.tagline,
    description: home.heroDescription,
    address: {
      "@type": "PostalAddress",
      streetAddress: COMPANY.street,
      addressLocality: COMPANY.locality,
      addressRegion: COMPANY.region,
      postalCode: COMPANY.postalCode,
      addressCountry: "IN",
    },
    areaServed: "Chennai",
    telephone: COMPANY.phone,
    ...(settings.email ? { email: settings.email } : {}),
    ...(settings.publicSiteUrl ? { url: settings.publicSiteUrl } : {}),
  };

  return (
    <div>
      <LeadCaptureModal projectTypes={projectTypes} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="hero-carousel relative overflow-hidden bg-secondary text-background">
        <HeroMedia slides={data.slides} index={heroSlideIndex} onIndexChange={setHeroSlideIndex} />
        <div className="hero-carousel-content relative mx-auto flex max-w-7xl items-center px-5 py-16 md:px-8">
          <div className="max-w-2xl">
            <h1 className="font-display text-4xl leading-tight md:text-6xl">
              <Highlight text={heroCopy.heading} highlight={heroCopy.highlight} />
            </h1>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button to={home.primaryCtaHref}>{home.primaryCtaText}</Button>
              <Button to={home.secondaryCtaHref} variant="ghost">
                {home.secondaryCtaText}
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 md:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <SectionLabel>Services</SectionLabel>
            <h2 className="mt-3 font-display text-4xl text-secondary md:text-5xl">Nine ways the studio works.</h2>
          </div>
          <Link to="/services" className="text-sm font-semibold text-secondary underline">
            All services
          </Link>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => (
            <Reveal key={service.id} className={index === 0 ? "md:col-span-2 lg:col-span-1" : ""}>
              <Link to="/services/$slug" params={{ slug: service.slug }} className="group block h-full">
                <article className="h-full overflow-hidden rounded-3xl bg-surface">
                  <div className="frame-card overflow-hidden">
                    {service.imageUrl ? (
                      <img
                        src={service.imageUrl}
                        alt={service.imageAlt ?? ""}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : null}
                  </div>
                  <div className="p-5">
                    <h3 className="font-display text-2xl text-secondary">{service.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-ink-soft">{service.summary}</p>
                    <p className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-secondary">
                      Learn more <ArrowUpRight className="size-4 text-primary" />
                    </p>
                  </div>
                </article>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bg-secondary text-background">
        <div className="mx-auto max-w-7xl px-5 py-20 md:px-8">
          <SectionLabel>
            <span className="text-primary">How the work is approached</span>
          </SectionLabel>
          <h2 className="mt-4 max-w-2xl font-display text-4xl md:text-5xl">Standards we work toward. Not trophies we claim.</h2>
          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data.principles.map((item, index) => (
              <article key={item.title} className="rounded-3xl border border-background/15 p-6">
                <p className="font-display text-3xl text-primary">{String(index + 1).padStart(2, "0")}</p>
                <h3 className="mt-4 font-display text-2xl">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-background/75">{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 md:px-8">
        <SectionLabel>Featured projects</SectionLabel>
        <h2 className="mt-3 font-display text-4xl text-secondary md:text-5xl">Works we have chosen to show.</h2>
        <div className="mt-10">
          {data.featured.length ? (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              {data.featured.slice(0, 4).map((project) => (
                <ProjectCard key={project.id} project={project} onOpen={setSelectedProject} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No featured projects yet"
              body="Completed and ongoing work appears here only after it is published from the studio desk. Nothing on this page is a stand-in project."
            />
          )}
        </div>
      </section>

      <section className="completed-gallery-section" aria-labelledby="completed-projects-title">
        <header className="completed-gallery-header">
          <SectionLabel>Actual Pictures</SectionLabel>
          <h2 id="completed-projects-title">Our Completed Site Pictures</h2>
        </header>
        <div className="completed-gallery-grid">
          {COMPLETED_PROJECT_IMAGES.map((image, index) => (
            <figure className="completed-gallery-tile" key={image.src}>
              <img src={image.src} alt={image.alt} loading={index < 4 ? "eager" : "lazy"} />
            </figure>
          ))}
        </div>
      </section>

      <section className="bg-surface">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 md:px-8 lg:grid-cols-2">
          <div className="lg:col-span-2">
            <SectionLabel>On site now</SectionLabel>
            <h2 className="mt-3 font-display text-4xl text-secondary">Ongoing projects</h2>
            <div className="mt-8">
              {data.ongoing.length ? (
                <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {data.ongoing.map((project) => (
                    <li key={project.id}>
                      <Link to="/projects/$slug" params={{ slug: project.slug }} className="block h-full rounded-3xl bg-background p-5">
                        {project.images[0] ? (
                          <div className="mb-5 aspect-[16/10] overflow-hidden rounded-2xl bg-muted">
                            <img
                              src={project.images[0].url}
                              alt={project.images[0].alt ?? `${project.name} project photograph`}
                              className="h-full w-full object-cover transition duration-500 hover:scale-105"
                              loading="lazy"
                            />
                          </div>
                        ) : null}
                        <p className="font-display text-2xl text-secondary">{project.name}</p>
                        <p className="mt-1 text-sm text-ink-soft">
                          {project.location || "Location not recorded"} · {statusLabel(project.status)}
                        </p>
                        <p className="mt-5 text-sm leading-relaxed text-ink-soft">
                          Current site updates and project details are available on the project page.
                        </p>
                        <span className="mt-5 inline-flex text-sm font-semibold text-secondary underline">View project</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState
                  title="Nothing listed as ongoing"
                  body="Current sites are shown here when a published project is marked ongoing, with a progress figure only if one has been entered."
                />
              )}
            </div>
          </div>
          <div className="rounded-3xl bg-background p-7 lg:col-span-2">
            <SectionLabel>Project snapshot</SectionLabel>
            <h2 className="mt-3 font-display text-3xl text-secondary">A clear plan from brief to handover.</h2>
            <p className="mt-4 leading-relaxed text-ink-soft">Every project has a visible scope, a current status and a next step. Select a featured project above to see the working details.</p>
            <Button to="/projects" variant="dark" className="mt-6">View all projects</Button>
          </div>
          {selectedProject ? <ProjectDetailModal project={selectedProject} onClose={() => setSelectedProject(null)} /> : null}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 md:px-8">
        <SectionLabel>Our process</SectionLabel>
        <h2 className="mt-3 max-w-2xl font-display text-4xl text-secondary">From the first conversation to handover.</h2>
        <ol className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data.steps.map((step) => (
            <li key={step.title} className="rounded-3xl border border-line p-6">
              <p className="font-display text-3xl text-primary">{String(step.number).padStart(2, "0")}</p>
              <h3 className="mt-3 font-display text-2xl text-secondary">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="bg-surface">
        <div className="mx-auto max-w-7xl px-5 py-20 md:px-8">
          <SectionLabel>Clients</SectionLabel>
          <h2 className="mt-3 font-display text-4xl text-secondary">Notes from people we have built for.</h2>
          <div className="mt-8">
            {data.testimonials.length ? (
              <TestimonialRow items={data.testimonials} />
            ) : (
              <EmptyState
                title="No published testimonials"
                body="Client feedback is shown only when it is entered and published. This space stays empty until then."
              />
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 md:px-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <SectionLabel>People</SectionLabel>
            <h2 className="mt-3 font-display text-4xl text-secondary">Our team</h2>
          </div>
          <Link to="/team" className="text-sm font-semibold underline">
            Team page
          </Link>
        </div>
        <div className="mt-8">
          {data.team.length ? (
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {data.team.map((member) => (
                <li key={member.name} className="group flex h-full flex-col rounded-3xl bg-surface p-5 transition-shadow duration-300 hover:shadow-xl">
                  {member.photoUrl ? (
                    <img src={member.photoUrl} alt={`${member.name}, ${member.designation}`} className="mb-4 aspect-[4/5] w-full rounded-2xl object-cover object-[center_20%] transition duration-500 group-hover:scale-[1.02]" />
                  ) : null}
                  <p className="font-display text-2xl text-secondary">{member.name}</p>
                  <p className="text-sm text-primary">{member.designation}</p>
                  {member.bio ? <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-soft">{member.bio}</p> : null}
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              title="Team profiles are not published"
              body="Names, designations and biographies appear here only when the studio adds them. Founder details are included on the About page once supplied."
            />
          )}
        </div>
      </section>

      <section className="services-showcase" aria-labelledby="services-showcase-title">
        <div className="services-showcase-inner">
          <div className="services-showcase-intro">
            <p className="services-showcase-kicker">What we do?</p>
            <h2 id="services-showcase-title">
              <span>Services</span>
              <strong>We offer</strong>
            </h2>
          </div>
          <div className="services-showcase-list">
            <article className="services-showcase-item">
              <img src="/media/design.jpg" alt="Architectural drawings and design materials" loading="lazy" />
              <h3>Architectural<br />Designs</h3>
            </article>
            <article className="services-showcase-item">
              <img src="/media/residential.jpg" alt="Completed residential construction" loading="lazy" />
              <h3>Residential<br />Construction</h3>
            </article>
            <article className="services-showcase-item">
              <img src="/media/interior.jpg" alt="Finished interior design" loading="lazy" />
              <h3>Interior<br />Designs</h3>
            </article>
          </div>
        </div>
        <div className="consultation-strip">
          <Button to="/consultation" variant="primary">
            Get free consultation
          </Button>
        </div>
      </section>

      <PartnerLogoMarquee />

      <section className="mx-auto max-w-3xl px-5 py-20 md:px-8">
        <SectionLabel>Questions</SectionLabel>
        <h2 className="mt-3 font-display text-4xl text-secondary">Before you write.</h2>
        <Accordion.Root type="single" collapsible className="mt-8 divide-y divide-line border-y border-line">
          {data.faqs.map((faq) => (
            <Accordion.Item key={faq.question} value={faq.question}>
              <Accordion.Header>
                <Accordion.Trigger className="group flex w-full items-center justify-between gap-4 py-5 text-left font-display text-xl text-secondary">
                  {faq.question}
                  <ChevronDown className="faq-chevron size-5 shrink-0 text-primary" />
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content className="faq-content overflow-hidden pb-5 leading-relaxed text-ink-soft">{faq.answer}</Accordion.Content>
            </Accordion.Item>
          ))}
        </Accordion.Root>
      </section>

      <section className="bg-surface" id="contact">
        <div className="mx-auto max-w-7xl px-5 py-20 md:px-8">
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-5">
            <SectionLabel>Contact</SectionLabel>
            <h2 className="mt-3 font-display text-4xl text-secondary">Write to the studio.</h2>
            <p className="mt-4 text-ink-soft">{settings.address}</p>
            <div className="mt-6 space-y-2 text-sm">
              <a
                className="block font-semibold text-secondary"
                href={`tel:${phoneDigits(COMPANY.phone)}`}
                onClick={() => track("phone_click", { location: "home" })}
              >
                {COMPANY.phone}
              </a>
              {settings.email ? (
                <a className="block font-semibold text-secondary" href={`mailto:${settings.email}`}>
                  {settings.email}
                </a>
              ) : (
                <p className="text-ink-soft">Email address not published yet.</p>
              )}
            </div>
            </div>
            {settings.mapsEmbedUrl ? (
              <div className="lg:col-span-7">
                <iframe
                  title="Map showing the Grandeur Constructions studio in Perambur"
                  src={settings.mapsEmbedUrl}
                  width="600"
                  height="450"
                  className="contact-map"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            ) : null}
          </div>
          <div className="mt-10">
            <EnquiryForm projectTypes={projectTypes} />
          </div>
        </div>
      </section>
    </div>
  );
}

function TestimonialRow({ items }: { items: HomeData["testimonials"] }) {
  const [index, setIndex] = useState(0);
  const item = items[index];
  if (!item) return null;
  return (
    <div className="rounded-3xl bg-background p-8 md:p-12">
      <blockquote className="max-w-3xl font-display text-3xl leading-snug text-secondary md:text-4xl">
        “{item.quote}”
      </blockquote>
      <p className="mt-6 text-sm text-ink-soft">
        <span className="font-semibold text-secondary">{item.authorName}</span>
        {item.authorRole ? ` · ${item.authorRole}` : ""}
        {item.location ? ` · ${item.location}` : ""}
      </p>
      {items.length > 1 ? (
        <div className="mt-8 flex gap-3">
          <button
            type="button"
            className="min-h-11 rounded-full border border-line px-4 text-sm"
            onClick={() => setIndex((current) => (current - 1 + items.length) % items.length)}
          >
            Previous
          </button>
          <button
            type="button"
            className="min-h-11 rounded-full bg-secondary px-4 text-sm text-background"
            onClick={() => setIndex((current) => (current + 1) % items.length)}
          >
            Next
          </button>
          <div className="ml-2 flex items-center gap-2" aria-label="Testimonial slides">
            {items.map((testimonial, dotIndex) => (
              <button
                key={testimonial.authorName}
                type="button"
                aria-label={`Show testimonial ${dotIndex + 1}`}
                aria-current={dotIndex === index}
                className={`size-2.5 rounded-full ${dotIndex === index ? "bg-primary" : "bg-line"}`}
                onClick={() => setIndex(dotIndex)}
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
