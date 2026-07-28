import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import fetch from 'node-fetch';

import { version } from '../package.json';
import { setupTools } from './tools.generated';
import { setupToolsV2 } from './tools.v2.generated';

type TaskadeServerOpts = {
  accessToken: string;
};

export class TaskadeMCPServer extends McpServer {
  readonly config: TaskadeServerOpts;

  constructor(opts: TaskadeServerOpts) {
    super({
      name: 'taskade',
      version,
      capabilities: {
        resources: {},
        tools: {},
      },
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
                text: 'The url to projects is in the format of: https://www.taskade.com/d/{projectId}. You should link all projects in the response to the user.',
              },
            ],
          };
        },
        projectGet: (response) => {
          return {
            content: [
              { type: 'text', text: JSON.stringify(response) },
              {
                type: 'text',
                text: 'The url to this project is: https://www.taskade.com/d/{projectId}. Link it in your response.',
              },
            ],
          };
        },
        projectCreate: (response) => {
          return {
            content: [
              { type: 'text', text: JSON.stringify(response) },
              {
                type: 'text',
                text: 'The url to the new project is: https://www.taskade.com/d/{projectId}. Share the link with the user.',
              },
            ],
          };
        },
        projectCopy: (response) => {
          return {
            content: [
              { type: 'text', text: JSON.stringify(response) },
              {
                type: 'text',
                text: 'The url to the copied project is: https://www.taskade.com/d/{projectId}. Share the link with the user.',
              },
            ],
          };
        },
        projectFromTemplate: (response) => {
          return {
            content: [
              { type: 'text', text: JSON.stringify(response) },
              {
                type: 'text',
                text: 'The url to the new project is: https://www.taskade.com/d/{projectId}. Share the link with the user.',
              },
            ],
          };
        },
        projectShareLinkGet: (response) => {
          return {
            content: [
              { type: 'text', text: JSON.stringify(response) },
              {
                type: 'text',
                text: 'Share these project links with the user so they can share with collaborators.',
              },
            ],
          };
        },
        workspaceCreateProject: (response) => {
          return {
            content: [
              { type: 'text', text: JSON.stringify(response) },
              {
                type: 'text',
                text: 'The url to the new project is: https://www.taskade.com/d/{projectId}. Share the link with the user.',
              },
            ],
          };
        },
        meProjectsGet: (response) => {
          return {
            content: [
              { type: 'text', text: JSON.stringify(response) },
              {
                type: 'text',
                text: 'The url to projects is in the format of: https://www.taskade.com/d/{projectId}. You should link all projects in the response to the user.',
              },
            ],
          };
        },
        taskCreate: (response) => {
          return {
            content: [
              { type: 'text', text: JSON.stringify(response) },
              {
                type: 'text',
                text: 'The url to new tasks is in the format of: https://www.taskade.com/d/{projectId}#node-{taskId}. Share the links with the user.',
              },
            ],
          };
        },
        taskGet: (response) => {
          return {
            content: [
              { type: 'text', text: JSON.stringify(response) },
              {
                type: 'text',
                text: 'The url to this task is: https://www.taskade.com/d/{projectId}#node-{taskId}. Link it in your response.',
              },
            ],
          };
        },
        projectTasksGet: (response) => {
          return {
            content: [
              { type: 'text', text: JSON.stringify(response) },
              {
                type: 'text',
                text: 'The url to tasks is in the format of: https://www.taskade.com/d/{projectId}#node-{taskId}. You should link all tasks in the response to the user.',
              },
            ],
          };
        },
        workspacesGet: (response) => {
          return {
            content: [
              { type: 'text', text: JSON.stringify(response) },
              {
                type: 'text',
                text: 'The url to workspaces is in the format of: https://www.taskade.com/spaces/{workspaceId}. You should link all workspaces in the response to the user.',
              },
            ],
          };
        },
        workspaceFoldersGet: (response) => {
          return {
            content: [
              { type: 'text', text: JSON.stringify(response) },
              {
                type: 'text',
                text: 'The url to workspace folders is in the format of: https://www.taskade.com/spaces/{workspaceId}/subspaces/{folderId}. You should link all folders in the response to the user.',
              },
            ],
          };
        },
        folderAgentGet: (response) => {
          return {
            content: [
              { type: 'text', text: JSON.stringify(response) },
              {
                type: 'text',
                text: 'Agents can be managed at: https://www.taskade.com/agents. Link agents in the response to the user.',
              },
            ],
          };
        },
        folderCreateAgent: (response) => {
          return {
            content: [
              { type: 'text', text: JSON.stringify(response) },
              {
                type: 'text',
                text: 'The agent was created successfully. The user can manage their agents at: https://www.taskade.com/agents',
              },
            ],
          };
        },
        folderAgentGenerate: (response) => {
          return {
            content: [
              { type: 'text', text: JSON.stringify(response) },
              {
                type: 'text',
                text: 'The AI agent was generated successfully. The user can manage their agents at: https://www.taskade.com/agents',
              },
            ],
          };
        },
        agentGet: (response) => {
          return {
            content: [
              { type: 'text', text: JSON.stringify(response) },
              {
                type: 'text',
                text: 'The user can manage this agent at: https://www.taskade.com/agents',
              },
            ],
          };
        },
        agentPublicGet: (response) => {
          return {
            content: [
              { type: 'text', text: JSON.stringify(response) },
              {
                type: 'text',
                text: 'Public agents are accessible at: https://www.taskade.com/a/{publicAgentId}. Share this link with the user.',
              },
            ],
          };
        },
        publicAgentGet: (response) => {
          return {
            content: [
              { type: 'text', text: JSON.stringify(response) },
              {
                type: 'text',
                text: 'This public agent is accessible at: https://www.taskade.com/a/{publicAgentId}. Share this link with the user.',
              },
            ],
          };
        },
      },
    });

    // Taskade API v2 (beta) — additive layer for capabilities v1 lacks (agent chat,
    // webhooks). Same bearer token; base URL is /api/v2. The v1 tools above are
    // unaffected.
    setupToolsV2(this, {
      url: 'https://www.taskade.com/api/v2',
      fetch,
      headers: {
        Authorization: `Bearer ${this.config.accessToken}`,
      },
      normalizeResponse: {
        promptAgent: (response) => {
          return {
            content: [
              { type: 'text', text: JSON.stringify(response) },
              {
                type: 'text',
                text: "This is the agent's reply. Relay it to the user; manage agents at https://www.taskade.com/agents.",
              },
            ],
          };
        },
      },
    });
  }
}
