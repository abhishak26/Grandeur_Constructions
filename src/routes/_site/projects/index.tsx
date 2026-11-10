import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { EmptyState, PageIntro } from "@/components/site/bits";
import { categoryLabel, statusLabel } from "@/lib/company";
import { getProjects } from "@/lib/public.functions";

const FILTERS = [
  ["all", "All"],
  ["completed", "Completed"],
  ["ongoing", "Ongoing"],
  ["design", "Design"],
] as const;

export const Route = createFileRoute("/_site/projects/")({
  loader: () => getProjects(),
  head: () => ({
    meta: [
      { title: "Projects · Grandeur Constructions" },
      {
        name: "description",
        content: "Projects published by Grandeur Constructions. The gallery stays empty until the studio adds real work.",
      },
    ],
  }),
  component: ProjectsPage,
});

function ProjectsPage() {
  const { projects } = Route.useLoaderData();
  const [filter, setFilter] = useState<(typeof FILTERS)[number][0]>("all");
  const visible = projects.filter((project) => filter === "all" || project.status === filter);
  return (
    <>
      <PageIntro
        kicker="Projects"
        title="Only work the studio has published."
        lede="Names, locations, photographs and progress come from the studio desk. Nothing here is a sample project."
      />
      <div className="mx-auto max-w-7xl px-5 py-12 md:px-8">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter projects">
          {FILTERS.map(([value, label]) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={filter === value}
              className={`min-h-11 rounded-full px-4 text-sm ${
                filter === value ? "bg-secondary text-background" : "border border-line text-secondary"
              }`}
              onClick={() => setFilter(value)}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="mt-8">
          {visible.length ? (
            <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {visible.map((project) => {
                const image = project.images[0];
                return (
                  <li key={project.id}>
                    <Link to="/projects/$slug" params={{ slug: project.slug }} className="group block">
                      <article className="overflow-hidden rounded-3xl bg-surface">
                        <div className="frame-card overflow-hidden bg-muted">
                          {image ? (
                            <img
                              src={image.url}
                              alt={image.alt ?? ""}
                              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                              loading="lazy"
                            />
                          ) : null}
                        </div>
                        <div className="p-5">
                          <p className="text-xs font-semibold tracking-widest text-ink-soft uppercase">
                            {categoryLabel(project.category)} · {statusLabel(project.status)}
                          </p>
                          <h2 className="mt-2 font-display text-2xl text-secondary">{project.name}</h2>
                          {project.location ? <p className="mt-1 text-sm text-ink-soft">{project.location}</p> : null}
                        </div>
                      </article>
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <EmptyState
              title="No projects in this view"
              body="When the studio publishes a project, it will be listed here with its location, status and photographs."
            />
          )}
        </div>
      </div>
    </>
  );
}
