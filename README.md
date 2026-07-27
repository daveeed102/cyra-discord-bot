# Cyra Discord Bot

Cyra is a private Discord bot powered by the xAI Responses API. She:

- Responds when mentioned in one designated admin channel.
- Reads recent channel messages for context.
- Uses xAI web search for current fact-checking when enabled.
- Answers accurately while using a sarcastic, chaotic personality.
- Runs continuously on Railway.
- Includes `/ask`, `/reset`, `/mode`, and `/status` commands.

## Discord configuration

In the Discord Developer Portal:

1. Open **Bot**.
2. Enable **Message Content Intent**.
3. Invite the bot with:
   - View Channels
   - Send Messages
   - Read Message History
   - Embed Links
   - Attach Files
   - Add Reactions
4. Keep the admin channel private through Discord channel permissions.

## Railway variables

Add these under the Railway service's **Variables** tab:

```env
DISCORD_TOKEN=...
XAI_API_KEY=...
ADMIN_CHANNEL_ID=...
```

Optional variables:

```env
XAI_MODEL=grok-4.5
CONTEXT_MESSAGE_LIMIT=75
MAX_OUTPUT_TOKENS=1800
ENABLE_WEB_SEARCH=true
```

## Deploy

1. Push all files to a private GitHub repository.
2. In Railway, create a project using **Deploy from GitHub Repo**.
3. Select this repository.
4. Add the Railway variables.
5. Deploy.
6. Open the deployment logs and look for:

```text
Cyra is online as ...
Health server listening on port ...
```

## Using Cyra

Inside the configured admin channel:

```text
@Cyra is this claim actually true?
```

Cyra will read the recent conversation and answer with context.

Commands:

- `/ask question:` Ask Cyra directly.
- `/reset` Clear the current in-memory conversation state.
- `/mode` Display Cyra's active personality.
- `/status` Confirm Cyra is online.

## Notes about memory

This release uses rolling context from recent Discord messages. It does not yet save permanent memories to a database. Because the context is fetched from Discord when needed, restarting Railway does not erase messages still available in the channel history.

A future version can add Supabase for durable summaries, decisions, assignments, and long-term memories.
