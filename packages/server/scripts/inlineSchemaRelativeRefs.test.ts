import { dereference } from '@readme/openapi-parser';
import { describe, expect, it } from 'vitest';

import { inlineSchemaRelativeRefs } from './inlineSchemaRelativeRefs';

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
                    },
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
