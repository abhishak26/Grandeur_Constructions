import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState, type Dispatch, type ReactNode, type SetStateAction } from "react";
import { Notice } from "@/components/admin/shell";
import { getAdminHomepage, saveAdminHomepage } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin/homepage")({
  loader: () => getAdminHomepage(),
  head: () => ({ meta: [{ title: "Homepage · Studio desk" }] }),
  component: HomepageAdmin,
});

function HomepageAdmin() {
  const loaded = Route.useLoaderData();
  const router = useRouter();
  const home = loaded.ok ? loaded.home : null;
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [slides, setSlides] = useState(home?.slides ?? []);
  const [faqs, setFaqs] = useState(home?.faqs ?? []);
  const [principles, setPrinciples] = useState(home?.principles ?? []);
  const [steps, setSteps] = useState(home?.steps ?? []);
  if (!loaded.ok || !home) return <p>{loaded.ok ? "Missing homepage." : loaded.message}</p>;

  return (
    <form
      className="space-y-8"
      onSubmit={async (event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const result = await saveAdminHomepage({
          data: {
            heroHeading: String(form.get("heroHeading") || ""),
            heroHighlight: String(form.get("heroHighlight") || ""),
            heroDescription: String(form.get("heroDescription") || ""),
            primaryCtaText: String(form.get("primaryCtaText") || ""),
            primaryCtaHref: String(form.get("primaryCtaHref") || ""),
            secondaryCtaText: String(form.get("secondaryCtaText") || ""),
            secondaryCtaHref: String(form.get("secondaryCtaHref") || ""),
            aboutHeading: String(form.get("aboutHeading") || ""),
            aboutBody: String(form.get("aboutBody") || ""),
            mission: String(form.get("mission") || ""),
            vision: String(form.get("vision") || ""),
            founderName: String(form.get("founderName") || ""),
            founderBio: String(form.get("founderBio") || ""),
            consultationHeading: String(form.get("consultationHeading") || ""),
            consultationBody: String(form.get("consultationBody") || ""),
            slides,
            faqs,
            principles,
            steps,
          },
        });
        if (!result.ok) {
          setError(result.message);
          setMessage(null);
          return;
        }
        setError(null);
        setMessage("Homepage saved.");
        await router.invalidate();
      }}
    >
      <h1 className="font-display text-4xl text-secondary">Homepage</h1>
      {message ? <Notice>{message}</Notice> : null}
      {error ? <Notice tone="bad">{error}</Notice> : null}
      <section className="space-y-3 rounded-3xl bg-background p-5">
        <h2 className="font-display text-2xl">Hero</h2>
        <input name="heroHeading" defaultValue={home.heroHeading} className="input" />
        <input name="heroHighlight" defaultValue={home.heroHighlight} className="input" placeholder="Words to show in gold" />
        <textarea name="heroDescription" defaultValue={home.heroDescription} className="input min-h-28" />
        <div className="grid gap-3 md:grid-cols-2">
          <input name="primaryCtaText" defaultValue={home.primaryCtaText} className="input" />
          <input name="primaryCtaHref" defaultValue={home.primaryCtaHref} className="input" />
          <input name="secondaryCtaText" defaultValue={home.secondaryCtaText} className="input" />
          <input name="secondaryCtaHref" defaultValue={home.secondaryCtaHref} className="input" />
        </div>
        {slides.map((slide, index) => (
          <div key={index} className="grid gap-2 md:grid-cols-2">
            <input className="input" value={slide.imageUrl} onChange={(event) => update(setSlides, index, { ...slide, imageUrl: event.target.value })} placeholder="Image address" />
            <input className="input" value={slide.alt} onChange={(event) => update(setSlides, index, { ...slide, alt: event.target.value })} placeholder="Alt text" />
          </div>
        ))}
        <button type="button" className="text-sm underline" onClick={() => setSlides([...slides, { imageUrl: "", alt: "", active: true }])}>
          Add hero image
        </button>
      </section>
      <section className="space-y-3 rounded-3xl bg-background p-5">
        <h2 className="font-display text-2xl">About, mission, vision</h2>
        <input name="aboutHeading" defaultValue={home.aboutHeading} className="input" />
        <textarea name="aboutBody" defaultValue={home.aboutBody} className="input min-h-32" />
        <textarea name="mission" defaultValue={home.mission} className="input min-h-24" placeholder="Mission — leave blank if not ready" />
        <textarea name="vision" defaultValue={home.vision} className="input min-h-24" placeholder="Vision — leave blank if not ready" />
        <input name="founderName" defaultValue={home.founderName} className="input" placeholder="Founder name, only if you want it public" />
        <textarea name="founderBio" defaultValue={home.founderBio} className="input min-h-24" placeholder="Founder biography" />
      </section>
      <Repeat
        title="Principles"
        rows={principles}
        onAdd={() => setPrinciples([...principles, { title: "", body: "" }])}
        render={(row, index) => (
          <div className="grid gap-2">
            <input className="input" value={row.title} onChange={(event) => update(setPrinciples, index, { ...row, title: event.target.value })} />
            <textarea className="input" value={row.body} onChange={(event) => update(setPrinciples, index, { ...row, body: event.target.value })} />
          </div>
        )}
      />
      <Repeat
        title="Process"
        rows={steps}
        onAdd={() => setSteps([...steps, { title: "", body: "" }])}
        render={(row, index) => (
          <div className="grid gap-2">
            <input className="input" value={row.title} onChange={(event) => update(setSteps, index, { ...row, title: event.target.value })} />
            <textarea className="input" value={row.body} onChange={(event) => update(setSteps, index, { ...row, body: event.target.value })} />
          </div>
        )}
      />
      <Repeat
        title="Questions"
        rows={faqs}
        onAdd={() => setFaqs([...faqs, { question: "", answer: "", published: true }])}
        render={(row, index) => (
          <div className="grid gap-2">
            <input className="input" value={row.question} onChange={(event) => update(setFaqs, index, { ...row, question: event.target.value })} />
            <textarea className="input" value={row.answer} onChange={(event) => update(setFaqs, index, { ...row, answer: event.target.value })} />
          </div>
        )}
      />
      <section className="space-y-3 rounded-3xl bg-background p-5">
        <h2 className="font-display text-2xl">Consultation band</h2>
        <input name="consultationHeading" defaultValue={home.consultationHeading} className="input" />
        <textarea name="consultationBody" defaultValue={home.consultationBody} className="input min-h-24" />
      </section>
      <button type="submit" className="min-h-11 rounded-full bg-primary px-6 font-semibold text-secondary">
        Save homepage
      </button>
    </form>
  );
}

function update<T>(setter: Dispatch<SetStateAction<T[]>>, index: number, row: T) {
  setter((current) => current.map((item, itemIndex) => (itemIndex === index ? row : item)));
}

function Repeat<T>({
  title,
  rows,
  onAdd,
  render,
}: {
  title: string;
  rows: T[];
  onAdd: () => void;
  render: (row: T, index: number) => ReactNode;
}) {
  return (
    <section className="space-y-3 rounded-3xl bg-background p-5">
      <h2 className="font-display text-2xl">{title}</h2>
      {rows.map((row, index) => (
        <div key={index}>{render(row, index)}</div>
      ))}
      <button type="button" className="text-sm underline" onClick={onAdd}>
        Add row
      </button>
    </section>
  );
}
