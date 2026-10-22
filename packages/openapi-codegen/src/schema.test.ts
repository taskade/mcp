import { OpenAPIV3 } from 'openapi-types';
import { describe, expect, it } from 'vitest';

import { codegen } from './codegen';

const testDocument: OpenAPIV3.Document = {
  openapi: '3.0.0',
  info: { title: 'Synthetic Taskade Test API', version: '1.0.0' },
  paths: {
    '/workspaces/{workspaceId}/tasks': {
      post: {
        operationId: 'createTask',
        summary: 'Create a new task in a workspace',
        parameters: [
          {
            name: 'workspaceId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Target workspace identifier',
          },
          {
            name: 'dryRun',
            in: 'query',
            required: false,
            schema: { type: 'boolean', default: false },
            description: 'Simulate without saving',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['title', 'priority'],
                properties: {
                  title: { type: 'string', description: 'Task title' },
                  priority: {
                    type: 'string',
                    enum: ['low', 'medium', 'high'],
                    description: 'Priority level',
                  },
                  tags: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Optional labels',
                  },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Task created successfully' },
        },
      },
    },
    '/workspaces/{workspaceId}/tasks/{taskId}': {
      get: {
        operationId: 'getTask',
        summary: 'Retrieve a specific task',
        parameters: [
          {
            name: 'workspaceId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Workspace ID',
          },
          {
            name: 'taskId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Task ID',
          },
          {
            name: 'includeArchived',
            in: 'query',
            required: false,
            schema: { type: 'boolean' },
          },
        ],
        responses: {
          '200': { description: 'Task details' },
        },
      },
    },
  },
};

describe('OpenAPI Codegen Schema Validation', () => {
  it('correctly maps path, query, and requestBody parameters into tool zod schemas', async () => {
    const output = await codegen({ document: testDocument });

    // Verify tools are generated
    expect(output).toContain('"createTask"');
    expect(output).toContain('"getTask"');

    // Verify path parameter extraction
    expect(output).toContain('workspaceId: z.string()');
    expect(output).toContain('taskId: z.string()');

    // Verify query parameter extraction with defaults/optionals
    expect(output).toContain('dryRun: z.boolean().default(false)');
    expect(output).toContain('includeArchived: z.boolean().optional()');

    // Verify request body properties in createTask
    expect(output).toContain('title: z.string().describe("Task title")');
    expect(output).toContain(
      'priority: z.enum(["low", "medium", "high"]).describe("Priority level")',
    );
    expect(output).toContain('tags: z.array(z.string()).describe("Optional labels").optional()');
  });

  it('generates runtime argument dispatchers with correct pathParamKeys and queryParamKeys', async () => {
    const output = await codegen({ document: testDocument });

    // createTask path and query param keys
    expect(output).toContain('pathParamKeys: ["workspaceId"]');
    expect(output).toContain('queryParamKeys: ["dryRun"]');

    // getTask path and query param keys
    expect(output).toContain('pathParamKeys: ["workspaceId", "taskId"]');
    expect(output).toContain('queryParamKeys: ["includeArchived"]');
  });
});
