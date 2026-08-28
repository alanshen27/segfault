import type { ReactNode } from "react";

interface CafeHeaderProps {
  kicker: string;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
}

export default function CafeHeader({ kicker, title, description, actions }: CafeHeaderProps) {
  return (
    <section className="rounded-2xl border border-primary-200/70 dark:border-neutral-800 bg-card p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] lowercase tracking-[0.18em] text-primary">
            {kicker}
          </p>
          <h1 className="mt-3 font-display text-3xl sm:text-4xl leading-[1.05] lowercase">
            {title}
          </h1>
          {description && (
            <p className="mt-3 max-w-xl text-sm sm:text-base leading-relaxed text-neutral-600 dark:text-neutral-400">
              {description}
            </p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </div>
    </section>
  );
}
