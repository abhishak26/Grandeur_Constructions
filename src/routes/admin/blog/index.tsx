import { createFileRoute, Link } from "@tanstack/react-router";
import { getAdminPosts } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin/blog/")({
  loader: () => getAdminPosts(),
  component: BlogAdmin,
});

function BlogAdmin() {
  const data = Route.useLoaderData();
  if (!data.ok) return <p>{data.message}</p>;
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-4xl text-secondary">Blog</h1>
        <Link to="/admin/blog/$id" params={{ id: "new" }} className="min-h-11 rounded-full bg-primary px-4 py-2 text-sm font-semibold">
          New article
        </Link>
      </div>
      {data.posts.length ? (
        <ul className="space-y-3">
          {data.posts.map((post) => (
            <li key={post.id} className="rounded-3xl bg-background p-4">
              <Link to="/admin/blog/$id" params={{ id: post.id }} className="font-semibold">
                {post.title}
              </Link>
              <p className="text-sm text-ink-soft">{post.status}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-ink-soft">No articles yet.</p>
      )}
    </div>
  );
}
