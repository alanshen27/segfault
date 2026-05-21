"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Avatar from "@/components/Avatar";
import ImageUpload from "@/components/ImageUpload";
import { uploadAvatar } from "@/lib/storage";
import { type UserProfile } from "@/lib/types";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [name, setName] = useState("");
  const [pendingAvatar, setPendingAvatar] = useState<File | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/me")
      .then((r) => {
        if (!r.ok) throw new Error("Unauthorized");
        return r.json() as Promise<UserProfile>;
      })
      .then((data) => {
        if (active) {
          setUser(data);
          setName(data.name);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) {
          setLoading(false);
          router.push("/login");
        }
      });
    return () => { active = false; };
  }, [router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      let avatarUrl = user.avatarUrl;
      if (pendingAvatar) {
        avatarUrl = await uploadAvatar(user.supabaseId, pendingAvatar);
      }

      const res = await fetch("/api/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, avatarUrl }),
      });

      if (!res.ok) {
        const data: { error?: string } = await res.json();
        throw new Error(data.error ?? "Failed to update profile");
      }

      const updated: UserProfile = await res.json();
      setUser(updated);
      setPendingAvatar(null);
      setSuccess("Profile updated");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="h-8 w-32 bg-neutral-100 dark:bg-neutral-900 rounded animate-pulse mb-6" />
        <div className="h-48 bg-neutral-100 dark:bg-neutral-900 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold tracking-tight mb-6">Profile</h1>

      <form onSubmit={handleSave} className="space-y-6 p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
        {error && (
          <div className="text-sm text-red-600 bg-red-50 dark:bg-red-950/30 dark:text-red-400 p-3 rounded-lg">
            {error}
          </div>
        )}
        {success && (
          <div className="text-sm text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-400 p-3 rounded-lg">
            {success}
          </div>
        )}

        <ImageUpload
          label="Profile picture"
          previewUrl={user.avatarUrl}
          onFileSelect={setPendingAvatar}
          disabled={saving}
          fallback={<Avatar src={user.avatarUrl} name={user.name} size="xl" />}
        />

        <div>
          <label className="block text-sm font-medium mb-1.5">Display name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Email</label>
          <input
            type="email"
            value={user.email}
            disabled
            className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 text-neutral-500 text-sm cursor-not-allowed"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-5 py-2.5 rounded-lg bg-primary text-white font-medium hover:bg-primary-hover disabled:opacity-50 transition-colors text-sm"
        >
          {saving ? "Saving..." : "Save changes"}
        </button>
      </form>
    </div>
  );
}
