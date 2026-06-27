import { describe, expect, it } from 'vitest';

import {
  OpenAPIToolRuntimeConfig,
  prepareToolCallOperation,
  ToolCallOpenApiOperation,
} from './runtime';

describe('prepareToolCallOperation', () => {
  it('splits input into path params, query params, and JSON body', () => {
    const result = prepareToolCallOperation({
      name: 'taskCreate',
      path: '/projects/{projectId}/tasks/',
      method: 'POST',
      input: { projectId: 'p1', limit: 10, content: 'hello' },
      pathParamKeys: ['projectId'],
      queryParamKeys: ['limit'],
    });

    expect(result.url).toBe('/projects/p1/tasks/?limit=10');
    expect(result.method).toBe('POST');
    expect(JSON.parse(result.body as string)).toEqual({ content: 'hello' });
    expect(result.headers['Content-Type']).toBe('application/json');
  });

  it('omits the body and content-type when there are no body params', () => {
    const result = prepareToolCallOperation({
      name: 'projectGet',
      path: '/projects/{projectId}',
      method: 'GET',
      input: { projectId: 'p1' },
      pathParamKeys: ['projectId'],
      queryParamKeys: [],
    });

    expect(result.url).toBe('/projects/p1');
    expect(result.body).toBeUndefined();
    expect(result.headers['Content-Type']).toBeUndefined();
  });
});

const op: ToolCallOpenApiOperation = {
  name: 'thing',
  path: '/thing',
  method: 'POST',
  input: {},
};

const fakeFetch = (status: number, body: unknown) => async () => ({
  ok: status >= 200 && status < 300,
  status,
  statusText: `Status ${status}`,
  json: async () => body,
  text: async () => (typeof body === 'string' ? body : JSON.stringify(body)),
});

describe('OpenAPIToolRuntimeConfig.executeToolCall', () => {
  it('returns the response body normally on a 2xx', async () => {
    const config = new OpenAPIToolRuntimeConfig({
      url: 'https://example.com',
      fetch: fakeFetch(200, { hello: 'world' }),
    });
    const result = await config.executeToolCall(op);
    expect(result.isError).toBeFalsy();
    expect(JSON.stringify(result.content)).toContain('hello');
  });

  it('surfaces a 401 as isError instead of a fake success', async () => {
    const config = new OpenAPIToolRuntimeConfig({
      url: 'https://example.com',
      fetch: fakeFetch(401, { error: 'Unauthorized' }),
    });
    const result = await config.executeToolCall(op);
    expect(result.isError).toBe(true);
    expect(JSON.stringify(result.content)).toContain('401');
    expect(JSON.stringify(result.content)).toContain('Unauthorized');
  });

  it('surfaces a 500 as isError', async () => {
    const config = new OpenAPIToolRuntimeConfig({
      url: 'https://example.com',
      fetch: fakeFetch(500, 'Internal Server Error'),
    });
    const result = await config.executeToolCall(op);
    expect(result.isError).toBe(true);
    expect(JSON.stringify(result.content)).toContain('500');
  });

  it('surfaces a network/transport failure as isError', async () => {
    const config = new OpenAPIToolRuntimeConfig({
      url: 'https://example.com',
      fetch: async () => {
        throw new Error('ECONNREFUSED');
      },
    });
    const result = await config.executeToolCall(op);
    expect(result.isError).toBe(true);
    expect(JSON.stringify(result.content)).toContain('ECONNREFUSED');
  });
});
