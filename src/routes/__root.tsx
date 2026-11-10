import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { getSeo } from "@/lib/public.functions";
import appCss from "../styles.css?url";

export const Route = createRootRoute({
  loader: () => getSeo(),
  head: ({ loaderData }) => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: loaderData?.title ?? "Grandeur Constructions" },
      {
        name: "description",
        content: loaderData?.description ?? "Grandeur Constructions, Perambur, Chennai.",
      },
      { name: "theme-color", content: "#171717" },
    ],
    links: [
      { rel: "icon", type: "image/png", sizes: "450x450", href: "/favicon-gc.png?v=2" },
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&family=Syne:wght@500;600;700;800&display=swap",
      },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
    ],
  }),
  component: RootComponent,
  notFoundComponent: NotFound,
});

function RootComponent() {
  const data = Route.useLoaderData();
  const ga = data.gaMeasurementId;
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
        {ga ? <script async src={`https://www.googletagmanager.com/gtag/js?id=${ga}`} /> : null}
        {ga ? (
          <script
            dangerouslySetInnerHTML={{
              __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());gtag('config','${ga}');`,
            }}
          />
        ) : null}
      </head>
      <body className="min-h-screen bg-background font-sans text-ink antialiased">
        <PreviewHostBridge />
        <div className="site-aurora" aria-hidden="true" />
        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-full focus:bg-primary focus:px-4 focus:py-2"
        >
          Skip to content
        </a>
        <div className="site-content">
          <AuthProvider>
            <Outlet />
          </AuthProvider>
        </div>
        <Scripts />
      </body>
    </html>
  );
}

function NotFound() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-xl flex-col justify-center px-6">
      <p className="text-xs font-semibold tracking-widest text-ink-soft uppercase">404</p>
      <h1 className="mt-3 font-display text-4xl text-secondary">This page is not on the site.</h1>
      <a href="/" className="mt-6 text-sm font-semibold text-secondary underline">
        Back to Grandeur Constructions
      </a>
    </main>
  );
}
