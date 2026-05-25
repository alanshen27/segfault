interface CommunityIconProps {
  name: string;
  iconUrl?: string | null;
  color?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const SIZES = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-14 h-14 text-lg",
  xl: "w-20 h-20 text-2xl",
} as const;

export default function CommunityIcon({
  name,
  iconUrl,
  color = "#D35959",
  size = "md",
  className = "",
}: CommunityIconProps) {
  const initial = (name.charAt(0) || "?").toUpperCase();
  const ring =
    /\bring-/.test(className)
      ? ""
      : "ring-2 ring-white dark:ring-neutral-950";
  const base = `${SIZES[size]} rounded-full shrink-0 ${ring} ${className}`;

  if (iconUrl) {
    return (
      <img
        src={iconUrl}
        alt={name}
        className={`${base} object-cover`}
      />
    );
  }

  return (
    <div
      className={`${base} text-white font-bold flex items-center justify-center`}
      style={{ backgroundColor: color }}
      aria-hidden
    >
      {initial}
    </div>
  );
}
