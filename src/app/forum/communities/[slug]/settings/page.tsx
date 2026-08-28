"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import CommunityIcon from "@/components/CommunityIcon";
import ImageUpload from "@/components/ImageUpload";
import { uploadCommunityBanner, uploadCommunityIcon } from "@/lib/storage";
import { type SubredditSummary, type UserProfile } from "@/lib/types";

function canManageCommunity(
  user: UserProfile,
  community: SubredditSummary,
) {
  return (
    community.createdById === user.id
    || user.role === "ADMIN"
    || user.role === "MODERATOR"
  );
}

export default function CommunitySettingsPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const [community, setCommunity] = useState<SubredditSummary | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#D35959");
  const [pendingIcon, setPendingIcon] = useState<File | null>(null);
  const [pendingBanner, setPendingBanner] = useState<File | null>(null);
  const [removeIcon, setRemoveIcon] = useState(false);
  const [removeBanner, setRemoveBanner] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.all([
      fetch(`/api/subreddits/${slug}`).then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json() as Promise<SubredditSummary>;
      }),
      fetch("/api/me").then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([sub, me]: [SubredditSummary, UserProfile | null]) => {
        if (!active) return;
        if (!me || !canManageCommunity(me, sub)) {
          router.replace(`/forum/communities/${slug}`);
          return;
        }
        setCommunity(sub);
        setUser(me);
        setDescription(sub.description);
        setColor(sub.color);
        setLoading(false);
      })
      .catch(() => {
        if (active) router.replace("/forum/communities");
      });

    return () => { active = false; };
  }, [slug, router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!community) return;
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      let iconUrl: string | null | undefined = undefined;
      let bannerUrl: string | null | undefined = undefined;

      if (removeIcon) {
        iconUrl = null;
      } else if (pendingIcon) {
        iconUrl = await uploadCommunityIcon(community.slug, pendingIcon);
      }

      if (removeBanner) {
        bannerUrl = null;
      } else if (pendingBanner) {
        bannerUrl = await uploadCommunityBanner(community.slug, pendingBanner);
      }

      const res = await fetch(`/api/subreddits/${community.slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description,
          color,
          ...(iconUrl !== undefined && { iconUrl }),
          ...(bannerUrl !== undefined && { bannerUrl }),
        }),
      });

      if (!res.ok) {
        const data: { error?: string } = await res.json();
        throw new Error(data.error ?? "Failed to save settings");
      }

      const updated: SubredditSummary = await res.json();
      setCommunity(updated);
      setPendingIcon(null);
      setPendingBanner(null);
      setRemoveIcon(false);
      setRemoveBanner(false);
      setSuccess("Community settings saved");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !community || !user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="h-8 w-48 bg-primary-50 dark:bg-neutral-900 rounded animate-pulse mb-6" />
        <div className="h-96 bg-primary-50 dark:bg-neutral-900 rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          href={`/forum/communities/${community.slug}`}
          className="text-sm text-neutral-500 hover:text-primary transition-colors"
        >
          ← Back to s/{community.name}
        </Link>
        <h1 className="text-2xl font-display font-semibold tracking-tight mt-3">Community settings</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Update how s/{community.name} looks and what it says about itself.
        </p>
      </div>

      <form
        onSubmit={handleSave}
        className="space-y-6 p-5 rounded-xl border border-primary-200/70 dark:border-neutral-800 bg-card"
      >
        {error && (
          <div className="text-sm text-red-600 bg-red-50 dark:bg-red-950/30 dark:text-red-400 p-3 rounded-lg">
            {error}
          </div>
        )}
        {success && (
          <div className="text-sm text-emerald-700 bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-400 p-3 rounded-lg">
            {success}
          </div>
        )}

        <ImageUpload
          label="Banner"
          shape="banner"
          previewUrl={removeBanner ? null : community.bannerUrl}
          hint="Recommended 1920×384 or wider · JPEG, PNG, WebP, or GIF · max 5 MB"
          onFileSelect={(file) => {
            setPendingBanner(file);
            setRemoveBanner(false);
          }}
        />
        {community.bannerUrl && !pendingBanner && (
          <button
            type="button"
            onClick={() => setRemoveBanner(true)}
            className="text-xs text-red-600 hover:underline -mt-4"
          >
            Remove banner
          </button>
        )}

        <ImageUpload
          label="Icon"
          previewUrl={removeIcon ? null : community.iconUrl}
          fallback={
            <CommunityIcon
              name={community.name}
              color={color}
              size="lg"
              className="ring-0"
            />
          }
          onFileSelect={(file) => {
            setPendingIcon(file);
            setRemoveIcon(false);
          }}
        />
        {community.iconUrl && !pendingIcon && (
          <button
            type="button"
            onClick={() => setRemoveIcon(true)}
            className="text-xs text-red-600 hover:underline -mt-4"
          >
            Remove icon
          </button>
        )}

        <div>
          <label className="block text-sm font-medium mb-2">Accent color</label>
          <p className="text-xs text-neutral-500 mb-3">
            Used for the banner fallback and community icon when no image is set.
          </p>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-12 h-10 rounded-lg border border-neutral-300 dark:border-neutral-700 cursor-pointer bg-transparent"
            />
            <input
              type="text"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              pattern="^#[0-9A-Fa-f]{6}$"
              className="flex-1 px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-card text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-2">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            minLength={10}
            rows={4}
            className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-y"
          />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 rounded-full bg-primary text-white text-sm font-semibold hover:bg-primary-hover disabled:opacity-50 transition-colors"
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
          <Link
            href={`/forum/communities/${community.slug}`}
            className="px-5 py-2.5 rounded-full border border-neutral-300 dark:border-neutral-700 text-sm font-medium hover:bg-primary-light dark:hover:bg-neutral-900 transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
