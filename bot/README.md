# segfault mentor bot

Always-on Discord AI mentor for the segfault community. Answers questions about
vibe coding, reviews approaches, and nudges people toward shipping.

## How it responds

- **`/ask <question>`** — slash command, works in any channel the bot can see.
- **@mention** — mention (ping) the bot in a message and it replies in-channel.
- **Reply** — reply to one of the bot's messages and it responds.
- **DMs** — message the bot directly.

When replying in a channel it reads the last 20 messages of the conversation
as context, so it can follow the discussion. DMs keep a short rolling memory.
Replies are rate-limited per user (5s cooldown) to prevent spam.

## Daily morning post

If `DAILY_CHANNEL_ID` is set, the bot posts every morning (default 13:00 UTC,
configurable via `DAILY_POST_HOUR_UTC`) alternating between a programming meme
(from r/ProgrammerHumor) and a short digest of AI/coding news compiled from
Hacker News front-page stories of the last 24h. If one source fails it falls
back to the other.

## Setup

1. Create an application at the [Discord Developer Portal](https://discord.com/developers/applications),
   add a **Bot**, and enable the **Message Content Intent**.
2. Invite it to your server with the `bot` and `applications.commands` scopes
   and permission to read/send messages.
3. Copy `.env.example` to `.env` and fill in `DISCORD_BOT_TOKEN` and
   `OPENAI_API_KEY`. Optionally set `DAILY_CHANNEL_ID` (right-click a channel
   → Copy Channel ID) to enable the daily morning post.

## Run

```bash
npm install
npm run dev      # local development (tsx watch)

npm run build    # compile to dist/
npm start        # run compiled bot
```

## Deployment

Deployed as a Render **worker** via the root `render.yaml` — see the repo root.
Set `DISCORD_BOT_TOKEN` and `OPENAI_API_KEY` in the Render dashboard.
