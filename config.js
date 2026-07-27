function readPositiveInteger(name, fallback, minimum, maximum) {
  const raw = process.env[name];

  if (!raw) return fallback;

  const value = Number.parseInt(raw, 10);

  if (!Number.isInteger(value) || value < minimum || value > maximum) {
    throw new Error(
      `${name} must be an integer between ${minimum} and ${maximum}.`
    );
  }

  return value;
}

function readBoolean(name, fallback) {
  const raw = process.env[name];

  if (raw === undefined) return fallback;

  return ["true", "1", "yes", "on"].includes(raw.toLowerCase());
}

const requiredVariables = [
  "DISCORD_TOKEN",
  "XAI_API_KEY",
  "ADMIN_CHANNEL_ID",
];

for (const variableName of requiredVariables) {
  if (!process.env[variableName]) {
    throw new Error(
      `Missing ${variableName}. Add it to Railway's Variables tab.`
    );
  }
}

const config = Object.freeze({
  discordToken: process.env.DISCORD_TOKEN,
  xaiApiKey: process.env.XAI_API_KEY,
  adminChannelId: process.env.ADMIN_CHANNEL_ID,
  xaiModel: process.env.XAI_MODEL || "grok-4.5",
  contextMessageLimit: readPositiveInteger(
    "CONTEXT_MESSAGE_LIMIT",
    75,
    10,
    100
  ),
  maxOutputTokens: readPositiveInteger(
    "MAX_OUTPUT_TOKENS",
    1800,
    100,
    5000
  ),
  enableWebSearch: readBoolean("ENABLE_WEB_SEARCH", true),
  port: readPositiveInteger("PORT", 3000, 1, 65535),
});

module.exports = { config };
