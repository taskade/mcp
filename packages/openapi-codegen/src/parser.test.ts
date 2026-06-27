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

  it('falls back to the HTTP method for a root path', () => {
    expect(deriveToolName('get', '/')).toBe('get');
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
});
