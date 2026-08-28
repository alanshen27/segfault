import type { ReactNode } from "react";
import Link from "next/link";
import { CHANNELS, DISCORD_URL, type Channel } from "@/lib/site";

function ChannelLink({ channel, active }: { channel: Channel; active?: boolean }) {
  const className = `flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
    active
      ? "bg-primary-light text-ink"
      : "text-neutral-600 dark:text-neutral-400 hover:bg-primary-light hover:text-ink dark:hover:text-ink"
  }`;
  const inner = (
    <>
      <span aria-hidden>{channel.emoji}</span>
      <span className="font-mono text-[13px]"># {channel.label}</span>
    </>
  );
  if ("external" in channel && channel.external) {
    return (
      <a href={channel.href} target="_blank" rel="noopener noreferrer" className={className}>
        {inner}
      </a>
    );
  }
  return (
    <Link href={channel.href} className={className}>
      {inner}
    </Link>
  );
}

interface CafeShellProps {
  active?: Channel["label"];
  children: ReactNode;
}

export default function CafeShell({ active, children }: CafeShellProps) {
  return (
    <div className="bg-paper text-ink">
      <div className="max-w-6xl mx-auto px-4 py-8 sm:py-10 grid grid-cols-[minmax(0,1fr)] lg:grid-cols-[240px_minmax(0,1fr)] gap-8 items-start">
        <aside className="hidden lg:block sticky top-24 space-y-4">
          <div className="rounded-2xl border border-primary-200/70 dark:border-neutral-800 bg-card p-4">
            <p className="font-display text-lg leading-tight">
              buildwith.coffee <span aria-hidden>☕</span>
            </p>
            <p className="mt-1.5 text-[13px] leading-relaxed text-neutral-500">
              a café for young builders learning to ship real things with AI.
            </p>
          </div>
          <nav
            aria-label="community channels"
            className="rounded-2xl border border-primary-200/70 dark:border-neutral-800 bg-card p-2"
          >
            <p className="px-3 pt-2 pb-1 font-mono text-[11px] lowercase tracking-[0.18em] text-neutral-400">
              channels
            </p>
            {CHANNELS.map((channel) => (
              <ChannelLink
                key={channel.label}
                channel={channel}
                active={channel.label === active}
              />
            ))}
          </nav>
          <a
            href={DISCORD_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-center rounded-xl bg-ink text-paper text-sm font-medium px-4 py-2.5 hover:bg-primary transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            join the discord
          </a>
        </aside>

        <div className="min-w-0 space-y-5">
          <div className="lg:hidden -mx-4 px-4 flex gap-2 overflow-x-auto pb-1">
            {CHANNELS.map((channel) =>
              "external" in channel && channel.external ? (
                <a
                  key={channel.label}
                  href={channel.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 rounded-full border border-primary-200/70 dark:border-neutral-800 bg-card px-3.5 py-1.5 font-mono text-xs text-neutral-600 dark:text-neutral-400"
                >
                  {channel.emoji} # {channel.label}
                </a>
              ) : (
                <Link
                  key={channel.label}
                  href={channel.href}
                  className={`shrink-0 rounded-full border px-3.5 py-1.5 font-mono text-xs ${
                    channel.label === active
                      ? "border-primary bg-primary-light text-ink"
                      : "border-primary-200/70 dark:border-neutral-800 bg-card text-neutral-600 dark:text-neutral-400"
                  }`}
                >
                  {channel.emoji} # {channel.label}
                </Link>
              ),
            )}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
