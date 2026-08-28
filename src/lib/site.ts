export const DISCORD_URL = "https://discord.gg/RpnJVrzPTj";

export const CHANNELS = [
  { emoji: "🔨", label: "now-building", href: "/projects" },
  { emoji: "☕", label: "coffee-chat", href: DISCORD_URL, external: true },
  { emoji: "📓", label: "build-logs", href: "/logs" },
  { emoji: "🙋", label: "ask-anything", href: "/questions" },
  { emoji: "🧑‍🤝‍🧑", label: "find-teammates", href: "/builders" },
  { emoji: "💬", label: "forum", href: "/forum" },
] as const;

export type Channel = (typeof CHANNELS)[number];
