import { createFileRoute } from "@tanstack/react-router";
import { HomeView } from "@/components/site/home-view";
import { getHome } from "@/lib/public.functions";

export const Route = createFileRoute("/_site/")({
  loader: () => getHome(),
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData?.settings.seoTitle || "Grandeur Constructions | Building Trust. Creating Legacies." },
      {
        name: "description",
        content:
          loaderData?.settings.seoDescription ||
          "Residential and commercial construction in Perambur, Chennai.",
      },
    ],
  }),
  component: function HomePage() {
    const data = Route.useLoaderData();
    return <HomeView data={data} />;
  },
});
