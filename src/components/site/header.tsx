import { Link } from "@tanstack/react-router";
import { Building2, Menu, MessageCircle, PhoneCall, X } from "lucide-react";
import { useEffect, useState } from "react";
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
  const [desktopHeaderVisible, setDesktopHeaderVisible] = useState(true);

  useEffect(() => {
    let previousScrollY = window.scrollY;
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY <= 8) {
        setDesktopHeaderVisible(true);
      } else if (currentScrollY > previousScrollY + 4) {
        setDesktopHeaderVisible(false);
      } else if (currentScrollY < previousScrollY - 4) {
        setDesktopHeaderVisible(true);
      }
      previousScrollY = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        className={`site-header sticky top-0 z-40 bg-background/90 backdrop-blur ${
          desktopHeaderVisible ? "" : "desktop-header-hidden"
        }`}
      >
      <Link to="/" className="mobile-header-notch lg:hidden" onClick={() => setOpen(false)}>
        <img src="/media/grandeur-logo.png" alt="Grandeur Constructions" />
      </Link>
      <div className="desktop-header-inner hidden items-center lg:flex">
        <nav className="desktop-primary-nav desktop-primary-nav-left" aria-label="Primary">
          {LINKS.slice(0, 4).map(([to, label]) => (
            <Link
              key={to}
              to={to}
              className="desktop-primary-link"
              activeOptions={{ exact: to === "/" }}
              activeProps={{ className: "desktop-primary-link desktop-primary-link-active" }}
            >
              {label}
            </Link>
          ))}
        </nav>
        <nav className="desktop-primary-nav desktop-primary-nav-right" aria-label="Primary">
          {LINKS.slice(4).map(([to, label]) => (
            <Link
              key={to}
              to={to}
              className="desktop-primary-link"
              activeOptions={{ exact: to === "/" }}
              activeProps={{ className: "desktop-primary-link desktop-primary-link-active" }}
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="desktop-header-cta">
          <Button to="/contact">Get a Quote</Button>
        </div>
        <Link to="/" className="desktop-header-notch" aria-label="Grandeur Constructions home" onClick={() => setOpen(false)}>
          <img src="/media/grandeur-logo.png" alt="Grandeur Constructions" />
        </Link>
      </div>
      {open ? (
        <nav id="mobile-nav" className="mobile-nav-panel border-t border-line bg-background px-5 py-4 lg:hidden" aria-label="Mobile">
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
        <a
          href={`tel:${COMPANY.phone.replace(/[^\d+]/g, "")}`}
          className="mobile-bottom-nav-item"
          aria-label={`Call ${COMPANY.name}`}
        >
          <PhoneCall aria-hidden="true" />
          <span>Call</span>
        </a>
        <Link to="/contact" className="mobile-bottom-nav-item" aria-label="Send an enquiry">
          <MessageCircle aria-hidden="true" />
          <span>Enquire</span>
        </Link>
        <Link to="/projects" className="mobile-bottom-nav-item" aria-label="View projects">
          <Building2 aria-hidden="true" />
          <span>Projects</span>
        </Link>
        <button
          type="button"
          className="mobile-bottom-nav-item mobile-bottom-nav-menu"
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
