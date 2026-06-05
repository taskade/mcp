import { describe, expect, it } from 'vitest';

import { prepareToolCallOperation } from './runtime';

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
