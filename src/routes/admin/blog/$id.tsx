import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { Notice } from "@/components/admin/shell";
import { slugify } from "@/lib/format";
import { deleteAdminPost, getAdminPost, saveAdminPost } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin/blog/$id")({
  loader: ({ params }) => getAdminPost({ data: params.id }),
  component: PostEditor,
});

function PostEditor() {
  const loaded = Route.useLoaderData();
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  if (!loaded.ok) return <p>{loaded.message}</p>;
  const post = loaded.post;
  return (
    <form
      className="space-y-4 rounded-3xl bg-background p-5"
      onSubmit={async (event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const result = await saveAdminPost({
          data: {
            id: post.id,
            title: String(form.get("title") || ""),
            slug: String(form.get("slug") || ""),
            excerpt: String(form.get("excerpt") || ""),
            content: String(form.get("content") || ""),
            categoryId: String(form.get("categoryId") || ""),
            newCategory: String(form.get("newCategory") || ""),
            featuredImage: String(form.get("featuredImage") || ""),
            status: String(form.get("status") || "draft"),
            seoTitle: String(form.get("seoTitle") || ""),
            seoDescription: String(form.get("seoDescription") || ""),
          },
        });
        if (!result.ok) {
          setMessage(result.message);
          return;
        }
        setMessage("Article saved.");
        await router.navigate({ to: "/admin/blog/$id", params: { id: result.id } });
      }}
    >
      <h1 className="font-display text-3xl">{post.id ? "Edit article" : "New article"}</h1>
      {message ? <Notice>{message}</Notice> : null}
      <input name="title" defaultValue={post.title} required className="input" placeholder="Title" onChange={(event) => {
        if (post.id) return;
        const slug = event.currentTarget.form?.elements.namedItem("slug");
        if (slug instanceof HTMLInputElement) slug.value = slugify(event.currentTarget.value);
      }} />
      <input name="slug" defaultValue={post.slug} required className="input" placeholder="Address" />
      <textarea name="excerpt" defaultValue={post.excerpt} className="input min-h-20" placeholder="Excerpt" />
      <textarea name="content" defaultValue={post.content} required className="input min-h-56" placeholder="Write in paragraphs. Start a line with ## for a heading." />
      <select name="categoryId" defaultValue={post.categoryId} className="input">
        <option value="">No category</option>
        {loaded.categories.map((category) => (
          <option key={category.id} value={category.id}>{category.name}</option>
        ))}
      </select>
      <input name="newCategory" className="input" placeholder="Or type a new category" />
      <input name="featuredImage" defaultValue={post.featuredImage} className="input" placeholder="Featured image address" />
      <select name="status" defaultValue={post.status} className="input">
        <option value="draft">Draft</option>
        <option value="published">Published</option>
      </select>
      <input name="seoTitle" defaultValue={post.seoTitle} className="input" placeholder="SEO title" />
      <textarea name="seoDescription" defaultValue={post.seoDescription} className="input" placeholder="SEO description" />
      <div className="flex gap-3">
        <button className="min-h-11 rounded-full bg-primary px-5 text-sm font-semibold">Save</button>
        {post.id ? (
          <button
            type="button"
            className="text-sm text-danger"
            onClick={async () => {
              if (!confirm("Delete this article?")) return;
              await deleteAdminPost({ data: post.id });
              await router.navigate({ to: "/admin/blog" });
            }}
          >
            Delete
          </button>
        ) : null}
      </div>
    </form>
  );
}
