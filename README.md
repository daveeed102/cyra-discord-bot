# Cyra Discord Bot

This release keeps xAI web search enabled and automatically retries incomplete responses.

## Files

Upload these files directly to the root of the private GitHub repository:

```text
index.js
package.json
.env.example
.gitignore
README.md
```

Do not upload a real `.env` file.

## Railway variables

Add these in Railway under **Variables**:

```env
DISCORD_TOKEN=your_new_discord_bot_token
DISCORD_APP_ID=1531086114142556240
DISCORD_PUBLIC_KEY=your_discord_public_key
DISCORD_SERVER_ID=1069682722982875337
ADMIN_CHANNEL_ID=1069682723884630030

XAI_API_KEY=your_xai_api_key
XAI_MODEL=grok-4.5

PORT=3000
CONTEXT_MESSAGE_LIMIT=75
MAX_OUTPUT_TOKENS=4000
ENABLE_WEB_SEARCH=true
```

The public key is optional for this gateway-based bot, but it is safe to keep as a Railway variable.

## Discord portal

Under **Bot → Privileged Gateway Intents**, enable:

- Message Content Intent

## Expected Railway logs

```text
Cyra boot sequence started.
Attempting Discord login.
Health server listening on port ...
Cyra logged into Discord as Cyra...
Slash commands registered.
```

## Memory

Cyra reads the latest 75 messages in the configured admin channel whenever she is mentioned or `/ask` is used. This is rolling context, not permanent database memory.
