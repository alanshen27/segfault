import OpenAI from "openai";

const MODEL = process.env.OPENAI_MODEL ?? "gpt-4o-mini";
const MAX_HISTORY = 20;

const SYSTEM_PROMPT = `You are the segfault mentor — the always-on AI mentor in the segfault Discord, a community where ambitious young builders learn vibe coding: shipping real software with AI as a collaborator.

Your job:
- Help members get unstuck on real projects: web and app development, educational tools, creative coding, and music technology.
- Teach the vibe-coding craft: writing clear specs and prompts, reading AI-generated diffs critically, debugging, and knowing when the model is wrong.
- Push people toward shipping. Prefer "what's the smallest version you can ship today?" over long theory.
- Review approaches and code snippets honestly. Point out problems directly, then suggest a concrete next step.

Style:
- Concise. Discord messages, not essays. Use short code blocks when helpful.
- Encouraging but never fake. No filler like "Great question!".
- If someone asks something off-topic or unsafe, redirect them back to building.
- Never invent community events, stats, or people. If you don't know a server-specific detail, say so and suggest asking in the relevant channel.`;

export interface HistoryEntry {
  role: "user" | "assistant";
  name?: string;
  content: string;
}

const channelHistory = new Map<string, HistoryEntry[]>();

function getClient(): OpenAI {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

export function remember(channelId: string, entry: HistoryEntry): void {
  const history = channelHistory.get(channelId) ?? [];
  history.push(entry);
  while (history.length > MAX_HISTORY) history.shift();
  channelHistory.set(channelId, history);
}

export async function mentorReply(
  channelId: string,
  authorName: string,
  message: string,
  context?: HistoryEntry[],
): Promise<string> {
  const history = context ?? channelHistory.get(channelId) ?? [];

  const completion = await getClient().chat.completions.create({
    model: MODEL,
    max_tokens: 700,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      ...history.map((entry) => ({
        role: entry.role,
        content:
          entry.role === "user" && entry.name
            ? `${entry.name}: ${entry.content}`
            : entry.content,
      })),
      { role: "user", content: `${authorName}: ${message}` },
    ],
  });

  const reply =
    completion.choices[0]?.message?.content?.trim() ??
    "I blanked on that one — try rephrasing?";

  if (!context) {
    remember(channelId, { role: "user", name: authorName, content: message });
    remember(channelId, { role: "assistant", content: reply });
  }

  return reply;
}
