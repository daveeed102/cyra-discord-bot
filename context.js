const { cleanDiscordMentions, getDisplayName } = require("./utils");

async function getRecentConversation({
  channel,
  currentMessageId,
  clientUserId,
  limit,
}) {
  const fetchedMessages = await channel.messages.fetch({ limit });

  return [...fetchedMessages.values()]
    .filter((message) => message.id !== currentMessageId)
    .filter((message) => message.content?.trim())
    .filter(
      (message) =>
        !message.author.bot || message.author.id === clientUserId
    )
    .sort(
      (firstMessage, secondMessage) =>
        firstMessage.createdTimestamp -
        secondMessage.createdTimestamp
    )
    .map((message) => {
      const timestamp = new Date(
        message.createdTimestamp
      ).toLocaleString("en-US", {
        timeZone: "America/Phoenix",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });

      const authorName = getDisplayName(message);
      const content = cleanDiscordMentions(
        message.content,
        clientUserId
      );

      return `[${timestamp}] ${authorName}: ${content}`;
    })
    .join("\n");
}

module.exports = { getRecentConversation };
