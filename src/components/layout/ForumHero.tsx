import type { ReactNode } from "react";
import PageContainer from "@/components/layout/PageContainer";

interface ForumHeroProps {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
}

export default function ForumHero({ eyebrow, title, description, actions }: ForumHeroProps) {
  return (
    <div className="pt-8">
      <PageContainer width="wide">
        <div className="rounded-2xl border border-primary-200/70 dark:border-neutral-800 bg-card p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            {eyebrow && (
              <p className="font-mono text-[11px] lowercase tracking-[0.18em] text-primary mb-3">
                {eyebrow}
              </p>
            )}
            <h1 className="text-3xl sm:text-4xl font-display font-semibold tracking-tight lowercase">
              {title}
            </h1>
            {description && (
              <p className="text-neutral-500 mt-2 max-w-xl text-sm sm:text-base">
                {description}
              </p>
            )}
          </div>
          {actions && (
            <div className="flex items-center gap-2 shrink-0">{actions}</div>
          )}
        </div>
        </div>
      </PageContainer>
    </div>
  );
}
