import { type ForumTagSummary } from "@/lib/types";

interface TagBadgeProps {
  tag: ForumTagSummary | null;
  size?: "sm" | "md";
}

export default function TagBadge({ tag, size = "sm" }: TagBadgeProps) {
  if (!tag) return null;
  const sizeClass = size === "sm" ? "text-[10px] px-1.5 py-0.5" : "text-xs px-2 py-0.5";
  return (
    <span className={`rounded font-medium ${sizeClass} ${tag.color}`}>
      {tag.name}
    </span>
  );
}
