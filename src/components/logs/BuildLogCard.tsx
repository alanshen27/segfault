import Link from "next/link";
import Avatar from "@/components/Avatar";
import { type BuildLogEntry } from "@/lib/types";

interface BuildLogCardProps {
  log: BuildLogEntry;
}

function timeAgo(dateStr: string): string {
  const seconds = Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / 1000,
  );
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function BuildLogCard({ log }: BuildLogCardProps) {
  return (
    <div className="flex gap-3 py-4 border-b border-neutral-100 dark:border-neutral-800/50 last:border-0">
      <Avatar src={log.author.avatarUrl} name={log.author.name} size="sm" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium">{log.author.name}</span>
          <span className="text-neutral-400">·</span>
          <span className="text-neutral-400 text-xs">
            {timeAgo(log.createdAt)}
          </span>
          {log.project && (
            <>
              <span className="text-neutral-400">·</span>
              <Link
                href={`/projects/${log.project.id}`}
                className="text-xs text-primary hover:underline truncate"
              >
                {log.project.title}
              </Link>
            </>
          )}
        </div>
        <p className="text-sm text-neutral-700 dark:text-neutral-300 mt-1 whitespace-pre-wrap">
          {log.content}
        </p>
      </div>
    </div>
  );
}
