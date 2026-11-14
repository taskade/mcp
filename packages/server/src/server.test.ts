import { readFileSync } from 'node:fs';

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ENABLED_TASKADE_ACTIONS } from './constants';
import { ENABLED_TASKADE_V2_ACTIONS } from './constants.v2';
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
      method: 'GET',
      url: 'https://www.taskade.com/api/v1/workspaces',
    },
    {
      api: 'v2',
      name: 'promptAgent',
      args: { spaceId: 's1', agentId: 'a1', prompt: 'hi' },
      method: 'POST',
      url: 'https://www.taskade.com/api/v2/promptAgent',
    },
    {
      api: 'v2',
      name: 'setTaskFieldValue',
      args: { projectId: 'p1', taskId: 't1', fieldId: '@da01', value: '2026-12-01' },
      method: 'POST',
      url: 'https://www.taskade.com/api/v2/setTaskFieldValue',
    },
    {
      api: 'v2',
      name: 'createTask',
      args: {
        projectId: 'p1',
        tasks: [
          { contentType: 'text/plain', content: 'Alpha', taskId: null, placement: 'beforeend' },
        ],
      },
      method: 'POST',
      url: 'https://www.taskade.com/api/v2/createTask',
    },
  ])(
    'names the package and its version on a $api tool call',
    async ({ name, args, method, url }) => {
      const result = await client.callTool({ name, arguments: args });

      expect(result.isError).toBeFalsy();
      expect(packageVersion).toMatch(/^\d+\.\d+\.\d+/);
      expect(fetchMock).toHaveBeenCalledTimes(1);

      const [calledUrl, init] = fetchMock.mock.calls[0];
      expect(calledUrl).toBe(url);
      expect(init.method).toBe(method);
      expect(init.headers['User-Agent']).toBe(`taskade-mcp-server/${packageVersion}`);
      expect(init.headers.Authorization).toBe('Bearer test-access-token');
      if (method === 'POST') {
        expect(JSON.parse(init.body)).toEqual(args);
      }
    },
  );

  it('keeps every v1 tool name and adds the v2 tools with their hints', async () => {
    const { tools } = await client.listTools();
    const names = tools.map((tool) => tool.name);

    // A client can call a tool by its name, so a release adds names and never drops one.
    // A change of these counts needs a changelog line that names each tool.
    expect(ENABLED_TASKADE_ACTIONS).toHaveLength(57);
    expect(ENABLED_TASKADE_V2_ACTIONS).toHaveLength(9);
    expect(names).toHaveLength(ENABLED_TASKADE_ACTIONS.length + ENABLED_TASKADE_V2_ACTIONS.length);
    expect(new Set(names).size).toBe(names.length);
    expect(names).toEqual(expect.arrayContaining([...ENABLED_TASKADE_ACTIONS]));
    expect(names).toEqual(expect.arrayContaining([...ENABLED_TASKADE_V2_ACTIONS]));

    const hintsOf = (name: string) => {
      const annotations = tools.find((tool) => tool.name === name)?.annotations;
      return {
        readOnlyHint: annotations?.readOnlyHint,
        destructiveHint: annotations?.destructiveHint,
        idempotentHint: annotations?.idempotentHint,
      };
    };
    expect(hintsOf('listTasks')).toEqual({
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
    });
    expect(hintsOf('createTask')).toEqual({
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
    });
    for (const name of ['setTaskFieldValue', 'renameProject']) {
      expect(hintsOf(name)).toEqual({
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: true,
      });
    }
  });

  it('advertises tools and no resources, and sends only the name and version as serverInfo', () => {
    expect(client.getServerCapabilities()).toEqual({ tools: { listChanged: true } });
    expect(client.getServerVersion()).toEqual({ name: 'taskade', version: packageVersion });
  });
});
