interface ListSkeletonProps {
  count?: number;
  className?: string;
  layout?: "stack" | "grid";
}

export default function ListSkeleton({
  count = 3,
  className = "h-48 rounded-xl bg-neutral-100 dark:bg-neutral-900 animate-pulse",
  layout = "stack",
}: ListSkeletonProps) {
  const items = Array.from({ length: count }, (_, i) => (
    <div key={i} className={className} />
  ));

  if (layout === "grid") {
    return <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{items}</div>;
  }

  return <div className="space-y-3">{items}</div>;
}
