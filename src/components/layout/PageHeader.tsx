import type { ReactNode } from "react";

interface PageHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  eyebrow?: string;
  actions?: ReactNode;
  className?: string;
}

export default function PageHeader({
  title,
  description,
  eyebrow,
  actions,
  className = "",
}: PageHeaderProps) {
  return (
    <div
      className={
        className
          ? `flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 ${className}`
          : "flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8"
      }
    >
      <div>
        {eyebrow && (
          <p className="font-mono text-[11px] lowercase tracking-[0.14em] text-primary mb-2">
            {eyebrow}
          </p>
        )}
        <h1 className="text-3xl sm:text-4xl font-display font-semibold tracking-tight lowercase">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-neutral-500 mt-1">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2 shrink-0">{actions}</div>
      )}
    </div>
  );
}
