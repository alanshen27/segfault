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
    name: "web & app development",
    description:
      "Take an idea from prompt to production. Real deployments, real users, real bugs — and the AI workflow that gets you through all three.",
    terminal: "$ npx create-something-real",
  },
  {
    number: "02",
    name: "educational tools",
    description:
      "Build the study tools, tutors, and classroom software you wish existed. Software that teaches is the fastest way to learn twice.",
    terminal: "$ ship --for classmates",
  },
  {
    number: "03",
    name: "creative coding & music tech",
    description:
      "Synths, visuals, generative art, instruments in the browser. The corner of programming where the demo is the point.",
    terminal: "$ play --loud",
  },
] as const;

const SHIPPING_STEPS = [
  {
    label: "pick something real",
    body: "Not a todo app. A tool a friend would use, a site for your club, an instrument that makes noise. Stakes make you learn.",
  },
  {
    label: "build with AI, out loud",
    body: "Vibe coding isn't autocomplete — it's directing. You learn to spec, prompt, read the diff, and know when the model is lying to you.",
  },
  {
    label: "log it, ship it, demo it",
    body: "Post build logs as you go. Ship early. Demo in Discord and take the feedback. Then do it again, better.",
  },
] as const;

const COMMUNITY_ITEMS = [
  {
    title: "discord is home base",
    body: "Build channels, help threads, and an always-on AI mentor that answers questions and reviews your approach at 2am.",
  },
  {
    title: "weekly build sessions",
    body: "Co-working calls where everyone works on their own thing, together. Show up stuck, leave unstuck.",
  },
  {
    title: "projects & teammates",
    body: "Post what you're building on the site, flag what help you need, and find collaborators for hackathons and side quests.",
  },
  {
    title: "practice ground",
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
    <p className="font-mono text-xs lowercase tracking-[0.18em] text-neutral-400 dark:text-neutral-500">
      <span aria-hidden>✳ </span>
      {children}
    </p>
  );
}

