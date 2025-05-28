import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

import { TaskadeMCPServer } from './server';

async function main() {
  const server = new TaskadeMCPServer({
    accessToken: process.env.TASKADE_API_KEY!,
  });
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error('Taskade MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error in main():', error);
  process.exit(1);
});
