import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Avatar from "@/components/Avatar";
import LandingSection from "@/components/landing/LandingSection";
import { PageContainer } from "@/components/layout";
import { timeAgo } from "@/lib/forum-utils";
import {
  PROJECT_STATUS_COLORS,
  type ProjectStatus,
  SITE_STATS,
} from "@/lib/types";

export const dynamic = "force-dynamic";

const EXPLORE = [
  {
    href: "/projects",
    label: "Projects",
    description: "Share what you're building and find collaborators.",
  },
  {
    href: "/builders",
    label: "Builders",
    description: "Browse student profiles open to hackathons and teams.",
  },
  {
    href: "/forum",
    label: "Forum",
    description: "Discuss problems, editorials, and community topics.",
  },
  {
    href: "/logs",
    label: "Build logs",
    description: "Quick ship updates — commit messages for humans.",
  },
] as const;

function statusClass(status: string) {
  return (
    PROJECT_STATUS_COLORS[status as ProjectStatus] ??
    "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-400"
  );
}

export default async function HomePage() {
  const [featuredProjects, teammateProjects, recentLogs, builderCount, projectCount] =
    await Promise.all([
      prisma.project.findMany({
        orderBy: { createdAt: "desc" },
        take: 3,
        include: {
          author: { select: { id: true, name: true, avatarUrl: true } },
        },
      }),
      prisma.project.findMany({
        where: { lookingFor: { isEmpty: false } },
        orderBy: { createdAt: "desc" },
        take: 3,
        include: {
          author: { select: { id: true, name: true, avatarUrl: true } },
        },
      }),
      prisma.buildLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          author: { select: { id: true, name: true, avatarUrl: true } },
          project: { select: { id: true, title: true } },
        },
      }),
      prisma.builderProfile.count(),
      prisma.project.count(),
    ]);

  const builderStat =
    builderCount > 0 ? String(builderCount) : SITE_STATS.builders;
  const projectStat =
    projectCount > 0 ? String(projectCount) : "—";

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-neutral-200/80 dark:border-neutral-800">
        <div
          className="absolute inset-0 bg-gradient-to-b from-primary-50/90 via-white to-white dark:from-primary-950/40 dark:via-neutral-950 dark:to-neutral-950"
          aria-hidden
        />
        <div
          className="absolute inset-0 opacity-[0.35] dark:opacity-20 bg-[radial-gradient(circle_at_1px_1px,rgba(211,89,89,0.18)_1px,transparent_0)] bg-size-[24px_24px]"
          aria-hidden
        />
        <div
          className="absolute -top-24 right-0 w-[min(480px,80vw)] h-[min(480px,80vw)] rounded-full bg-primary/10 blur-3xl dark:bg-primary/20"
          aria-hidden
        />

        <PageContainer width="wide" className="relative py-16 sm:py-24 lg:py-28">
          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 dark:bg-neutral-900/80 border border-primary/20 text-primary text-sm font-semibold shadow-sm backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Student builder network
            </p>
            <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.08]">
              Ship weird software,
              <span className="text-primary"> together.</span>
            </h1>
            <p className="mt-5 text-lg sm:text-xl text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-2xl">
              Projects, hackathon teams, build logs, and a forum for students who
              would rather ship than watch another tutorial.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="https://discord.gg/segfault"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 rounded-full bg-primary text-white text-sm font-semibold hover:bg-primary-hover transition-colors shadow-sm shadow-primary/20"
              >
                Join Discord
              </a>
              <Link
                href="/projects/new"
                className="px-6 py-3 rounded-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-sm font-semibold hover:border-primary/40 transition-colors"
              >
                Share a project
              </Link>
              <Link
                href="/projects"
                className="px-6 py-3 rounded-full text-sm font-semibold text-neutral-600 dark:text-neutral-400 hover:text-primary transition-colors"
              >
                Explore projects →
              </Link>
            </div>
          </div>

          <dl className="mt-12 sm:mt-14 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-3xl">
            <div className="rounded-xl bg-white/70 dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-800 px-4 py-3 backdrop-blur-sm">
              <dt className="text-2xl sm:text-3xl font-bold text-primary tabular-nums">
                {builderStat}
              </dt>
              <dd className="text-xs sm:text-sm text-neutral-500 mt-0.5">builders</dd>
            </div>
            <div className="rounded-xl bg-white/70 dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-800 px-4 py-3 backdrop-blur-sm">
              <dt className="text-2xl sm:text-3xl font-bold text-primary">Weekly</dt>
              <dd className="text-xs sm:text-sm text-neutral-500 mt-0.5 leading-snug">
                {SITE_STATS.sessions}
              </dd>
            </div>
            <div className="rounded-xl bg-white/70 dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-800 px-4 py-3 backdrop-blur-sm">
              <dt className="text-2xl sm:text-3xl font-bold text-primary">Teams</dt>
              <dd className="text-xs sm:text-sm text-neutral-500 mt-0.5 leading-snug">
                {SITE_STATS.teams}
              </dd>
            </div>
            <div className="rounded-xl bg-white/70 dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-800 px-4 py-3 backdrop-blur-sm">
              <dt className="text-2xl sm:text-3xl font-bold text-primary tabular-nums">
                {projectStat}
              </dt>
              <dd className="text-xs sm:text-sm text-neutral-500 mt-0.5">
                {SITE_STATS.shipped}
              </dd>
            </div>
          </dl>
        </PageContainer>
      </section>

      <PageContainer width="wide" className="py-14 sm:py-16">
        {/* Explore */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {EXPLORE.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 hover:border-primary/40 hover:shadow-sm transition-all"
            >
              <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 group-hover:text-primary transition-colors">
                {item.label}
              </h3>
              <p className="text-sm text-neutral-500 mt-1.5 leading-relaxed">
                {item.description}
              </p>
              <span className="inline-block mt-3 text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                Open →
              </span>
            </Link>
          ))}
        </div>

        {featuredProjects.length > 0 && (
          <LandingSection
            title="Latest projects"
            href="/projects"
            linkLabel="View all"
            className="mt-14 sm:mt-16"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {featuredProjects.map((project) => (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className="group p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 hover:border-primary/40 hover:shadow-md transition-all flex flex-col min-h-[168px]"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold leading-snug group-hover:text-primary transition-colors line-clamp-2">
                      {project.title}
                    </h3>
                    <span
                      className={`shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded ${statusClass(project.status)}`}
                    >
                      {project.status}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-500 mt-2 line-clamp-2 flex-1">
                    {project.tagline}
                  </p>
                  {project.lookingFor.length > 0 && (
                    <p className="text-xs text-primary font-medium mt-3 line-clamp-1">
                      Looking for {project.lookingFor.join(", ")}
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
          </LandingSection>
        )}

        {teammateProjects.length > 0 && (
          <LandingSection
            title="Looking for teammates"
            href="/builders"
            linkLabel="Find builders"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {teammateProjects.map((project) => (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className="group flex items-start gap-4 p-4 rounded-xl border border-primary/20 bg-primary-50/50 dark:bg-primary-950/20 hover:border-primary/40 transition-colors"
                >
                  <div className="shrink-0 w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center text-primary font-bold text-sm">
                    {project.title.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-sm text-neutral-500 mt-0.5 line-clamp-1">
                      {project.tagline}
                    </p>
                    <p className="text-xs text-primary font-medium mt-1.5">
                      Needs {project.lookingFor.join(", ")}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </LandingSection>
        )}

        {recentLogs.length > 0 && (
          <LandingSection title="Build log feed" href="/logs" linkLabel="View all">
            <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 overflow-hidden divide-y divide-neutral-100 dark:divide-neutral-800/60">
              {recentLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex gap-3 px-4 sm:px-5 py-4 hover:bg-neutral-50/80 dark:hover:bg-neutral-900/40 transition-colors"
                >
                  <Avatar
                    src={log.author.avatarUrl}
                    name={log.author.name}
                    size="sm"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm">
                      <span className="font-medium">{log.author.name}</span>
                      <span className="text-neutral-400 text-xs">
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
          </LandingSection>
        )}

        {/* CTA */}
        <section className="mt-16 sm:mt-20 relative overflow-hidden rounded-2xl border border-neutral-200 dark:border-neutral-800">
          <div
            className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary-50/30 dark:from-primary/20 dark:to-neutral-900"
            aria-hidden
          />
          <div className="relative px-6 py-12 sm:px-12 sm:py-14 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Stop building alone.
            </h2>
            <p className="text-neutral-500 mt-3 max-w-lg mx-auto leading-relaxed">
              Join Discord for live build sessions, post a project when you need
              teammates, and log what you shipped this week.
            </p>
            <div className="flex flex-wrap justify-center gap-3 mt-8">
              <a
                href="https://discord.gg/segfault"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 rounded-full bg-primary text-white text-sm font-semibold hover:bg-primary-hover transition-colors shadow-sm"
              >
                Join Discord
              </a>
              <Link
                href="/signup"
                className="px-6 py-3 rounded-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-sm font-semibold hover:border-primary/40 transition-colors"
              >
                Create account
              </Link>
            </div>
          </div>
        </section>
      </PageContainer>
    </>
  );
}
