import { createFileRoute } from "@tanstack/react-router";
import { PageIntro, RichText } from "@/components/site/bits";

export const Route = createFileRoute("/_site/terms")({
  head: () => ({
    meta: [
      { title: "Terms · Grandeur Constructions" },
      { name: "description", content: "Terms for using the Grandeur Constructions website." },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  const text = `These terms describe this website. They are not a building contract.

## The site
Grandeur Constructions publishes information about its services from Perambur, Chennai. Project photographs, team profiles, testimonials and articles appear only when the studio adds them.

## Enquiries and consultations
Sending a form creates a request with a reference number. It does not confirm an appointment, a fee, or a start date. Scope, cost and programme are agreed separately in writing.

## Photographs
Reference photographs used to illustrate services are not a claim that Grandeur Constructions designed or built those particular buildings, unless a project page says so.

## Liability
Information on the site can be updated. It is not a quotation.`;
  return (
    <>
      <PageIntro kicker="Terms" title="How to read this website." />
      <div className="mx-auto max-w-3xl px-5 py-14 md:px-8">
        <RichText text={text} />
      </div>
    </>
  );
}
