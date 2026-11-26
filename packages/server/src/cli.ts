import { inspect } from 'node:util';

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { ErrorCode, isJSONRPCRequest } from '@modelcontextprotocol/sdk/types.js';

import {
  createProxyServer,
  hostedServerTransport,
  hostedServerUrl,
  isLegacyMode,
  LEGACY_NOTE,
} from './proxy';
import { TaskadeMCPServer } from './server';

// Legacy mode prints the message and exits, as version 0.2 did.
function exitWith(message: string): never {
  console.error(message);
  process.exit(1);
}

// Removes the whitespace around the key. `fail` gets the message for a missing or short key.
function validateAccessToken(token: string | undefined, fail: (message: string) => never): string {
  if (!token) {
    fail(
      'ERROR: TASKADE_API_KEY environment variable is not set.\n\n' +
        'To fix this:\n' +
        '1. Generate a Personal Access Token at: https://www.taskade.com/settings/api\n' +
        '2. Set the environment variable:\n' +
        '   export TASKADE_API_KEY="your_token_here"\n',
    );
  }

  const trimmedToken = token.trim();

  if (trimmedToken.length === 0) {
    fail('ERROR: TASKADE_API_KEY is empty. Please provide a valid token.');
  }

  if (trimmedToken.length < 10) {
    fail(
      'ERROR: TASKADE_API_KEY appears to be invalid (too short).\n' +
        'Please verify your token at: https://www.taskade.com/settings/api',
    );
  }

  return trimmedToken;
}

// Most clients show only a failed state when the server exits, and keep stderr in a log. A
// client shows the error of its initialize request, so the message goes there too.
async function answerWithError(text: string): Promise<void> {
  process.exitCode = 1;
  const transport = new StdioServerTransport();
  transport.onmessage = (request) => {
    if (isJSONRPCRequest(request)) {
      void transport
        .send({
          jsonrpc: '2.0',
          id: request.id,
          error: { code: ErrorCode.InternalError, message: text },
        })
        .then(() => transport.close());
    }
  };
  await transport.start();
}

// Cuts the key out of a text, so that no unexpected error shows it.
function withoutKey(text: string): string {
  const key = process.env.TASKADE_API_KEY?.trim();
  return key ? text.split(key).join('<TASKADE_API_KEY>') : text;
}

function throwError(message: string): never {
  throw new Error(message);
}

async function main() {
  // Legacy mode: the tools that the package generates from the Taskade API v1 and v2.
  if (isLegacyMode(process.argv.slice(2), process.env)) {
    const accessToken = validateAccessToken(process.env.TASKADE_API_KEY, exitWith);
    const server = new TaskadeMCPServer({
      accessToken,
    });
    const transport = new StdioServerTransport();
    await server.connect(transport);

    console.error('Taskade MCP Server running on stdio');
    return;
  }

  // Default mode: forward the MCP session to the hosted server. Every failure before the
  // stdio connection goes to stderr and to the initialize request of the client.
  console.error(LEGACY_NOTE);
  let url;
  let server;
  try {
    const accessToken = validateAccessToken(process.env.TASKADE_API_KEY, throwError);
    url = hostedServerUrl(process.env.TASKADE_MCP_URL);
    server = await createProxyServer(hostedServerTransport(url, accessToken));
  } catch (error) {
    const message =
      error instanceof Error && error.message.startsWith('ERROR: ')
        ? error.message
        : `ERROR: The local package could not start: ${withoutKey(String(error))}`;
    console.error(message);
    await answerWithError(message);
    return;
  }
  // The connection to the hosted server keeps the process alive. Close it when the client
  // closes stdin, so the process ends as in legacy mode.
  process.stdin.on('end', () => void server.close());
  await server.connect(new StdioServerTransport());

  console.error(`Taskade MCP Server running on stdio, connected to ${url.origin}${url.pathname}`);
}

main().catch((error) => {
  if (error instanceof Error && error.message.startsWith('ERROR: ')) {
    console.error(error.message);
  } else {
    console.error('Fatal error in main():', withoutKey(inspect(error)));
  }
  process.exit(1);
});
