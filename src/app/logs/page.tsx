"use client";

import { useEffect, useState } from "react";
import BuildLogCard from "@/components/logs/BuildLogCard";
import EmptyState from "@/components/EmptyState";
import { type BuildLogEntry, type ProjectSummary } from "@/lib/types";

export default function LogsPage() {
  const [logs, setLogs] = useState<BuildLogEntry[]>([]);
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");
  const [projectId, setProjectId] = useState("");
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/logs")
      .then((res) => (res.ok ? res.json() : []))
      .then((data: BuildLogEntry[]) => {
        if (active) {
          setLogs(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) setLoading(false);
      });

    fetch("/api/projects")
      .then((r) => (r.ok ? r.json() : []))
      .then((data: ProjectSummary[]) => {
        if (active) setProjects(data);
      })
      .catch(() => {});

    return () => { active = false; };
  }, []);

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setPosting(true);

    const res = await fetch("/api/logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: content.trim(),
        projectId: projectId || undefined,
      }),
    });

    if (res.ok) {
      setContent("");
      setProjectId("");
      const logsRes = await fetch("/api/logs");
      if (logsRes.ok) setLogs(await logsRes.json());
    }
    setPosting(false);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Build Logs</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Quick updates on what you&apos;re building. Think commit messages for humans.
        </p>
      </div>

      <form
        onSubmit={handlePost}
        className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 mb-6"
      >
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={2}
          placeholder="shipped auth today..."
          className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm resize-none"
        />
        <div className="flex items-center gap-3 mt-3">
          {projects.length > 0 && (
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value="">No project</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          )}
          <button
            type="submit"
            disabled={posting || !content.trim()}
            className="ml-auto px-4 py-1.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-hover disabled:opacity-50 transition-colors"
          >
            {posting ? "Posting..." : "Post"}
          </button>
        </div>
      </form>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-16 rounded-xl bg-neutral-100 dark:bg-neutral-900 animate-pulse"
            />
          ))}
        </div>
      ) : logs.length === 0 ? (
        <EmptyState
          icon="📝"
          title="No build logs yet"
          description="Share what you shipped, broke, or learned today."
        />
      ) : (
        <div className="divide-y divide-neutral-100 dark:divide-neutral-800/50">
          {logs.map((log) => (
            <BuildLogCard key={log.id} log={log} />
          ))}
        </div>
      )}
    </div>
  );
}
