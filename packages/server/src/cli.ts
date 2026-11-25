import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

import { createProxyServer, hostedServerTransport, hostedServerUrl, isLegacyMode } from './proxy';
import { TaskadeMCPServer } from './server';

function validateAccessToken(token: string | undefined): string {
  if (!token) {
    console.error(
      'ERROR: TASKADE_API_KEY environment variable is not set.\n\n' +
        'To fix this:\n' +
        '1. Generate a Personal Access Token at: https://www.taskade.com/settings/api\n' +
        '2. Set the environment variable:\n' +
        '   export TASKADE_API_KEY="your_token_here"\n',
    );
    process.exit(1);
  }

  const trimmedToken = token.trim();

  if (trimmedToken.length === 0) {
    console.error('ERROR: TASKADE_API_KEY is empty. Please provide a valid token.');
    process.exit(1);
  }

  if (trimmedToken.length < 10) {
    console.error(
      'ERROR: TASKADE_API_KEY appears to be invalid (too short).\n' +
        'Please verify your token at: https://www.taskade.com/settings/api',
    );
    process.exit(1);
  }

  return trimmedToken;
}

async function main() {
  const accessToken = validateAccessToken(process.env.TASKADE_API_KEY);

  // Legacy mode: the tools that the package generates from the Taskade API v1 and v2.
  if (isLegacyMode(process.argv.slice(2), process.env)) {
    const server = new TaskadeMCPServer({
      accessToken,
    });
    const transport = new StdioServerTransport();
    await server.connect(transport);

    console.error('Taskade MCP Server running on stdio');
    return;
  }

  // Default mode: forward the MCP session to the hosted server.
  const url = hostedServerUrl(process.env.TASKADE_MCP_URL);
  const server = await createProxyServer(hostedServerTransport(url, accessToken));
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
    console.error('Fatal error in main():', error);
  }
  process.exit(1);
});
