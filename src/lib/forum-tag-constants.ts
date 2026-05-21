export const TAG_COLOR_PRESETS = [
  "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
  "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
  "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-400",
] as const;

export const DEFAULT_FORUM_TAGS = [
  { slug: "GENERAL", name: "General", color: TAG_COLOR_PRESETS[0] },
  { slug: "QUESTION", name: "Question", color: TAG_COLOR_PRESETS[1] },
  { slug: "EDITORIAL", name: "Editorial", color: TAG_COLOR_PRESETS[2] },
  { slug: "META", name: "Meta", color: TAG_COLOR_PRESETS[6] },
] as const;

export function slugifyTag(name: string): string {
  return name
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 32);
}

export function pickTagColor(index: number): string {
  return TAG_COLOR_PRESETS[index % TAG_COLOR_PRESETS.length];
}
