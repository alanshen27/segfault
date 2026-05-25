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
    <div className="border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
      <PageContainer width="wide" className="py-8 sm:py-10">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            {eyebrow && (
              <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">
                {eyebrow}
              </p>
            )}
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">{title}</h1>
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
      </PageContainer>
    </div>
  );
}
