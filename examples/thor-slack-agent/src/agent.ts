import Anthropic from "@anthropic-ai/sdk";
import type {
  MessageParam,
  TextBlockParam,
  ImageBlockParam,
  ToolUseBlockParam,
  ToolResultBlockParam,
  ContentBlock,
} from "@anthropic-ai/sdk/resources/messages";
import { config } from "./config.js";
import { THOR_SYSTEM_PROMPT } from "./prompt.js";
import type { ToolBelt } from "./mcp.js";

type ContentBlockParam =
  | TextBlockParam
  | ImageBlockParam
  | ToolUseBlockParam
  | ToolResultBlockParam;

const anthropic = new Anthropic({ apiKey: config.anthropicApiKey });

export type OnStatus = (text: string) => Promise<void> | void;

export class ThorAgent {
  constructor(private readonly tools: ToolBelt) {}

  /**
   * Runs one turn of the agent for a given conversation. `history` is the prior
   * messages in the thread (mutated in place so callers keep the running
   * transcript). Returns Thor's final natural-language reply.
   */
  async respond(
    history: MessageParam[],
    userText: string,
    onStatus?: OnStatus,
  ): Promise<string> {
    history.push({ role: "user", content: userText });

    for (let step = 0; step < config.maxAgentSteps; step++) {
      const response = await anthropic.messages.create({
        model: config.model,
        max_tokens: 2048,
        system: THOR_SYSTEM_PROMPT,
        tools: this.tools.tools,
        messages: history,
      });

      history.push({
        role: "assistant",
        content: response.content as unknown as ContentBlockParam[],
      });

      const toolUses = response.content.filter(
        (block): block is Extract<ContentBlock, { type: "tool_use" }> =>
          block.type === "tool_use",
      );

      if (response.stop_reason !== "tool_use" || toolUses.length === 0) {
        return textOf(response.content) || "(Thor had nothing to say.)";
      }

      const toolResults: ContentBlockParam[] = [];
      for (const toolUse of toolUses) {
        if (onStatus) await onStatus(`⚡ wielding \`${toolUse.name}\`…`);
        let output: string;
        try {
          output = await this.tools.call(
            toolUse.name,
            (toolUse.input ?? {}) as Record<string, unknown>,
          );
        } catch (error) {
          output = `Tool call threw: ${(error as Error).message}`;
        }
        toolResults.push({
          type: "tool_result",
          tool_use_id: toolUse.id,
          content: output,
        });
      }

      history.push({ role: "user", content: toolResults });
    }

    return "I hit my step limit before finishing that quest. Narrow the request and I'll pick the hammer back up. ⚡";
  }
}

function textOf(content: ContentBlock[]): string {
  return content
    .filter((block): block is Extract<ContentBlock, { type: "text" }> => block.type === "text")
    .map((block) => block.text)
    .join("\n")
    .trim();
}
