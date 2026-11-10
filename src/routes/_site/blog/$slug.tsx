import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { RichText } from "@/components/site/bits";
import { formatWhen } from "@/lib/format";
import { getPost } from "@/lib/public.functions";

export const Route = createFileRoute("/_site/blog/$slug")({
  loader: async ({ params }) => {
    const data = await getPost({ data: params.slug });
    if (!data) throw notFound();
    return data;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData?.post.seoTitle || `${loaderData?.post.title ?? "Article"} · Grandeur Constructions` },
      {
        name: "description",
        content: loaderData?.post.seoDescription || loaderData?.post.excerpt || "A note from Grandeur Constructions.",
      },
    ],
  }),
  component: PostPage,
});

function PostPage() {
  const { post } = Route.useLoaderData();
  return (
    <article className="mx-auto max-w-3xl px-5 py-14 md:px-8">
      <p className="text-xs font-semibold tracking-widest text-ink-soft uppercase">
        <Link to="/blog">Blog</Link>
        {post.categoryName ? ` · ${post.categoryName}` : ""}
        {post.publishedAt ? ` · ${formatWhen(post.publishedAt)}` : ""}
      </p>
      <h1 className="mt-4 font-display text-4xl text-secondary md:text-5xl">{post.title}</h1>
      {post.featuredImage ? (
        <img src={post.featuredImage} alt="" className="mt-8 w-full rounded-3xl object-cover" />
      ) : null}
      <RichText text={post.content} className="mt-8" />
    </article>
  );
}
