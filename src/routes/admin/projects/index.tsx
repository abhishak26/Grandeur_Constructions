import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { categoryLabel, statusLabel } from "@/lib/company";
import { deleteAdminProject, getAdminProjects } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin/projects/")({
  loader: () => getAdminProjects(),
  head: () => ({ meta: [{ title: "Projects · Studio desk" }] }),
  component: ProjectsAdmin,
});

function ProjectsAdmin() {
  const data = Route.useLoaderData();
  const router = useRouter();
  if (!data.ok) return <p className="text-danger">{data.message}</p>;
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-display text-4xl text-secondary">Projects</h1>
        <Link to="/admin/projects/$id" params={{ id: "new" }} className="min-h-11 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-secondary">
          Add project
        </Link>
      </div>
      {data.projects.length ? (
        <ul className="space-y-3">
          {data.projects.map((project) => (
            <li key={project.id} className="flex flex-wrap items-center justify-between gap-3 rounded-3xl bg-background p-4">
              <div>
                <p className="font-semibold text-secondary">{project.name}</p>
                <p className="text-sm text-ink-soft">
                  {categoryLabel(project.category)} · {statusLabel(project.status)} · {project.published ? "Published" : "Hidden"}
                  {project.featured ? " · Featured" : ""}
                </p>
              </div>
              <div className="flex gap-2">
                <Link to="/admin/projects/$id" params={{ id: project.id }} className="min-h-11 rounded-full border border-line px-4 py-2 text-sm">
                  Edit
                </Link>
                <button
                  type="button"
                  className="min-h-11 rounded-full px-4 text-sm text-danger"
                  onClick={async () => {
                    if (!confirm(`Delete ${project.name}?`)) return;
                    await deleteAdminProject({ data: project.id });
                    await router.invalidate();
                  }}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-3xl bg-background p-8 text-ink-soft">No projects yet. Add one when you have a real record to publish.</p>
      )}
    </div>
  );
}
