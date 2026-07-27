function extractResponseText(apiResponse) {
  if (typeof apiResponse.output_text === "string") {
    return apiResponse.output_text.trim();
  }

  const textParts = [];

  for (const outputItem of apiResponse.output || []) {
    for (const contentItem of outputItem.content || []) {
      if (
        contentItem.type === "output_text" &&
        typeof contentItem.text === "string"
      ) {
        textParts.push(contentItem.text);
      }
    }
  }

  return textParts.join("\n").trim();
}

function splitDiscordMessage(text, maximumLength = 1900) {
  const parts = [];
  let remaining = text.trim();

  while (remaining.length > maximumLength) {
    let splitAt = remaining.lastIndexOf("\n", maximumLength);

    if (splitAt < maximumLength / 2) {
      splitAt = remaining.lastIndexOf(" ", maximumLength);
    }

    if (splitAt < maximumLength / 2) {
      splitAt = maximumLength;
    }

    parts.push(remaining.slice(0, splitAt).trim());
    remaining = remaining.slice(splitAt).trim();
  }

  if (remaining) parts.push(remaining);

  return parts;
}

function cleanDiscordMentions(text, clientUserId) {
  return text
    .replaceAll(`<@${clientUserId}>`, "Cyra")
    .replaceAll(`<@!${clientUserId}>`, "Cyra")
    .replaceAll("@everyone", "everyone")
    .replaceAll("@here", "here")
    .trim();
}

function getDisplayName(messageOrInteraction) {
  const member = messageOrInteraction.member;
  const user = messageOrInteraction.author || messageOrInteraction.user;

  return (
    member?.displayName ||
    user?.globalName ||
    user?.displayName ||
    user?.username ||
    "Unknown admin"
  );
}

module.exports = {
  cleanDiscordMentions,
  extractResponseText,
  getDisplayName,
  splitDiscordMessage,
};
