import { readFileSync } from 'node:fs';

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { TaskadeMCPServer } from './server';

const fetchMock = vi.hoisted(() => vi.fn());

vi.mock('node-fetch', () => ({ default: fetchMock }));

const packageVersion: string = JSON.parse(
  readFileSync(new URL('../package.json', import.meta.url), 'utf8'),
).version;

describe('TaskadeMCPServer API requests', () => {
  let client: Client;

  beforeEach(async () => {
    fetchMock.mockReset();
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({ ok: true }),
      text: async () => '{"ok":true}',
    });

    const server = new TaskadeMCPServer({ accessToken: 'test-access-token' });
    client = new Client({ name: 'test-client', version: '0.0.0' });
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);
  });

  afterEach(async () => {
    await client.close();
  });

  it.each([
    {
      api: 'v1',
      name: 'workspacesGet',
      args: {},
      url: 'https://www.taskade.com/api/v1/workspaces',
    },
    {
      api: 'v2',
      name: 'promptAgent',
      args: { spaceId: 's1', agentId: 'a1', prompt: 'hi' },
      url: 'https://www.taskade.com/api/v2/promptAgent',
    },
  ])('names the package and its version on a $api tool call', async ({ name, args, url }) => {
    const result = await client.callTool({ name, arguments: args });

    expect(result.isError).toBeFalsy();
    expect(packageVersion).toMatch(/^\d+\.\d+\.\d+/);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [calledUrl, init] = fetchMock.mock.calls[0];
    expect(calledUrl).toBe(url);
    expect(init.headers['User-Agent']).toBe(`taskade-mcp-server/${packageVersion}`);
    expect(init.headers.Authorization).toBe('Bearer test-access-token');
  });
});
