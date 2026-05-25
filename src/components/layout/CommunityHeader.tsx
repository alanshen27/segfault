import type { ReactNode } from "react";
import CommunityIcon from "@/components/CommunityIcon";

interface CommunityHeaderProps {
  name: string;
  description?: string | null;
  color: string;
  iconUrl?: string | null;
  bannerUrl?: string | null;
  actions?: ReactNode;
}

export default function CommunityHeader({
  name,
  description,
  color,
  iconUrl,
  bannerUrl,
  actions,
}: CommunityHeaderProps) {
  return (
    <div className="mb-6">
      <div className="relative h-32 sm:h-40">
        <div className="absolute inset-0 overflow-hidden rounded-b-2xl">
          {bannerUrl ? (
            <img
              src={bannerUrl}
              alt=""
              className="w-full h-full object-cover object-center"
            />
          ) : (
            <div
              className="w-full h-full"
              style={{
                background: `linear-gradient(135deg, ${color} 0%, ${color}66 50%, ${color}33 100%)`,
              }}
            />
          )}
          <div
            className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent"
            aria-hidden
          />
        </div>

        <div className="absolute left-0 bottom-0 z-20 translate-y-1/2">
          <CommunityIcon
            name={name}
            iconUrl={iconUrl}
            color={color}
            size="xl"
            className="ring-4 ring-white dark:ring-neutral-950 shadow-md"
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mt-12 sm:mt-3 sm:pl-24">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            s/{name}
          </h1>
          {description && (
            <p className="text-sm text-neutral-500 mt-1 leading-relaxed max-w-2xl">
              {description}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2 shrink-0">{actions}</div>
        )}
      </div>
    </div>
  );
}
