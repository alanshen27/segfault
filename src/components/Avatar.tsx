const SIZES = {
  xs: "w-6 h-6 text-[10px]",
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-14 h-14 text-lg",
  xl: "w-20 h-20 text-2xl",
} as const;

interface AvatarProps {
  src?: string | null;
  name: string;
  size?: keyof typeof SIZES;
  className?: string;
}

export default function Avatar({ src, name, size = "md", className = "" }: AvatarProps) {
  const initial = (name.charAt(0) || "?").toUpperCase();

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`${SIZES[size]} rounded-full object-cover shrink-0 bg-neutral-200 dark:bg-neutral-800 ${className}`}
      />
    );
  }

  return (
    <div
      className={`${SIZES[size]} rounded-full shrink-0 bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 font-semibold flex items-center justify-center ${className}`}
      aria-hidden
    >
      {initial}
    </div>
  );
}
