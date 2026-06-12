import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Avatar from "@/components/Avatar";
import { PageContainer } from "@/components/layout";
import {
  PRIZE_RARITY_COLORS,
  PRIZE_TYPE_COLORS,
  type PrizeRarity,
  type PrizeType,
} from "@/lib/types";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ certificateNo: string }>;
}

async function getAward(certificateNo: string) {
  return prisma.prizeAward.findUnique({
    where: { certificateNo },
    include: {
      prize: true,
      user: { select: { id: true, name: true, avatarUrl: true } },
      awardedBy: { select: { id: true, name: true } },
    },
  });
}

export async function generateMetadata(
  { params }: PageProps,
): Promise<Metadata> {
  const { certificateNo } = await params;
  const award = await getAward(certificateNo);
  if (!award) return { title: "Certificate not found — segfault.zip" };

  const title = `${award.prize.name} — ${award.user.name}`;
  const description = `segfault certified: ${award.reason}`;

  return {
    title: `${title} — segfault.zip`,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: `/certified/${certificateNo}/og`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function CertifiedPage({ params }: PageProps) {
  const { certificateNo } = await params;
  const award = await getAward(certificateNo);
  if (!award) notFound();

  const rarityColor =
    PRIZE_RARITY_COLORS[award.prize.rarity as PrizeRarity] ??
    PRIZE_RARITY_COLORS.COMMON;
  const typeColor =
    PRIZE_TYPE_COLORS[award.prize.type as PrizeType] ??
    PRIZE_TYPE_COLORS.CERTIFICATE;

  const date = new Date(award.awardedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <PageContainer width="narrow" className="py-12">
      <div className="relative overflow-hidden rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
        <div
          className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-amber-50/30 dark:from-primary/10 dark:to-neutral-900"
          aria-hidden
        />
        <div className="relative px-6 py-10 sm:px-10 sm:py-14">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center">
              <svg
                className="w-5 h-5 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                segfault certified
              </p>
              <p className="text-xs text-neutral-400 font-mono">
                #{certificateNo}
              </p>
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            {award.prize.name}
          </h1>
          <p className="text-neutral-500 mt-2 leading-relaxed">
            {award.prize.description}
          </p>

          <div className="flex flex-wrap items-center gap-2 mt-4">
            <span
              className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${rarityColor}`}
            >
              {award.prize.rarity}
            </span>
            <span
              className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${typeColor}`}
            >
              {award.prize.type}
            </span>
          </div>

          <div className="mt-8 pt-6 border-t border-neutral-200 dark:border-neutral-800">
            <p className="text-sm font-medium text-neutral-500 mb-3">
              Awarded to
            </p>
            <div className="flex items-center gap-3">
              <Avatar
                src={award.user.avatarUrl}
                name={award.user.name}
                size="lg"
              />
              <div>
                <p className="font-semibold text-lg">{award.user.name}</p>
                <p className="text-sm text-neutral-500">{award.reason}</p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-400">
            <span>{date}</span>
            {award.awardedBy && (
              <span>Granted by {award.awardedBy.name}</span>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 text-center">
        <a
          href={`/certified/${certificateNo}/og`}
          download={`segfault-${certificateNo}.png`}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          Download certificate
        </a>
      </div>
    </PageContainer>
  );
}
