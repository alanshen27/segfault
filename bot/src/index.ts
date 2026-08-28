import {
  ChannelType,
  Client,
  Events,
  GatewayIntentBits,
  Partials,
  REST,
  Routes,
  SlashCommandBuilder,
  type Interaction,
  type Message,
} from "discord.js";
import { mentorReply, type HistoryEntry } from "./mentor.js";
import { scheduleDailyPost } from "./daily.js";

const DISCORD_TOKEN = process.env.DISCORD_BOT_TOKEN;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!DISCORD_TOKEN) throw new Error("DISCORD_BOT_TOKEN is not set");
if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is not set");

const COOLDOWN_MS = 5_000;
const lastReplyAt = new Map<string, number>();

function onCooldown(userId: string): boolean {
  const last = lastReplyAt.get(userId) ?? 0;
  if (Date.now() - last < COOLDOWN_MS) return true;
  lastReplyAt.set(userId, Date.now());
  return false;
}

function chunkReply(text: string): string[] {
  const chunks: string[] = [];
  let rest = text;
  while (rest.length > 1900) {
    let cut = rest.lastIndexOf("\n", 1900);
    if (cut < 500) cut = 1900;
    chunks.push(rest.slice(0, cut));
    rest = rest.slice(cut);
  }
  chunks.push(rest);
  return chunks;
}

const CONTEXT_MESSAGES = 20;

async function fetchChannelContext(
  message: Message,
  botUserId: string,
): Promise<HistoryEntry[]> {
  try {
    const fetched = await message.channel.messages.fetch({
      limit: CONTEXT_MESSAGES,
      before: message.id,
    });
    return [...fetched.values()]
      .sort((a, b) => a.createdTimestamp - b.createdTimestamp)
      .filter((m) => m.content.trim().length > 0)
      .map((m) =>
        m.author.id === botUserId
          ? { role: "assistant" as const, content: m.content }
          : {
              role: "user" as const,
              name: m.author.displayName,
              content: m.content,
            },
      );
  } catch (error) {
    console.error("Failed to fetch channel context:", error);
    return [];
  }
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
  ],
  partials: [Partials.Channel],
});

const askCommand = new SlashCommandBuilder()
  .setName("ask")
  .setDescription("Ask the segfault mentor anything about building with AI")
  .addStringOption((option) =>
    option
      .setName("question")
      .setDescription("What are you stuck on?")
      .setRequired(true)
      .setMaxLength(1500),
  );

async function registerCommands(applicationId: string): Promise<void> {
  const rest = new REST().setToken(DISCORD_TOKEN!);
  await rest.put(Routes.applicationCommands(applicationId), {
    body: [askCommand.toJSON()],
  });
}

client.once(Events.ClientReady, async (readyClient) => {
  console.log(`Mentor online as ${readyClient.user.tag}`);
  try {
    await registerCommands(readyClient.user.id);
    console.log("Slash commands registered");
  } catch (error) {
    console.error("Failed to register slash commands:", error);
  }
  scheduleDailyPost(client);
});

client.on(Events.InteractionCreate, async (interaction: Interaction) => {
  if (!interaction.isChatInputCommand() || interaction.commandName !== "ask") {
    return;
  }
  const question = interaction.options.getString("question", true);
  await interaction.deferReply();
  try {
    const reply = await mentorReply(
      interaction.channelId,
      interaction.user.displayName,
      question,
    );
    const [first, ...rest] = chunkReply(reply);
    await interaction.editReply(first);
    for (const chunk of rest) {
      await interaction.followUp(chunk);
    }
  } catch (error) {
    console.error("Mentor error (slash):", error);
    await interaction.editReply(
      "Something broke on my end — try again in a minute.",
    );
  }
});

client.on(Events.MessageCreate, async (message: Message) => {
  if (message.author.bot || !client.user) return;

  const isDM = message.channel.type === ChannelType.DM;
  const isMentioned = message.mentions.users.has(client.user.id);
  let isReplyToBot = false;
  if (!isDM && !isMentioned && message.reference?.messageId) {
    try {
      const referenced = await message.fetchReference();
      isReplyToBot = referenced.author.id === client.user.id;
    } catch {
      isReplyToBot = false;
    }
  }
  if (!isDM && !isMentioned && !isReplyToBot) return;
  if (onCooldown(message.author.id)) return;

  const content = message.content
    .replaceAll(`<@${client.user.id}>`, "")
    .trim();
  if (!content) return;

  try {
    if ("sendTyping" in message.channel) {
      await message.channel.sendTyping();
    }
    const context = await fetchChannelContext(message, client.user.id);
    const reply = await mentorReply(
      message.channelId,
      message.author.displayName,
      content,
      context.length > 0 ? context : undefined,
    );
    for (const chunk of chunkReply(reply)) {
      await message.reply(chunk);
    }
  } catch (error) {
    console.error("Mentor error (message):", error);
    await message.reply("Something broke on my end — try again in a minute.");
  }
});

client.login(DISCORD_TOKEN);
