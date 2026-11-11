import { Link } from "@tanstack/react-router";
import { Building2, Menu, Phone, Send, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/site/bits";
import { COMPANY } from "@/lib/company";

const LINKS = [
  ["/", "Home"],
  ["/about", "About Us"],
  ["/services", "Services"],
  ["/projects", "Projects"],
  ["/team", "Our Team"],
  ["/blog", "Blog"],
  ["/contact", "Contact Us"],
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <header className="site-header sticky top-0 z-40 border-b border-line bg-background/90 backdrop-blur">
      <div className="mobile-header-actions lg:hidden">
        <Link to="/contact">Book a Site Visit</Link>
        <Link to="/contact">Download Brochure</Link>
      </div>
      <Link to="/" className="mobile-header-notch lg:hidden" onClick={() => setOpen(false)}>
        <img src="/media/grandeur-logo.png" alt="Grandeur Constructions" />
      </Link>
      <div className="mx-auto hidden max-w-7xl items-center justify-between gap-4 px-5 py-3 md:px-8 lg:flex">
        <Link to="/" className="flex min-w-0 shrink-0 items-center gap-3" onClick={() => setOpen(false)}>
          <img
            src="/media/grandeur-logo.png"
            alt="Grandeur Constructions"
            className="h-14 w-auto max-w-[18rem] object-contain"
          />
        </Link>
        <nav className="hidden items-center gap-6 lg:flex" aria-label="Primary">
          {LINKS.map(([to, label]) => (
            <Link
              key={to}
              to={to}
              className="relative py-2 text-sm text-ink transition-colors after:absolute after:right-0 after:bottom-0 after:left-0 after:h-0.5 after:origin-left after:scale-x-0 after:bg-primary after:transition-transform hover:text-secondary hover:after:scale-x-100"
              activeOptions={{ exact: to === "/" }}
              activeProps={{ className: "relative py-2 text-sm font-semibold text-secondary after:absolute after:right-0 after:bottom-0 after:left-0 after:h-0.5 after:origin-left after:scale-x-100 after:bg-primary" }}
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="hidden lg:block">
          <Button to="/contact">Get a Quote</Button>
        </div>
      </div>
      {open ? (
        <nav id="mobile-nav" className="border-t border-line bg-background px-5 py-4 lg:hidden" aria-label="Mobile">
          <ul className="space-y-1">
            {LINKS.map(([to, label]) => (
              <li key={to}>
                <Link
                  to={to}
                  className="block rounded-xl px-3 py-3 text-base text-secondary hover:bg-surface"
                  onClick={() => setOpen(false)}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-3">
            <Button to="/contact" className="w-full">
              Get a Quote
            </Button>
          </div>
        </nav>
      ) : null}
      </header>
      <nav className="mobile-bottom-nav lg:hidden" aria-label="Mobile quick actions">
        <a href={`tel:${COMPANY.phone.replace(/[^\d+]/g, "")}`} className="mobile-bottom-nav-item">
          <Phone aria-hidden="true" />
          <span>Call Us</span>
        </a>
        <Link to="/contact" className="mobile-bottom-nav-item">
          <Send aria-hidden="true" />
          <span>Enquiry</span>
        </Link>
        <Link to="/" className="mobile-bottom-nav-brand" aria-label="Grandeur Constructions home">
          <img src="/media/grandeur-logo-nav.png" alt="Grandeur Constructions" />
        </Link>
        <Link to="/projects" className="mobile-bottom-nav-item">
          <Building2 aria-hidden="true" />
          <span>Projects</span>
        </Link>
        <button
          type="button"
          className="mobile-bottom-nav-item"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          <span>Menu</span>
        </button>
      </nav>
    </>
  );
}
