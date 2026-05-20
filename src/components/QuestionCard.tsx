import Link from "next/link";

const difficultyColors: Record<string, string> = {
  EASY: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  MEDIUM:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  HARD: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

interface QuestionCardProps {
  id: string;
  title: string;
  difficulty: string;
  topic: string;
  author?: { name: string };
  bank?: { name: string } | null;
}

export default function QuestionCard({
  id,
  title,
  difficulty,
  topic,
  author,
  bank,
}: QuestionCardProps) {
  return (
    <Link
      href={`/questions/${id}`}
      className="block p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors bg-white dark:bg-neutral-950"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-medium text-neutral-900 dark:text-white">
          {title}
        </h3>
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${difficultyColors[difficulty] || "bg-neutral-100 text-neutral-600"}`}
        >
          {difficulty}
        </span>
      </div>
      <div className="flex items-center gap-2 mt-2 text-xs text-neutral-500 dark:text-neutral-400">
        <span>{topic}</span>
        {bank && (
          <>
            <span>&middot;</span>
            <span>{bank.name}</span>
          </>
        )}
        {author && (
          <>
            <span>&middot;</span>
            <span>by {author.name}</span>
          </>
        )}
      </div>
    </Link>
  );
}
