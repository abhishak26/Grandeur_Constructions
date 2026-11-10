import { z } from "zod";

const email = z
  .string()
  .trim()
  .max(160)
  .refine((value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value), "Enter a valid email address.");

const phone = z
  .string()
  .trim()
  .min(8, "Enter a phone number.")
  .max(24)
  .refine((value) => /^[+0-9 ()-]{8,24}$/.test(value), "Use digits, spaces, or + only.");

const contactMethod = z.enum(["phone", "email", "whatsapp"]);

export const enquirySchema = z.object({
  fullName: z.string().trim().min(2, "Enter your name.").max(120),
  email,
  phone,
  projectType: z.string().trim().min(2).max(80),
  projectLocation: z.string().trim().min(2, "Enter the project location.").max(160),
  estimatedBudget: z.string().trim().max(80).optional().default(""),
  projectDescription: z
    .string()
    .trim()
    .min(10, "Describe the work in a sentence or two.")
    .max(4000),
  preferredContact: contactMethod,
  privacyConsent: z.boolean().refine((value) => value, "Consent is required before we can store this enquiry."),
  companyUrl: z.string().max(200).optional().default(""),
});

export const consultationSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your name.").max(120),
  email,
  phone,
  projectType: z.string().trim().min(2).max(80),
  projectLocation: z.string().trim().max(160).optional().default(""),
  preferredWindow: z.string().trim().max(160).optional().default(""),
  message: z.string().trim().min(10, "Tell us what you would like to discuss.").max(4000),
  preferredContact: contactMethod,
  privacyConsent: z
    .boolean()
    .refine((value) => value, "Consent is required before we can store this request."),
  companyUrl: z.string().max(200).optional().default(""),
});

export const setupSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email,
  password: z.string().min(10, "Use at least 10 characters.").max(200),
});

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Enter your password.").max(200),
});

const assetUrl = z
  .string()
  .trim()
  .max(500)
  .refine((value) => value === "" || isSafeAssetUrl(value), "Use a site image path or an http(s) URL.");

export const projectSchema = z.object({
  id: z.string().trim().max(80).optional().default(""),
  name: z.string().trim().min(2).max(140),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens."),
  location: z.string().trim().max(160).optional().default(""),
  category: z.enum([
    "residential",
    "commercial",
    "architectural",
    "interior",
    "renovation",
    "civil",
    "other",
  ]),
  description: z.string().trim().min(10).max(8000),
  status: z.enum(["completed", "ongoing", "design"]),
  progress: z.string().trim().max(3).optional().default(""),
  completionDate: z
    .string()
    .trim()
    .refine((value) => value === "" || /^\d{4}-\d{2}-\d{2}$/.test(value), "Use a real date.")
    .optional()
    .default(""),
  featured: z.boolean(),
  featuredOrder: z.number().int().min(0).max(999),
  published: z.boolean(),
  images: z
    .array(
      z.object({
        url: assetUrl.refine((value) => value.length > 0, "Image address is required."),
        alt: z.string().trim().max(200).optional().default(""),
      }),
    )
    .max(12),
});

export const serviceSchema = z.object({
  id: z.string().trim().max(80).optional().default(""),
  title: z.string().trim().min(2).max(80),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens."),
  summary: z.string().trim().min(8).max(240),
  description: z.string().trim().min(10).max(6000),
  imageUrl: assetUrl.optional().default(""),
  imageAlt: z.string().trim().max(200).optional().default(""),
  published: z.boolean(),
  displayOrder: z.number().int().min(0).max(999),
});

export const testimonialSchema = z.object({
  id: z.string().trim().max(80).optional().default(""),
  quote: z.string().trim().min(8).max(800),
  authorName: z.string().trim().min(2).max(80),
  authorRole: z.string().trim().max(80).optional().default(""),
  location: z.string().trim().max(80).optional().default(""),
  published: z.boolean(),
  displayOrder: z.number().int().min(0).max(999),
});

