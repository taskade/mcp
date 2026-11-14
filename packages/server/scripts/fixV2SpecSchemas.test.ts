import { dereference } from '@readme/openapi-parser';
import { codegen } from '@taskade/mcp-openapi-codegen';
import { describe, expect, it } from 'vitest';

import { inlineSchemaRelativeRefs, nullEnumToNull } from './fixV2SpecSchemas';

const CONTENT_TYPE = { type: 'string', enum: ['text/markdown', 'text/plain'] };

// The shape of the live `createTask` body: the second item refers to a property of the
// first item, with a pointer from the body schema, not from the document root.
const createTaskDocument = () => ({
  openapi: '3.0.3',
  info: { title: 'Test', version: '1.0.0' },
  paths: {
    '/createTask': {
      post: {
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  tasks: {
                    type: 'array',
                    items: {
                      anyOf: [
                        { type: 'object', properties: { contentType: CONTENT_TYPE } },
                        {
                          type: 'object',
                          properties: {
                            contentType: {
                              $ref: '#/properties/tasks/items/anyOf/0/properties/contentType',
                            },
                          },
                        },
                      ],
                    },
                  },
                },
              },
            },
          },
        },
        responses: {},
      },
    },
  },
});

const bodyOf = (doc: any) =>
  doc.paths['/createTask'].post.requestBody.content['application/json'].schema;

describe('inlineSchemaRelativeRefs', () => {
  it('lets the parser dereference a body with a ref that points inside the body', async () => {
    await expect(dereference(createTaskDocument() as never)).rejects.toThrow(
      'Missing $ref pointer',
    );

    const fixed = inlineSchemaRelativeRefs(createTaskDocument());
    expect(bodyOf(fixed).properties.tasks.items.anyOf[1].properties.contentType).toEqual(
      CONTENT_TYPE,
    );
    await expect(dereference(fixed as never)).resolves.toBeTruthy();
  });

  it('resolves a ref inside a component schema against that component', () => {
    const sourceRef = { type: 'object', properties: { fieldPath: { type: 'string' } } };
    const fixed = inlineSchemaRelativeRefs({
      paths: {},
      components: {
        schemas: {
          Field: {
            properties: {
              data: {
                anyOf: [
                  { properties: { sourceRef } },
                  {
                    properties: {
                      sourceRef: { $ref: '#/properties/data/anyOf/0/properties/sourceRef' },
                    },
                  },
                ],
              },
            },
          },
        },
      },
    });

    expect(fixed.components.schemas.Field.properties.data.anyOf[1].properties.sourceRef).toEqual(
      sourceRef,
    );
  });

  it('breaks a ref to its own ancestor after one level', () => {
    const fixed = inlineSchemaRelativeRefs({
      paths: {},
      components: {
        schemas: {
          Node: {
            type: 'object',
            properties: { child: { properties: { again: { $ref: '#/properties/child' } } } },
          },
        },
      },
    });

    expect(fixed.components.schemas.Node.properties.child).toEqual({
      properties: { again: { properties: { again: {} } } },
    });
  });

  it('keeps component refs and refs that resolve nowhere', () => {
    const doc = {
      paths: {
        '/x': {
          post: {
            requestBody: {
              content: {
                'application/json': {
                  schema: {
                    properties: {
                      a: { $ref: '#/components/schemas/Task' },
                      b: { $ref: '#/properties/missing' },
                      c: { $ref: '#/paths/~1y' },
                    },
                    // Decoys: without the exclusion, `a` and `c` resolve to these.
                    components: { schemas: { Task: { type: 'string' } } },
                    paths: { '/y': { type: 'string' } },
                  },
                },
              },
            },
          },
        },
      },
      components: { schemas: { Task: { type: 'object' } } },
    };

    expect(inlineSchemaRelativeRefs(doc)).toEqual(doc);
  });
});

describe('nullEnumToNull', () => {
  const nullEnum = { enum: ['null'], nullable: true };

  it('rewrites the spec shape of a JSON null and keeps every other enum', () => {
    expect(
      nullEnumToNull({
        properties: {
          taskId: nullEnum,
          contentType: { type: 'string', enum: ['text/plain'] },
          word: { type: 'string', enum: ['null'], nullable: true },
        },
      }),
    ).toEqual({
      properties: {
        taskId: { nullable: true },
        contentType: { type: 'string', enum: ['text/plain'] },
        word: { type: 'string', enum: ['null'], nullable: true },
      },
    });
  });

  it('makes the codegen accept a JSON null, not the string "null"', async () => {
    const operation = {
      requestBody: {
        content: {
          'application/json': {
            schema: { type: 'object', properties: { taskId: nullEnum } },
          },
        },
      },
      responses: {},
    };
    const doc = {
      openapi: '3.0.3',
      info: { title: 'Test', version: '1.0.0' },
      paths: { '/createTask': { post: operation } },
    };

    expect(await codegen({ document: doc as never })).toContain('taskId: z.literal("null")');
    const output = await codegen({ document: nullEnumToNull(doc) });
    expect(output).toContain('taskId: z.null()');
    expect(output).not.toContain('z.literal("null")');
  });
});
