"use client";

import { useEffect, useState } from "react";
import { TAG_COLOR_PRESETS } from "@/lib/forum-tag-constants";
import { type ForumTagSummary } from "@/lib/types";

interface TagPickerProps {
  subredditId: string | null;
  value: string;
  onChange: (slug: string) => void;
  allowCreate?: boolean;
}

export default function TagPicker({
  subredditId,
  value,
  onChange,
  allowCreate = true,
}: TagPickerProps) {
  const [tags, setTags] = useState<ForumTagSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState<string>(TAG_COLOR_PRESETS[0]);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!subredditId) {
      setTags([]);
      return;
    }

    let active = true;
    setLoading(true);
    fetch(`/api/forum/tags?subredditId=${subredditId}`)
      .then((r) => r.json())
      .then((data: ForumTagSummary[] | { error: string }) => {
        if (!active) return;
        if (Array.isArray(data)) {
          setTags(data);
        }
        setLoading(false);
      })
      .catch(() => { if (active) setLoading(false); });

    return () => { active = false; };
  }, [subredditId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subredditId) return;
    setCreating(true);
    setError("");

    const res = await fetch("/api/forum/tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName, color: newColor, subredditId }),
    });

    if (!res.ok) {
      const data: { error?: string } = await res.json();
      setError(data.error ?? "Failed to create tag");
      setCreating(false);
      return;
    }

    const created: ForumTagSummary = await res.json();
    setTags((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
    onChange(created.slug);
    setNewName("");
    setShowCreate(false);
    setCreating(false);
  };

  if (!subredditId) {
    return (
      <p className="text-sm text-neutral-500 py-2">
        Select a community first — tags are unique to each community.
      </p>
    );
  }

  if (loading) {
    return <div className="h-8 rounded-lg bg-neutral-100 dark:bg-neutral-900 animate-pulse" />;
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {tags.map((t) => (
          <button
            key={t.slug}
            type="button"
            onClick={() => onChange(t.slug)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              value === t.slug ? "ring-2 ring-primary ring-offset-1" : ""
            } ${t.color}`}
          >
            {t.name}
          </button>
        ))}
        {allowCreate && (
          <button
            type="button"
            onClick={() => setShowCreate((s) => !s)}
            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-dashed border-neutral-300 dark:border-neutral-600 text-neutral-500 hover:border-primary hover:text-primary transition-colors"
          >
            + New tag
          </button>
        )}
      </div>

      {showCreate && allowCreate && (
        <form onSubmit={handleCreate} className="mt-3 p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 space-y-3">
          {error && (
            <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
          )}
          <div>
            <label className="block text-xs font-medium mb-1">Tag name</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              required
              minLength={2}
              maxLength={32}
              placeholder="e.g. Contest Prep"
              className="w-full px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5">Color</label>
            <div className="flex flex-wrap gap-1.5">
              {TAG_COLOR_PRESETS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setNewColor(c)}
                  className={`w-7 h-7 rounded-full ${c.split(" ")[0]} ${
                    newColor === c ? "ring-2 ring-primary ring-offset-1" : ""
                  }`}
                  aria-label="Pick tag color"
                />
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={creating}
              className="px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-medium hover:bg-primary-hover disabled:opacity-50"
            >
              {creating ? "Creating..." : "Create tag"}
            </button>
            <button
              type="button"
              onClick={() => { setShowCreate(false); setError(""); }}
              className="px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 text-xs hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
