import bolt from "@slack/bolt";
import type { SayFn } from "@slack/bolt";
import type { WebClient } from "@slack/web-api";
import type { MessageParam } from "@anthropic-ai/sdk/resources/messages";
import { config } from "./config.js";
import { connectTaskade } from "./mcp.js";
import { ThorAgent } from "./agent.js";

const { App } = bolt;

interface HandleOptions {
  text: string;
  threadKey: string;
  threadTs?: string;
  say: SayFn;
  client: WebClient;
  channel: string;
}

async function main() {
  const toolBelt = await connectTaskade();
  const agent = new ThorAgent(toolBelt);
  console.log(`⚡ Thor connected to ${toolBelt.tools.length} Taskade tools.`);

  // One running transcript per Slack thread.
  const conversations = new Map<string, MessageParam[]>();
  const historyFor = (key: string): MessageParam[] => {
    let history = conversations.get(key);
    if (!history) {
      history = [];
      conversations.set(key, history);
    }
    return history;
  };

  const app = new App({
    token: config.slack.botToken,
    appToken: config.slack.appToken,
    signingSecret: config.slack.signingSecret,
    socketMode: true,
  });

  async function handle(opts: HandleOptions): Promise<void> {
    const prompt = stripMention(opts.text).trim();
    if (!prompt) return;

    const status = await opts.say({
      text: "⚡ _Thor is on it…_",
      thread_ts: opts.threadTs,
    });

    const post = async (text: string) => {
      if (status.ts) {
        await opts.client.chat.update({ channel: opts.channel, ts: status.ts, text });
      } else {
        await opts.say({ text, thread_ts: opts.threadTs });
      }
    };

    try {
      const reply = await agent.respond(
        historyFor(opts.threadKey),
        prompt,
        (update) => post(update),
      );
      await post(reply);
    } catch (error) {
      await post(`The forge went cold: ${(error as Error).message}`);
    }
  }

  // @Thor mentions in channels.
  app.event("app_mention", async ({ event, say, client }) => {
    const threadTs = event.thread_ts ?? event.ts;
    await handle({
      text: event.text ?? "",
      threadKey: `${event.channel}:${threadTs}`,
      threadTs,
      say,
      client,
      channel: event.channel,
    });
  });

  // Direct messages to Thor.
  app.message(async ({ message, say, client }) => {
    if (message.subtype !== undefined) return;
    if (message.channel_type !== "im") return;
    const threadTs = message.thread_ts ?? message.ts;
    await handle({
      text: message.text ?? "",
      threadKey: `${message.channel}:${threadTs}`,
      threadTs,
      say,
      client,
      channel: message.channel,
    });
  });

  await app.start();
  console.log("⚡ Thor is listening on Slack. Summon him with a mention or a DM.");

  const shutdown = async () => {
    await app.stop();
    await toolBelt.close();
    process.exit(0);
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

function stripMention(text: string): string {
  return text.replace(/<@[^>]+>/g, "").trim();
}

main().catch((error) => {
  console.error("Thor failed to wake:", error);
  process.exit(1);
});
