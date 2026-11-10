/** Facts supplied for Grandeur Constructions. Do not add unverified claims here. */
export const COMPANY = {
  name: "Grandeur Constructions",
  tagline: "Building Trust. Creating Legacies.",
  address:
    "No.24, 10, Paul Varghese St, Vetri Nagar, Perambur, Chennai, Tamil Nadu 600082.",
  locality: "Chennai",
  region: "Tamil Nadu",
  postalCode: "600082",
  street: "No.24, 10, Paul Varghese St, Vetri Nagar, Perambur",
  years: 10,
} as const;

export const PROJECT_CATEGORIES = [
  ["residential", "Residential"],
  ["commercial", "Commercial"],
  ["architectural", "Architectural design"],
  ["interior", "Interior"],
  ["renovation", "Renovation"],
  ["civil", "Civil"],
  ["other", "Other"],
] as const;

export const PROJECT_STATUSES = [
  ["completed", "Completed"],
  ["ongoing", "Ongoing"],
  ["design", "Design / concept"],
] as const;

export type ProjectCategory = (typeof PROJECT_CATEGORIES)[number][0];
export type ProjectStatus = (typeof PROJECT_STATUSES)[number][0];

export function categoryLabel(value: string): string {
  return PROJECT_CATEGORIES.find((item) => item[0] === value)?.[1] ?? value;
}

export function statusLabel(value: string): string {
  return PROJECT_STATUSES.find((item) => item[0] === value)?.[1] ?? value;
}

export function enquiryStatusLabel(value: string): string {
  const map: Record<string, string> = {
    new: "New",
    contacted: "Contacted",
    in_progress: "In progress",
    completed: "Completed",
    archived: "Archived",
  };
  return map[value] ?? value;
}
