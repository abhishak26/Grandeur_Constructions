import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { Notice } from "@/components/admin/shell";
import { PROJECT_CATEGORIES, PROJECT_STATUSES } from "@/lib/company";
import { slugify } from "@/lib/format";
import { getAdminProject, saveAdminProject, uploadAdminMedia } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin/projects/$id")({
  loader: ({ params }) => getAdminProject({ data: params.id }),
  head: () => ({ meta: [{ title: "Edit project · Studio desk" }] }),
  component: ProjectEditor,
});

function ProjectEditor() {
  const loaded = Route.useLoaderData();
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [slugTouched, setSlugTouched] = useState(Boolean(loaded.ok && loaded.project.id));
  if (!loaded.ok) return <p className="text-danger">{loaded.message}</p>;
  const project = loaded.project;

  return (
    <form
      className="space-y-5 rounded-3xl bg-background p-5 md:p-8"
      onSubmit={async (event) => {
        event.preventDefault();
        setError(null);
        setMessage(null);
        const form = new FormData(event.currentTarget);
        const images = projectImages(form);
        const result = await saveAdminProject({
          data: {
            id: project.id,
            name: String(form.get("name") || ""),
            slug: String(form.get("slug") || ""),
            location: String(form.get("location") || ""),
            category: String(form.get("category") || "residential"),
            description: String(form.get("description") || ""),
            status: String(form.get("status") || "design"),
            progress: String(form.get("progress") || ""),
            completionDate: String(form.get("completionDate") || ""),
            featured: form.get("featured") === "on",
            featuredOrder: Number(form.get("featuredOrder") || 0),
            published: form.get("published") === "on",
            images,
          },
        });
        if (!result.ok) {
          setError(result.message);
          return;
        }
        setMessage("Project saved.");
        await router.navigate({ to: "/admin/projects/$id", params: { id: result.id } });
        await router.invalidate();
      }}
    >
      <h1 className="font-display text-3xl text-secondary">{project.id ? "Edit project" : "New project"}</h1>
      {message ? <Notice>{message}</Notice> : null}
      {error ? <Notice tone="bad">{error}</Notice> : null}
      <label className="block space-y-2 text-sm">
        Name
        <input
          name="name"
          defaultValue={project.name}
          required
          className="input"
          onChange={(event) => {
            if (slugTouched) return;
            const slug = event.currentTarget.form?.elements.namedItem("slug");
            if (slug instanceof HTMLInputElement) slug.value = slugify(event.currentTarget.value);
          }}
        />
      </label>
      <label className="block space-y-2 text-sm">
        Address
        <input name="slug" defaultValue={project.slug} required className="input" onChange={() => setSlugTouched(true)} />
      </label>
      <label className="block space-y-2 text-sm">
        Location
        <input name="location" defaultValue={project.location} className="input" />
      </label>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block space-y-2 text-sm">
          Category
          <select name="category" defaultValue={project.category} className="input">
            {PROJECT_CATEGORIES.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="block space-y-2 text-sm">
          Status
          <select name="status" defaultValue={project.status} className="input">
            {PROJECT_STATUSES.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="block space-y-2 text-sm">
          Progress (0–100, leave blank if unknown)
          <input name="progress" defaultValue={project.progress} className="input" inputMode="numeric" />
        </label>
        <label className="block space-y-2 text-sm">
          Completion date
          <input name="completionDate" type="date" defaultValue={project.completionDate} className="input" />
        </label>
        <label className="block space-y-2 text-sm">
          Featured order
          <input name="featuredOrder" type="number" defaultValue={project.featuredOrder} className="input" />
        </label>
      </div>
      <label className="block space-y-2 text-sm">
        Description
        <textarea name="description" defaultValue={project.description} required className="input min-h-40" />
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input name="published" type="checkbox" defaultChecked={project.published} /> Published
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input name="featured" type="checkbox" defaultChecked={project.featured} /> Featured on the homepage
      </label>
      <ImageFields initial={project.images} />
      <button type="submit" className="min-h-11 rounded-full bg-primary px-6 font-semibold text-secondary">
        Save project
      </button>
    </form>
  );
}

function projectImages(form: FormData) {
  const urls = form.getAll("imageUrl").map(String);
  const alts = form.getAll("imageAlt").map(String);
  return urls
    .map((url, index) => ({ url: url.trim(), alt: alts[index] ?? "" }))
    .filter((image) => image.url);
}

function ImageFields({ initial }: { initial: { url: string; alt: string | null }[] }) {
  const [rows, setRows] = useState(initial.length ? initial : [{ url: "", alt: "" }]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-medium">Photographs</legend>
      {rows.map((row, index) => (
        <div key={index} className="grid gap-2 md:grid-cols-2">
          <input name="imageUrl" value={row.url} placeholder="Image address" className="input" onChange={(event) => {
            const next = [...rows];
            next[index] = { ...row, url: event.target.value };
            setRows(next);
          }} />
          <input name="imageAlt" value={row.alt ?? ""} placeholder="Alt text" className="input" onChange={(event) => {
            const next = [...rows];
            next[index] = { ...row, alt: event.target.value };
            setRows(next);
          }} />
        </div>
      ))}
      <div className="flex flex-wrap gap-3">
        <button type="button" className="text-sm font-semibold underline" onClick={() => setRows([...rows, { url: "", alt: "" }])}>
          Add image row
        </button>
        <label className="text-sm font-semibold underline">
          Upload image
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={async (event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (!file) return;
              if (file.size > 1_800_000) {
                setUploadError("Keep images under 1.8 MB.");
                return;
              }
              const base64 = await fileToBase64(file);
              const result = await uploadAdminMedia({
                data: { filename: file.name, mime: file.type as "image/jpeg", base64, alt: "" },
              });
              if (!result.ok) {
                setUploadError(result.message);
                return;
              }
              setUploadError(null);
              setRows([...rows.filter((item) => item.url), { url: result.item.url, alt: "" }]);
            }}
          />
        </label>
      </div>
      {uploadError ? <p className="text-sm text-danger">{uploadError}</p> : null}
    </fieldset>
  );
}

function fileToBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const value = String(reader.result || "");
      resolve(value.split(",")[1] || "");
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
