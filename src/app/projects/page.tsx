"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProjectCard from "@/components/projects/ProjectCard";
import ProjectFilters from "@/components/projects/ProjectFilters";
import EmptyState from "@/components/EmptyState";
import { type ProjectSummary } from "@/lib/types";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [tag, setTag] = useState("");
  const [status, setStatus] = useState("");
  const [lookingFor, setLookingFor] = useState("");

  useEffect(() => {
    let active = true;
    const params = new URLSearchParams();
    if (tag) params.set("tag", tag);
    if (status) params.set("status", status);
    if (lookingFor) params.set("lookingFor", lookingFor);

    fetch(`/api/projects?${params.toString()}`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data: ProjectSummary[]) => {
        if (active) {
          setProjects(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [tag, status, lookingFor]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Share what you&apos;re building. Find collaborators.
          </p>
        </div>
        <Link
          href="/projects/new"
          className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors shrink-0"
        >
          Share a project
        </Link>
      </div>

      <ProjectFilters
        tag={tag}
        status={status}
        lookingFor={lookingFor}
        onTagChange={setTag}
        onStatusChange={setStatus}
        onLookingForChange={setLookingFor}
      />

      {loading ? (
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-48 rounded-xl bg-neutral-100 dark:bg-neutral-900 animate-pulse"
            />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            icon="🚀"
            title="No projects yet"
            description="Be the first to share what you're building."
            actionLabel="Share a project"
            actionHref="/projects/new"
          />
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
