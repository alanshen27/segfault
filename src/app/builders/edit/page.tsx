"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BUILDER_SKILLS,
  BUILDER_INTERESTS,
  OPEN_TO_OPTIONS,
} from "@/lib/types";

interface ProfileData {
  bio?: string;
  skills: string[];
  interests: string[];
  timezone?: string;
  school?: string;
  openTo: string[];
  githubUrl?: string;
  linkedinUrl?: string;
  websiteUrl?: string;
}

export default function EditBuilderProfilePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
    fetch("/api/me")
      .then((r) => {
        if (!r.ok) throw new Error("Unauthorized");
        return r.json();
      })
      .then(() => {
        return fetch("/api/builders");
      })
      .then((r) => r.json())
      .then(() => {
        setLoading(false);
      })
      .catch(() => {
        router.push("/login");
      });
  }, [router]);

  const toggle = (
    arr: string[],
    set: (v: string[]) => void,
    value: string,
  ) => {
    set(arr.includes(value) ? arr.filter((x) => x !== value) : [...arr, value]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const body: ProfileData = {
      bio: bio || undefined,
      skills,
      interests,
      timezone: timezone || undefined,
      school: school || undefined,
      openTo,
      githubUrl: githubUrl || undefined,
      linkedinUrl: linkedinUrl || undefined,
      websiteUrl: websiteUrl || undefined,
    };

    const res = await fetch("/api/builders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const data: { error?: string } = await res.json();
      setError(data.error ?? "Failed to save profile");
      setSaving(false);
      return;
    }

    router.push("/builders");
  };

  const inputClass =
    "w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm";

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="h-8 w-48 bg-neutral-100 dark:bg-neutral-900 rounded animate-pulse mb-6" />
        <div className="h-96 bg-neutral-100 dark:bg-neutral-900 rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold tracking-tight mb-6">
        Builder Profile
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
            <label className="block text-sm font-medium mb-1.5">
              Timezone
            </label>
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
                onClick={() => toggle(skills, setSkills, s)}
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
                onClick={() => toggle(interests, setInterests, i)}
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
                onClick={() => toggle(openTo, setOpenTo, o)}
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
            <label className="block text-sm font-medium mb-1.5">
              LinkedIn
            </label>
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

        <button
          type="submit"
          disabled={saving}
          className="px-5 py-2.5 rounded-lg bg-primary text-white font-medium hover:bg-primary-hover disabled:opacity-50 transition-colors text-sm"
        >
          {saving ? "Saving..." : "Save profile"}
        </button>
      </form>
    </div>
  );
}
