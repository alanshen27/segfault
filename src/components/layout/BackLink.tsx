import Link from "next/link";
import type { ReactNode } from "react";

interface BackLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
}

export default function BackLink({ href, children, className = "" }: BackLinkProps) {
  const base =
    "inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-primary transition-colors";
  return (
    <Link href={href} className={className ? `${base} ${className}` : base}>
      <svg
        className="w-4 h-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
      </svg>
      {children}
    </Link>
  );
}
