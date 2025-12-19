import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import fetch from 'node-fetch';

import { setupTools } from './tools.generated';

type TaskadeServerOpts = {
  accessToken: string;
};

export class TaskadeMCPServer extends McpServer {
  readonly config: TaskadeServerOpts;

  constructor(opts: TaskadeServerOpts) {
    super({
      name: 'taskade',
      version: '0.0.1',
    });

    this.config = opts;

    setupTools(this, {
      url: 'https://www.taskade.com/api/v1',
      fetch,
      headers: {
        Authorization: `Bearer ${this.config.accessToken}`,
      },
      normalizeResponse: {
        folderProjectsGet: (response) => {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(response),
              },
              {
                type: 'text',
                text:
                  'The url to projects is in the format of: https://www.taskade.com/d/{projectId}. ' +
                  'You should link all projects in the response to the user.',
              },
            ],
          };
        },
      },
    });
  }
}
