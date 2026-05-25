"use client";

import { useState } from "react";
import Link from "next/link";
import Avatar from "@/components/Avatar";
import { type BuildLogEntry } from "@/lib/types";

interface ProjectBuildLogSectionProps {
  projectId: string;
  logs: BuildLogEntry[];
  currentUserId?: string | null;
  isModerator?: boolean;
  onLogsChange: (logs: BuildLogEntry[]) => void;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function ProjectBuildLogSection({
  projectId,
  logs,
  currentUserId,
  isModerator = false,
  onLogsChange,
}: ProjectBuildLogSectionProps) {
  const [draft, setDraft] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const canManage = (authorId: string) =>
    !!currentUserId && (currentUserId === authorId || isModerator);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim() || !currentUserId) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: draft.trim(), projectId }),
      });
      if (!res.ok) return;
      const log: BuildLogEntry = await res.json();
      onLogsChange([log, ...logs]);
      setDraft("");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSave = async (logId: string) => {
    if (!editDraft.trim()) return;
    setSavingId(logId);
    try {
      const res = await fetch(`/api/logs/${logId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editDraft.trim() }),
      });
      if (!res.ok) return;
      const updated: BuildLogEntry = await res.json();
      onLogsChange(logs.map((log) => (log.id === logId ? updated : log)));
      setEditingId(null);
      setEditDraft("");
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (logId: string) => {
    if (!confirm("Delete this build log entry?")) return;
    setDeletingId(logId);
    try {
      const res = await fetch(`/api/logs/${logId}`, { method: "DELETE" });
      if (!res.ok) return;
      onLogsChange(logs.filter((log) => log.id !== logId));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section className="mt-8">
      <h2 className="text-lg font-semibold mb-3">Build log</h2>

      {currentUserId ? (
        <form onSubmit={handleCreate} className="mb-4">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={3}
            placeholder="Share a progress update..."
            className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-y"
          />
          <div className="flex justify-end mt-2">
            <button
              type="submit"
              disabled={submitting || !draft.trim()}
              className="px-4 py-1.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-hover disabled:opacity-50"
            >
              {submitting ? "Posting..." : "Add update"}
            </button>
          </div>
        </form>
      ) : (
        <p className="mb-4 text-sm text-neutral-500">
          <Link href="/login" className="text-primary hover:underline">
            Sign in
          </Link>{" "}
          to post build updates.
        </p>
      )}

      {logs.length === 0 ? (
        <p className="text-sm text-neutral-500 py-4 text-center rounded-lg border border-dashed border-neutral-200 dark:border-neutral-800">
          No build updates yet.
        </p>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => {
            const editing = editingId === log.id;
            const manageable = canManage(log.author.id);

            return (
              <div
                key={log.id}
                className="flex gap-3 p-3 rounded-lg border border-neutral-100 dark:border-neutral-800/50"
              >
                <Avatar
                  src={log.author.avatarUrl}
                  name={log.author.name}
                  size="sm"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-sm flex-wrap">
                    <span className="font-medium">{log.author.name}</span>
                    <span className="text-neutral-400 text-xs">
                      {formatDate(log.createdAt)}
                    </span>
                    {manageable && !editing && (
                      <span className="ml-auto flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingId(log.id);
                            setEditDraft(log.content);
                          }}
                          className="text-xs text-neutral-500 hover:text-primary"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(log.id)}
                          disabled={deletingId === log.id}
                          className="text-xs text-red-500 hover:text-red-600 disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </span>
                    )}
                  </div>

                  {editing ? (
                    <div className="mt-2 space-y-2">
                      <textarea
                        value={editDraft}
                        onChange={(e) => setEditDraft(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-y"
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleSave(log.id)}
                          disabled={savingId === log.id || !editDraft.trim()}
                          className="px-3 py-1 rounded-lg bg-primary text-white text-xs font-medium hover:bg-primary-hover disabled:opacity-50"
                        >
                          {savingId === log.id ? "Saving..." : "Save"}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingId(null);
                            setEditDraft("");
                          }}
                          className="px-3 py-1 rounded-lg border border-neutral-300 dark:border-neutral-700 text-xs hover:bg-neutral-100 dark:hover:bg-neutral-800"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-0.5 whitespace-pre-wrap">
                      {log.content}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
