import { spawn } from 'node:child_process';
import { createServer, type IncomingHttpHeaders, type Server as HttpServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import { fileURLToPath } from 'node:url';

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { McpError, ResultSchema } from '@modelcontextprotocol/sdk/types.js';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  createProxyServer,
  HOSTED_MCP_URL,
  hostedServerTransport,
  hostedServerUrl,
  isLegacyMode,
} from './proxy';

// A fake token. Tests never read TASKADE_API_KEY from the environment.
const TOKEN = 'proxy-test-token-0123456789';
const MOCK_INSTRUCTIONS = 'Mock hosted server. Call list_spaces first.';

const MOCK_TOOLS = [
  {
    name: 'list_spaces',
    title: 'List workspaces',
    description: 'List the workspaces of the account.',
    inputSchema: {
      type: 'object',
      properties: { page: { type: 'integer', description: 'Page number' } },
    },
    outputSchema: { type: 'object', properties: { items: { type: 'array' } } },
    annotations: { title: 'List workspaces', readOnlyHint: true, openWorldHint: false },
    _meta: { 'example.com/extra': 'kept' },
  },
  {
    name: 'delete_task',
    title: 'Delete a task',
    inputSchema: { type: 'object', properties: { taskId: { type: 'string' } } },
    annotations: { destructiveHint: true },
  },
];

// An in-process stand-in for the hosted server, with one tool of each kind, one resource and
// one prompt. It uses the low-level Server, so each field reaches the wire as written here.
function createMockHostedServer() {
  const server = new Server(
    { name: 'mock-hosted', version: '9.9.9' },
    {
      capabilities: { tools: { listChanged: true }, resources: {}, prompts: {} },
      instructions: MOCK_INSTRUCTIONS,
    },
  );
  // The mock answers each method in one handler. A typed handler for each method makes
  // TypeScript fail with "excessively deep" on the zod 3.25 types.
  server.fallbackRequestHandler = async ({ method, params = {} }) => {
    const args = (params.arguments ?? {}) as Record<string, unknown>;
    switch (method) {
      case 'tools/list':
        return { tools: MOCK_TOOLS };
      case 'tools/call':
        return params.name === 'list_spaces'
          ? {
              content: [{ type: 'text', text: `spaces page ${args.page ?? 1}` }],
              structuredContent: { items: [{ id: 's1', name: 'Marketing' }] },
            }
          : {
              isError: true,
              content: [{ type: 'text', text: `Task ${args.taskId} was not found.` }],
            };
      case 'resources/list':
        return { resources: [{ uri: 'taskade://getting-started', name: 'getting-started' }] };
      case 'resources/read':
        if (params.uri !== 'taskade://getting-started') {
          throw new McpError(-32002, `Resource ${params.uri} not found`);
        }
        return { contents: [{ uri: params.uri, text: '# Getting started' }] };
      case 'prompts/list':
        return {
          prompts: [{ name: 'weekly_review', arguments: [{ name: 'project', required: true }] }],
        };
      case 'prompts/get':
        return {
          messages: [{ role: 'user', content: { type: 'text', text: `Review ${args.project}` } }],
        };
      default:
        throw new McpError(-32601, 'Method not found');
    }
  };
  return server;
}

type Mock = {
  url: URL;
  headers: IncomingHttpHeaders[];
  setUnauthorized: (value: boolean) => void;
  close: () => Promise<void>;
};

async function startMock(): Promise<Mock> {
  const headers: IncomingHttpHeaders[] = [];
  let unauthorized = false;
  const http: HttpServer = createServer(async (req, res) => {
    headers.push(req.headers);
    if (unauthorized || req.headers.authorization !== `Bearer ${TOKEN}`) {
      res.writeHead(401, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ error: 'Invalid or expired token' }));
      return;
    }
    if (req.method !== 'POST') {
      res.writeHead(405).end();
      return;
    }
    // Stateless mode: one server and one transport for each request.
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
      enableJsonResponse: true,
    });
    res.on('close', () => void transport.close());
    await createMockHostedServer().connect(transport);
    await transport.handleRequest(req, res);
  });
  await new Promise<void>((resolve) => http.listen(0, '127.0.0.1', resolve));
  const { port } = http.address() as AddressInfo;
  return {
    url: new URL(`http://127.0.0.1:${port}/mcp`),
    headers,
    setUnauthorized: (value) => {
      unauthorized = value;
    },
    close: () =>
      new Promise((resolve) => {
        http.closeAllConnections();
        http.close(() => resolve());
      }),
  };
}

