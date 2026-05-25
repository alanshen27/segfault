"use client";

import {
  BUILDER_SKILLS,
  BUILDER_INTERESTS,
  OPEN_TO_OPTIONS,
} from "@/lib/types";

interface BuilderFiltersProps {
  skill: string;
  interest: string;
  openTo: string;
  onSkillChange: (v: string) => void;
  onInterestChange: (v: string) => void;
  onOpenToChange: (v: string) => void;
}

export default function BuilderFilters({
  skill,
  interest,
  openTo,
  onSkillChange,
  onInterestChange,
  onOpenToChange,
}: BuilderFiltersProps) {
  const selectClass =
    "px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40";

  return (
    <div className="flex flex-wrap gap-2">
      <select
        value={skill}
        onChange={(e) => onSkillChange(e.target.value)}
        className={selectClass}
      >
        <option value="">All Skills</option>
        {BUILDER_SKILLS.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>

      <select
        value={interest}
        onChange={(e) => onInterestChange(e.target.value)}
        className={selectClass}
      >
        <option value="">All Interests</option>
        {BUILDER_INTERESTS.map((i) => (
          <option key={i} value={i}>
            {i}
          </option>
        ))}
      </select>

      <select
        value={openTo}
        onChange={(e) => onOpenToChange(e.target.value)}
        className={selectClass}
      >
        <option value="">All</option>
        {OPEN_TO_OPTIONS.map((o) => (
          <option key={o} value={o}>
            Open to {o}
          </option>
        ))}
      </select>
    </div>
  );
}
