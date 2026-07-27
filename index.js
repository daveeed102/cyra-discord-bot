const http = require("http");
const {
  Client,
  Events,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder,
} = require("discord.js");

const { config } = require("./config");
const { getRecentConversation } = require("./context");
const { askCyra } = require("./xai");
const {
  getDisplayName,
  splitDiscordMessage,
} = require("./utils");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const commands = [
  new SlashCommandBuilder()
    .setName("ask")
    .setDescription("Ask Cyra a question")
    .addStringOption((option) =>
      option
        .setName("question")
        .setDescription("What do you want Cyra to check?")
        .setRequired(true)
        .setMaxLength(2000)
    ),
  new SlashCommandBuilder()
    .setName("reset")
    .setDescription("Reset Cyra's temporary conversation state"),
  new SlashCommandBuilder()
    .setName("mode")
    .setDescription("Show Cyra's current personality mode"),
  new SlashCommandBuilder()
    .setName("status")
    .setDescription("Check whether Cyra is online"),
].map((command) => command.toJSON());

let requestQueue = Promise.resolve();

function queueRequest(task) {
  const result = requestQueue.then(task, task);
  requestQueue = result.catch(() => undefined);
  return result;
}

function isAdminChannel(channelId) {
  return channelId === config.adminChannelId;
}

async function registerGuildCommands(readyClient) {
  const rest = new REST({ version: "10" }).setToken(
    config.discordToken
  );

  for (const guild of readyClient.guilds.cache.values()) {
    await rest.put(
      Routes.applicationGuildCommands(
        readyClient.user.id,
        guild.id
      ),
      { body: commands }
    );

    console.log(
      `Registered slash commands in ${guild.name} (${guild.id}).`
    );
  }
}

async function createContext(channel, currentMessageId) {
  return getRecentConversation({
    channel,
    currentMessageId,
    clientUserId: client.user.id,
    limit: config.contextMessageLimit,
  });
}

async function sendMessageParts({
  firstReply,
  sendFollowUp,
  answer,
}) {
  const parts = splitDiscordMessage(answer);

  await firstReply(parts[0]);

  for (const part of parts.slice(1)) {
    await sendFollowUp(part);
  }
}

client.once(Events.ClientReady, async (readyClient) => {
  console.log(`Cyra is online as ${readyClient.user.tag}.`);

  try {
    await registerGuildCommands(readyClient);
  } catch (error) {
    console.error("Slash-command registration failed:", error);
  }
});

client.on(Events.MessageCreate, async (message) => {
  if (!message.guild) return;
  if (!isAdminChannel(message.channelId)) return;
  if (message.author.bot) return;
  if (!message.mentions.has(client.user)) return;

  const question = message.content
    .replaceAll(`<@${client.user.id}>`, "")
    .replaceAll(`<@!${client.user.id}>`, "")
    .trim();

  if (!question) {
    await message.reply({
      content:
        "You summoned me and then supplied absolutely nothing. Impressive. What are we checking?",
      allowedMentions: {
        repliedUser: false,
        parse: [],
      },
    });
    return;
  }

  await message.channel.sendTyping();

  try {
    const answer = await queueRequest(async () => {
      const conversation = await createContext(
        message.channel,
        message.id
      );

      return askCyra({
        conversation,
        requesterName: getDisplayName(message),
        question,
        source: "Discord mention",
      });
    });

    await sendMessageParts({
      answer,
      firstReply: (content) =>
        message.reply({
          content,
          allowedMentions: {
            repliedUser: false,
            parse: [],
          },
        }),
      sendFollowUp: (content) =>
        message.channel.send({
          content,
          allowedMentions: { parse: [] },
        }),
    });
  } catch (error) {
    console.error("Mention request failed:", error);

    await message.reply({
      content:
        "The request face-planted somewhere between Discord and xAI. Check the Railway logs for the actual crime scene.",
      allowedMentions: {
        repliedUser: false,
        parse: [],
      },
    });
  }
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (!isAdminChannel(interaction.channelId)) {
    await interaction.reply({
      content:
        "I'm restricted to the designated admin channel. Bureaucracy wins again.",
      ephemeral: true,
    });
    return;
  }

  if (interaction.commandName === "status") {
    await interaction.reply({
      content: `Online. Model: \`${config.xaiModel}\`. Web fact-checking: **${
        config.enableWebSearch ? "enabled" : "disabled"
      }**.`,
      ephemeral: true,
    });
    return;
  }

  if (interaction.commandName === "mode") {
    await interaction.reply({
      content:
        "**Mode:** Unhinged fact-checker — sarcasm enabled, hallucinations still not invited.",
      ephemeral: true,
    });
    return;
  }

  if (interaction.commandName === "reset") {
    await interaction.reply({
      content:
        "Temporary state reset. The Discord channel history still exists, because deleting reality seemed excessive.",
      ephemeral: true,
    });
    return;
  }

  if (interaction.commandName !== "ask") return;

  const question = interaction.options.getString(
    "question",
    true
  );

  await interaction.deferReply();

  try {
    const answer = await queueRequest(async () => {
      const conversation = await createContext(
        interaction.channel,
        null
      );

      return askCyra({
        conversation,
        requesterName: getDisplayName(interaction),
        question,
        source: "/ask command",
      });
    });

    await sendMessageParts({
      answer,
      firstReply: (content) =>
        interaction.editReply({
          content,
          allowedMentions: { parse: [] },
        }),
      sendFollowUp: (content) =>
        interaction.followUp({
          content,
          allowedMentions: { parse: [] },
        }),
    });
  } catch (error) {
    console.error("Slash-command request failed:", error);

    await interaction.editReply(
      "The request detonated somewhere between Discord and xAI. Check the Railway logs."
    );
  }
});

const server = http.createServer((request, response) => {
  if (request.url === "/health") {
    response.writeHead(200, {
      "Content-Type": "application/json",
    });
    response.end(
      JSON.stringify({
        status: "ok",
        bot: client.user?.tag || "starting",
        model: config.xaiModel,
        webSearch: config.enableWebSearch,
      })
    );
    return;
  }

  response.writeHead(200, {
    "Content-Type": "text/plain; charset=utf-8",
  });
  response.end("Cyra is running. Against all odds.");
});

server.listen(config.port, () => {
  console.log(`Health server listening on port ${config.port}.`);
});

client.login(config.discordToken).catch((error) => {
  console.error("Discord login failed:", error);
  process.exit(1);
});
