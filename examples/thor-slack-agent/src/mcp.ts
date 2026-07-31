import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import type { Tool as AnthropicTool } from "@anthropic-ai/sdk/resources/messages";
import { config } from "./config.js";

export interface ToolBelt {
  tools: AnthropicTool[];
  call(name: string, input: Record<string, unknown>): Promise<string>;
  close(): Promise<void>;
}

/**
 * Boots the Taskade MCP server as a child process and exposes its tools in the
 * shape the Anthropic Messages API expects. This is what turns Thor from a
 * chatbot into an agent: real, side-effecting tools he can wield on Taskade.
 */
export async function connectTaskade(): Promise<ToolBelt> {
  const transport = new StdioClientTransport({
    command: config.mcp.command,
    args: config.mcp.args,
    env: { ...process.env, TASKADE_API_KEY: config.taskadeApiKey } as Record<string, string>,
  });

  const client = new Client({ name: "thor-slack-agent", version: "1.0.0" });
  await client.connect(transport);

  const { tools } = await client.listTools();

  const anthropicTools: AnthropicTool[] = tools.map((tool) => ({
    name: tool.name,
    description: tool.description ?? "",
    input_schema: tool.inputSchema as AnthropicTool["input_schema"],
  }));

  return {
    tools: anthropicTools,
    async call(name, input) {
      const result = await client.callTool({ name, arguments: input });
      const parts = (result.content ?? []) as Array<{ type: string; text?: string }>;
      const text = parts
        .filter((part) => part.type === "text" && part.text)
        .map((part) => part.text)
        .join("\n")
        .trim();
      if (result.isError) {
        return `Tool "${name}" returned an error:\n${text || "(no details)"}`;
      }
      return text || "(the tool returned no content)";
    },
    async close() {
      await client.close();
    },
  };
}
