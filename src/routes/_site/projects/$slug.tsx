import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { Button, RichText } from "@/components/site/bits";
import { categoryLabel, statusLabel } from "@/lib/company";
import { formatDay } from "@/lib/format";
import { getProject } from "@/lib/public.functions";

export const Route = createFileRoute("/_site/projects/$slug")({
  loader: async ({ params }) => {
    const data = await getProject({ data: params.slug });
    if (!data) throw notFound();
    return data;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.project.name ?? "Project"} · Grandeur Constructions` },
      {
        name: "description",
        content: loaderData?.project.description.slice(0, 160) ?? "Project by Grandeur Constructions.",
      },
    ],
  }),
  component: ProjectPage,
});

function ProjectPage() {
  const { project } = Route.useLoaderData();
  const [active, setActive] = useState(0);
  const image = project.images[active] ?? project.images[0];
  const completion = formatDay(project.completionDate);
  return (
    <article className="mx-auto max-w-7xl px-5 py-12 md:px-8">
      <p className="text-xs font-semibold tracking-widest text-ink-soft uppercase">
        <Link to="/projects">Projects</Link>
      </p>
      <div className="mt-4 grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <div className="overflow-hidden rounded-3xl bg-muted">
            {image ? (
              <img src={image.url} alt={image.alt ?? ""} className="aspect-video w-full object-cover" />
            ) : (
              <div className="grid aspect-video place-items-center text-sm text-ink-soft">No photograph yet</div>
            )}
          </div>
          {project.images.length > 1 ? (
            <ul className="mt-3 flex gap-2 overflow-x-auto">
              {project.images.map((item, index) => (
                <li key={item.url}>
                  <button type="button" onClick={() => setActive(index)} className="overflow-hidden rounded-xl">
                    <img src={item.url} alt="" className="h-16 w-24 object-cover" />
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        <div className="lg:col-span-5">
          <p className="text-xs font-semibold tracking-widest text-primary uppercase">
            {categoryLabel(project.category)} · {statusLabel(project.status)}
          </p>
          <h1 className="mt-3 font-display text-4xl text-secondary md:text-5xl">{project.name}</h1>
          {project.location ? <p className="mt-3 text-ink-soft">{project.location}</p> : null}
          <dl className="mt-6 space-y-3 text-sm">
            {project.progress != null ? (
              <div>
                <dt className="font-semibold text-secondary">Progress on record</dt>
                <dd className="text-ink-soft">{project.progress}%</dd>
              </div>
            ) : null}
            {completion ? (
              <div>
                <dt className="font-semibold text-secondary">Completion date</dt>
                <dd className="text-ink-soft">{completion}</dd>
              </div>
            ) : null}
          </dl>
          <RichText text={project.description} className="mt-6" />
          <div className="mt-8">
            <Button to="/contact">Discuss a similar brief</Button>
          </div>
        </div>
      </div>
    </article>
  );
}
