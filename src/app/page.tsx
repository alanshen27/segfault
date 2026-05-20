import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const questionCount = await prisma.question.count({ where: { approved: true } });
  const bankCount = await prisma.questionBank.count();

  return (
    <div className="max-w-4xl mx-auto px-4 py-24">
      <div className="text-center space-y-6">
        <h1 className="text-5xl font-bold tracking-tight">
          Competitive Programming
          <br />
          <span className="text-neutral-400">Made Simple</span>
        </h1>
        <p className="text-lg text-neutral-500 max-w-xl mx-auto">
          Practice with {questionCount}+ curated problems across multiple topics.
          Write code in the browser with Monaco, run against the Piston compiler
          API. Submit your own problems for community review.
        </p>
        <div className="flex justify-center gap-3 pt-4">
          <Link
            href="/questions"
            className="px-5 py-2.5 rounded-md bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-medium hover:opacity-90 transition-opacity"
          >
            Browse Problems
          </Link>
          <Link
            href="/submit"
            className="px-5 py-2.5 rounded-md border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors font-medium"
          >
            Submit a Problem
          </Link>
        </div>
      </div>

      <div className="mt-20 grid grid-cols-3 gap-4">
        <div className="p-5 rounded-lg border border-neutral-200 dark:border-neutral-800 text-center">
          <div className="text-3xl font-bold">{questionCount}</div>
          <div className="text-sm text-neutral-500 mt-1">Problems</div>
        </div>
        <div className="p-5 rounded-lg border border-neutral-200 dark:border-neutral-800 text-center">
          <div className="text-3xl font-bold">{bankCount}</div>
          <div className="text-sm text-neutral-500 mt-1">Question Banks</div>
        </div>
        <div className="p-5 rounded-lg border border-neutral-200 dark:border-neutral-800 text-center">
          <div className="text-3xl font-bold">8+</div>
          <div className="text-sm text-neutral-500 mt-1">Languages</div>
        </div>
      </div>
    </div>
  );
}
