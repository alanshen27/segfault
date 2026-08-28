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

## Commands

- `/ask <question>` — ask the mentor anything
- `/news` — fresh AI & coding news digest, on demand
- `/resource` — a hand-picked builder resource
- `/meme` — a programming meme

New members get a welcome embed in the server's system channel (requires the
**Server Members Intent** in the Developer Portal).

## Daily posts

Every day, at a random time (12:00–23:00 UTC), the bot posts:

- a short digest of AI/coding news compiled from Hacker News front-page
  stories of the last 24h to the **daily news** channel, and
- a picked learning resource (a Show HN / tool / tutorial from the last week,
  falling back to a programming meme) to the **resources** channel.

Both are posted as formatted embeds. The channel IDs default to the
community's #daily-news and #resources channels and can be overridden via
`DAILY_NEWS_CHANNEL_ID` and `RESOURCES_CHANNEL_ID`.

## Setup

1. Create an application at the [Discord Developer Portal](https://discord.com/developers/applications),
   add a **Bot**, and enable the **Message Content Intent** and
   **Server Members Intent**.
2. Invite it to your server with the `bot` and `applications.commands` scopes
   and permission to read/send messages.
3. Copy `.env.example` to `.env` and fill in `DISCORD_BOT_TOKEN` and
   `OPENAI_API_KEY`. Optionally override `DAILY_NEWS_CHANNEL_ID` / `RESOURCES_CHANNEL_ID`
   (right-click a channel → Copy Channel ID).

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
