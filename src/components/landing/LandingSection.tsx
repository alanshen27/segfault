import Link from "next/link";
import type { ReactNode } from "react";

interface LandingSectionProps {
  title: string;
  href: string;
  linkLabel: string;
  children: ReactNode;
  className?: string;
}

export default function LandingSection({
  title,
  href,
  linkLabel,
  children,
  className = "mt-16",
}: LandingSectionProps) {
  return (
    <section className={className}>
      <div className="flex items-end justify-between gap-4 mb-5">
        <h2 className="text-xl sm:text-2xl font-display font-semibold tracking-tight">{title}</h2>
        <Link
          href={href}
          className="text-sm font-medium text-primary hover:underline shrink-0"
        >
          {linkLabel}
        </Link>
      </div>
      {children}
    </section>
  );
}
