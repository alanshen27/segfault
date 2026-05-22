import Link from "next/link";
import Logo from "@/components/Logo";

export default function Footer() {
  return (
    <footer className="border-t border-neutral-200 dark:border-neutral-800 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-neutral-500">
            <Logo />
            <span>segfault</span>
            <span className="text-neutral-300 dark:text-neutral-700">&middot;</span>
            <span>A community for coders to learn</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-neutral-500">
            <Link href="/questions" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
              Problems
            </Link>
            <Link href="/banks" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
              Banks
            </Link>
            <Link href="/forum" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
              Forum
            </Link>
            <Link href="/submit" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
              Submit
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
