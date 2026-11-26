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

// The local package can also start with --legacy. The first sentence names the package, because
// the model reads it after the instructions of the hosted server.
export const LEGACY_NOTE =
  'The local package @taskade/mcp-server can also start with --legacy. ' +
  'That mode serves the tools of version 0.2, which work with a Taskade API key on any plan.';

const LOOPBACK_HOSTS = ['127.0.0.1', 'localhost', '[::1]'];

// TASKADE_MCP_URL exists to test the proxy against a mock. The key goes to this address, and a
// project config file can set it, so it accepts only the hosted origin or a loopback host.
export function hostedServerUrl(value: string | undefined): URL {
  const text = value?.trim() || HOSTED_MCP_URL;
  let url: URL;
  try {
    url = new URL(text);
  } catch {
    throw new Error('ERROR: TASKADE_MCP_URL is not a valid URL.');
  }
  const hosted = url.origin === new URL(HOSTED_MCP_URL).origin;
  const loopback =
    LOOPBACK_HOSTS.includes(url.hostname) &&
    (url.protocol === 'http:' || url.protocol === 'https:');
  if ((hosted || loopback) && url.username === '' && url.password === '') {
    return url;
  }
  throw new Error(
    'ERROR: TASKADE_MCP_URL must be on https://www.taskade.com, or on 127.0.0.1, localhost or [::1] for a test.',
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

function unreachableMessage(error: StreamableHTTPError | TypeError): string {
  const cause = (error as { cause?: { code?: unknown } }).cause?.code;
  const detail =
    error instanceof StreamableHTTPError
      ? `HTTP ${error.code}`
      : typeof cause === 'string'
        ? cause
        : 'network error';
  return (
    `ERROR: The local package cannot reach the Taskade MCP server (${detail}).\n\n` +
    'Check the network connection, then restart the server from your MCP client.\n' +
    'Legacy mode works without the hosted server: start the package with --legacy,\n' +
    'or set TASKADE_MCP_LEGACY=1.\n'
  );
}

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
  // The CLI removes the whitespace around the key first. A control character that is still in
  // the key (inside it, or a NUL at an edge) stops the package here. Node puts an invalid
  // header value, with the key, into its error message, so this check comes first.
  const controlCharacter = [...accessToken].some((c) => c < ' ' || c === '\u007f');
  if (controlCharacter) {
    throw new Error(
      'ERROR: TASKADE_API_KEY holds a control character, for example a line break inside it. ' +
        'Copy the token again from https://www.taskade.com/settings/api.',
    );
  }
  return new StreamableHTTPClientTransport(url, {
    requestInit: {
      headers: { Authorization: `Bearer ${accessToken}`, 'User-Agent': USER_AGENT },
    },
  });
}

// Connects to the hosted server, then returns a server for the stdio client.
// - It answers `initialize` and `ping` itself, with the instructions of the hosted server and
//   LEGACY_NOTE after them.
// - It sends every other request of its client to the hosted server. Names, titles,
//   annotations, schemas, results and errors pass through unchanged. A cancel of the client
//   cancels the request on the hosted server.
// - It sends the tools, resources and prompts list_changed notifications of the hosted server
//   to its client. It drops the other notifications of the hosted server (progress, log
//   messages, resource updates) and every notification of its client except a cancel.
// - It does not offer the roots, sampling or elicitation capabilities of its client to the
//   hosted server.
// Its close also closes the connection to the hosted server.
export async function createProxyServer(hostedTransport: Transport): Promise<Server> {
  const upstream = new Client({ name: 'taskade-mcp-server', version });
  try {
    await upstream.connect(hostedTransport);
  } catch (error) {
    if (error instanceof StreamableHTTPError && error.code === 401) {
      throw new Error(UNAUTHORIZED_MESSAGE);
    }
    // An HTTP error answer, or a network failure ("fetch failed").
    if (error instanceof StreamableHTTPError || error instanceof TypeError) {
      throw new Error(unreachableMessage(error));
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
    {
      capabilities,
      instructions: [upstream.getInstructions(), LEGACY_NOTE].filter(Boolean).join('\n\n'),
    },
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
  upstream.fallbackNotificationHandler = async (notification) => {
    if (notification.method.endsWith('/list_changed')) {
      await server.notification(notification as ServerNotification);
    }
  };
  server.onclose = () => void upstream.close();

  return server;
}
