import Link from "next/link";
import { type Difficulty, DIFFICULTY_COLORS } from "@/lib/types";

interface QuestionCardProps {
  id: string;
  title: string;
  difficulty: Difficulty;
  topic: string;
  author?: { name: string };
  bank?: { name: string } | null;
  solved?: boolean;
}

export default function QuestionCard({
  id,
  title,
  difficulty,
  topic,
  author,
  bank,
  solved,
}: QuestionCardProps) {
  const colorClass =
    DIFFICULTY_COLORS[difficulty] ?? "bg-neutral-100 text-neutral-600";

  return (
    <Link
      href={`/questions/${id}`}
      className="group block p-4 rounded-xl border border-primary-200/70 dark:border-neutral-800 hover:border-primary/40 dark:hover:border-primary/40 transition-all bg-card hover:shadow-sm"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-medium text-neutral-900 dark:text-white group-hover:text-primary transition-colors flex items-center gap-2">
          {title}
          {solved && (
            <span className="text-[10px] font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
              Solved
            </span>
          )}
        </h3>
        <span
          className={`text-xs font-medium px-2.5 py-0.5 rounded-full shrink-0 ${colorClass}`}
        >
          {difficulty}
        </span>
      </div>
      <div className="flex items-center gap-2 mt-2 text-xs text-neutral-500 dark:text-neutral-400">
        <span className="inline-flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
          </svg>
          {topic}
        </span>
        {bank && (
          <>
            <span className="text-neutral-300 dark:text-neutral-700">&middot;</span>
            <span>{bank.name}</span>
          </>
        )}
        {author && (
          <>
            <span className="text-neutral-300 dark:text-neutral-700">&middot;</span>
            <span>by {author.name}</span>
          </>
        )}
      </div>
    </Link>
  );
}
