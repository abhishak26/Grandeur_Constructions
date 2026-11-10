import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Footer, WhatsAppButton } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { getChrome } from "@/lib/public.functions";

export const Route = createFileRoute("/_site")({
  loader: () => getChrome(),
  component: SiteLayout,
});

function SiteLayout() {
  const { settings, services } = Route.useLoaderData();
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main id="content" className="flex-1">
        <Outlet />
      </main>
      <Footer settings={settings} services={services} />
      <WhatsAppButton />
    </div>
  );
}
