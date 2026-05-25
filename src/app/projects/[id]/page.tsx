"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import Avatar from "@/components/Avatar";
import ForumVoteRail from "@/components/forum/ForumVoteRail";
import ForumThread from "@/components/forum/ForumThread";
import ProjectBuildLogSection from "@/components/projects/ProjectBuildLogSection";
import { BackLink, PageContainer, PageNotFound } from "@/components/layout";
import { useCurrentUser } from "@/lib/use-current-user";
import {
  PROJECT_STATUS_COLORS,
  type ProjectDetail,
  type ProjectStatus,
} from "@/lib/types";

function ProjectAttachmentGallery({
  attachments,
}: {
  attachments: ProjectDetail["attachments"];
}) {
  if (attachments.length === 0) return null;

  return (
    <div className="mt-6">
      <h2 className="text-sm font-semibold text-neutral-500 mb-3">
        Photos ({attachments.length})
      </h2>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {attachments.map((attachment) => (
          <li key={attachment.id}>
            <a
              href={attachment.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800 hover:opacity-90 transition-opacity"
            >
              <img
                src={attachment.url}
                alt=""
                className="w-full max-h-96 object-contain bg-neutral-100 dark:bg-neutral-900"
                loading="lazy"
              />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const { user } = useCurrentUser();

  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [submittingReply, setSubmittingReply] = useState(false);

  useEffect(() => {
    let active = true;
    fetch(`/api/projects/${projectId}`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json() as Promise<ProjectDetail>;
      })
      .then((data) => {
        if (active) {
          setProject(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [projectId]);

  const handleVote = async (value: number) => {
    const res = await fetch(`/api/projects/${projectId}/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value }),
    });
    if (res.status === 401) {
      router.push("/login");
      return;
    }
    if (res.ok && project) {
      const data: { vote: number | null } = await res.json();
      const oldVote = project.userVote ?? 0;
      const newVote = data.vote ?? 0;
      setProject({
        ...project,
        voteScore: (project.voteScore ?? 0) - oldVote + newVote,
        userVote: data.vote,
      });
    }
  };

  const handleCommentVote = async (commentId: string, value: number) => {
    const res = await fetch(`/api/projects/comments/${commentId}/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value }),
    });
    if (res.status === 401) {
      router.push("/login");
      return;
    }
    if (res.ok && project) {
      const data: { vote: number | null } = await res.json();
      setProject({
        ...project,
        comments: project.comments.map((c) => {
          if (c.id !== commentId) return c;
          const oldVote = c.userVote ?? 0;
          const newVote = data.vote ?? 0;
          return {
            ...c,
            voteScore: c.voteScore - oldVote + newVote,
            userVote: data.vote,
          };
        }),
      });
    }
  };

  const handleReply = async (content: string, parentId: string | null) => {
    setSubmittingReply(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, parentId }),
      });
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      if (res.ok) {
        const newComment = await res.json();
        setProject((prev) =>
          prev
            ? {
                ...prev,
                comments: [...prev.comments, newComment],
                _count: prev._count
                  ? { ...prev._count, comments: prev._count.comments + 1 }
                  : prev._count,
              }
            : prev,
        );
      }
    } finally {
      setSubmittingReply(false);
    }
  };

  if (loading) {
    return (
      <PageContainer width="content" className="py-8 space-y-4">
        <div className="h-6 w-32 bg-neutral-100 dark:bg-neutral-900 rounded animate-pulse" />
        <div className="h-40 rounded-xl bg-neutral-100 dark:bg-neutral-900 animate-pulse" />
        <div className="h-64 rounded-xl bg-neutral-100 dark:bg-neutral-900 animate-pulse" />
      </PageContainer>
    );
  }

  if (!project) {
    return (
      <PageNotFound
        width="content"
        message="Project not found."
        backHref="/projects"
        backLabel="Back to projects"
      />
    );
  }

  const statusColor =
    PROJECT_STATUS_COLORS[project.status as ProjectStatus] ??
    "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-400";

  const isModerator = user?.role === "ADMIN" || user?.role === "MODERATOR";
  const canEdit =
    !!user && (project.author.id === user.id || isModerator);

  return (
    <PageContainer width="content" className="py-8">
      <BackLink href="/projects" className="mb-4">
        All projects
      </BackLink>

      <div className="mt-4 space-y-3">
        <ForumVoteRail
          size="md"
          plain
          orientation="horizontal"
          score={project.voteScore ?? 0}
          userVote={project.userVote}
          onVote={handleVote}
        />
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h1 className="text-3xl font-bold tracking-tight">{project.title}</h1>
            <p className="text-neutral-500 mt-1">{project.tagline}</p>
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0">
            <span className={`text-xs font-medium px-2.5 py-1 rounded ${statusColor}`}>
              {project.status}
            </span>
            {canEdit && (
              <Link
                href={`/projects/${projectId}/edit`}
                className="text-xs text-primary font-medium hover:underline"
              >
                Edit
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 mt-4">
        <Avatar src={project.author.avatarUrl} name={project.author.name} size="sm" />
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
          <span className="text-sm font-medium text-primary">Looking for: </span>
          <span className="text-sm text-primary">{project.lookingFor.join(", ")}</span>
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

      <ProjectAttachmentGallery attachments={project.attachments} />

      <ProjectBuildLogSection
        projectId={projectId}
        logs={project.buildLogs}
        currentUserId={user?.id}
        isModerator={isModerator}
        onLogsChange={(buildLogs) => setProject((prev) => (prev ? { ...prev, buildLogs } : prev))}
      />

      <div className="mt-10 rounded-xl border border-neutral-200 dark:border-neutral-800 p-5 sm:p-6">
        <ForumThread
          comments={project.comments}
          onSubmitReply={handleReply}
          onVoteComment={handleCommentVote}
          submitting={submittingReply}
          canReply={!!user}
        />
      </div>
    </PageContainer>
  );
}
