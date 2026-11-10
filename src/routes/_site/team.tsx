import { createFileRoute } from "@tanstack/react-router";
import { EmptyState, PageIntro } from "@/components/site/bits";
import { getTeamPage } from "@/lib/public.functions";

export const Route = createFileRoute("/_site/team")({
  loader: () => getTeamPage(),
  head: () => ({
    meta: [
      { title: "Our Team · Grandeur Constructions" },
      { name: "description", content: "People at Grandeur Constructions. Profiles appear when the studio publishes them." },
    ],
  }),
  component: TeamPage,
});

function TeamPage() {
  const { team } = Route.useLoaderData();
  return (
    <>
      <PageIntro
        kicker="Our team"
        title="The people, when the studio names them."
        lede="Photographs, designations and short biographies are published from the studio desk. None are invented here."
      />
      <div className="mx-auto max-w-7xl px-5 py-14 md:px-8">
        {team.length ? (
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {team.map((member) => (
              <li key={member.name} className="group flex h-full flex-col rounded-3xl bg-surface p-5 transition-shadow duration-300 hover:shadow-xl">
                {member.photoUrl ? (
                    <img src={member.photoUrl} alt={`${member.name}, ${member.designation}`} className="mb-4 aspect-[4/5] w-full rounded-2xl object-cover object-[center_20%] transition duration-500 group-hover:scale-[1.02]" />
                ) : null}
                <h2 className="font-display text-2xl text-secondary">{member.name}</h2>
                <p className="text-sm text-primary">{member.designation}</p>
                {member.bio ? <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-soft">{member.bio}</p> : null}
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            title="No team profiles yet"
            body="Add a name, designation, photograph and biography in the studio desk to publish someone here."
          />
        )}
      </div>
    </>
  );
}
