import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Avatar from "@/components/Avatar";
import { timeAgo } from "@/lib/forum-utils";
import {
  PROJECT_STATUS_COLORS,
  type ProjectStatus,
} from "@/lib/types";

import { CHANNELS, DISCORD_URL } from "@/lib/site";
import DiscordInviteLink from "@/components/DiscordInviteLink";

export const dynamic = "force-dynamic";

const TRACKS = [
  {
    emoji: "🌐",
    name: "web & app development",
    description:
      "Take an idea from prompt to production. Real deployments, real users, real bugs — and the AI workflow that gets you through all three.",
  },
  {
    emoji: "📚",
    name: "educational tools",
    description:
      "Build the study tools, tutors, and classroom software you wish existed. Software that teaches is the fastest way to learn twice.",
  },
  {
    emoji: "🎛️",
    name: "creative coding & music tech",
    description:
      "Synths, visuals, generative art, instruments in the browser. The corner of programming where the demo is the point.",
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
    title: "discord is the counter",
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

function FeedCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-2xl border border-primary-200/70 dark:border-neutral-800 bg-card ${className}`}
    >
      {children}
    </section>
  );
}

function CardLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-xs lowercase tracking-[0.18em] text-primary/70">
      {children}
    </p>
  );
}

function ChannelLink({
  channel,
}: {
  channel: (typeof CHANNELS)[number];
}) {
  const className =
    "flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-neutral-600 dark:text-neutral-400 hover:bg-primary-light hover:text-ink dark:hover:text-ink transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";
  const inner = (
    <>
      <span aria-hidden>{channel.emoji}</span>
      <span className="font-mono text-[13px]"># {channel.label}</span>
    </>
  );
  if ("external" in channel && channel.external) {
    return (
      <DiscordInviteLink href={channel.href} className={className}>
        {inner}
      </DiscordInviteLink>
    );
  }
  return (
    <Link href={channel.href} className={className}>
      {inner}
    </Link>
  );
}

export default async function HomePage() {
  const { featuredProjects, recentLogs } = await getCommunityActivity();

  return (
    <div className="bg-paper text-ink">
      <div className="max-w-6xl mx-auto px-4 py-8 sm:py-10 grid grid-cols-[minmax(0,1fr)] lg:grid-cols-[240px_minmax(0,1fr)] gap-8 items-start">
        {/* Sidebar */}
        <aside className="hidden lg:block sticky top-24 space-y-4">
          <div className="rounded-2xl border border-primary-200/70 dark:border-neutral-800 bg-card p-4">
            <p className="font-display text-lg leading-tight">
              buildwith.coffee <span aria-hidden>☕</span>
            </p>
            <p className="mt-1.5 text-[13px] leading-relaxed text-neutral-500">
              a café for young builders learning to ship real things with AI.
            </p>
          </div>
          <nav
            aria-label="community channels"
            className="rounded-2xl border border-primary-200/70 dark:border-neutral-800 bg-card p-2"
          >
            <p className="px-3 pt-2 pb-1 font-mono text-[11px] lowercase tracking-[0.18em] text-neutral-400">
              channels
            </p>
            {CHANNELS.map((channel) => (
              <ChannelLink key={channel.label} channel={channel} />
            ))}
          </nav>
          <DiscordInviteLink
            href={DISCORD_URL}
            className="block text-center rounded-xl bg-ink text-paper text-sm font-medium px-4 py-2.5 hover:bg-primary transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            join the discord
          </DiscordInviteLink>
        </aside>

        {/* Feed */}
        <div className="min-w-0 space-y-5">
          {/* Mobile channels */}
          <div className="lg:hidden -mx-4 px-4 flex gap-2 overflow-x-auto pb-1">
            {CHANNELS.map((channel) =>
              "external" in channel && channel.external ? (
                <DiscordInviteLink
                  key={channel.label}
                  href={channel.href}
                  className="shrink-0 rounded-full border border-primary-200/70 dark:border-neutral-800 bg-card px-3.5 py-1.5 font-mono text-xs text-neutral-600 dark:text-neutral-400"
                >
                  {channel.emoji} # {channel.label}
                </DiscordInviteLink>
              ) : (
                <Link
                  key={channel.label}
                  href={channel.href}
                  className="shrink-0 rounded-full border border-primary-200/70 dark:border-neutral-800 bg-card px-3.5 py-1.5 font-mono text-xs text-neutral-600 dark:text-neutral-400"
                >
                  {channel.emoji} # {channel.label}
                </Link>
              ),
            )}
          </div>

          {/* Hero card */}
          <FeedCard className="overflow-hidden">
            <div className="p-6 sm:p-10">
              <p className="rise-in inline-flex items-center gap-2 rounded-full bg-primary-light dark:bg-primary-light px-3 py-1 font-mono text-[11px] lowercase tracking-[0.14em] text-primary">
                <span
                  className="inline-block w-1.5 h-1.5 rounded-full bg-primary"
                  aria-hidden
                />
                open — pull up a chair
              </p>
              <h1 className="rise-in rise-in-1 font-display mt-5 text-4xl sm:text-5xl leading-[1.05]">
                learn to build real things with AI.
              </h1>
              <p className="rise-in rise-in-2 mt-5 max-w-xl text-lg leading-relaxed text-neutral-600 dark:text-neutral-400">
                buildwith.coffee is where ambitious young builders learn vibe coding —
                shipping actual software with AI as a collaborator, alongside
                people doing the same.
              </p>
              <div className="rise-in rise-in-3 mt-8 flex flex-wrap items-center gap-3">
                <DiscordInviteLink
                  href={DISCORD_URL}
                  className="px-6 py-3 rounded-full bg-ink text-paper text-sm font-medium hover:bg-primary transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  join the discord
                </DiscordInviteLink>
                <Link
                  href="/projects"
                  className="px-6 py-3 rounded-full border border-primary-200 dark:border-neutral-700 text-sm font-medium hover:border-primary hover:text-primary transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  see what people ship
                </Link>
              </div>
            </div>
            <div
              className="border-t border-primary-200/70 dark:border-neutral-800 bg-primary-50 dark:bg-neutral-900/40 px-6 sm:px-10 py-3.5 font-mono text-[13px] text-neutral-500"
              aria-hidden
            >
              <span className="text-primary">$</span> brew --idea &quot;something
              your friends would actually use&quot;
              <span className="cursor-blink text-primary">▌</span>
            </div>
          </FeedCard>

          {/* Tracks */}
          <FeedCard className="p-6 sm:p-8">
            <CardLabel># on-the-menu</CardLabel>
            <h2 className="font-display mt-2 text-2xl sm:text-3xl leading-[1.1]">
              vibe coding is the craft.{" "}
              <span className="text-neutral-400 dark:text-neutral-500">
                three ways to practice it.
              </span>
            </h2>
            <div className="mt-6 divide-y divide-primary-100 dark:divide-neutral-800">
              {TRACKS.map((track) => (
                <article key={track.name} className="py-5 first:pt-0 last:pb-0 flex gap-4">
                  <span className="text-xl pt-0.5" aria-hidden>
                    {track.emoji}
                  </span>
                  <div>
                    <h3 className="font-display text-lg leading-snug">
                      {track.name}
                    </h3>
                    <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                      {track.description}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </FeedCard>

          {/* Method */}
          <FeedCard className="p-6 sm:p-8">
            <CardLabel># house-rules</CardLabel>
            <h2 className="font-display mt-2 text-2xl sm:text-3xl leading-[1.1]">
              learn by shipping.
            </h2>
            <p className="mt-3 text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-xl">
              Tutorials teach you to follow. Shipping teaches you to build.
              Everything here is organized around getting real software in
              front of real people, on repeat.
            </p>
            <ol className="mt-6 divide-y divide-primary-100 dark:divide-neutral-800">
              {SHIPPING_STEPS.map((step, i) => (
                <li key={step.label} className="py-5 first:pt-0 last:pb-0 flex gap-5">
                  <span className="font-mono text-xs text-primary/70 pt-1.5 shrink-0">
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
          </FeedCard>

          {/* Community activity */}
          <FeedCard className="p-6 sm:p-8">
            <div className="flex items-end justify-between gap-4 flex-wrap">
              <div>
                <CardLabel># now-building</CardLabel>
                <h2 className="font-display mt-2 text-2xl sm:text-3xl leading-[1.1]">
                  what&apos;s on the tables right now
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
              <div className="mt-6 grid sm:grid-cols-3 gap-4">
                {featuredProjects.map((project) => (
                  <Link
                    key={project.id}
                    href={`/projects/${project.id}`}
                    className="group rounded-xl border border-primary-100 dark:border-neutral-800 p-5 flex flex-col min-h-[168px] hover:border-primary/40 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
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
                    <div className="mt-4 pt-3 border-t border-primary-100 dark:border-neutral-800/80 flex items-center gap-2 text-xs text-neutral-500">
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
              <div className="mt-6 rounded-xl border border-dashed border-primary-200 dark:border-neutral-700 p-8 text-center">
                <p className="font-mono text-sm text-neutral-500">
                  {"// the next featured build could be yours"}
                </p>
                <Link
                  href="/projects/new"
                  className="inline-block mt-4 px-5 py-2.5 rounded-full border border-primary-200 dark:border-neutral-700 text-sm font-medium hover:border-primary hover:text-primary transition-colors"
                >
                  share a project
                </Link>
              </div>
            )}

            {recentLogs.length > 0 && (
              <div className="mt-8">
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
                <div className="mt-4 rounded-xl border border-primary-100 dark:border-neutral-800 overflow-hidden divide-y divide-primary-100 dark:divide-neutral-800/60">
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
          </FeedCard>

          {/* How the community works */}
          <FeedCard className="p-6 sm:p-8">
            <CardLabel># how-it-works</CardLabel>
            <h2 className="font-display mt-2 text-2xl sm:text-3xl leading-[1.1]">
              a community that runs on momentum
            </h2>
            <div className="mt-6 grid sm:grid-cols-2 gap-x-8 gap-y-6">
              {COMMUNITY_ITEMS.map((item) => (
                <div key={item.title}>
                  <h3 className="font-display text-lg leading-snug">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    {item.body}
                  </p>
                </div>
              ))}
            </div>
          </FeedCard>

          {/* Final CTA */}
          <FeedCard className="p-8 sm:p-12 text-center bg-primary-50 dark:bg-neutral-900/40">
            <p className="font-mono text-xs lowercase tracking-[0.18em] text-primary/70">
              {"// no prerequisites, just intent"}
            </p>
            <h2 className="font-display mt-3 text-3xl sm:text-4xl leading-[1.05]">
              come build something real.
            </h2>
            <p className="mt-4 max-w-lg mx-auto text-neutral-600 dark:text-neutral-400 leading-relaxed">
              The Discord is where sessions happen, questions get answered, and
              demos get cheered. Start there — ship from anywhere.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <DiscordInviteLink
                href={DISCORD_URL}
                className="px-7 py-3.5 rounded-full bg-ink text-paper text-sm font-medium hover:bg-primary transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                join the discord
              </DiscordInviteLink>
              <Link
                href="/signup"
                className="px-7 py-3.5 rounded-full border border-primary-200 dark:border-neutral-700 text-sm font-medium hover:border-primary hover:text-primary transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                create an account
              </Link>
            </div>
          </FeedCard>
        </div>
      </div>
    </div>
  );
}
