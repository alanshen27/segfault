interface PaginationBarProps {
  page: number;
  totalPages: number;
  total: number;
  itemLabel?: string;
  onPageChange: (page: number) => void;
  className?: string;
}

export default function PaginationBar({
  page,
  totalPages,
  total,
  itemLabel = "items",
  onPageChange,
  className = "pt-2",
}: PaginationBarProps) {
  if (totalPages <= 1) return null;

  const btnClass =
    "px-3 py-1.5 text-xs font-medium rounded-lg border border-neutral-300 dark:border-neutral-700 disabled:opacity-30 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors";

  return (
    <div className={`flex items-center justify-between ${className}`}>
      <span className="text-xs text-neutral-500 tabular-nums">
        Page {page} of {totalPages} · {total} {itemLabel}
      </span>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page === 1}
          className={btnClass}
        >
          Previous
        </button>
        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          className={btnClass}
        >
          Next
        </button>
      </div>
    </div>
  );
}
