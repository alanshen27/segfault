import Link from "next/link";
import Logo from "@/components/Logo";

const FOOTER_LINKS = [
  { href: "/projects", label: "Projects" },
  { href: "/builders", label: "Builders" },
  { href: "/logs", label: "Logs" },
  { href: "/forum", label: "Forum" },
] as const;

export default function Footer() {
  return (
    <footer className="border-t border-neutral-200 dark:border-neutral-800 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-neutral-500">
            <Logo />
            <span className="font-semibold text-neutral-700 dark:text-neutral-300">oat.cafe</span>
            <span className="text-neutral-300 dark:text-neutral-700">&middot;</span>
            <span className="font-mono text-xs">learn to build real things with AI</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-neutral-500">
            {FOOTER_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="hover:text-neutral-900 dark:hover:text-white transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <a
              href="https://discord.gg/segfault"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary hover:underline underline-offset-4"
            >
              Discord
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
