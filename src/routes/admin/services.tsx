import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { Notice } from "@/components/admin/shell";
import { slugify } from "@/lib/format";
import { deleteAdminService, getAdminServices, reorderAdminServices, saveAdminService } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin/services")({
  loader: () => getAdminServices(),
  head: () => ({ meta: [{ title: "Services · Studio desk" }] }),
  component: ServicesAdmin,
});

type Service = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
  displayOrder: number;
  published: boolean;
};

const blankService = (): Service => ({
  id: "",
  slug: "",
  title: "",
  summary: "",
  description: "",
  imageUrl: "",
  imageAlt: "",
  displayOrder: 99,
  published: true,
});

function ServicesAdmin() {
  const data = Route.useLoaderData();
  const router = useRouter();
  const [editing, setEditing] = useState<Service | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  if (!data.ok) return <p>{data.message}</p>;

  async function move(index: number, direction: -1 | 1) {
    const ids = data.ok ? data.services.map((service) => service.id) : [];
    const next = index + direction;
    if (next < 0 || next >= ids.length) return;
    const copy = [...ids];
    const current = copy[index];
    const target = copy[next];
    if (!current || !target) return;
    copy[index] = target;
    copy[next] = current;
    await reorderAdminServices({ data: copy });
    await router.invalidate();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-4xl text-secondary">Services</h1>
        <button type="button" className="min-h-11 rounded-full bg-primary px-4 text-sm font-semibold" onClick={() => setEditing(blankService())}>
          Add service
        </button>
      </div>
      {message ? <Notice>{message}</Notice> : null}
      {error ? <Notice tone="bad">{error}</Notice> : null}
      <ul className="space-y-3">
        {data.services.map((service, index) => (
          <li key={service.id} className="flex flex-wrap items-center justify-between gap-3 rounded-3xl bg-background p-4">
            <div>
              <p className="font-semibold">{service.title}</p>
              <p className="text-sm text-ink-soft">{service.published ? "Published" : "Hidden"}</p>
            </div>
            <div className="flex gap-2 text-sm">
              <button type="button" className="min-h-11 px-2" onClick={() => move(index, -1)}>Up</button>
              <button type="button" className="min-h-11 px-2" onClick={() => move(index, 1)}>Down</button>
              <button type="button" className="min-h-11 px-2 underline" onClick={() => setEditing(service)}>Edit</button>
              <button
                type="button"
                className="min-h-11 px-2 text-danger"
                onClick={async () => {
                  if (!confirm(`Delete ${service.title}?`)) return;
                  await deleteAdminService({ data: service.id });
                  await router.invalidate();
                }}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
      {editing ? (
        <form
          className="space-y-4 rounded-3xl bg-background p-5"
          onSubmit={async (event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            const result = await saveAdminService({
              data: {
                id: editing.id,
                title: String(form.get("title") || ""),
                slug: String(form.get("slug") || ""),
                summary: String(form.get("summary") || ""),
                description: String(form.get("description") || ""),
                imageUrl: String(form.get("imageUrl") || ""),
                imageAlt: String(form.get("imageAlt") || ""),
                published: form.get("published") === "on",
                displayOrder: editing.displayOrder,
              },
            });
            if (!result.ok) {
              setError(result.message);
              return;
            }
            setMessage("Service saved.");
            setEditing(null);
            await router.invalidate();
          }}
        >
          <h2 className="font-display text-2xl">{editing.id ? "Edit service" : "New service"}</h2>
          <input name="title" defaultValue={editing.title} required className="input" placeholder="Title" onChange={(event) => {
            const slug = event.currentTarget.form?.elements.namedItem("slug");
            if (slug instanceof HTMLInputElement && !editing.id) slug.value = slugify(event.currentTarget.value);
          }} />
          <input name="slug" defaultValue={editing.slug} required className="input" placeholder="Address" />
          <textarea name="summary" defaultValue={editing.summary} required className="input min-h-20" placeholder="Short summary" />
          <textarea name="description" defaultValue={editing.description} required className="input min-h-32" placeholder="Description" />
          <input name="imageUrl" defaultValue={editing.imageUrl} className="input" placeholder="Image address" />
          <input name="imageAlt" defaultValue={editing.imageAlt} className="input" placeholder="Image description" />
          <label className="flex items-center gap-2 text-sm">
            <input name="published" type="checkbox" defaultChecked={editing.published} /> Published
          </label>
          <button type="submit" className="min-h-11 rounded-full bg-secondary px-5 text-sm font-semibold text-background">
            Save service
          </button>
        </form>
      ) : null}
    </div>
  );
}
