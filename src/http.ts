import url from 'node:url';

import { startHTTPServer } from 'mcp-proxy';

import { TaskadeMCPServer } from './server';

await startHTTPServer({
  createServer: async (req) => {
    const parsedUrl = url.parse(req.url!, true);
    const query = parsedUrl.query;
    const accessToken = query.access_token;

    if (!accessToken || typeof accessToken !== 'string') {
      throw new Error('Access token is required');
    }

    return new TaskadeMCPServer({
      accessToken: accessToken,
    });
  },
  port: 3000,
});
