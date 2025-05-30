import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import fetch from 'node-fetch';

import { ExecuteToolCallOpenApiOperationCbPayload, setupTools } from './tools.generated';

type TaskadeServerOpts = {
  accessToken: string;
};

export class TaskadeMCPServer extends McpServer {
  readonly config: TaskadeServerOpts;

  constructor(opts: TaskadeServerOpts) {
    super({
      name: 'taskade',
      version: '0.0.1',
      capabilities: {
        resources: {},
        tools: {},
      },
    });

    this.config = opts;

    setupTools(this, async (args) => await this.callOperation(args));
  }

  async callOperation(args: ExecuteToolCallOpenApiOperationCbPayload) {
    const apiBase = new URL('https://www.taskade.com/api/v1').toString();

    try {
      const response = await fetch(`${apiBase}${args.url}`, {
        method: args.method,
        body: args.body,
        headers:  {
          ...args.headers,  
          'Authorization': `Bearer ${this.config.accessToken}`
        }
      });

      return await response.json();
    } catch (error) {
      console.error('TASKADE_ACTION_API_CALL_ERROR', error);
      throw error;
    }
  }
}
