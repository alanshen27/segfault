"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase-client";
import Avatar from "@/components/Avatar";
import Image from "next/image"

interface NavUser {
  email?: string;
  name?: string;
  role?: string;
  avatarUrl?: string | null;
}

const NAV_LINKS = [
  { href: "/questions", label: "Problems" },
  { href: "/banks", label: "Banks" },
  { href: "/forum", label: "Forum" },
  { href: "/submit", label: "Submit" },
] as const;

export default function Navbar() {
  const [user, setUser] = useState<NavUser | null>(null);
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    let active = true;
    const supabase = createClient();
    if (supabase) {
      supabase.auth.getUser().then(
        ({ data }: { data: { user: NavUser | null } }) => {
          if (active) {
            setUser(data.user);
            setMounted(true);
          }
        },
      );
      fetch("/api/me").then((r) => {
        if (r.ok) return r.json();
        return null;
      }).then((me: { role?: string; name?: string; avatarUrl?: string | null } | null) => {
        if (active && me) {
          setUser((prev) => prev ? { ...prev, ...me } : prev);
        }
      }).catch(() => {});
    } else {
      Promise.resolve().then(() => {
        if (active) setMounted(true);
      });
    }
    return () => { active = false; };
  }, []);

  const closeMobileMenu = useCallback(() => {
    setMobileOpen(false);
  }, []);

  const handleSignOut = useCallback(async () => {
    const supabase = createClient();
    await supabase?.auth.signOut();
    setUser(null);
    router.push("/");
    router.refresh();
  }, [router]);

  const isActive = (href: string) => pathname === href;

  const linkClass = (href: string) =>
    `text-sm font-medium transition-colors ${
      isActive(href)
        ? "text-primary"
        : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
    }`;

  const displayName = user?.name ?? user?.email?.split("@")[0] ?? "User";

  const renderAuth = () => {
    if (!mounted) {
      return (
        <>
          <Link href="/login" className="text-sm text-neutral-500">
            Sign In
          </Link>
          <Link
            href="/signup"
            className="text-sm px-4 py-1.5 rounded-lg bg-primary text-white font-medium hover:bg-primary-hover transition-colors"
          >
            Sign Up
          </Link>
        </>
      );
    }
    if (user) {
      return (
        <>
          <Link
            href="/profile"
            className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
          >
            <Avatar src={user.avatarUrl} name={displayName} size="sm" />
            <span className="hidden sm:inline truncate max-w-[120px]">{displayName}</span>
          </Link>
          <button
            onClick={handleSignOut}
            className="text-sm px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            Sign Out
          </button>
        </>
      );
    }
    return (
      <>
        <Link href="/login" className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">
          Sign In
        </Link>
        <Link
          href="/signup"
          className="text-sm px-4 py-1.5 rounded-lg bg-primary text-white font-medium hover:bg-primary-hover transition-colors"
        >
          Sign Up
        </Link>
      </>
    );
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="font-bold text-lg tracking-tight flex items-center gap-2"
          >
            <Image height={20} width={20} src="/logo.png" alt=">_ segfault logo" />
            <span className="text-neutral-900 dark:text-white mb-0.5">segfault</span>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className={linkClass(link.href)}>
                {link.label}
              </Link>
            ))}
            {user && (user.role === "MODERATOR" || user.role === "ADMIN") && (
              <Link href="/moderate" className={linkClass("/moderate")}>
                Moderate
              </Link>
            )}
          </div>
        </div>

        <div className="hidden md:flex items-center gap-3">{renderAuth()}</div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          aria-label="Toggle menu"
        >
          <svg
            className="w-5 h-5 text-neutral-700 dark:text-neutral-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            {mobileOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-4 py-3 space-y-3">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={closeMobileMenu}
              className={`block py-1 ${linkClass(link.href)}`}
            >
              {link.label}
            </Link>
          ))}
          {user && (user.role === "MODERATOR" || user.role === "ADMIN") && (
            <Link href="/moderate" onClick={closeMobileMenu} className={`block py-1 ${linkClass("/moderate")}`}>
              Moderate
            </Link>
          )}
          {user && (
            <Link href="/profile" onClick={closeMobileMenu} className={`block py-1 ${linkClass("/profile")}`}>
              Profile
            </Link>
          )}
          <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800 flex items-center gap-3">
            {renderAuth()}
          </div>
        </div>
      )}
    </nav>
  );
}
