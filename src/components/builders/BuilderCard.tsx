import Avatar from "@/components/Avatar";
import PrizeBadge from "@/components/PrizeBadge";
import { type BuilderProfileSummary } from "@/lib/types";

interface BuilderCardProps {
  profile: BuilderProfileSummary;
}

export default function BuilderCard({ profile }: BuilderCardProps) {
  return (
    <div className="p-5 rounded-xl border border-primary-200/70 dark:border-neutral-800 hover:border-primary/40 transition-colors flex flex-col">
      <div className="flex items-center gap-3">
        <Avatar
          src={profile.user.avatarUrl}
          name={profile.user.name}
          size="lg"
        />
        <div className="min-w-0">
          <h3 className="font-semibold truncate flex items-center gap-1">
            {profile.user.name}
            {profile.user.equippedBadge && (
              <PrizeBadge
                name={profile.user.equippedBadge.name}
                rarity={profile.user.equippedBadge.rarity}
              />
            )}
          </h3>
          {profile.school && (
            <p className="text-xs text-neutral-500 truncate">
              {profile.school}
            </p>
          )}
        </div>
      </div>

      {profile.bio && (
        <p className="text-sm text-neutral-500 mt-3 line-clamp-2">
          {profile.bio}
        </p>
      )}

      {profile.openTo.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {profile.openTo.map((o) => (
            <span
              key={o}
              className="text-[10px] px-1.5 py-0.5 rounded bg-primary-50 text-primary dark:bg-primary-900/20 font-medium"
            >
              Open to {o.toLowerCase()}
            </span>
          ))}
        </div>
      )}

      {profile.skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {profile.skills.slice(0, 6).map((s) => (
            <span
              key={s}
              className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400 font-medium"
            >
              {s}
            </span>
          ))}
          {profile.skills.length > 6 && (
            <span className="text-[10px] px-1.5 py-0.5 text-neutral-400">
              +{profile.skills.length - 6} more
            </span>
          )}
        </div>
      )}

      {profile.interests.length > 0 && (
        <div className="mt-2">
          <span className="text-xs text-neutral-400">Interests: </span>
          <span className="text-xs text-neutral-600 dark:text-neutral-300">
            {profile.interests.join(", ")}
          </span>
        </div>
      )}

      <div className="mt-auto pt-4 flex items-center gap-3 text-xs">
        {profile.githubUrl && (
          <a
            href={profile.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
          >
            GitHub
          </a>
        )}
        {profile.linkedinUrl && (
          <a
            href={profile.linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
          >
            LinkedIn
          </a>
        )}
        {profile.websiteUrl && (
          <a
            href={profile.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
          >
            Website
          </a>
        )}
        {profile.timezone && (
          <span className="text-neutral-400 ml-auto">{profile.timezone}</span>
        )}
      </div>
    </div>
  );
}
