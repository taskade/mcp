import "dotenv/config";

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable ${name}. See .env.example for setup.`,
    );
  }
  return value;
}

export const config = {
  anthropicApiKey: required("ANTHROPIC_API_KEY"),
  model: process.env.THOR_MODEL ?? "claude-sonnet-5",
  taskadeApiKey: required("TASKADE_API_KEY"),
  slack: {
    botToken: required("SLACK_BOT_TOKEN"),
    appToken: required("SLACK_APP_TOKEN"),
    signingSecret: required("SLACK_SIGNING_SECRET"),
  },
  mcp: {
    command: process.env.TASKADE_MCP_COMMAND ?? "npx",
    args: (process.env.TASKADE_MCP_ARGS ?? "-y,@taskade/mcp-server").split(","),
  },
  maxAgentSteps: Number(process.env.THOR_MAX_STEPS ?? 12),
};
