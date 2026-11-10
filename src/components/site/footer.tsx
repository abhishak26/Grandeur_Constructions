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

export function WhatsAppButton({ number }: { number: string | null }) {
  const digits = phoneDigits(number);
  if (!digits) return null;
  return (
    <a
      href={`https://wa.me/${digits}`}
      className="whatsapp-float fixed right-4 z-30 inline-flex min-h-11 items-center rounded-full bg-primary px-4 text-sm font-semibold text-secondary shadow-sm"
      onClick={() => track("whatsapp_click")}
      rel="noreferrer"
    >
      WhatsApp
    </a>
  );
}
