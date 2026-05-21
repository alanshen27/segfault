"use client";

interface ForumVoteRailProps {
  score: number;
  userVote?: number | null;
  onVote: (value: number) => void;
  size?: "sm" | "md";
  plain?: boolean;
  orientation?: "vertical" | "horizontal";
}

export default function ForumVoteRail({
  score,
  userVote,
  onVote,
  size = "sm",
  plain = false,
  orientation = "vertical",
}: ForumVoteRailProps) {
  const iconSize = size === "sm" ? "w-5 h-5" : "w-6 h-6";
  const scoreSize = size === "sm" ? "text-sm" : "text-base";

  const upButton = (
    <button
      type="button"
      onClick={() => onVote(1)}
      aria-label="Upvote"
      className={`p-1 rounded-md transition-all hover:bg-primary/10 ${
        userVote === 1
          ? "text-primary bg-primary/10"
          : "text-neutral-400 hover:text-primary"
      }`}
    >
      <svg className={iconSize} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
      </svg>
    </button>
  );

  const downButton = (
    <button
      type="button"
      onClick={() => onVote(-1)}
      aria-label="Downvote"
      className={`p-1 rounded-md transition-all hover:bg-red-500/10 ${
        userVote === -1
          ? "text-red-500 bg-red-500/10"
          : "text-neutral-400 hover:text-red-500"
      }`}
    >
      <svg className={iconSize} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  );

  const scoreEl = (
    <span
      className={`${scoreSize} font-bold tabular-nums ${
        score > 0 ? "text-primary" : score < 0 ? "text-red-500" : "text-neutral-500"
      }`}
    >
      {score}
    </span>
  );

  if (orientation === "horizontal") {
    return (
      <div className="flex items-center gap-1 shrink-0">
        {upButton}
        {scoreEl}
        {downButton}
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col items-center justify-center gap-0.5 shrink-0 ${
        plain ? "" : "rounded-lg bg-neutral-50 dark:bg-neutral-900/80"
      } ${size === "sm" ? "w-10 py-2" : "w-12 py-3"}`}
    >
      {upButton}
      {scoreEl}
      {downButton}
    </div>
  );
}
