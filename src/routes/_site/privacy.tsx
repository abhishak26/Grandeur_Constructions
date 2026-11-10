import { createFileRoute } from "@tanstack/react-router";
import { PageIntro, RichText } from "@/components/site/bits";
import { COMPANY } from "@/lib/company";
import { getChrome } from "@/lib/public.functions";

export const Route = createFileRoute("/_site/privacy")({
  loader: () => getChrome(),
  head: () => ({
    meta: [
      { title: "Privacy · Grandeur Constructions" },
      { name: "description", content: "How Grandeur Constructions handles enquiry and consultation details." },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  const { settings } = Route.useLoaderData();
  const text = `This note describes what this website actually does. It is not a substitute for legal advice.

## What is stored
The enquiry form stores your name, email, phone number, project type, location, optional budget, description and preferred contact method. The consultation form stores your name, email, phone, project type, optional location, optional timing note, message and preferred contact method. A reference number is created for each submission.

## Why
The studio keeps these details so it can reply. They are not sold. They are visible to the administrator of this website.

## Analytics and WhatsApp
If a Google Analytics measurement ID is saved in settings, pages can send usage events, including form submissions, phone clicks and WhatsApp clicks. The WhatsApp button, when a number is published, opens WhatsApp. That conversation is handled by WhatsApp, not by this site.

## Corrections
To ask for a correction or deletion, contact the studio using the phone or email published on the contact page. Currently published: ${[COMPANY.phone, settings.email].filter(Boolean).join(", ")}.`;
  return (
    <>
      <PageIntro kicker="Privacy" title="What this site keeps." />
      <div className="mx-auto max-w-3xl px-5 py-14 md:px-8">
        <RichText text={text} />
      </div>
    </>
  );
}
