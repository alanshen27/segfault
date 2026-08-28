interface LogoProps {
  size?: number;
  className?: string;
}

export default function Logo({ size = 20, className = "" }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="brew.coffee logo"
      className={className}
    >
      <rect width="32" height="32" rx="9" className="fill-primary" />
      <path
        d="M9 13.5h11a1 1 0 0 1 1 1v3.5a5.5 5.5 0 0 1-5.5 5.5h-2A5.5 5.5 0 0 1 8 18v-3.5a1 1 0 0 1 1-1Z"
        className="fill-paper"
      />
      <path
        d="M21 15h1.5a2.5 2.5 0 0 1 0 5H20.4"
        className="stroke-paper"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M12.5 7.5c-.8 1 .8 1.8 0 2.8M16.5 7.5c-.8 1 .8 1.8 0 2.8"
        className="stroke-paper"
        strokeWidth="1.6"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
