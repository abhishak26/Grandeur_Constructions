import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { Notice } from "@/components/admin/shell";
import { getAdminSettings, saveAdminSettings } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin/settings")({
  loader: () => getAdminSettings(),
  head: () => ({ meta: [{ title: "Settings · Studio desk" }] }),
  component: SettingsPage,
});

const FIELDS = [
  ["companyName", "Company name"],
  ["tagline", "Tagline"],
  ["address", "Address"],
  ["phone", "Phone"],
  ["email", "Public email"],
  ["whatsapp", "WhatsApp number"],
  ["mapsEmbedUrl", "Google Maps embed URL"],
  ["publicSiteUrl", "Public site URL (https)"],
  ["facebook", "Facebook"],
  ["instagram", "Instagram"],
  ["linkedin", "LinkedIn"],
  ["youtube", "YouTube"],
  ["seoTitle", "Default SEO title"],
  ["seoDescription", "Default SEO description"],
  ["gaMeasurementId", "Google Analytics measurement ID"],
  ["notifyEmail", "Notification email (for your records)"],
  ["notifyWebhookUrl", "Notification webhook URL"],
] as const;

function SettingsPage() {
  const data = Route.useLoaderData();
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  if (!data.ok) return <p>{data.message}</p>;
  const settings = data.settings;
  return (
    <form
      className="space-y-4"
      onSubmit={async (event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const payload = Object.fromEntries(FIELDS.map(([key]) => [key, String(form.get(key) || "")]));
        const result = await saveAdminSettings({ data: payload });
        setMessage(result.ok ? "Settings saved." : result.message);
        if (result.ok) await router.invalidate();
      }}
    >
      <h1 className="font-display text-4xl text-secondary">Settings</h1>
      <p className="max-w-2xl text-sm text-ink-soft">
        Leave phone, email and WhatsApp empty until you are ready to publish them. Email alerts are stored here and
        delivered only if a webhook URL is set. Analytics runs only when a measurement ID is saved.
      </p>
      {message ? <Notice>{message}</Notice> : null}
      {FIELDS.map(([key, label]) => (
        <label key={key} className="block space-y-2 text-sm">
          {label}
          {key === "address" || key === "seoDescription" ? (
            <textarea name={key} defaultValue={settings[key]} className="input min-h-24" />
          ) : (
            <input name={key} defaultValue={settings[key]} className="input" />
          )}
        </label>
      ))}
      <button className="min-h-11 rounded-full bg-primary px-6 font-semibold text-secondary">Save settings</button>
    </form>
  );
}
