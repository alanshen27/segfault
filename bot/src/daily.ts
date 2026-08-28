import OpenAI from "openai";
import type { Client, TextChannel } from "discord.js";
import { ChannelType, EmbedBuilder } from "discord.js";

const MODEL = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

const NEWS_CHANNEL_ID = process.env.DAILY_NEWS_CHANNEL_ID ?? "1542808944227909684";
const RESOURCES_CHANNEL_ID = process.env.RESOURCES_CHANNEL_ID ?? "1542792389926588489";

export const ESPRESSO = 0x2b2019;

interface MemeApiResponse {
  title?: string;
  url?: string;
  postLink?: string;
  nsfw?: boolean;
  spoiler?: boolean;
}

interface HnHit {
  title: string;
  url: string | null;
  objectID: string;
  points: number;
}

export async function buildMemeEmbed(): Promise<EmbedBuilder | null> {
  const response = await fetch("https://meme-api.com/gimme/ProgrammerHumor");
  if (!response.ok) return null;
  const meme = (await response.json()) as MemeApiResponse;
  if (!meme.url || meme.nsfw || meme.spoiler) return null;
  return new EmbedBuilder()
    .setColor(ESPRESSO)
    .setTitle(meme.title ?? "today's meme")
    .setURL(meme.postLink ?? meme.url)
    .setImage(meme.url)
    .setFooter({ text: "☕ daily meme · r/ProgrammerHumor" })
    .setTimestamp();
}

async function searchHn(
  query: string,
  extraTags: string,
  sinceSeconds: number,
  minPoints: number,
): Promise<{ title: string; url: string }[]> {
  const since = Math.floor(Date.now() / 1000) - sinceSeconds;
  const params = new URLSearchParams({
    query,
    tags: extraTags,
    numericFilters: `created_at_i>${since},points>${minPoints}`,
    hitsPerPage: "8",
  });
  const response = await fetch(`https://hn.algolia.com/api/v1/search?${params}`);
  if (!response.ok) return [];
  const data = (await response.json()) as { hits: HnHit[] };
  return data.hits
    .filter((hit) => hit.title)
    .slice(0, 5)
    .map((hit) => ({
      title: hit.title,
      url: hit.url ?? `https://news.ycombinator.com/item?id=${hit.objectID}`,
    }));
}

async function summarize(
  systemPrompt: string,
  hits: { title: string; url: string }[],
): Promise<string | null> {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const completion = await client.chat.completions.create({
    model: MODEL,
    max_tokens: 600,
    messages: [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: hits.map((hit) => `- ${hit.title}\n  ${hit.url}`).join("\n"),
      },
    ],
  });
  return completion.choices[0]?.message?.content?.trim() ?? null;
}

export async function buildNewsEmbed(): Promise<EmbedBuilder | null> {
  const hits = await searchHn("AI coding", "story", 24 * 60 * 60, 20);
  if (hits.length === 0) return null;
  const digest = await summarize(
    "You write a short, casual news digest for a Discord of young builders learning to ship software with AI. Format each story as a markdown bullet: '- [story title](url) — one-sentence plain-language takeaway.' Use the exact titles and links given. No intro line, no hype, no invented facts, under 1800 characters total.",
    hits,
  );
  if (!digest) return null;
  return new EmbedBuilder()
    .setColor(ESPRESSO)
    .setTitle("☕ daily brew — ai & coding news")
    .setDescription(digest)
    .setFooter({ text: "compiled from hacker news · last 24h" })
    .setTimestamp();
}

export async function buildResourceEmbed(): Promise<EmbedBuilder | null> {
  const hits = await searchHn(
    "AI tool OR tutorial OR guide",
    "(story,show_hn)",
    7 * 24 * 60 * 60,
    30,
  );
  if (hits.length === 0) return buildMemeEmbed();
  const pick = hits[Math.floor(Math.random() * hits.length)];
  const pitch = await summarize(
    "You write a one-or-two sentence, casual pitch for a resource shared with a Discord of young builders learning to ship software with AI. Explain plainly why it's worth a look. Do not include any links — just the pitch text. No hype, no invented facts.",
    [pick],
  );
  if (!pitch) return null;
  return new EmbedBuilder()
    .setColor(ESPRESSO)
    .setTitle(`📚 ${pick.title}`)
    .setURL(pick.url)
    .setDescription(pitch)
    .setFooter({ text: "resource of the day" })
    .setTimestamp();
}

const RANDOM_WINDOW_START_UTC = 12;
const RANDOM_WINDOW_END_UTC = 23;

function msUntilNextRandomRun(): number {
  const now = new Date();
  const windowMs =
    (RANDOM_WINDOW_END_UTC - RANDOM_WINDOW_START_UTC) * 60 * 60 * 1000;
  const candidate = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      RANDOM_WINDOW_START_UTC,
    ),
  );
  candidate.setTime(candidate.getTime() + Math.floor(Math.random() * windowMs));
  if (candidate.getTime() <= now.getTime()) {
    candidate.setUTCDate(candidate.getUTCDate() + 1);
  }
  return candidate.getTime() - now.getTime();
}

function scheduleChannelPost(
  client: Client,
  label: string,
  channelId: string,
  buildPost: () => Promise<EmbedBuilder | null>,
): void {
  const run = async () => {
    try {
      const channel = await client.channels.fetch(channelId);
      if (!channel || channel.type !== ChannelType.GuildText) {
        console.error(`${label}: channel ${channelId} is not a text channel`);
      } else {
        const embed = await buildPost();
        if (embed) await (channel as TextChannel).send({ embeds: [embed] });
        else console.error(`${label}: no content from any source`);
      }
    } catch (error) {
      console.error(`${label} post failed:`, error);
    }
    setTimeout(run, msUntilNextRandomRun());
  };

  const delay = msUntilNextRandomRun();
  console.log(`${label} post scheduled in ${Math.round(delay / 60000)} min`);
  setTimeout(run, delay);
}

export function scheduleDailyPost(client: Client): void {
  scheduleChannelPost(client, "daily-news", NEWS_CHANNEL_ID, buildNewsEmbed);
  scheduleChannelPost(
    client,
    "resources",
    RESOURCES_CHANNEL_ID,
    buildResourceEmbed,
  );
}
