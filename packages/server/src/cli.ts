import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

import { TaskadeMCPServer } from './server';

function validateAccessToken(token: string | undefined): string {
  if (!token) {
    console.error(
      'ERROR: TASKADE_API_KEY environment variable is not set.\n\n' +
        'To fix this:\n' +
        '1. Generate a Personal Access Token at: https://www.taskade.com/settings/password\n' +
        '2. Set the environment variable:\n' +
        '   export TASKADE_API_KEY="your_token_here"\n\n' +
        'See SECURITY.md for token handling best practices.',
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
        'Please verify your token at: https://www.taskade.com/settings/password',
    );
    process.exit(1);
  }

  return trimmedToken;
}

async function main() {
  const accessToken = validateAccessToken(process.env.TASKADE_API_KEY);

  const server = new TaskadeMCPServer({
    accessToken,
  });
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error('Taskade MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error in main():', error);
  process.exit(1);
});
