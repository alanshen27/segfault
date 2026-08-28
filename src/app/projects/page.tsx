"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProjectCard from "@/components/projects/ProjectCard";
import ProjectFilters from "@/components/projects/ProjectFilters";
import EmptyState from "@/components/EmptyState";
import { CafeHeader, CafeShell, ListSkeleton } from "@/components/layout";
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
    <CafeShell active="now-building">
      <CafeHeader
        kicker="🔨 # now-building"
        title="projects"
        description="what the café is building right now. share yours, find collaborators, ship together."
        actions={
          <Link
            href="/projects/new"
            className="px-5 py-2.5 rounded-full bg-ink text-paper text-sm font-medium hover:bg-primary transition-colors shrink-0"
          >
            share a project
          </Link>
        }
      />

      <ProjectFilters
        tag={tag}
        status={status}
        lookingFor={lookingFor}
        onTagChange={setTag}
        onStatusChange={setStatus}
        onLookingForChange={setLookingFor}
      />

      {loading ? (
        <div>
          <ListSkeleton
            count={4}
            layout="grid"
            className="h-48 rounded-xl bg-primary-50 dark:bg-neutral-900 animate-pulse"
          />
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          icon="🔨"
          title="nothing on the workbench yet"
          description="be the first to share what you're building."
          actionLabel="share a project"
          actionHref="/projects/new"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </CafeShell>
  );
}