export const teamSchema = z.object({
  id: z.string().trim().max(80).optional().default(""),
  name: z.string().trim().min(2).max(80),
  designation: z.string().trim().min(2).max(80),
  bio: z.string().trim().max(2000).optional().default(""),
  photoUrl: assetUrl.optional().default(""),
  published: z.boolean(),
  displayOrder: z.number().int().min(0).max(999),
});

export const postSchema = z.object({
  id: z.string().trim().max(80).optional().default(""),
  title: z.string().trim().min(3).max(160),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens."),
  excerpt: z.string().trim().max(300).optional().default(""),
  content: z.string().trim().min(10).max(20000),
  categoryId: z.string().trim().max(80).optional().default(""),
  newCategory: z.string().trim().max(60).optional().default(""),
  featuredImage: assetUrl.optional().default(""),
  status: z.enum(["draft", "published"]),
  seoTitle: z.string().trim().max(160).optional().default(""),
  seoDescription: z.string().trim().max(300).optional().default(""),
});

export const settingsSchema = z.object({
  companyName: z.string().trim().min(2).max(120),
  tagline: z.string().trim().min(2).max(160),
  address: z.string().trim().min(8).max(300),
  phone: z.string().trim().max(24).optional().default(""),
  email: z.string().trim().max(160).optional().default(""),
  whatsapp: z.string().trim().max(24).optional().default(""),
  mapsEmbedUrl: z.string().trim().max(600).optional().default(""),
  publicSiteUrl: z.string().trim().max(200).optional().default(""),
  facebook: z.string().trim().max(200).optional().default(""),
  instagram: z.string().trim().max(200).optional().default(""),
  linkedin: z.string().trim().max(200).optional().default(""),
  youtube: z.string().trim().max(200).optional().default(""),
  seoTitle: z.string().trim().max(160).optional().default(""),
  seoDescription: z.string().trim().max(300).optional().default(""),
  gaMeasurementId: z.string().trim().max(32).optional().default(""),
  notifyEmail: z.string().trim().max(160).optional().default(""),
  notifyWebhookUrl: z.string().trim().max(400).optional().default(""),
});

export const noteSchema = z.object({
  id: z.string().trim().min(2),
  status: z.enum(["new", "contacted", "in_progress", "completed", "archived"]),
  internalNotes: z.string().trim().max(4000).optional().default(""),
});

export const uploadSchema = z.object({
  filename: z.string().trim().min(1).max(120),
  mime: z.enum(["image/jpeg", "image/png", "image/webp"]),
  base64: z.string().min(20).max(3_200_000),
  alt: z.string().trim().max(200).optional().default(""),
});

export type EnquiryInput = z.input<typeof enquirySchema>;
export type ConsultationInput = z.input<typeof consultationSchema>;
export type EnquiryData = z.output<typeof enquirySchema>;
export type ConsultationData = z.output<typeof consultationSchema>;

export type FieldResult<T> =
  | { ok: true; data: T }
  | { ok: false; message: string; fieldErrors: Record<string, string> };

export function parseBody<T>(schema: z.ZodType<T>, data: unknown): FieldResult<T> {
  const result = schema.safeParse(data);
  if (result.success) return { ok: true, data: result.data };
  const fieldErrors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const key = issue.path.join(".") || "form";
    if (!fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return { ok: false, message: "Please check the form and try again.", fieldErrors };
}

export function isSafeAssetUrl(value: string): boolean {
  if (value.startsWith("/media/") || value.startsWith("/api/media/")) return true;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export function httpsOrNull(value: string | null | undefined): string | null {
  const trimmed = (value ?? "").trim();
  if (!trimmed) return null;
  try {
    const url = new URL(trimmed);
    if (url.protocol !== "https:") return null;
    return url.toString();
  } catch {
    return null;
  }
}

export function safeHref(value: string): string | null {
  const trimmed = value.trim();
  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) return trimmed;
  return httpsOrNull(trimmed);
}

export function safeGa(value: string | null | undefined): string | null {
  const trimmed = (value ?? "").trim();
  if (!trimmed) return null;
  return /^G-[A-Z0-9]{4,32}$/.test(trimmed) ? trimmed : null;
}