async function connectClient(server: Server): Promise<Client> {
  const client = new Client({ name: 'test-client', version: '0.0.0' });
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);
  return client;
}

describe('the stdio proxy to the hosted server', () => {
  let mock: Mock;
  let stderr: string[];
  const clients: Client[] = [];

  beforeAll(async () => {
    mock = await startMock();
  });

  afterAll(async () => {
    await mock.close();
  });

  beforeEach(() => {
    mock.headers.length = 0;
    mock.setUnauthorized(false);
    stderr = [];
    vi.spyOn(console, 'error').mockImplementation((...args) => {
      stderr.push(args.map(String).join(' '));
    });
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    await Promise.all(clients.splice(0).map((client) => client.close()));
    expect(stderr.join('\n')).not.toContain(TOKEN);
  });

  async function startProxy() {
    const proxy = await connectClient(
      await createProxyServer(hostedServerTransport(mock.url, TOKEN)),
    );
    // A client that connects to the mock directly, to compare with the proxy.
    const direct = new Client({ name: 'direct', version: '0.0.0' });
    await direct.connect(
      new StreamableHTTPClientTransport(mock.url, {
        requestInit: { headers: { Authorization: `Bearer ${TOKEN}`, 'User-Agent': 'direct-test' } },
      }),
    );
    // Closing the proxy client also closes the connection of the proxy to the mock.
    clients.push(proxy, direct);
    return { proxy, direct };
  }

  it('passes the instructions and the capabilities of the hosted server through', async () => {
    const { proxy, direct } = await startProxy();

    expect(proxy.getInstructions()).toBe(MOCK_INSTRUCTIONS);
    expect(proxy.getServerCapabilities()).toEqual(direct.getServerCapabilities());
    expect(proxy.getServerCapabilities()).toEqual({
      tools: { listChanged: true },
      resources: {},
      prompts: {},
    });
  });

  it('lists the tools of the hosted server unchanged', async () => {
    const { proxy, direct } = await startProxy();

    const viaProxy = await proxy.request({ method: 'tools/list', params: {} }, ResultSchema);
    const viaDirect = await direct.request({ method: 'tools/list', params: {} }, ResultSchema);

    expect(viaProxy).toEqual(viaDirect);
    expect(viaProxy.tools).toEqual(MOCK_TOOLS);
  });

  it('forwards a tool call and returns its result unchanged', async () => {
    const { proxy, direct } = await startProxy();
    const params = { name: 'list_spaces', arguments: { page: 2 } };

    const viaProxy = await proxy.request({ method: 'tools/call', params }, ResultSchema);
    const viaDirect = await direct.request({ method: 'tools/call', params }, ResultSchema);

    expect(viaProxy).toEqual(viaDirect);
    expect(viaProxy).toEqual({
      content: [{ type: 'text', text: 'spaces page 2' }],
      structuredContent: { items: [{ id: 's1', name: 'Marketing' }] },
    });
  });

  it('forwards a tool error result and a protocol error with their text', async () => {
    const { proxy, direct } = await startProxy();

    const toolError = await proxy.callTool({ name: 'delete_task', arguments: { taskId: 't9' } });
    expect(toolError).toEqual({
      isError: true,
      content: [{ type: 'text', text: 'Task t9 was not found.' }],
    });

    const readMissing = (client: Client) =>
      client.readResource({ uri: 'taskade://missing' }).catch((error: unknown) => error);
    const viaProxy = await readMissing(proxy);
    const viaDirect = await readMissing(direct);
    expect(viaProxy).toMatchObject({ code: (viaDirect as { code: number }).code });
    // The text equals the text of a direct connection. The proxy adds no second prefix.
    expect((viaProxy as Error).message).toBe((viaDirect as Error).message);
    expect((viaProxy as Error).message).toContain('Resource taskade://missing not found');
  });

  it('forwards resources and prompts', async () => {
    const { proxy } = await startProxy();

    const { resources } = await proxy.listResources();
    expect(resources.map((resource) => resource.uri)).toEqual(['taskade://getting-started']);
    const read = await proxy.readResource({ uri: 'taskade://getting-started' });
    expect(read.contents).toEqual([
      { uri: 'taskade://getting-started', text: '# Getting started' },
    ]);

    const { prompts } = await proxy.listPrompts();
    expect(prompts.map((prompt) => prompt.name)).toEqual(['weekly_review']);
    const prompt = await proxy.getPrompt({ name: 'weekly_review', arguments: { project: 'Q4' } });
    expect(prompt.messages).toEqual([
      { role: 'user', content: { type: 'text', text: 'Review Q4' } },
    ]);
  });

  it('forwards a tool list change of the hosted server', async () => {
    // A stateless mock cannot push a notification, so this test links the mock in memory.
    const hostedServer = createMockHostedServer();
    const [toProxy, toHosted] = InMemoryTransport.createLinkedPair();
    await hostedServer.connect(toHosted);
    const proxy = await connectClient(await createProxyServer(toProxy));
    clients.push(proxy);
    const changed = new Promise<string>((resolve) => {
      proxy.fallbackNotificationHandler = async (notification) => resolve(notification.method);
    });

    await hostedServer.sendToolListChanged();

    await expect(changed).resolves.toBe('notifications/tools/list_changed');
  });

  it('sends the token as a Bearer header and names the package on every request', async () => {
    const { proxy } = await startProxy();
    mock.headers.length = 0;

    await proxy.listTools();

    // The direct client of the comparison tests sends its own User-Agent. Skip its requests.
    const fromProxy = mock.headers.filter((header) => header['user-agent'] !== 'direct-test');
    expect(fromProxy.length).toBeGreaterThan(0);
    for (const header of fromProxy) {
      expect(header.authorization).toBe(`Bearer ${TOKEN}`);
      expect(header['user-agent']).toMatch(/^taskade-mcp-server\/\d+\.\d+\.\d+/);
    }
  });

  it('turns a 401 at startup into one clear message without the token', async () => {
    mock.setUnauthorized(true);

    const error = await createProxyServer(hostedServerTransport(mock.url, TOKEN)).catch(
      (e: unknown) => e,
    );

    expect(error).toBeInstanceOf(Error);
    const message = (error as Error).message;
    expect(message).toContain('https://www.taskade.com/settings/api');
    expect(message).toContain('paid Taskade plan');
    expect(message).toContain('--legacy');
    expect(message).toContain('TASKADE_MCP_LEGACY=1');
    expect(message).not.toContain(TOKEN);
    expect(mock.headers).toHaveLength(1);
  });

  it('turns a 401 during a session into the same message', async () => {
    const { proxy } = await startProxy();
    mock.setUnauthorized(true);

    const error = await proxy.listTools().catch((e: unknown) => e);

    expect(String((error as Error).message)).toContain('https://www.taskade.com/settings/api');
    expect(String((error as Error).message)).not.toContain(TOKEN);
    expect(stderr.join('\n')).toContain('--legacy');
  });
});

