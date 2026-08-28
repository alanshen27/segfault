import Link from "next/link";

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  compact?: boolean;
}

export default function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  compact = false,
}: EmptyStateProps) {
  const actionClass =
    "inline-flex px-4 py-2 rounded-full bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors mt-4";

  return (
    <div className={`text-center ${compact ? "py-4" : "py-16 sm:py-20"}`}>
      {icon && (
        <div className={`${compact ? "text-2xl mb-2" : "text-4xl mb-3"} opacity-40`}>{icon}</div>
      )}
      <p className={`text-neutral-500 font-medium ${compact ? "text-xs" : ""}`}>{title}</p>
      {description && (
        <p className={`text-neutral-400 mt-1 max-w-sm mx-auto ${compact ? "text-xs px-2" : "text-sm"}`}>
          {description}
        </p>
      )}
      {actionLabel && actionHref && (
        <Link href={actionHref} className={`${actionClass} ${compact ? "text-xs px-3 py-1.5 mt-2" : ""}`}>
          {actionLabel}
        </Link>
      )}
      {actionLabel && onAction && !actionHref && (
        <button type="button" onClick={onAction} className={actionClass}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}
