"use client";

import Link from "next/link";
import {
  PRIZE_RARITY_COLORS,
  type PrizeRarity,
  type PrizeAwardSummary,
} from "@/lib/types";

const RARITY_RING: Record<string, string> = {
  COMMON: "ring-neutral-300 dark:ring-neutral-700",
  RARE: "ring-blue-400 dark:ring-blue-500",
  LEGENDARY: "ring-amber-400 dark:ring-amber-500 animate-pulse",
};

interface TrophyCaseProps {
  awards: PrizeAwardSummary[];
  editable?: boolean;
  onEquip?: (awardId: string, equipped: boolean) => void;
}

export default function TrophyCase({
  awards,
  editable = false,
  onEquip,
}: TrophyCaseProps) {
  if (awards.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-3xl opacity-30 mb-2">🏆</div>
        <p className="text-sm text-neutral-500">No prizes yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {awards.map((award) => {
        const rc =
          PRIZE_RARITY_COLORS[award.prize.rarity as PrizeRarity] ??
          PRIZE_RARITY_COLORS.COMMON;
        const ringClass =
          RARITY_RING[award.prize.rarity] ?? RARITY_RING.COMMON;

        return (
          <div
            key={award.id}
            className={`relative p-4 rounded-xl border bg-card transition-all ${
              award.equipped
                ? `border-transparent ring-2 ${ringClass}`
                : "border-primary-200/70 dark:border-neutral-800"
            }`}
          >
            <Link
              href={`/certified/${award.certificateNo}`}
              className="block group"
            >
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${rc}`}
                >
                  {award.prize.rarity}
                </span>
                {award.equipped && (
                  <span className="text-[10px] font-medium text-primary">
                    Equipped
                  </span>
                )}
              </div>
              <h4 className="font-semibold text-sm group-hover:text-primary transition-colors truncate">
                {award.prize.name}
              </h4>
              <p className="text-xs text-neutral-500 mt-1 line-clamp-1">
                {award.reason}
              </p>
              <p className="text-[10px] text-neutral-400 mt-2">
                {new Date(award.awardedAt).toLocaleDateString("en-US", {
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </Link>
            {editable &&
              (award.prize.type === "BADGE" ||
                award.prize.type === "COSMETIC") && (
                <button
                  type="button"
                  onClick={() => onEquip?.(award.id, !award.equipped)}
                  className={`absolute top-2 right-2 text-[10px] font-medium px-2 py-0.5 rounded-full transition-colors ${
                    award.equipped
                      ? "bg-primary text-white"
                      : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-primary/10 hover:text-primary"
                  }`}
                >
                  {award.equipped ? "Unequip" : "Equip"}
                </button>
              )}
          </div>
        );
      })}
    </div>
  );
}
