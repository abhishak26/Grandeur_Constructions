import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { Notice } from "@/components/admin/shell";
import { deleteAdminTestimonial, getAdminTestimonials, saveAdminTestimonial } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin/testimonials")({
  loader: () => getAdminTestimonials(),
  component: TestimonialsAdmin,
});

function TestimonialsAdmin() {
  const data = Route.useLoaderData();
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  if (!data.ok) return <p>{data.message}</p>;
  return (
    <div className="space-y-6">
      <h1 className="font-display text-4xl text-secondary">Testimonials</h1>
      <p className="text-sm text-ink-soft">Leave unpublished until the wording is a real client note.</p>
      {message ? <Notice>{message}</Notice> : null}
      <ul className="space-y-3">
        {data.testimonials.map((item) => (
          <li key={item.id} className="rounded-3xl bg-background p-4 text-sm">
            <p className="font-semibold">{item.authorName}</p>
            <p className="text-ink-soft">{item.published ? "Published" : "Hidden"} · {item.quote}</p>
            <button
              type="button"
              className="mt-2 text-danger"
              onClick={async () => {
                await deleteAdminTestimonial({ data: item.id });
                await router.invalidate();
              }}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
      <form
        className="space-y-3 rounded-3xl bg-background p-5"
        onSubmit={async (event) => {
          event.preventDefault();
          const form = new FormData(event.currentTarget);
          const result = await saveAdminTestimonial({
            data: {
              quote: String(form.get("quote") || ""),
              authorName: String(form.get("authorName") || ""),
              authorRole: String(form.get("authorRole") || ""),
              location: String(form.get("location") || ""),
              published: form.get("published") === "on",
              displayOrder: data.testimonials.length,
            },
          });
          setMessage(result.ok ? "Testimonial saved." : result.message);
          if (result.ok) {
            event.currentTarget.reset();
            await router.invalidate();
          }
        }}
      >
        <h2 className="font-display text-2xl">Add a note</h2>
        <textarea name="quote" required className="input min-h-24" placeholder="Quote" />
        <input name="authorName" required className="input" placeholder="Name" />
        <input name="authorRole" className="input" placeholder="Role, if they gave one" />
        <input name="location" className="input" placeholder="Place, if relevant" />
        <label className="flex items-center gap-2 text-sm">
          <input name="published" type="checkbox" /> Publish
        </label>
        <button className="min-h-11 rounded-full bg-primary px-5 text-sm font-semibold">Save testimonial</button>
      </form>
    </div>
  );
}
