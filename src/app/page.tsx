import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const questionCount = await prisma.question.count({ where: { approved: true } });
  const bankCount = await prisma.questionBank.count();

  return (
    <div className="max-w-4xl mx-auto px-4 py-24">
      <div className="text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 dark:bg-primary-900/20 text-primary text-sm font-medium">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          Open-source competitive programming
        </div>
        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight">
          Competitive Programming
          <br />
          <span className="text-primary">Made Simple</span>
        </h1>
        <p className="text-lg text-neutral-500 max-w-xl mx-auto leading-relaxed">
          Practice with {questionCount}+ curated problems across multiple topics.
          Write code in the browser with Monaco, run against the Piston compiler
          API. Submit your own problems for community review.
        </p>
        <div className="flex justify-center gap-3 pt-4">
          <Link
            href="/questions"
            className="px-6 py-2.5 rounded-lg bg-primary text-white font-medium hover:bg-primary-hover transition-colors shadow-sm"
          >
            Browse Problems
          </Link>
          <Link
            href="/submit"
            className="px-6 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors font-medium"
          >
            Submit a Problem
          </Link>
        </div>
      </div>

      <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 text-center hover:border-primary/40 transition-colors group">
          <div className="text-3xl font-bold text-primary">{questionCount}</div>
          <div className="text-sm text-neutral-500 mt-1">Problems</div>
        </div>
        <div className="p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 text-center hover:border-primary/40 transition-colors group">
          <div className="text-3xl font-bold text-primary">{bankCount}</div>
          <div className="text-sm text-neutral-500 mt-1">Question Banks</div>
        </div>
        <div className="p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 text-center hover:border-primary/40 transition-colors group">
          <div className="text-3xl font-bold text-primary">8+</div>
          <div className="text-sm text-neutral-500 mt-1">Languages</div>
        </div>
      </div>
    </div>
  );
}
