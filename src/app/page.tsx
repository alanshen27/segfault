import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Avatar from "@/components/Avatar";
import {
  PROJECT_STATUS_COLORS,
  type ProjectStatus,
  SITE_STATS,
} from "@/lib/types";

export const dynamic = "force-dynamic";

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

  return (
    <div className="max-w-5xl mx-auto px-4 py-20 sm:py-28">
      {/* Hero */}
      <div className="text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 dark:bg-primary-900/20 text-primary text-sm font-medium">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          a student builder network
        </div>
        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight">
          ship weird software,
          <br />
          <span className="text-primary">together</span>
        </h1>
        <p className="text-lg text-neutral-500 max-w-2xl mx-auto leading-relaxed">
          segfault.zip is a student builder network for projects, hackathons,
          research and live build sessions. Less tutorial hell. More shipping.
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-4">
          <a
            href="https://discord.gg/segfault"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-2.5 rounded-lg bg-primary text-white font-medium hover:bg-primary-hover transition-colors shadow-sm"
          >
            Join Discord
          </a>
          <Link
            href="/projects"
            className="px-6 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors font-medium"
          >
            Explore Projects
          </Link>
        </div>
      </div>

      {/* Featured Projects */}
      {featuredProjects.length > 0 && (
        <section className="mt-20">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold tracking-tight">Featured Projects</h2>
            <Link href="/projects" className="text-sm text-primary hover:underline">
              View all &rarr;
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {featuredProjects.map((project) => {
              const statusColor =
                PROJECT_STATUS_COLORS[project.status as ProjectStatus] ??
                "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-400";
              return (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-primary/40 transition-colors flex flex-col"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold truncate">{project.title}</h3>
                    <span className={`shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded ${statusColor}`}>
                      {project.status}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-500 mt-1 line-clamp-1">{project.tagline}</p>
                  {project.lookingFor.length > 0 && (
                    <p className="text-xs text-primary mt-2">
                      Looking for: {project.lookingFor.join(", ")}
                    </p>
                  )}
                  <div className="mt-auto pt-3 flex items-center gap-2 text-xs text-neutral-400">
                    <Avatar src={project.author.avatarUrl} name={project.author.name} size="sm" />
                    {project.author.name}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Looking for Teammates */}
      {teammateProjects.length > 0 && (
        <section className="mt-16">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold tracking-tight">Looking for Teammates</h2>
            <Link href="/builders" className="text-sm text-primary hover:underline">
              Find builders &rarr;
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {teammateProjects.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-primary/40 transition-colors"
              >
                <h3 className="font-semibold truncate">{project.title}</h3>
                <p className="text-sm text-neutral-500 mt-1 line-clamp-1">{project.tagline}</p>
                <p className="text-xs text-primary font-medium mt-2">
                  Looking for: {project.lookingFor.join(", ")}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Recent Build Logs */}
      {recentLogs.length > 0 && (
        <section className="mt-16">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold tracking-tight">Recent Build Logs</h2>
            <Link href="/logs" className="text-sm text-primary hover:underline">
              View all &rarr;
            </Link>
          </div>
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 divide-y divide-neutral-100 dark:divide-neutral-800/50">
            {recentLogs.map((log) => (
              <div key={log.id} className="flex gap-3 px-5 py-3">
                <Avatar src={log.author.avatarUrl} name={log.author.name} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">{log.author.name}</span>
                    {log.project && (
                      <>
                        <span className="text-neutral-400">&middot;</span>
                        <Link
                          href={`/projects/${log.project.id}`}
                          className="text-xs text-primary hover:underline truncate"
                        >
                          {log.project.title}
                        </Link>
                      </>
                    )}
                  </div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-0.5 line-clamp-1">
                    {log.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Community Stats */}
      <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 text-center hover:border-primary/40 transition-colors">
          <div className="text-3xl font-bold text-primary">{builderCount > 0 ? builderCount : SITE_STATS.builders}</div>
          <div className="text-sm text-neutral-500 mt-1">builders</div>
        </div>
        <div className="p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 text-center hover:border-primary/40 transition-colors">
          <div className="text-3xl font-bold text-primary">{SITE_STATS.sessions}</div>
          <div className="text-sm text-neutral-500 mt-1">&nbsp;</div>
        </div>
        <div className="p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 text-center hover:border-primary/40 transition-colors">
          <div className="text-3xl font-bold text-primary">{SITE_STATS.teams}</div>
          <div className="text-sm text-neutral-500 mt-1">&nbsp;</div>
        </div>
        <div className="p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 text-center hover:border-primary/40 transition-colors">
          <div className="text-3xl font-bold text-primary">{projectCount > 0 ? projectCount : SITE_STATS.shipped}</div>
          <div className="text-sm text-neutral-500 mt-1">projects shipped</div>
        </div>
      </div>

      {/* CTA */}
      <div className="mt-20 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-900/40 px-6 py-10 sm:px-10 text-center">
        <h2 className="text-2xl font-bold tracking-tight">Ready to build?</h2>
        <p className="text-neutral-500 mt-2 max-w-lg mx-auto">
          Join a community of student builders shipping real projects.
          Share what you&apos;re working on, find teammates, and stop building alone.
        </p>
        <div className="flex flex-wrap justify-center gap-3 mt-6">
          <a
            href="https://discord.gg/segfault"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-2.5 rounded-lg bg-primary text-white font-medium hover:bg-primary-hover transition-colors shadow-sm"
          >
            Join Discord
          </a>
          <Link
            href="/projects"
            className="px-6 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-white dark:hover:bg-neutral-900 transition-colors font-medium"
          >
            Share a project
          </Link>
        </div>
      </div>
    </div>
  );
}
