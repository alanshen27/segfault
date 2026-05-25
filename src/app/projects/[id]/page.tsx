import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Avatar from "@/components/Avatar";
import {
  PROJECT_STATUS_COLORS,
  type ProjectStatus,
} from "@/lib/types";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { id } = await params;

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      author: { select: { id: true, name: true, avatarUrl: true } },
      buildLogs: {
        orderBy: { createdAt: "desc" },
        take: 10,
        include: {
          author: { select: { id: true, name: true, avatarUrl: true } },
        },
      },
    },
  });

  if (!project) notFound();

  const statusColor =
    PROJECT_STATUS_COLORS[project.status as ProjectStatus] ??
    "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-400";

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link
        href="/projects"
        className="text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
      >
        &larr; All projects
      </Link>

      <div className="mt-4 flex items-start gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-bold tracking-tight">
            {project.title}
          </h1>
          <p className="text-neutral-500 mt-1">{project.tagline}</p>
        </div>
        <span
          className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded ${statusColor}`}
        >
          {project.status}
        </span>
      </div>

      <div className="flex items-center gap-3 mt-4">
        <Avatar
          src={project.author.avatarUrl}
          name={project.author.name}
          size="sm"
        />
        <span className="text-sm text-neutral-500">{project.author.name}</span>
        <span className="text-neutral-300 dark:text-neutral-700">&middot;</span>
        <span className="text-sm text-neutral-400">
          {new Date(project.createdAt).toLocaleDateString()}
        </span>
      </div>

      {project.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-4">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs px-2 py-0.5 rounded bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400 font-medium"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {project.lookingFor.length > 0 && (
        <div className="mt-4 p-3 rounded-lg bg-primary-50 dark:bg-primary-900/20">
          <span className="text-sm font-medium text-primary">
            Looking for:{" "}
          </span>
          <span className="text-sm text-primary">
            {project.lookingFor.join(", ")}
          </span>
        </div>
      )}

      <div className="flex gap-3 mt-4">
        {project.githubUrl && (
          <a
            href={project.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            GitHub
          </a>
        )}
        {project.demoUrl && (
          <a
            href={project.demoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            Demo
          </a>
        )}
      </div>

      {project.description && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-2">About</h2>
          <p className="text-neutral-600 dark:text-neutral-400 text-sm leading-relaxed whitespace-pre-wrap">
            {project.description}
          </p>
        </div>
      )}

      {project.buildLogs.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-3">Build Log</h2>
          <div className="space-y-3">
            {project.buildLogs.map((log) => (
              <div
                key={log.id}
                className="flex gap-3 p-3 rounded-lg border border-neutral-100 dark:border-neutral-800/50"
              >
                <Avatar
                  src={log.author.avatarUrl}
                  name={log.author.name}
                  size="sm"
                />
                <div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">{log.author.name}</span>
                    <span className="text-neutral-400 text-xs">
                      {new Date(log.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-0.5">
                    {log.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
