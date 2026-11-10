import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/site/bits";

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
    <header className="sticky top-0 z-40 border-b border-line bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3 md:px-8">
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
              className="nav-glow-item relative rounded-full px-3 py-2 text-sm text-ink transition-colors hover:text-secondary"
              activeOptions={{ exact: to === "/" }}
              activeProps={{ className: "nav-glow-item is-active relative rounded-full px-3 py-2 text-sm font-semibold text-secondary" }}
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="hidden lg:block">
          <Button to="/contact">Get a Quote</Button>
        </div>
        <button
          type="button"
          className="grid h-11 w-11 place-items-center rounded-full border border-line lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((value) => !value)}
        >
          <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
          {open ? <X /> : <Menu />}
        </button>
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
  );
}
