import { describe, expect, it } from 'vitest';

import { deriveToolName, parseOpenApi } from './parser';

describe('deriveToolName', () => {
  it('derives a camelCase name from a flat RPC path (API v2)', () => {
    expect(deriveToolName('post', '/promptAgent')).toBe('promptAgent');
    expect(deriveToolName('post', '/subscribeWebhook')).toBe('subscribeWebhook');
    expect(deriveToolName('post', '/listConversations')).toBe('listConversations');
  });

  it('drops path params and camelCases remaining segments', () => {
    expect(deriveToolName('get', '/media/{mediaId}/content')).toBe('mediaContent');
    expect(deriveToolName('get', '/bundles/{spaceId}/export/zip')).toBe('bundlesExportZip');
  });

  it('camelCases hyphen- and underscore-separated segments', () => {
    expect(deriveToolName('post', '/list-conversations')).toBe('listConversations');
    expect(deriveToolName('get', '/user_profile')).toBe('userProfile');
  });

  it('falls back to the HTTP method for a root or param-only path', () => {
    expect(deriveToolName('get', '/')).toBe('get');
    expect(deriveToolName('POST', '/{id}')).toBe('post');
  });

  it('collides for REST siblings: {param} segments dropped, method ignored (the nameOverrides hazard)', () => {
    // Pins the hazard that motivates nameOverrides: without an override, all four
    // signed-webhook CRUD ops would emit the same tool name.
    expect(deriveToolName('post', '/webhooks')).toBe('webhooks');
    expect(deriveToolName('get', '/webhooks')).toBe('webhooks');
    expect(deriveToolName('get', '/webhooks/{id}')).toBe('webhooks');
    expect(deriveToolName('delete', '/webhooks/{id}')).toBe('webhooks');
  });
});

describe('parseOpenApi name resolution', () => {
  it('prefers operationId when present (API v1, unchanged behavior)', () => {
    const tools = parseOpenApi({
      '/projects': {
        post: { operationId: 'projectCreate', description: 'Create a project', responses: {} },
      },
    } as never);
    expect(tools).toHaveLength(1);
    expect(tools[0].name).toBe('projectCreate');
    expect(tools[0].description).toBe('Create a project');
  });

  it('derives the name from the path and uses summary as description when operationId is absent (API v2)', () => {
    const tools = parseOpenApi({
      '/promptAgent': { post: { summary: 'Prompt an agent', responses: {} } },
    } as never);
    expect(tools).toHaveLength(1);
    expect(tools[0].name).toBe('promptAgent');
    expect(tools[0].description).toBe('Prompt an agent');
  });

  it('falls back to an empty description when neither description nor summary is present', () => {
    const tools = parseOpenApi({
      '/promptAgent': { post: { responses: {} } },
    } as never);
    expect(tools).toHaveLength(1);
    expect(tools[0].description).toBe('');
  });

  it('keeps request-body params when the body schema is nullable (API v2 promptAgent)', () => {
    const tools = parseOpenApi({
      '/promptAgent': {
        post: {
          summary: 'Prompt an agent',
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  nullable: true,
                  properties: {
                    spaceId: { type: 'string' },
                    agentId: { type: 'string' },
                    prompt: { type: 'string' },
                  },
                  required: ['spaceId', 'agentId', 'prompt'],
                },
              },
            },
          },
          responses: {},
        },
      },
    } as never);
    expect(tools).toHaveLength(1);
    expect(Object.keys(tools[0].inputSchema.properties ?? {})).toEqual([
      'spaceId',
      'agentId',
      'prompt',
    ]);
    expect(tools[0].inputSchema.required).toEqual(['spaceId', 'agentId', 'prompt']);
  });

  it('applies nameOverrides keyed by "<lowercase-method> <path>" to disambiguate REST siblings', () => {
    const tools = parseOpenApi(
      {
        '/webhooks': {
          post: { summary: 'Register a signed webhook', responses: {} },
          get: { summary: 'List signed webhooks', responses: {} },
        },
        '/webhooks/{id}': {
          get: { summary: 'Get a signed webhook', responses: {} },
          delete: { summary: 'Delete a signed webhook', responses: {} },
        },
      } as never,
      {
        nameOverrides: {
          'post /webhooks': 'createWebhook',
          'get /webhooks': 'listWebhooks',
          'get /webhooks/{id}': 'getWebhook',
          'delete /webhooks/{id}': 'deleteWebhook',
        },
      },
    );
    expect(tools.map((t) => t.name).sort()).toEqual([
      'createWebhook',
      'deleteWebhook',
      'getWebhook',
      'listWebhooks',
    ]);
  });

  it('without nameOverrides, REST siblings all fall back to the same derived name (collision pinned)', () => {
    const tools = parseOpenApi({
      '/webhooks': {
        post: { responses: {} },
        get: { responses: {} },
      },
      '/webhooks/{id}': {
        get: { responses: {} },
        delete: { responses: {} },
      },
    } as never);
    expect(tools.map((t) => t.name)).toEqual(['webhooks', 'webhooks', 'webhooks', 'webhooks']);
  });

  it('an explicit override beats operationId; unkeyed operations are unaffected', () => {
    const tools = parseOpenApi(
      {
        '/projects': {
          post: { operationId: 'projectCreate', responses: {} },
          get: { operationId: 'projectsList', responses: {} },
        },
      } as never,
      { nameOverrides: { 'post /projects': 'createProject' } },
    );
    expect(tools.map((t) => t.name).sort()).toEqual(['createProject', 'projectsList']);
  });
});
