import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const FEATURES = [
  {
    title: "Practice problems",
    description:
      "Work through curated challenges in your browser. Write code, run samples, and test your solutions against hidden cases.",
    href: "/questions",
    cta: "Browse problems",
  },
  {
    title: "Ask and discuss",
    description:
      "Stuck on an approach? Share ideas, read editorials, and learn from other coders in the forum.",
    href: "/forum",
    cta: "Visit the forum",
  },
  {
    title: "Learn together",
    description:
      "Join topic-based communities, explore question banks, and contribute problems to help others grow.",
    href: "/banks",
    cta: "Explore banks",
  },
] as const;

export default async function HomePage() {
  const questionCount = await prisma.question.count({ where: { approved: true } });
  const bankCount = await prisma.questionBank.count();
  const postCount = await prisma.forumPost.count();

  return (
    <div className="max-w-5xl mx-auto px-4 py-20 sm:py-28">
      <div className="text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 dark:bg-primary-900/20 text-primary text-sm font-medium">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          A community for coders to learn
        </div>
        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight">
          Learn to code,
          <br />
          <span className="text-primary">together</span>
        </h1>
        <p className="text-lg text-neutral-500 max-w-2xl mx-auto leading-relaxed">
          segfault is where beginners and experienced programmers practice problems,
          discuss solutions, and grow as a community. No setup required — just sign up
          and start learning.
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-4">
          <Link
            href="/signup"
            className="px-6 py-2.5 rounded-lg bg-primary text-white font-medium hover:bg-primary-hover transition-colors shadow-sm"
          >
            Join the community
          </Link>
          <Link
            href="/questions"
            className="px-6 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors font-medium"
          >
            Start practicing
          </Link>
        </div>
      </div>

      <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {FEATURES.map((feature) => (
          <div
            key={feature.title}
            className="p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-primary/40 transition-colors flex flex-col"
          >
            <h2 className="font-semibold text-lg">{feature.title}</h2>
            <p className="text-sm text-neutral-500 mt-2 leading-relaxed flex-1">
              {feature.description}
            </p>
            <Link
              href={feature.href}
              className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline mt-4"
            >
              {feature.cta}
              <span aria-hidden>→</span>
            </Link>
          </div>
        ))}
      </div>

      <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 text-center hover:border-primary/40 transition-colors">
          <div className="text-3xl font-bold text-primary">{questionCount}</div>
          <div className="text-sm text-neutral-500 mt-1">Practice problems</div>
        </div>
        <div className="p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 text-center hover:border-primary/40 transition-colors">
          <div className="text-3xl font-bold text-primary">{bankCount}</div>
          <div className="text-sm text-neutral-500 mt-1">Learning paths</div>
        </div>
        <div className="p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 text-center hover:border-primary/40 transition-colors">
          <div className="text-3xl font-bold text-primary">{postCount}</div>
          <div className="text-sm text-neutral-500 mt-1">Forum posts</div>
        </div>
        <div className="p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 text-center hover:border-primary/40 transition-colors">
          <div className="text-3xl font-bold text-primary">8+</div>
          <div className="text-sm text-neutral-500 mt-1">Languages</div>
        </div>
      </div>

      <div className="mt-20 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-900/40 px-6 py-10 sm:px-10 text-center">
        <h2 className="text-2xl font-bold tracking-tight">Ready to level up?</h2>
        <p className="text-neutral-500 mt-2 max-w-lg mx-auto">
          Create a free account to save your code, run test cases, join discussions,
          and track what you&apos;ve solved.
        </p>
        <div className="flex flex-wrap justify-center gap-3 mt-6">
          <Link
            href="/signup"
            className="px-6 py-2.5 rounded-lg bg-primary text-white font-medium hover:bg-primary-hover transition-colors shadow-sm"
          >
            Sign up free
          </Link>
          <Link
            href="/forum"
            className="px-6 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-white dark:hover:bg-neutral-900 transition-colors font-medium"
          >
            See what others are discussing
          </Link>
        </div>
      </div>
    </div>
  );
}
