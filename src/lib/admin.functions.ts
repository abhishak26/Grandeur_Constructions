import { createServerFn } from "@tanstack/react-start";

async function auth() {
  return import("@/lib/server/auth-admin");
}
async function data() {
  return import("@/lib/server/admin-data");
}
async function media() {
  return import("@/lib/server/media");
}

export const getAdminGate = createServerFn({ method: "GET" }).handler(async () => (await auth()).gate());

export const setupAdmin = createServerFn({ method: "POST" })
  .validator((input: { name: string; email: string; password: string }) => input)
  .handler(async ({ data: input }) => (await auth()).setup(input));

export const loginAdmin = createServerFn({ method: "POST" })
  .validator((input: { email: string; password: string }) => input)
  .handler(async ({ data: input }) => (await auth()).login(input));

export const logoutAdmin = createServerFn({ method: "POST" }).handler(async () => (await auth()).logout());

export const getOverview = createServerFn({ method: "GET" }).handler(async () => (await data()).overview());

export const getAdminProjects = createServerFn({ method: "GET" }).handler(async () => (await data()).listProjects());

export const getAdminProject = createServerFn({ method: "GET" })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => (await data()).getProject(id));

export const saveAdminProject = createServerFn({ method: "POST" })
  .validator((input: unknown) => input)
  .handler(async ({ data: input }) => (await data()).saveProject(input));

export const deleteAdminProject = createServerFn({ method: "POST" })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => (await data()).deleteProject(id));

export const getAdminServices = createServerFn({ method: "GET" }).handler(async () => (await data()).listServices());

export const saveAdminService = createServerFn({ method: "POST" })
  .validator((input: unknown) => input)
  .handler(async ({ data: input }) => (await data()).saveService(input));

export const deleteAdminService = createServerFn({ method: "POST" })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => (await data()).deleteService(id));

export const reorderAdminServices = createServerFn({ method: "POST" })
  .validator((ids: string[]) => ids)
  .handler(async ({ data: ids }) => (await data()).reorderServices(ids));

export const getAdminEnquiries = createServerFn({ method: "GET" })
  .validator((input: { q: string; status: string }) => input)
  .handler(async ({ data: input }) => (await data()).listEnquiries(input.q, input.status));

export const getAdminEnquiry = createServerFn({ method: "GET" })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => (await data()).getEnquiry(id));

export const updateAdminEnquiry = createServerFn({ method: "POST" })
  .validator((input: unknown) => input)
  .handler(async ({ data: input }) => (await data()).updateEnquiry(input));

export const deleteAdminEnquiry = createServerFn({ method: "POST" })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => (await data()).deleteEnquiry(id));

export const getAdminConsultations = createServerFn({ method: "GET" })
  .validator((input: { q: string; status: string }) => input)
  .handler(async ({ data: input }) => (await data()).listConsultations(input.q, input.status));

export const getAdminConsultation = createServerFn({ method: "GET" })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => (await data()).getConsultation(id));

export const updateAdminConsultation = createServerFn({ method: "POST" })
  .validator((input: unknown) => input)
  .handler(async ({ data: input }) => (await data()).updateConsultation(input));

export const deleteAdminConsultation = createServerFn({ method: "POST" })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => (await data()).deleteConsultation(id));

export const getAdminHomepage = createServerFn({ method: "GET" }).handler(async () => (await data()).getHomepageAdmin());

export const saveAdminHomepage = createServerFn({ method: "POST" })
  .validator((input: unknown) => input)
  .handler(async ({ data: input }) => (await data()).saveHomepage(input));

export const getAdminTestimonials = createServerFn({ method: "GET" }).handler(async () =>
  (await data()).listTestimonials(),
);

export const saveAdminTestimonial = createServerFn({ method: "POST" })
  .validator((input: unknown) => input)
  .handler(async ({ data: input }) => (await data()).saveTestimonial(input));

export const deleteAdminTestimonial = createServerFn({ method: "POST" })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => (await data()).deleteTestimonial(id));

export const getAdminTeam = createServerFn({ method: "GET" }).handler(async () => (await data()).listTeam());

export const saveAdminTeam = createServerFn({ method: "POST" })
  .validator((input: unknown) => input)
  .handler(async ({ data: input }) => (await data()).saveTeam(input));

export const deleteAdminTeam = createServerFn({ method: "POST" })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => (await data()).deleteTeam(id));

export const getAdminPosts = createServerFn({ method: "GET" }).handler(async () => (await data()).listPostsAdmin());

export const getAdminPost = createServerFn({ method: "GET" })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => (await data()).getPost(id));

export const saveAdminPost = createServerFn({ method: "POST" })
  .validator((input: unknown) => input)
  .handler(async ({ data: input }) => (await data()).savePost(input));

export const deleteAdminPost = createServerFn({ method: "POST" })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => (await data()).deletePost(id));

export const getAdminSettings = createServerFn({ method: "GET" }).handler(async () => (await data()).getSettingsAdmin());

export const saveAdminSettings = createServerFn({ method: "POST" })
  .validator((input: unknown) => input)
  .handler(async ({ data: input }) => (await data()).saveSettings(input));

export const getAdminMedia = createServerFn({ method: "GET" }).handler(async () => (await media()).listMedia());

export const uploadAdminMedia = createServerFn({ method: "POST" })
  .validator((input: { filename: string; mime: "image/jpeg" | "image/png" | "image/webp"; base64: string; alt?: string }) => input)
  .handler(async ({ data: input }) => (await media()).uploadMedia(input));

export const deleteAdminMedia = createServerFn({ method: "POST" })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => (await media()).deleteMedia(id));
