# segfault mentor bot

Always-on Discord AI mentor for the segfault community. Answers questions about
vibe coding, reviews approaches, and nudges people toward shipping.

## How it responds

- **`/ask <question>`** — slash command, works in any channel the bot can see.
- **@mention** — mention the bot in a message and it replies in-channel.
- **DMs** — message the bot directly.

It keeps a short rolling memory per channel so follow-up questions have
context, and rate-limits replies per user (5s cooldown) to prevent spam.

## Setup

1. Create an application at the [Discord Developer Portal](https://discord.com/developers/applications),
   add a **Bot**, and enable the **Message Content Intent**.
2. Invite it to your server with the `bot` and `applications.commands` scopes
   and permission to read/send messages.
3. Copy `.env.example` to `.env` and fill in `DISCORD_BOT_TOKEN` and
   `OPENAI_API_KEY`.

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
