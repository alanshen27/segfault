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
            <span>Find builders. Share projects. Ship weird software.</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-neutral-500">
            <Link href="/projects" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
              Projects
            </Link>
            <Link href="/builders" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
              Builders
            </Link>
            <Link href="/logs" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
              Logs
            </Link>
            <Link href="/forum" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
              Forum
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
