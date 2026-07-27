const { config } = require("./config");
const {
  CYRA_SYSTEM_PROMPT,
  buildUserPrompt,
} = require("./prompt");
const { extractResponseText } = require("./utils");

async function askCyra({
  conversation,
  requesterName,
  question,
  source,
}) {
  const requestBody = {
    model: config.xaiModel,
    store: false,
    max_output_tokens: config.maxOutputTokens,
    input: [
      {
        role: "system",
        content: CYRA_SYSTEM_PROMPT,
      },
      {
        role: "user",
        content: buildUserPrompt({
          conversation,
          requesterName,
          question,
          source,
        }),
      },
    ],
  };

  if (config.enableWebSearch) {
    requestBody.tools = [{ type: "web_search" }];
  }

  const response = await fetch("https://api.x.ai/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.xaiApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
    signal: AbortSignal.timeout(360000),
  });

  const rawBody = await response.text();

  if (!response.ok) {
    throw new Error(
      `xAI API error ${response.status}: ${rawBody.slice(0, 2000)}`
    );
  }

  let data;

  try {
    data = JSON.parse(rawBody);
  } catch {
    throw new Error("xAI returned a response that was not valid JSON.");
  }

  const answer = extractResponseText(data);

  if (!answer) {
    throw new Error("xAI returned an empty answer.");
  }

  return answer;
}

module.exports = { askCyra };
