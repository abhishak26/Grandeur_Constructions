import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { Notice } from "@/components/admin/shell";
import { deleteAdminMedia, getAdminMedia, uploadAdminMedia } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin/media")({
  loader: () => getAdminMedia(),
  head: () => ({ meta: [{ title: "Media · Studio desk" }] }),
  component: MediaPage,
});

function MediaPage() {
  const data = Route.useLoaderData();
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  if (!data.ok) return <p>{data.message}</p>;
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl text-secondary">Media</h1>
          <p className="mt-2 max-w-xl text-sm text-ink-soft">
            Uploads are stored in the database, or sent to Cloudinary when that host is configured for the deployment.
            JPEG, PNG and WebP up to 1.8 MB.
          </p>
        </div>
        <label className="min-h-11 cursor-pointer rounded-full bg-primary px-4 py-2 text-sm font-semibold text-secondary">
          Upload
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={async (event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (!file) return;
              if (file.size > 1_800_000) {
                setMessage("Keep images under 1.8 MB.");
                return;
              }
              const base64 = await readBase64(file);
              const mime = file.type === "image/png" || file.type === "image/webp" ? file.type : "image/jpeg";
              const result = await uploadAdminMedia({ data: { filename: file.name, mime, base64, alt: "" } });
              setMessage(result.ok ? "Image uploaded." : result.message);
              if (result.ok) await router.invalidate();
            }}
          />
        </label>
      </div>
      {message ? <Notice>{message}</Notice> : null}
      {data.items.length ? (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.items.map((item) => (
            <li key={item.id} className="rounded-3xl bg-background p-3">
              <img src={item.url} alt={item.alt ?? ""} className="aspect-video w-full rounded-2xl object-cover" />
              <p className="mt-2 truncate text-sm">{item.filename}</p>
              <p className="truncate text-xs text-ink-soft">{item.url}</p>
              <button
                type="button"
                className="mt-2 text-sm text-danger"
                onClick={async () => {
                  const result = await deleteAdminMedia({ data: item.id });
                  setMessage(result.ok ? "Image removed." : result.message);
                  if (result.ok) await router.invalidate();
                }}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-ink-soft">The library is empty. Service photographs shipped with the site live in the page design, not in this library, until you upload replacements.</p>
      )}
    </div>
  );
}

function readBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || "").split(",")[1] || "");
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
