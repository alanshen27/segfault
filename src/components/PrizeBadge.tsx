const RARITY_STYLE: Record<string, string> = {
  COMMON: "text-neutral-500",
  RARE: "text-blue-500",
  LEGENDARY: "text-amber-500",
};

interface PrizeBadgeProps {
  name: string;
  rarity: string;
  className?: string;
}

export default function PrizeBadge({
  name,
  rarity,
  className = "",
}: PrizeBadgeProps) {
  const color = RARITY_STYLE[rarity] ?? RARITY_STYLE.COMMON;

  return (
    <span
      title={name}
      className={`inline-flex items-center gap-0.5 text-[10px] font-semibold ${color} ${className}`}
    >
      <svg
        className="w-3 h-3"
        fill="currentColor"
        viewBox="0 0 20 20"
        aria-hidden
      >
        <path
          fillRule="evenodd"
          d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          clipRule="evenodd"
        />
      </svg>
    </span>
  );
}