describe('the mode and the address of the server', () => {
  it('starts legacy mode only with --legacy or TASKADE_MCP_LEGACY', () => {
    expect(isLegacyMode([], {})).toBe(false);
    expect(isLegacyMode(['--legacy'], {})).toBe(true);
    expect(isLegacyMode([], { TASKADE_MCP_LEGACY: '1' })).toBe(true);
    expect(isLegacyMode([], { TASKADE_MCP_LEGACY: 'true' })).toBe(true);
    expect(isLegacyMode([], { TASKADE_MCP_LEGACY: '0' })).toBe(false);
    expect(isLegacyMode([], { TASKADE_MCP_LEGACY: '' })).toBe(false);
  });

  it('uses the hosted server unless TASKADE_MCP_URL names another one', () => {
    expect(hostedServerUrl(undefined).href).toBe(HOSTED_MCP_URL);
    expect(hostedServerUrl('').href).toBe(HOSTED_MCP_URL);
    expect(hostedServerUrl('https://example.com/mcp').href).toBe('https://example.com/mcp');
    expect(hostedServerUrl('http://127.0.0.1:4000/mcp').href).toBe('http://127.0.0.1:4000/mcp');
    expect(hostedServerUrl('http://localhost:4000/mcp').href).toBe('http://localhost:4000/mcp');
  });

  it('refuses an address that is not https, except a loopback address', () => {
    for (const value of ['http://example.com/mcp', 'ftp://example.com/mcp', 'not a url']) {
      expect(() => hostedServerUrl(value)).toThrow('TASKADE_MCP_URL');
    }
  });
});

