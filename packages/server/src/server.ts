import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import fetch from 'node-fetch';

import { CallOperationOpts, setupTools } from './tools.generated';

function toQueryParams(obj: Record<string, any>): string {
  const params = new URLSearchParams();

  for (const key in obj) {
    const value = obj[key];

    if (value == null) {
      continue;
    }

    if (Array.isArray(value)) {
      value.forEach((v) => params.append(key, String(v)));
    } else if (typeof value === 'object') {
      params.append(key, JSON.stringify(value));
    } else {
      params.append(key, String(value));
    }
  }

  const str = params.toString();

  if (str === '') {
    return '';
  }

  return `?${str}`;
}


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

  async callOperation(args: CallOperationOpts) {
    const queryParamKeys = new Set(args.queryParamKeys ?? []);
    const pathParamKeys = new Set(args.pathParamKeys ?? []);

    const queryParams: Record<string, string> = {};
    const pathParams: Record<string, string> = {};
    const body: Record<string, any> = {};
    const headers: HeadersInit = {};

    for (const [key, value] of Object.entries(args.input)) {
      if (queryParamKeys.has(key)) {
        queryParams[key] = value;
      } else if (pathParamKeys.has(key)) {
        pathParams[key] = value;
      } else {
        body[key] = value;
      }
    }

    let resolvedPath = args.path;

    for (const paramKey of pathParamKeys) {
      resolvedPath = resolvedPath.replace(
        `{${paramKey}}`,
        encodeURIComponent(pathParams[paramKey] ?? ''),
      );
    }

    if (Object.keys(body).length > 0) {
      headers['Accept'] = 'application/json';
      headers['Content-Type'] = 'application/json';
    }

    headers['Authorization'] = `Bearer ${this.config.accessToken}`;
    const apiBase = new URL('https://www.taskade.com/api/v1').toString();
    const url = `${apiBase}${resolvedPath}${toQueryParams(queryParams)}`;

    try {
      const response = await fetch(url, {
        method: args.method,
        body: Object.keys(body).length > 0 ? JSON.stringify(body) : undefined,
        headers,
      });

      return await response.json();
    } catch (error) {
      console.error('TASKADE_ACTION_API_CALL_ERROR', error);
      throw error;
    }
  }
}
