import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Avatar from "@/components/Avatar";
import { timeAgo } from "@/lib/forum-utils";
import {
  PROJECT_STATUS_COLORS,
  type ProjectStatus,
} from "@/lib/types";

export const dynamic = "force-dynamic";

const DISCORD_URL = "https://discord.gg/segfault";

const TRACKS = [
  {
    number: "01",
    name: "Web & app development",
    description:
      "Take an idea from prompt to production. Real deployments, real users, real bugs — and the AI workflow that gets you through all three.",
    terminal: "$ npx create-something-real",
  },
  {
    number: "02",
    name: "Educational tools",
    description:
      "Build the study tools, tutors, and classroom software you wish existed. Software that teaches is the fastest way to learn twice.",
    terminal: "$ ship --for classmates",
  },
  {
    number: "03",
    name: "Creative coding & music tech",
    description:
      "Synths, visuals, generative art, instruments in the browser. The corner of programming where the demo is the point.",
    terminal: "$ play --loud",
  },
] as const;

const SHIPPING_STEPS = [
  {
    label: "Pick something real",
    body: "Not a todo app. A tool a friend would use, a site for your club, an instrument that makes noise. Stakes make you learn.",
  },
  {
    label: "Build with AI, out loud",
    body: "Vibe coding isn't autocomplete — it's directing. You learn to spec, prompt, read the diff, and know when the model is lying to you.",
  },
  {
    label: "Log it, ship it, demo it",
    body: "Post build logs as you go. Ship early. Demo in Discord and take the feedback. Then do it again, better.",
  },
] as const;

const COMMUNITY_ITEMS = [
  {
    title: "Discord is home base",
    body: "Build channels, help threads, and an always-on AI mentor that answers questions and reviews your approach at 2am.",
  },
  {
    title: "Weekly build sessions",
    body: "Co-working calls where everyone works on their own thing, together. Show up stuck, leave unstuck.",
  },
  {
    title: "Projects & teammates",
    body: "Post what you're building on the site, flag what help you need, and find collaborators for hackathons and side quests.",
  },
  {
    title: "Practice ground",
    body: "A forum, coding questions, and build logs — the boring-sounding infrastructure that makes consistent shipping possible.",
  },
] as const;

const TICKER_ITEMS = [
  "vibe coding",
  "ship it",
  "read the diff",
  "demo friday",
  "prompt · build · debug",
  "learn by shipping",
  "web & apps",
  "edtech",
  "music tech",
];

function statusClass(status: string) {
  return (
    PROJECT_STATUS_COLORS[status as ProjectStatus] ??
    "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-400"
  );
}

async function getCommunityActivity() {
  try {
    const [featuredProjects, recentLogs] = await Promise.all([
      prisma.project.findMany({
        orderBy: { createdAt: "desc" },
        take: 3,
        include: {
          author: { select: { id: true, name: true, avatarUrl: true } },
        },
      }),
      prisma.buildLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 4,
        include: {
          author: { select: { id: true, name: true, avatarUrl: true } },
          project: { select: { id: true, title: true } },
        },
      }),
    ]);
    return { featuredProjects, recentLogs };
  } catch {
    return { featuredProjects: [], recentLogs: [] };
  }
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="inline-block font-mono text-xs uppercase tracking-[0.2em] bg-primary text-white px-2 py-1">
      {children}
    </p>
  );
}

