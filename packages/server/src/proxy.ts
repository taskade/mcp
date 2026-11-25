import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import {
  StreamableHTTPClientTransport,
  StreamableHTTPError,
} from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import type { Transport } from '@modelcontextprotocol/sdk/shared/transport.js';
import {
  McpError,
  ResultSchema,
  type ServerCapabilities,
  type ServerNotification,
  type ServerResult,
} from '@modelcontextprotocol/sdk/types.js';

import { version } from '../package.json';
import { USER_AGENT } from './server';

export const HOSTED_MCP_URL = 'https://www.taskade.com/mcp';

// The client of the proxy owns the timeout. Its cancel reaches the hosted server through the
// abort signal, so this limit only ends a request that nobody cancels.
const FORWARD_TIMEOUT_MS = 15 * 60 * 1000;

export function isLegacyMode(argv: string[], env: NodeJS.ProcessEnv): boolean {
  const flag = (env.TASKADE_MCP_LEGACY ?? '').trim().toLowerCase();
  return argv.includes('--legacy') || flag === '1' || flag === 'true';
}

// TASKADE_MCP_URL exists to test the proxy against a mock. It accepts https, and plain http
// only on the loopback host.
export function hostedServerUrl(value: string | undefined): URL {
  const text = value?.trim() || HOSTED_MCP_URL;
  let url: URL;
  try {
    url = new URL(text);
  } catch {
    throw new Error('ERROR: TASKADE_MCP_URL is not a valid URL.');
  }
  const loopback = url.hostname === '127.0.0.1' || url.hostname === 'localhost';
  if (url.protocol === 'https:' || (url.protocol === 'http:' && loopback)) {
    return url;
  }
  throw new Error(
    'ERROR: TASKADE_MCP_URL must start with https://. Plain http:// works only for 127.0.0.1 and localhost.',
  );
}

const UNAUTHORIZED_MESSAGE =
  'ERROR: The Taskade MCP server refused TASKADE_API_KEY (HTTP 401).\n\n' +
  'To fix this:\n' +
  '1. Create a personal access token at: https://www.taskade.com/settings/api\n' +
  '2. Set it in the TASKADE_API_KEY environment variable.\n\n' +
  'The hosted server works on every paid Taskade plan. It does not work on the Free plan.\n' +
  'To use the tools of version 0.2 with any plan, start the package with --legacy,\n' +
  'or set TASKADE_MCP_LEGACY=1.\n';

// An error from the hosted server keeps its code and its text. McpError adds an "MCP error"
// prefix to the text. The prefix comes off here, because the client of the proxy adds it again.
function forwardedError(error: unknown): Error {
  if (error instanceof StreamableHTTPError && error.code === 401) {
    return new Error(UNAUTHORIZED_MESSAGE);
  }
  if (error instanceof McpError) {
    const prefix = `MCP error ${error.code}: `;
    const text = error.message.startsWith(prefix)
      ? error.message.slice(prefix.length)
      : error.message;
    return Object.assign(new Error(text), { code: error.code, data: error.data });
  }
  return error instanceof Error ? new Error(error.message) : new Error(String(error));
}

export function hostedServerTransport(url: URL, accessToken: string): Transport {
  return new StreamableHTTPClientTransport(url, {
    requestInit: {
      headers: { Authorization: `Bearer ${accessToken}`, 'User-Agent': USER_AGENT },
    },
  });
}

// Connects to the hosted server, then returns a server for the stdio client that sends each
// request to the hosted server, and each notification of the hosted server back to its
// client. Names, titles, annotations, schemas, results and errors pass through unchanged. The
// returned server answers `initialize` and `ping` itself, with the instructions of the hosted
// server. Its close also closes the connection to the hosted server.
export async function createProxyServer(hostedTransport: Transport): Promise<Server> {
  const upstream = new Client({ name: 'taskade-mcp-server', version });
  try {
    await upstream.connect(hostedTransport);
  } catch (error) {
    if (error instanceof StreamableHTTPError && error.code === 401) {
      throw new Error(UNAUTHORIZED_MESSAGE);
    }
    throw error;
  }

  const hosted = upstream.getServerCapabilities() ?? {};
  const capabilities: ServerCapabilities = {};
  if (hosted.tools) {
    capabilities.tools = hosted.tools;
  }
  // The proxy forwards no resource subscription, so it does not offer one.
  if (hosted.resources) {
    capabilities.resources = { listChanged: hosted.resources.listChanged };
  }
  if (hosted.prompts) {
    capabilities.prompts = hosted.prompts;
  }

  const server = new Server(
    { name: 'taskade', version },
    { capabilities, instructions: upstream.getInstructions() },
  );

  // TypeScript cannot resolve the generic type of request() with the zod 3.25 types
  // ("excessively deep"). This plain signature is enough to forward a request.
  const request = upstream.request.bind(upstream) as unknown as (
    request: { method: string; params?: Record<string, unknown> },
    resultSchema: typeof ResultSchema,
    options: { signal: AbortSignal; timeout: number },
  ) => Promise<ServerResult>;

  let reportedUnauthorized = false;
  server.fallbackRequestHandler = async ({ method, params }, extra) => {
    try {
      return await request({ method, params }, ResultSchema, {
        signal: extra.signal,
        timeout: FORWARD_TIMEOUT_MS,
      });
    } catch (error) {
      const forwarded = forwardedError(error);
      // A token that stops working during a session gets the same message, once.
      if (forwarded.message === UNAUTHORIZED_MESSAGE && !reportedUnauthorized) {
        reportedUnauthorized = true;
        console.error(UNAUTHORIZED_MESSAGE);
      }
      throw forwarded;
    }
  };
  // For example notifications/tools/list_changed.
  upstream.fallbackNotificationHandler = (notification) =>
    server.notification(notification as ServerNotification);
  server.onclose = () => void upstream.close();

  return server;
}
