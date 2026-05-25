"use client";

import { useEffect, useState } from "react";
import BuilderCard from "@/components/builders/BuilderCard";
import BuilderFilters from "@/components/builders/BuilderFilters";
import EmptyState from "@/components/EmptyState";
import { type BuilderProfileSummary } from "@/lib/types";

export default function BuildersPage() {
  const [profiles, setProfiles] = useState<BuilderProfileSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [skill, setSkill] = useState("");
  const [interest, setInterest] = useState("");
  const [openTo, setOpenTo] = useState("");

  useEffect(() => {
    let active = true;
    const params = new URLSearchParams();
    if (skill) params.set("skill", skill);
    if (interest) params.set("interest", interest);
    if (openTo) params.set("openTo", openTo);

    fetch(`/api/builders?${params.toString()}`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data: BuilderProfileSummary[]) => {
        if (active) {
          setProfiles(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [skill, interest, openTo]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Builders</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Find teammates for your next project or hackathon.
        </p>
      </div>

      <BuilderFilters
        skill={skill}
        interest={interest}
        openTo={openTo}
        onSkillChange={setSkill}
        onInterestChange={setInterest}
        onOpenToChange={setOpenTo}
      />

      {loading ? (
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-56 rounded-xl bg-neutral-100 dark:bg-neutral-900 animate-pulse"
            />
          ))}
        </div>
      ) : profiles.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            icon="👋"
            title="No builders yet"
            description="Be the first to create your builder profile."
            actionLabel="Set up profile"
            actionHref="/builders/edit"
          />
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {profiles.map((profile) => (
            <BuilderCard key={profile.id} profile={profile} />
          ))}
        </div>
      )}
    </div>
  );
}