export default async function HomePage() {
  const { featuredProjects, recentLogs } = await getCommunityActivity();

  return (
    <div className="bg-paper text-ink">
      {/* Hero */}
      <section className="border-b border-neutral-200 dark:border-neutral-800">
        <div className="max-w-6xl mx-auto px-4 pt-20 pb-16 sm:pt-24 sm:pb-20">
          <div className="grid lg:grid-cols-[1.15fr_1fr] gap-12 lg:gap-16 items-center">
            <div>
              <p className="rise-in font-mono text-xs sm:text-sm text-neutral-500">
                segfault <span className="text-primary">✳</span> a community,
                not a course
              </p>
              <h1 className="rise-in rise-in-1 font-display mt-6 text-4xl sm:text-5xl lg:text-6xl leading-[1.05]">
                learn to build real things
                <br />
                with AI.
              </h1>
              <p className="rise-in rise-in-2 mt-6 max-w-xl text-lg leading-relaxed text-neutral-600 dark:text-neutral-400">
                Segfault is where ambitious young builders learn vibe coding —
                shipping actual software with AI as a collaborator, alongside
                people doing the same.
              </p>
              <div className="rise-in rise-in-3 mt-9 flex flex-wrap items-center gap-3">
                <a
                  href={DISCORD_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 rounded-full bg-ink text-paper text-sm font-medium hover:bg-primary transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  join the discord
                </a>
                <Link
                  href="/projects"
                  className="px-6 py-3 rounded-full border border-neutral-300 dark:border-neutral-700 text-sm font-medium hover:border-neutral-500 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  see what people ship
                </Link>
              </div>
            </div>

            <div className="rise-in rise-in-2 relative hidden lg:block" aria-hidden>
              <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_32px_-16px_rgba(0,0,0,0.12)] overflow-hidden">
                <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-neutral-200 dark:border-neutral-800">
                  <span className="w-2 h-2 rounded-full bg-neutral-300 dark:bg-neutral-700" />
                  <span className="w-2 h-2 rounded-full bg-neutral-300 dark:bg-neutral-700" />
                  <span className="w-2 h-2 rounded-full bg-neutral-300 dark:bg-neutral-700" />
                  <span className="ml-2 font-mono text-[11px] text-neutral-400">
                    ~/segfault
                  </span>
                </div>
                <div className="p-5 font-mono text-[13px] leading-6 text-neutral-500 dark:text-neutral-400">
                  <p>
                    <span className="text-neutral-400">$</span> segfault init
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
                    <span className="text-neutral-400">$</span> ship
                    <span className="cursor-blink text-primary">▌</span>
                  </p>
                </div>
              </div>
              <div className="absolute -bottom-6 -left-8 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_32px_-16px_rgba(0,0,0,0.12)] px-4 py-3">
                <p className="font-mono text-[11px] text-neutral-400">
                  build log · just now
                </p>
                <p className="mt-1 text-sm text-neutral-700 dark:text-neutral-300">
                  shipped v0.2 — demo friday 👋
                </p>
              </div>
              <div className="absolute -top-4 -right-4 rounded-full border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-3.5 py-1.5 font-mono text-[11px] text-neutral-500 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary mr-1.5 align-middle" />
                mentor online
              </div>
            </div>
          </div>
        </div>

        {/* Ticker */}
        <div className="border-t border-neutral-200 dark:border-neutral-800 py-3 overflow-hidden">
          <div className="ticker-track flex w-max whitespace-nowrap" aria-hidden>
            {[0, 1].map((half) => (
              <div key={half} className="flex">
                {TICKER_ITEMS.map((item) => (
                  <span
                    key={`${half}-${item}`}
                    className="font-mono text-xs lowercase tracking-[0.18em] text-neutral-400 dark:text-neutral-600 px-6"
                  >
                    {item} <span className="text-neutral-300 dark:text-neutral-700 px-2">✳</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tracks */}
      <section className="max-w-5xl mx-auto px-4 py-16 sm:py-24">
        <div className="max-w-2xl">
          <SectionLabel>the tracks</SectionLabel>
          <h2 className="font-display mt-3 text-3xl sm:text-4xl leading-[1.08]">
            vibe coding is the craft.{" "}
            <span className="text-neutral-400 dark:text-neutral-500">
              these are the places to practice it.
            </span>
          </h2>
        </div>
        <div className="mt-10 grid md:grid-cols-3 gap-4">
          {TRACKS.map((track) => (
            <article
              key={track.number}
              className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 flex flex-col hover:border-primary/40 transition-colors"
            >
              <span className="font-mono text-xs text-neutral-400">
                {track.number}
              </span>
              <h3 className="font-display text-xl mt-3 leading-snug">
                {track.name}
              </h3>
              <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed flex-1">
                {track.description}
              </p>
              <p className="mt-5 font-mono text-xs text-neutral-400 dark:text-neutral-500">
                {track.terminal}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* Learn by shipping */}
      <section className="border-y border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
        <div className="max-w-5xl mx-auto px-4 py-16 sm:py-24">
          <div className="grid lg:grid-cols-[1fr_1.3fr] gap-10 lg:gap-16">
            <div>
              <SectionLabel>the method</SectionLabel>
              <h2 className="font-display mt-3 text-3xl sm:text-4xl leading-[1.08]">
                learn by shipping.
              </h2>
              <p className="mt-5 text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-md">
                Tutorials teach you to follow. Shipping teaches you to build.
                Everything here is organized around getting real software in
                front of real people, on repeat.
              </p>
            </div>
            <ol className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {SHIPPING_STEPS.map((step, i) => (
                <li key={step.label} className="py-6 first:pt-0 last:pb-0 flex gap-5">
                  <span className="font-mono text-xs text-neutral-400 pt-1.5 shrink-0">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="font-display text-lg leading-snug">
                      {step.label}
                    </h3>
                    <p className="mt-1.5 text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
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
      <section className="max-w-5xl mx-auto px-4 py-16 sm:py-24">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <SectionLabel>from the workshop</SectionLabel>
            <h2 className="font-display mt-3 text-3xl sm:text-4xl leading-[1.08]">
              what&apos;s being built right now
            </h2>
          </div>
          <Link
            href="/projects"
            className="font-mono text-sm text-primary hover:underline underline-offset-4"
          >
            all projects →
          </Link>
        </div>

        {featuredProjects.length > 0 ? (
          <div className="mt-8 grid sm:grid-cols-3 gap-4">
            {featuredProjects.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="group rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-5 flex flex-col min-h-[168px] hover:border-primary/40 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-medium leading-snug group-hover:text-primary transition-colors line-clamp-2">
                    {project.title}
                  </h3>
                  <span
                    className={`shrink-0 text-[10px] font-mono px-1.5 py-0.5 rounded-full ${statusClass(project.status)}`}
                  >
                    {project.status}
                  </span>
                </div>
                <p className="text-sm text-neutral-500 mt-2 line-clamp-2 flex-1">
                  {project.tagline}
                </p>
                {project.lookingFor.length > 0 && (
                  <p className="text-xs text-primary font-medium mt-3 line-clamp-1">
                    looking for {project.lookingFor.join(", ")}
                  </p>
                )}
                <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center gap-2 text-xs text-neutral-500">
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
          <div className="mt-8 rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-700 p-8 text-center">
            <p className="font-mono text-sm text-neutral-500">
              {"// the next featured build could be yours"}
            </p>
            <Link
              href="/projects/new"
              className="inline-block mt-4 px-5 py-2.5 rounded-full border border-neutral-300 dark:border-neutral-700 text-sm font-medium hover:border-primary hover:text-primary transition-colors"
            >
              share a project
            </Link>
          </div>
        )}

        {recentLogs.length > 0 && (
          <div className="mt-10">
            <div className="flex items-end justify-between gap-4">
              <h3 className="font-mono text-xs lowercase tracking-[0.18em] text-neutral-500">
                build log feed
              </h3>
              <Link
                href="/logs"
                className="font-mono text-sm text-primary hover:underline underline-offset-4"
              >
                all logs →
              </Link>
            </div>
            <div className="mt-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 overflow-hidden divide-y divide-neutral-100 dark:divide-neutral-800/60">
              {recentLogs.map((log) => (
                <div key={log.id} className="flex gap-3 px-4 sm:px-5 py-4">
                  <Avatar
                    src={log.author.avatarUrl}
                    name={log.author.name}
                    size="sm"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm">
                      <span className="font-medium">{log.author.name}</span>
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
                          className="text-xs text-primary font-medium hover:underline truncate"
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
      <section className="border-y border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
        <div className="max-w-5xl mx-auto px-4 py-16 sm:py-24">
          <div className="max-w-2xl">
            <SectionLabel>how it works</SectionLabel>
            <h2 className="font-display mt-3 text-3xl sm:text-4xl leading-[1.08]">
              a community that runs on momentum
            </h2>
          </div>
          <div className="mt-10 grid sm:grid-cols-2 gap-x-10 gap-y-8">
            {COMMUNITY_ITEMS.map((item) => (
              <div key={item.title}>
                <h3 className="font-display text-lg leading-snug">
                  <span className="text-neutral-300 dark:text-neutral-600" aria-hidden>
                    ✳{" "}
                  </span>
                  {item.title}
                </h3>
                <p className="mt-1.5 text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section>
        <div className="max-w-5xl mx-auto px-4 py-20 sm:py-28 text-center">
          <p className="font-mono text-xs lowercase tracking-[0.18em] text-neutral-400">
            {"// no prerequisites, just intent"}
          </p>
          <h2 className="font-display mt-4 text-3xl sm:text-4xl lg:text-5xl leading-[1.05]">
            come build something real.
          </h2>
          <p className="mt-5 max-w-lg mx-auto text-neutral-600 dark:text-neutral-400 leading-relaxed">
            The Discord is where sessions happen, questions get answered, and
            demos get cheered. Start there — ship from anywhere.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a
              href={DISCORD_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-7 py-3.5 rounded-full bg-ink text-paper text-sm font-medium hover:bg-primary transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              join the discord
            </a>
            <Link
              href="/signup"
              className="px-7 py-3.5 rounded-full border border-neutral-300 dark:border-neutral-700 text-sm font-medium hover:border-primary hover:text-primary transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              create an account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
