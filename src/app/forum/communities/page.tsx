"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { type SubredditSummary } from "@/lib/types";

interface UserInfo {
  id: string;
  role: string;
}

export default function CommunitiesPage() {
  const [subreddits, setSubreddits] = useState<SubredditSummary[]>([]);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#D35959");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([
      fetch("/api/subreddits").then((r) => r.json()),
      fetch("/api/me").then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([subs, me]: [SubredditSummary[], UserInfo | null]) => {
        if (active) {
          setSubreddits(subs);
          setUser(me);
          setLoading(false);
        }
      })
      .catch(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const canCreate = user?.role === "ADMIN" || user?.role === "MODERATOR";

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError("");

    const res = await fetch("/api/subreddits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description, color }),
    });

    if (!res.ok) {
      const data: { error?: string } = await res.json();
      setError(data.error ?? "Failed to create community");
      setCreating(false);
      return;
    }

    setShowCreate(false);
    setName("");
    setDescription("");
    setColor("#D35959");
    setCreating(false);

    const updated: SubredditSummary[] = await fetch("/api/subreddits").then((r) => r.json());
    setSubreddits(updated);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Communities</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-xl bg-neutral-100 dark:bg-neutral-900 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/forum" className="text-sm text-neutral-500 hover:text-primary transition-colors">
              Forum
            </Link>
            <span className="text-neutral-300">/</span>
            <span className="text-sm font-medium">Communities</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Communities</h1>
          <p className="text-sm text-neutral-500 mt-0.5">
            {subreddits.length} communit{subreddits.length !== 1 ? "ies" : "y"}
          </p>
        </div>
        {canCreate && (
          <button
            onClick={() => setShowCreate(true)}
            className="px-4 py-2 rounded-lg bg-primary text-white font-medium hover:bg-primary-hover transition-colors text-sm"
          >
            Create Community
          </button>
        )}
      </div>

      {showCreate && (
        <div className="mb-6 p-5 rounded-xl border border-primary/30 bg-primary-50 dark:bg-primary-900/10">
          <h2 className="text-lg font-semibold mb-3">New Community</h2>
          <form onSubmit={handleCreate} className="space-y-3">
            {error && (
              <div className="text-sm text-red-600 bg-red-50 dark:bg-red-950/30 dark:text-red-400 p-2 rounded-lg">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm"
                placeholder="e.g., Algorithms"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={2}
                className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm"
                placeholder="What is this community about?"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-8 h-8 rounded border border-neutral-300 cursor-pointer"
                />
                <span className="text-xs text-neutral-500">{color}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={creating}
                className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-hover disabled:opacity-50 transition-colors"
              >
                {creating ? "Creating..." : "Create"}
              </button>
              <button
                type="button"
                onClick={() => { setShowCreate(false); setError(""); }}
                className="px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {subreddits.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-4xl mb-3 opacity-40">🏘️</div>
          <p className="text-neutral-500 font-medium">No communities yet</p>
          <p className="text-sm text-neutral-400 mt-1">
            {canCreate ? "Create the first community to get discussions going." : "Communities will appear here once moderators create them."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {subreddits.map((sub) => (
            <Link
              key={sub.id}
              href={`/forum?subredditId=${sub.id}`}
              className="group p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 hover:border-primary/40 transition-all hover:shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
                  style={{ backgroundColor: sub.color }}
                >
                  {sub.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h3 className="font-medium text-sm group-hover:text-primary transition-colors">
                    s/{sub.name}
                  </h3>
                  <p className="text-xs text-neutral-500 line-clamp-1">{sub.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 mt-3 text-xs text-neutral-400">
                <span>{sub._count.posts} post{sub._count.posts !== 1 ? "s" : ""}</span>
                <span className="text-neutral-300 dark:text-neutral-700">&middot;</span>
                <span>by {sub.createdBy.name}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
