import { describe, expect, it } from 'vitest';

import { deriveToolName, parseOpenApi } from './parser';
import { prepareToolCallOperation } from './runtime';

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
});

describe('parseOpenApi parameter inheritance', () => {
  it('parseOpenApi_inheritsPathAndQueryParametersForEachOperation', () => {
    const tools = parseOpenApi({
      '/projects/{projectId}': {
        parameters: [
          { name: 'projectId', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'limit', in: 'query', schema: { type: 'integer' } },
        ],
        get: { operationId: 'projectGet', responses: {} },
        delete: { operationId: 'projectDelete', responses: {} },
      },
    });

    for (const tool of tools) {
      expect(tool.pathParamsSchema?.required).toEqual(['projectId']);
      expect(tool.pathParamsSchema?.properties).toEqual({ projectId: { type: 'string' } });
      expect(tool.queryParamsSchema?.properties).toEqual({ limit: { type: 'integer' } });

      const request = prepareToolCallOperation({
        name: tool.name,
        path: tool.path,
        method: 'GET',
        input: { projectId: 'project/one', limit: 10 },
        pathParamKeys: Object.keys(tool.pathParamsSchema?.properties ?? {}),
        queryParamKeys: Object.keys(tool.queryParamsSchema?.properties ?? {}),
      });
      expect(request.url).toBe('/projects/project%2Fone?limit=10');
      expect(request.body).toBeUndefined();
    }
  });

  it('parseOpenApi_operationParametersOverrideOnlyTheMatchingNameAndLocation', () => {
    const tools = parseOpenApi({
      '/projects/{id}': {
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'id', in: 'query', required: true, schema: { type: 'integer' } },
        ],
        get: {
          operationId: 'projectGet',
          parameters: [{ name: 'id', in: 'query', schema: { type: 'string' } }],
          responses: {},
        },
        delete: { operationId: 'projectDelete', responses: {} },
      },
    });

    expect(tools[0].pathParamsSchema?.properties).toEqual({ id: { type: 'string' } });
    expect(tools[0].pathParamsSchema?.required).toEqual(['id']);
    expect(tools[0].queryParamsSchema?.properties).toEqual({ id: { type: 'string' } });
    expect(tools[0].queryParamsSchema?.required).toEqual([]);
    expect(tools[1].queryParamsSchema?.properties).toEqual({ id: { type: 'integer' } });
    expect(tools[1].queryParamsSchema?.required).toEqual(['id']);
  });
});