// These tests start the command line entry point in a child process, the way an MCP client does.
describe('the command line entry point', () => {
  const cli = fileURLToPath(new URL('./cli.ts', import.meta.url));
  let mock: Mock;

  beforeAll(async () => {
    mock = await startMock();
  });

  afterAll(async () => {
    await mock.close();
  });

  // Sends initialize and tools/list over stdin, then closes stdin and waits for the exit.
  function runCli(args: string[], env: NodeJS.ProcessEnv) {
    return new Promise<{ code: number | null; stdout: string; stderr: string }>(
      (resolve, reject) => {
        const child = spawn(process.execPath, ['--import', 'tsx', cli, ...args], {
          env: { PATH: process.env.PATH ?? '', ...env },
          stdio: ['pipe', 'pipe', 'pipe'],
        });
        let stdout = '';
        let stderr = '';
        child.stdout.on('data', (chunk) => {
          stdout += chunk;
          if (stdout.includes('"id":2')) {
            child.stdin.end();
          }
        });
        child.stderr.on('data', (chunk) => (stderr += chunk));
        child.on('error', reject);
        child.on('exit', (code) => resolve({ code, stdout, stderr }));
        const send = (message: object) => child.stdin.write(`${JSON.stringify(message)}\n`);
        send({
          jsonrpc: '2.0',
          id: 1,
          method: 'initialize',
          params: {
            protocolVersion: '2025-06-18',
            capabilities: {},
            clientInfo: { name: 'cli-test', version: '0.0.0' },
          },
        });
        send({ jsonrpc: '2.0', method: 'notifications/initialized' });
        send({ jsonrpc: '2.0', id: 2, method: 'tools/list', params: {} });
      },
    );
  }

  function toolNames(stdout: string): string[] {
    const response = stdout
      .split('\n')
      .filter(Boolean)
      .map((line) => JSON.parse(line))
      .find((message) => message.id === 2);
    return response.result.tools.map((tool: { name: string }) => tool.name);
  }

  it('serves the tools of the hosted server by default, and exits when stdin closes', async () => {
    const { code, stdout, stderr } = await runCli([], {
      TASKADE_API_KEY: TOKEN,
      TASKADE_MCP_URL: mock.url.href,
    });

    expect(toolNames(stdout)).toEqual(['list_spaces', 'delete_task']);
    expect(code).toBe(0);
    expect(stderr).not.toContain(TOKEN);
  }, 30_000);

  it('exits with the clear message when the hosted server answers 401', async () => {
    const { code, stdout, stderr } = await runCli([], {
      TASKADE_API_KEY: 'wrong-token-0123456789',
      TASKADE_MCP_URL: mock.url.href,
    });

    expect(code).toBe(1);
    expect(stdout).toBe('');
    expect(stderr).toContain('https://www.taskade.com/settings/api');
    expect(stderr).toContain('--legacy');
    expect(stderr).not.toContain('wrong-token-0123456789');
  }, 30_000);

  it.each([
    { mode: '--legacy', args: ['--legacy'], env: {} },
    { mode: 'TASKADE_MCP_LEGACY=1', args: [], env: { TASKADE_MCP_LEGACY: '1' } },
  ])(
    'serves the same 66 generated tools as version 0.2.1 with $mode',
    async ({ args, env }) => {
      // The URL points at the mock: legacy mode must not call it.
      mock.headers.length = 0;
      const { code, stdout } = await runCli(args, {
        TASKADE_API_KEY: TOKEN,
        TASKADE_MCP_URL: mock.url.href,
        ...env,
      });

      expect(code).toBe(0);
      // The file holds the tool list of version 0.2.1, in order. Legacy mode must not change it.
      await expect(`${JSON.stringify(toolNames(stdout), null, 2)}\n`).toMatchFileSnapshot(
        './__snapshots__/legacy-tool-names.json',
      );
      expect(mock.headers).toHaveLength(0);
    },
    30_000,
  );
});
