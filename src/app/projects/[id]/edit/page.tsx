"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { BackLink, PageContainer } from "@/components/layout";
import PostImagePicker, { type PendingPostImage } from "@/components/PostImagePicker";
import { uploadProjectImage } from "@/lib/storage";
import { inputClass } from "@/lib/styles";
import {
  PROJECT_TAGS,
  PROJECT_STATUSES,
  LOOKING_FOR_ROLES,
  type ProjectDetail,
} from "@/lib/types";
import { useCurrentUser } from "@/lib/use-current-user";

export default function EditProjectPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const { user, loaded: userLoading } = useCurrentUser();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [authorId, setAuthorId] = useState<string | null>(null);
  const [existingImages, setExistingImages] = useState<ProjectDetail["attachments"]>([]);

  const [title, setTitle] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [demoUrl, setDemoUrl] = useState("");
  const [status, setStatus] = useState("Idea");
  const [tags, setTags] = useState<string[]>([]);
  const [lookingFor, setLookingFor] = useState<string[]>([]);
  const [images, setImages] = useState<PendingPostImage[]>([]);

  useEffect(() => {
    let active = true;
    fetch(`/api/projects/${projectId}`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json() as Promise<ProjectDetail>;
      })
      .then((data) => {
        if (!active) return;
        setTitle(data.title);
        setTagline(data.tagline);
        setDescription(data.description ?? "");
        setGithubUrl(data.githubUrl ?? "");
        setDemoUrl(data.demoUrl ?? "");
        setStatus(data.status);
        setTags(data.tags);
        setLookingFor(data.lookingFor);
        setAuthorId(data.author.id);
        setExistingImages(data.attachments);
        setLoading(false);
      })
      .catch(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [projectId]);

  useEffect(() => {
    if (loading || userLoading || !authorId) return;
    if (!user) {
      router.push("/login");
      return;
    }
    const isAuthor = authorId === user.id;
    const isModerator = user.role === "ADMIN" || user.role === "MODERATOR";
    if (!isAuthor && !isModerator) {
      router.replace(`/projects/${projectId}`);
    }
  }, [loading, userLoading, user, authorId, projectId, router]);

  const toggleTag = (t: string) =>
    setTags((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t],
    );

  const toggleRole = (r: string) =>
    setLookingFor((prev) =>
      prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r],
    );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const res = await fetch(`/api/projects/${projectId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        tagline,
        description: description || undefined,
        githubUrl: githubUrl || undefined,
        demoUrl: demoUrl || undefined,
        status,
        tags,
        lookingFor,
      }),
    });

    if (!res.ok) {
      const data: { error?: string } = await res.json();
      setError(data.error ?? "Failed to update project");
      setSaving(false);
      return;
    }

    if (images.length > 0) {
      const urls = await Promise.all(
        images.map((img, index) =>
          uploadProjectImage(projectId, existingImages.length + index, img.file),
        ),
      );
      const attachRes = await fetch(`/api/projects/${projectId}/attachments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ urls }),
      });
      if (!attachRes.ok) {
        const data: { error?: string } = await attachRes.json();
        setError(data.error ?? "Project saved but new images failed to upload");
        setSaving(false);
        router.push(`/projects/${projectId}`);
        return;
      }
    }

    router.push(`/projects/${projectId}`);
  };

  if (loading || userLoading) {
    return (
      <PageContainer width="narrow" className="py-8">
        <div className="h-8 w-48 bg-neutral-100 dark:bg-neutral-900 rounded animate-pulse mb-6" />
        <div className="h-96 rounded-xl bg-neutral-100 dark:bg-neutral-900 animate-pulse" />
      </PageContainer>
    );
  }

  return (
    <PageContainer width="narrow" className="py-8">
      <BackLink href={`/projects/${projectId}`} className="mb-4">
        Back to project
      </BackLink>

      <h1 className="text-2xl font-bold tracking-tight mb-6">
        Edit project
      </h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 p-5 rounded-xl border border-neutral-200 dark:border-neutral-800"
      >
        {error && (
          <div className="text-sm text-red-600 bg-red-50 dark:bg-red-950/30 dark:text-red-400 p-3 rounded-lg">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1.5">Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Tagline *</label>
          <input
            type="text"
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            required
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className={inputClass}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">GitHub URL</label>
            <input
              type="url"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              placeholder="https://github.com/..."
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Demo URL</label>
            <input
              type="url"
              value={demoUrl}
              onChange={(e) => setDemoUrl(e.target.value)}
              placeholder="https://..."
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Status</label>
          <div className="flex gap-2">
            {PROJECT_STATUSES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatus(s)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  status === s
                    ? "bg-primary text-white"
                    : "border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Tags</label>
          <div className="flex flex-wrap gap-2">
            {PROJECT_TAGS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => toggleTag(t)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                  tags.includes(t)
                    ? "bg-primary text-white"
                    : "border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Looking for</label>
          <div className="flex flex-wrap gap-2">
            {LOOKING_FOR_ROLES.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => toggleRole(r)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                  lookingFor.includes(r)
                    ? "bg-primary text-white"
                    : "border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {existingImages.length > 0 && (
          <div>
            <label className="block text-sm font-medium mb-1.5">Current photos</label>
            <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {existingImages.map((attachment) => (
                <li key={attachment.id}>
                  <img
                    src={attachment.url}
                    alt=""
                    className="w-full h-24 object-cover rounded-lg border border-neutral-200 dark:border-neutral-800"
                  />
                </li>
              ))}
            </ul>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1.5">Add photos</label>
          <PostImagePicker images={images} onChange={setImages} />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-5 py-2.5 rounded-lg bg-primary text-white font-medium hover:bg-primary-hover disabled:opacity-50 transition-colors text-sm"
        >
          {saving ? "Saving..." : "Save changes"}
        </button>
      </form>
    </PageContainer>
  );
}
