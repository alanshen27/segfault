"use client";

import {
  PROJECT_TAGS,
  PROJECT_STATUSES,
  LOOKING_FOR_ROLES,
} from "@/lib/types";

interface ProjectFiltersProps {
  tag: string;
  status: string;
  lookingFor: string;
  onTagChange: (v: string) => void;
  onStatusChange: (v: string) => void;
  onLookingForChange: (v: string) => void;
}

export default function ProjectFilters({
  tag,
  status,
  lookingFor,
  onTagChange,
  onStatusChange,
  onLookingForChange,
}: ProjectFiltersProps) {
  const selectClass =
    "px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/40";

  return (
    <div className="flex flex-wrap gap-2">
      <select
        value={tag}
        onChange={(e) => onTagChange(e.target.value)}
        className={selectClass}
      >
        <option value="">All Tags</option>
        {PROJECT_TAGS.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>

      <select
        value={status}
        onChange={(e) => onStatusChange(e.target.value)}
        className={selectClass}
      >
        <option value="">All Statuses</option>
        {PROJECT_STATUSES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>

      <select
        value={lookingFor}
        onChange={(e) => onLookingForChange(e.target.value)}
        className={selectClass}
      >
        <option value="">All Roles</option>
        {LOOKING_FOR_ROLES.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </select>
    </div>
  );
}
