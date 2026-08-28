import OpenAI from "openai";
import type { Client, TextChannel } from "discord.js";
import { ChannelType } from "discord.js";

const MODEL = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

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

async function fetchNews(): Promise<string | null> {
  const since = Math.floor(Date.now() / 1000) - 24 * 60 * 60;
  const query = new URLSearchParams({
    query: "AI coding",
    tags: "story",
    numericFilters: `created_at_i>${since},points>20`,
    hitsPerPage: "8",
  });
  const response = await fetch(
    `https://hn.algolia.com/api/v1/search?${query}`,
  );
  if (!response.ok) return null;
  const data = (await response.json()) as { hits: HnHit[] };
  const hits = data.hits
    .filter((hit) => hit.title)
    .slice(0, 5)
    .map((hit) => ({
      title: hit.title,
      url: hit.url ?? `https://news.ycombinator.com/item?id=${hit.objectID}`,
    }));
  if (hits.length === 0) return null;

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const completion = await client.chat.completions.create({
    model: MODEL,
    max_tokens: 500,
    messages: [
      {
        role: "system",
        content:
          "You write a short, casual morning digest for a Discord of young builders learning to ship software with AI. One line of intro, then each story as a bullet: a one-sentence plain-language takeaway followed by its link on the same bullet. Keep the links exactly as given. No hype, no invented facts, under 1500 characters total.",
      },
      {
        role: "user",
        content: hits
          .map((hit) => `- ${hit.title}\n  ${hit.url}`)
          .join("\n"),
      },
    ],
  });
  return completion.choices[0]?.message?.content?.trim() ?? null;
}

export async function buildDailyPost(): Promise<string | null> {
  const memeDay = new Date().getUTCDate() % 2 === 0;
  const primary = memeDay ? fetchMeme : fetchNews;
  const fallback = memeDay ? fetchNews : fetchMeme;
  try {
    const post = await primary();
    if (post) return post;
  } catch (error) {
    console.error("Daily post primary source failed:", error);
  }
  try {
    return await fallback();
  } catch (error) {
    console.error("Daily post fallback source failed:", error);
    return null;
  }
}

function msUntilNextRun(hourUtc: number): number {
  const now = new Date();
  const next = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), hourUtc),
  );
  if (next.getTime() <= now.getTime()) {
    next.setUTCDate(next.getUTCDate() + 1);
  }
  return next.getTime() - now.getTime();
}

export function scheduleDailyPost(client: Client): void {
  const channelId = process.env.DAILY_CHANNEL_ID;
  if (!channelId) {
    console.log("DAILY_CHANNEL_ID not set — daily morning post disabled");
    return;
  }
  const hourUtc = Number(process.env.DAILY_POST_HOUR_UTC ?? "13");

  const run = async () => {
    try {
      const channel = await client.channels.fetch(channelId);
      if (!channel || channel.type !== ChannelType.GuildText) {
        console.error(`Daily post channel ${channelId} is not a text channel`);
      } else {
        const post = await buildDailyPost();
        if (post) await (channel as TextChannel).send(post);
        else console.error("Daily post: no content from any source");
      }
    } catch (error) {
      console.error("Daily post failed:", error);
    }
    setTimeout(run, msUntilNextRun(hourUtc));
  };

  const delay = msUntilNextRun(hourUtc);
  console.log(
    `Daily post scheduled in ${Math.round(delay / 60000)} min (hour ${hourUtc} UTC)`,
  );
  setTimeout(run, delay);
}
