import OpenAI from "openai";
import type { Client, TextChannel } from "discord.js";
import { ChannelType } from "discord.js";

const MODEL = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

const NEWS_CHANNEL_ID = process.env.DAILY_NEWS_CHANNEL_ID ?? "1542808944227909684";
const RESOURCES_CHANNEL_ID = process.env.RESOURCES_CHANNEL_ID ?? "1542792389926588489";

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

async function fetchMeme(): Promise<string | null> {
  const response = await fetch("https://meme-api.com/gimme/ProgrammerHumor");
  if (!response.ok) return null;
  const meme = (await response.json()) as MemeApiResponse;
  if (!meme.url || meme.nsfw || meme.spoiler) return null;
  return `☕ gm builders — today's meme:\n**${meme.title ?? "untitled"}**\n${meme.url}`;
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
    max_tokens: 500,
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

async function fetchNews(): Promise<string | null> {
  const hits = await searchHn("AI coding", "story", 24 * 60 * 60, 20);
  if (hits.length === 0) return null;
  return summarize(
    "You write a short, casual morning digest for a Discord of young builders learning to ship software with AI. One line of intro, then each story as a bullet: a one-sentence plain-language takeaway followed by its link on the same bullet. Keep the links exactly as given. No hype, no invented facts, under 1500 characters total.",
    hits,
  );
}

async function fetchResource(): Promise<string | null> {
  const hits = await searchHn(
    "AI tool OR tutorial OR guide",
    "(story,show_hn)",
    7 * 24 * 60 * 60,
    30,
  );
  if (hits.length === 0) return fetchMeme();
  const pick = hits[Math.floor(Math.random() * hits.length)];
  const summary = await summarize(
    "You write a one-or-two sentence, casual pitch for a resource shared with a Discord of young builders learning to ship software with AI. Explain plainly why it's worth a look. Keep the link exactly as given at the end. No hype, no invented facts.",
    [pick],
  );
  return summary ? `📚 today's resource:\n${summary}` : null;
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
  buildPost: () => Promise<string | null>,
): void {
  const run = async () => {
    try {
      const channel = await client.channels.fetch(channelId);
      if (!channel || channel.type !== ChannelType.GuildText) {
        console.error(`${label}: channel ${channelId} is not a text channel`);
      } else {
        const post = await buildPost();
        if (post) await (channel as TextChannel).send(post);
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
  scheduleChannelPost(client, "daily-news", NEWS_CHANNEL_ID, fetchNews);
  scheduleChannelPost(client, "resources", RESOURCES_CHANNEL_ID, fetchResource);
}
