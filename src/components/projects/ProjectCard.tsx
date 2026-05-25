import Link from "next/link";
import Avatar from "@/components/Avatar";
import {
  type ProjectSummary,
  PROJECT_STATUS_COLORS,
  type ProjectStatus,
} from "@/lib/types";

interface ProjectCardProps {
  project: ProjectSummary;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const statusColor =
    PROJECT_STATUS_COLORS[project.status as ProjectStatus] ??
    "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-400";

  return (
    <div className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-primary/40 transition-colors flex flex-col">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-lg truncate">{project.title}</h3>
          <p className="text-sm text-neutral-500 mt-0.5 line-clamp-1">
            {project.tagline}
          </p>
        </div>
        <span
          className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded ${statusColor}`}
        >
          {project.status}
        </span>
      </div>

      {project.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400 font-medium"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {project.lookingFor.length > 0 && (
        <div className="mt-3">
          <span className="text-xs text-neutral-400">Looking for: </span>
          <span className="text-xs text-primary font-medium">
            {project.lookingFor.join(", ")}
          </span>
        </div>
      )}

      <div className="mt-auto pt-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <Avatar
            src={project.author.avatarUrl}
            name={project.author.name}
            size="sm"
          />
          <span className="text-xs text-neutral-500 truncate">
            {project.author.name}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {(project.voteScore ?? 0) !== 0 && (
            <span className="text-xs font-medium text-neutral-500 tabular-nums">
              {project.voteScore} upvote{(project.voteScore ?? 0) === 1 ? "" : "s"}
            </span>
          )}
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
            >
              GitHub
            </a>
          )}
          {project.demoUrl && (
            <a
              href={project.demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
            >
              Demo
            </a>
          )}
          <Link
            href={`/projects/${project.id}`}
            className="text-xs text-primary font-medium hover:underline"
          >
            View Project
          </Link>
        </div>
      </div>
    </div>
  );
}
