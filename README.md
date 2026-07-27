# Cyra Discord Bot

Every project file is located directly in the repository root.

Cyra is a private Discord bot powered by the xAI Responses API. She:

- Responds when mentioned in one designated admin channel.
- Reads recent channel messages for context.
- Uses xAI web search for current fact-checking when enabled.
- Answers accurately while using a sarcastic, chaotic personality.
- Runs continuously on Railway.
- Includes `/ask`, `/reset`, `/mode`, and `/status` commands.

## Files

```text
.env.example
.gitignore
README.md
package.json
railway.json
config.js
context.js
index.js
prompt.js
utils.js
xai.js
```

## Discord configuration

In the Discord Developer Portal:

1. Open **Bot**.
2. Enable **Message Content Intent**.
3. Give Cyra:
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

1. Upload all files directly into the root of a private GitHub repository.
2. In Railway, create a project using **Deploy from GitHub Repo**.
3. Select the repository.
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

Commands:

- `/ask question:` Ask Cyra directly.
- `/reset` Reset temporary state.
- `/mode` Display Cyra's active personality.
- `/status` Confirm Cyra is online.

## Memory

This release uses rolling context from recent Discord messages. It does not yet save permanent memories to a database. Restarting Railway does not erase messages still available in Discord channel history.
