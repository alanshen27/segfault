"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Avatar from "@/components/Avatar";
import ImageUpload from "@/components/ImageUpload";
import { uploadAvatar } from "@/lib/storage";
import { PageContainer } from "@/components/layout";
import { inputClass } from "@/lib/styles";
import {
  BUILDER_SKILLS,
  BUILDER_INTERESTS,
  OPEN_TO_OPTIONS,
  type UserProfile,
} from "@/lib/types";

function toggleInList(
  arr: string[],
  set: (v: string[]) => void,
  value: string,
) {
  set(arr.includes(value) ? arr.filter((x) => x !== value) : [...arr, value]);
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [name, setName] = useState("");
  const [pendingAvatar, setPendingAvatar] = useState<File | null>(null);

  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [timezone, setTimezone] = useState("");
  const [school, setSchool] = useState("");
  const [openTo, setOpenTo] = useState<string[]>([]);
  const [githubUrl, setGithubUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");

  useEffect(() => {
    let active = true;
    fetch("/api/me")
      .then((r) => {
        if (!r.ok) throw new Error("Unauthorized");
        return r.json() as Promise<UserProfile>;
      })
      .then((data) => {
        if (!active) return;
        setUser(data);
        setName(data.name);
        const bp = data.builderProfile;
        if (bp) {
          setBio(bp.bio ?? "");
          setSkills(bp.skills ?? []);
          setInterests(bp.interests ?? []);
          setTimezone(bp.timezone ?? "");
          setSchool(bp.school ?? "");
          setOpenTo(bp.openTo ?? []);
          setGithubUrl(bp.githubUrl ?? "");
          setLinkedinUrl(bp.linkedinUrl ?? "");
          setWebsiteUrl(bp.websiteUrl ?? "");
        }
        setLoading(false);
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

      const [meRes, builderRes] = await Promise.all([
        fetch("/api/me", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, avatarUrl }),
        }),
        fetch("/api/builders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bio: bio || undefined,
            skills,
            interests,
            timezone: timezone || undefined,
            school: school || undefined,
            openTo,
            githubUrl: githubUrl || undefined,
            linkedinUrl: linkedinUrl || undefined,
            websiteUrl: websiteUrl || undefined,
          }),
        }),
      ]);

      if (!meRes.ok) {
        const data: { error?: string } = await meRes.json();
        throw new Error(data.error ?? "Failed to update account");
      }
      if (!builderRes.ok) {
        const data: { error?: string } = await builderRes.json();
        throw new Error(data.error ?? "Failed to update builder profile");
      }

      const updated: UserProfile = await meRes.json();
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
      <PageContainer width="narrow" className="py-8">
        <div className="h-8 w-32 bg-neutral-100 dark:bg-neutral-900 rounded animate-pulse mb-6" />
        <div className="h-96 bg-neutral-100 dark:bg-neutral-900 rounded-xl animate-pulse" />
      </PageContainer>
    );
  }

  if (!user) return null;

  return (
    <PageContainer width="narrow" className="py-8">
      <h1 className="text-2xl font-bold tracking-tight mb-6">Profile</h1>

      <form
        onSubmit={handleSave}
        className="space-y-8 p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950"
      >
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

        <section className="space-y-5">
          <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide">
            Account
          </h2>

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
              className={inputClass}
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
        </section>

        <section className="space-y-5 pt-5 border-t border-neutral-200 dark:border-neutral-800">
          <div>
            <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide">
              Builder profile
            </h2>
            <p className="text-sm text-neutral-500 mt-1">
              Shown on the Builders page so others can find teammates.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              placeholder="Tell builders about yourself..."
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">School</label>
              <input
                type="text"
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                placeholder="e.g. MIT, Stanford"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Timezone</label>
              <input
                type="text"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                placeholder="e.g. EST, PST, UTC+1"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Skills</label>
            <div className="flex flex-wrap gap-2">
              {BUILDER_SKILLS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleInList(skills, setSkills, s)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                    skills.includes(s)
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
            <label className="block text-sm font-medium mb-1.5">Interests</label>
            <div className="flex flex-wrap gap-2">
              {BUILDER_INTERESTS.map((i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => toggleInList(interests, setInterests, i)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                    interests.includes(i)
                      ? "bg-primary text-white"
                      : "border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  }`}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Open to</label>
            <div className="flex flex-wrap gap-2">
              {OPEN_TO_OPTIONS.map((o) => (
                <button
                  key={o}
                  type="button"
                  onClick={() => toggleInList(openTo, setOpenTo, o)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                    openTo.includes(o)
                      ? "bg-primary text-white"
                      : "border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  }`}
                >
                  {o}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">GitHub</label>
              <input
                type="url"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/..."
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">LinkedIn</label>
              <input
                type="url"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                placeholder="https://linkedin.com/in/..."
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Website</label>
              <input
                type="url"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://..."
                className={inputClass}
              />
            </div>
          </div>
        </section>

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