export default async function HomePage() {
  const { featuredProjects, recentLogs } = await getCommunityActivity();

  return (
    <div className="bg-white dark:bg-neutral-950 text-ink">
      {/* Hero */}
      <section className="relative border-b-2 border-ink">
        <div className="max-w-6xl mx-auto px-4 pt-14 pb-12 sm:pt-20 sm:pb-16">
          <p className="rise-in font-mono text-xs sm:text-sm">
            <span className="bg-ink text-paper px-1.5 py-0.5">segfault</span>{" "}
            — a community, not a course
          </p>
          <h1 className="rise-in rise-in-1 font-display mt-6 text-[2.6rem] leading-[0.95] sm:text-6xl lg:text-[5.5rem]">
            Learn to build
            <br />
            <span className="text-primary">real things</span>
            <br />
            with AI.
          </h1>
          <div className="mt-10 grid lg:grid-cols-[1.2fr_1fr] gap-10 items-end">
            <div>
              <p className="rise-in rise-in-2 max-w-xl text-lg leading-relaxed text-neutral-700 dark:text-neutral-300">
                Segfault is where ambitious young builders learn vibe coding —
                shipping actual software with AI as a collaborator, alongside
                people doing the same.
              </p>
              <div className="rise-in rise-in-3 mt-8 flex flex-wrap items-center gap-4">
                <a
                  href={DISCORD_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover-lift shadow-hard-sm px-6 py-3 border-2 border-ink bg-primary text-white text-sm font-bold uppercase tracking-wide focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  Join the Discord
                </a>
                <Link
                  href="/projects"
                  className="hover-lift shadow-hard-sm px-6 py-3 border-2 border-ink bg-white dark:bg-neutral-950 text-sm font-bold uppercase tracking-wide focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  See what people ship
                </Link>
              </div>
            </div>

            <div className="rise-in rise-in-2 hidden lg:block" aria-hidden>
              <div className="border-2 border-ink bg-white dark:bg-neutral-950 shadow-hard overflow-hidden">
                <div className="flex items-center gap-1.5 px-4 py-2.5 border-b-2 border-ink bg-paper">
                  <span className="w-2.5 h-2.5 border border-ink bg-primary" />
                  <span className="w-2.5 h-2.5 border border-ink" />
                  <span className="w-2.5 h-2.5 border border-ink" />
                  <span className="ml-2 font-mono text-[11px]">
                    ~/segfault
                  </span>
                </div>
                <div className="p-4 font-mono text-[13px] leading-6 text-neutral-600 dark:text-neutral-400">
                  <p>
                    <span className="text-primary">$</span> segfault init
                  </p>
                  <p className="text-neutral-400 dark:text-neutral-500">
                    → idea: something your friends would actually use
                  </p>
                  <p className="text-neutral-400 dark:text-neutral-500">
                    → stack: whatever ships fastest
                  </p>
                  <p className="text-neutral-400 dark:text-neutral-500">
                    → mentor: online · community: 24/7
                  </p>
                  <p className="mt-2">
                    <span className="text-primary">$</span> ship
                    <span className="cursor-blink text-primary">▌</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Ticker */}
        <div className="border-t-2 border-ink bg-ink text-paper py-3 overflow-hidden">
          <div className="ticker-track flex w-max whitespace-nowrap" aria-hidden>
            {[0, 1].map((half) => (
              <div key={half} className="flex">
                {TICKER_ITEMS.map((item) => (
                  <span
                    key={`${half}-${item}`}
                    className="font-mono text-xs uppercase tracking-[0.2em] px-6"
                  >
                    {item} <span className="text-primary px-2">■</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tracks */}
      <section className="max-w-6xl mx-auto px-4 py-16 sm:py-24">
        <div className="max-w-3xl">
          <SectionLabel>The tracks</SectionLabel>
          <h2 className="font-display mt-4 text-3xl sm:text-4xl lg:text-5xl leading-[1.02]">
            Vibe coding is the craft.{" "}
            <em className="text-neutral-400 dark:text-neutral-600">
              These are the places to practice it.
            </em>
          </h2>
        </div>
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          {TRACKS.map((track) => (
            <article
              key={track.number}
              className="hover-lift shadow-hard-sm group relative border-2 border-ink bg-white dark:bg-neutral-950 p-6 flex flex-col"
            >
              <span className="font-mono text-sm bg-ink text-paper px-1.5 py-0.5 self-start">
                {track.number}
              </span>
              <h3 className="font-display text-xl mt-4 leading-tight">
                {track.name}
              </h3>
              <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed flex-1">
                {track.description}
              </p>
              <p className="mt-5 pt-3 border-t-2 border-ink font-mono text-xs text-primary">
                {track.terminal}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* Learn by shipping */}
      <section className="border-y-2 border-ink bg-paper">
        <div className="max-w-6xl mx-auto px-4 py-16 sm:py-24">
          <div className="grid lg:grid-cols-[1fr_1.4fr] gap-10 lg:gap-16">
            <div>
              <SectionLabel>The method</SectionLabel>
              <h2 className="font-display mt-4 text-3xl sm:text-4xl lg:text-5xl leading-[1.02]">
                Learn by <span className="text-primary">shipping.</span>
              </h2>
              <p className="mt-5 text-neutral-700 dark:text-neutral-300 leading-relaxed max-w-md">
                Tutorials teach you to follow. Shipping teaches you to build.
                Everything here is organized around getting real software in
                front of real people, on repeat.
              </p>
            </div>
            <ol className="border-2 border-ink bg-white dark:bg-neutral-950 shadow-hard divide-y-2 divide-ink">
              {SHIPPING_STEPS.map((step, i) => (
                <li key={step.label} className="p-6 flex gap-5">
                  <span className="font-mono text-sm bg-primary text-white px-1.5 py-0.5 self-start shrink-0">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="font-display text-lg leading-tight">
                      {step.label}
                    </h3>
                    <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                      {step.body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Community activity */}
      <section className="max-w-6xl mx-auto px-4 py-16 sm:py-24">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <SectionLabel>From the workshop</SectionLabel>
            <h2 className="font-display mt-4 text-3xl sm:text-4xl leading-[1.02]">
              What&apos;s being built right now
            </h2>
          </div>
          <Link
            href="/projects"
            className="font-mono text-sm text-primary underline underline-offset-4 decoration-2"
          >
            all projects →
          </Link>
        </div>

        {featuredProjects.length > 0 ? (
          <div className="mt-10 grid sm:grid-cols-3 gap-6">
            {featuredProjects.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="hover-lift shadow-hard-sm group border-2 border-ink bg-white dark:bg-neutral-950 p-5 flex flex-col min-h-[168px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold leading-snug line-clamp-2">
                    {project.title}
                  </h3>
                  <span
                    className={`shrink-0 text-[10px] font-mono px-1.5 py-0.5 border border-ink ${statusClass(project.status)}`}
                  >
                    {project.status}
                  </span>
                </div>
                <p className="text-sm text-neutral-500 mt-2 line-clamp-2 flex-1">
                  {project.tagline}
                </p>
                {project.lookingFor.length > 0 && (
                  <p className="text-xs text-primary font-bold mt-3 line-clamp-1">
                    Looking for {project.lookingFor.join(", ")}
                  </p>
                )}
                <div className="mt-4 pt-3 border-t-2 border-ink flex items-center gap-2 text-xs text-neutral-500">
                  <Avatar
                    src={project.author.avatarUrl}
                    name={project.author.name}
                    size="sm"
                  />
                  <span className="truncate">{project.author.name}</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="mt-10 border-2 border-dashed border-ink p-8 text-center">
            <p className="font-mono text-sm text-neutral-500">
              {"// the next featured build could be yours"}
            </p>
            <Link
              href="/projects/new"
              className="hover-lift shadow-hard-sm inline-block mt-5 px-5 py-2.5 border-2 border-ink bg-white dark:bg-neutral-950 text-sm font-bold uppercase tracking-wide"
            >
              Share a project
            </Link>
          </div>
        )}

        {recentLogs.length > 0 && (
          <div className="mt-12">
            <div className="flex items-end justify-between gap-4">
              <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-neutral-500">
                Build log feed
              </h3>
              <Link
                href="/logs"
                className="font-mono text-sm text-primary underline underline-offset-4 decoration-2"
              >
                all logs →
              </Link>
            </div>
            <div className="mt-4 border-2 border-ink bg-white dark:bg-neutral-950 shadow-hard-sm divide-y-2 divide-ink">
              {recentLogs.map((log) => (
                <div key={log.id} className="flex gap-3 px-4 sm:px-5 py-4">
                  <Avatar
                    src={log.author.avatarUrl}
                    name={log.author.name}
                    size="sm"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm">
                      <span className="font-bold">{log.author.name}</span>
                      <span className="font-mono text-neutral-400 text-xs">
                        {timeAgo(
                          log.createdAt instanceof Date
                            ? log.createdAt.toISOString()
                            : String(log.createdAt),
                        )}
                      </span>
                      {log.project && (
                        <Link
                          href={`/projects/${log.project.id}`}
                          className="text-xs text-primary font-bold underline underline-offset-2 truncate"
                        >
                          {log.project.title}
                        </Link>
                      )}
                    </div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1 line-clamp-2 leading-relaxed">
                      {log.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* How the community works */}
      <section className="border-y-2 border-ink bg-paper">
        <div className="max-w-6xl mx-auto px-4 py-16 sm:py-24">
          <div className="max-w-3xl">
            <SectionLabel>How it works</SectionLabel>
            <h2 className="font-display mt-4 text-3xl sm:text-4xl lg:text-5xl leading-[1.02]">
              A community that runs on{" "}
              <span className="text-primary">momentum</span>
            </h2>
          </div>
          <div className="mt-12 grid sm:grid-cols-2 border-2 border-ink bg-white dark:bg-neutral-950 shadow-hard divide-y-2 divide-ink sm:divide-y-0">
            {COMMUNITY_ITEMS.map((item, i) => (
              <div
                key={item.title}
                className={`p-6 sm:p-8 border-ink ${i % 2 === 1 ? "sm:border-l-2" : ""} ${i >= 2 ? "sm:border-t-2" : ""}`}
              >
                <h3 className="font-display text-lg leading-tight">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-ink text-paper">
        <div className="max-w-6xl mx-auto px-4 py-20 sm:py-28 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">
            {"// no prerequisites, just intent"}
          </p>
          <h2 className="font-display mt-5 text-3xl sm:text-5xl lg:text-6xl leading-[0.98]">
            Come build
            <br />
            something <span className="text-primary">real.</span>
          </h2>
          <p className="mt-6 max-w-lg mx-auto text-neutral-400 leading-relaxed">
            The Discord is where sessions happen, questions get answered, and
            demos get cheered. Start there — ship from anywhere.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-4">
            <a
              href={DISCORD_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hover-lift shadow-hard-primary px-7 py-3.5 border-2 border-paper bg-primary text-white text-sm font-bold uppercase tracking-wide focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-paper"
            >
              Join the Discord
            </a>
            <Link
              href="/signup"
              className="hover-lift shadow-hard-primary px-7 py-3.5 border-2 border-paper text-paper text-sm font-bold uppercase tracking-wide focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-paper"
            >
              Create an account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
