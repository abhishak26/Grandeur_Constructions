import { createServerFn } from "@tanstack/react-start";

async function api() {
  return import("@/lib/server/public-data");
}

export const getSeo = createServerFn({ method: "GET" }).handler(async () => (await api()).loadSeo());

export const getChrome = createServerFn({ method: "GET" }).handler(async () => (await api()).loadChrome());

export const getHome = createServerFn({ method: "GET" }).handler(async () => (await api()).loadHome());

export const getServices = createServerFn({ method: "GET" }).handler(async () => (await api()).loadServices());

export const getService = createServerFn({ method: "GET" })
  .validator((slug: string) => slug)
  .handler(async ({ data }) => (await api()).loadService(data));

export const getProjects = createServerFn({ method: "GET" }).handler(async () => (await api()).loadProjects());

export const getProject = createServerFn({ method: "GET" })
  .validator((slug: string) => slug)
  .handler(async ({ data }) => (await api()).loadProject(data));

export const getTeamPage = createServerFn({ method: "GET" }).handler(async () => (await api()).loadTeamPage());

export const getTestimonialsPage = createServerFn({ method: "GET" }).handler(async () =>
  (await api()).loadTestimonialsPage(),
);

export const getPosts = createServerFn({ method: "GET" }).handler(async () => (await api()).loadPosts());

export const getPost = createServerFn({ method: "GET" })
  .validator((slug: string) => slug)
  .handler(async ({ data }) => (await api()).loadPost(data));

export const getSitemapData = createServerFn({ method: "GET" }).handler(async () => (await api()).loadSitemap());
