import { createFileRoute, Link } from "@tanstack/react-router";
import { EmptyState, PageIntro } from "@/components/site/bits";
import { formatWhen } from "@/lib/format";
import { getPosts } from "@/lib/public.functions";

export const Route = createFileRoute("/_site/blog/")({
  loader: () => getPosts(),
  head: () => ({
    meta: [
      { title: "Blog · Grandeur Constructions" },
      { name: "description", content: "Notes and news from Grandeur Constructions." },
    ],
  }),
  component: BlogPage,
});

function BlogPage() {
  const { posts } = Route.useLoaderData();
  return (
    <>
      <PageIntro kicker="Blog" title="Notes from the studio." lede="Articles appear when they are published. Drafts stay private." />
      <div className="mx-auto max-w-7xl px-5 py-14 md:px-8">
        {posts.length ? (
          <ul className="grid gap-5 md:grid-cols-2">
            {posts.map((post) => (
              <li key={post.slug}>
                <Link to="/blog/$slug" params={{ slug: post.slug }} className="block h-full rounded-3xl bg-surface p-5">
                  {post.featuredImage ? (
                    <img src={post.featuredImage} alt="" className="mb-4 aspect-video w-full rounded-2xl object-cover" />
                  ) : null}
                  <p className="text-xs font-semibold tracking-widest text-ink-soft uppercase">
                    {post.categoryName || "Note"}
                    {post.publishedAt ? ` · ${formatWhen(post.publishedAt)}` : ""}
                  </p>
                  <h2 className="mt-2 font-display text-2xl text-secondary">{post.title}</h2>
                  {post.excerpt ? <p className="mt-2 text-sm text-ink-soft">{post.excerpt}</p> : null}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState title="No articles yet" body="Published writing will be listed here. Nothing is filled in as sample news." />
        )}
      </div>
    </>
  );
}
