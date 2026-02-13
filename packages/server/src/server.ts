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
  }
}
