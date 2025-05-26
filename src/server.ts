import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import { setupTools } from './tools.generated';

export const createServer = () => {
  const server = new McpServer({
    name: 'taskade',
    version: '0.0.1',
    capabilities: {
      resources: {},
      tools: {},
    },
  });

  setupTools(server);
  return server;
};
