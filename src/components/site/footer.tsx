import { Link } from "@tanstack/react-router";
import { COMPANY } from "@/lib/company";
import { phoneDigits, track } from "@/lib/format";

type Settings = {
  companyName: string;
  tagline: string;
  address: string;
  phone: string | null;
  email: string | null;
  whatsapp: string | null;
  facebook: string | null;
  instagram: string | null;
  linkedin: string | null;
  youtube: string | null;
};

export function Footer({
  settings,
  services,
}: {
  settings: Settings;
  services: { slug: string; title: string }[];
}) {
  const socials = [
    ["Facebook", settings.facebook],
    ["Instagram", settings.instagram],
    ["LinkedIn", settings.linkedin],
    ["YouTube", settings.youtube],
  ].filter((item): item is [string, string] => Boolean(item[1]));
  const year = new Date().getFullYear();

  return (
    <footer className="bg-secondary text-background">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 md:grid-cols-12 md:px-8">
        <div className="md:col-span-4">
          <p className="font-display text-2xl tracking-wide">GRANDEUR</p>
          <p className="mt-1 text-xs tracking-widest text-primary">CONSTRUCTIONS</p>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-background/75">
            {settings.tagline} A residential and commercial construction practice based in Perambur, Chennai.
          </p>
        </div>
        <div className="md:col-span-3">
          <p className="text-xs font-semibold tracking-widest text-primary uppercase">Visit</p>
          <ul className="mt-4 space-y-2 text-sm">
            {[
              ["/", "Home"],
              ["/about", "About Us"],
              ["/projects", "Projects"],
              ["/team", "Our Team"],
              ["/blog", "Blog"],
              ["/testimonials", "Testimonials"],
              ["/contact", "Contact"],
              ["/consultation", "Consultation"],
            ].map(([to, label]) => (
              <li key={to}>
                <Link to={to as "/"} className="text-background/80 hover:text-background">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="md:col-span-3">
          <p className="text-xs font-semibold tracking-widest text-primary uppercase">Services</p>
          <ul className="mt-4 space-y-2 text-sm">
            {services.map((service) => (
              <li key={service.slug}>
                <Link
                  to="/services/$slug"
                  params={{ slug: service.slug }}
                  className="text-background/80 hover:text-background"
                >
                  {service.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="md:col-span-2">
          <p className="text-xs font-semibold tracking-widest text-primary uppercase">Studio</p>
          <p className="mt-4 text-sm leading-relaxed text-background/80">{settings.address}</p>
          {settings.phone ? (
            <a
              href={`tel:${phoneDigits(settings.phone)}`}
              className="mt-3 block text-sm text-background hover:text-primary"
              onClick={() => track("phone_click", { location: "footer" })}
            >
              {settings.phone}
            </a>
          ) : (
            <p className="mt-3 text-sm text-background/60">Phone not published yet.</p>
          )}
          {settings.email ? (
            <a href={`mailto:${settings.email}`} className="mt-2 block break-all text-sm text-background hover:text-primary">
              {settings.email}
            </a>
          ) : (
            <p className="mt-2 text-sm text-background/60">Email not published yet.</p>
          )}
          {socials.length ? (
            <ul className="mt-4 space-y-1 text-sm">
              {socials.map(([label, href]) => (
                <li key={label}>
                  <a href={href} className="text-background/80 hover:text-primary" rel="noreferrer">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
      <div className="border-t border-background/15">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-5 text-xs text-background/60 md:flex-row md:items-center md:justify-between md:px-8">
          <p>
            © {year} {settings.companyName || COMPANY.name}. All rights reserved.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/privacy" className="hover:text-background">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-background">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export function WhatsAppButton() {
  const digits = "919840822267";
  return (
    <a
      href={`https://wa.me/${digits}`}
      className="whatsapp-float fixed right-4 z-30 grid size-14 place-items-center rounded-full bg-[#25D366] text-white shadow-lg"
      aria-label="Chat with Grandeur Constructions on WhatsApp"
      onClick={() => track("whatsapp_click")}
      rel="noreferrer"
    >
      <svg viewBox="0 0 32 32" aria-hidden="true" className="size-8 fill-current">
        <path d="M16 3.2a12.8 12.8 0 0 0-10.9 19.5L3.2 28.8l6.3-1.8A12.8 12.8 0 1 0 16 3.2Zm0 23.3c-2 0-3.9-.6-5.5-1.7l-.4-.3-3.7 1.1 1.1-3.6-.3-.4A10.7 10.7 0 1 1 16 26.5Zm5.9-7.9c-.3-.2-1.9-.9-2.2-1-.3-.1-.5-.2-.7.2-.2.3-.8 1-.9 1.2-.2.2-.3.2-.6.1-2.4-1.2-4-2.2-5.1-4.9-.2-.4.2-.4.5-1.3.1-.2.1-.4 0-.6-.1-.2-.7-1.7-.9-2.3-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-.3.3-1.1 1.1-1.1 2.7s1.1 3.2 1.3 3.4c.2.2 2.2 3.4 5.4 4.8 2 .9 2.7 1 3.7.8.6-.1 1.9-.8 2.1-1.6.3-.8.3-1.5.2-1.6Z" />
      </svg>
    </a>
  );
}
