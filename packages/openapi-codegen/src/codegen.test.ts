import { OpenAPIV3 } from 'openapi-types';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';

import { codegen } from './codegen';

const document = {
  openapi: '3.0.0',
  info: { title: 'Tiny API', version: '1.0.0' },
  paths: {
    '/things': {
      get: { operationId: 'thingList', description: 'List things', responses: {} },
      post: { operationId: 'thingCreate', description: 'Create a thing', responses: {} },
    },
    '/things/{thingId}': {
      put: { operationId: 'thingUpdate', description: 'Update a thing', responses: {} },
      delete: { operationId: 'thingDelete', description: 'Delete a thing', responses: {} },
    },
  },
} as OpenAPIV3.Document;

/**
 * Extracts the annotation hints for a named tool out of the generated
 * (prettier-formatted) source.
 */
const hintsFor = (output: string, toolName: string) => {
  const chunk = output
    .split('server.tool(')
    .find((part) => part.trimStart().startsWith(`"${toolName}"`));
  expect(chunk, `generated output contains tool ${toolName}`).toBeDefined();

  const hints: Record<string, boolean> = {};
  for (const key of ['readOnlyHint', 'destructiveHint', 'idempotentHint', 'openWorldHint']) {
    const match = chunk?.match(new RegExp(`${key}:\\s*(true|false)`));
    expect(match, `${toolName} carries ${key}`).toBeTruthy();
    hints[key] = match?.[1] === 'true';
  }
  return hints;
};

describe('codegen derived annotations', () => {
  it('codegen_escapesDescriptionsFromSpecsAndActionOverrides', async () => {
    const DESCRIPTION = 'Read "quoted" text\nfrom C:\\tools';
    const OUTPUT = await codegen({
      document: {
        ...document,
        paths: {
          '/things': {
            get: { operationId: 'thingList', description: DESCRIPTION, responses: {} },
            post: { operationId: 'thingCreate', responses: {} },
          },
        },
      },
      actions: { thingCreate: { description: DESCRIPTION } },
    });

    const SOURCE = ts.createSourceFile('tools.ts', OUTPUT, ts.ScriptTarget.Latest);
    const DESCRIPTIONS: string[] = [];
    const VISIT = (node: ts.Node): void => {
      if (ts.isCallExpression(node) && node.expression.getText(SOURCE) === 'server.tool') {
        const VALUE = node.arguments[1];
        expect(ts.isStringLiteral(VALUE)).toBe(true);
        if (ts.isStringLiteral(VALUE)) {
          DESCRIPTIONS.push(VALUE.text);
        }
      }
      ts.forEachChild(node, VISIT);
    };

    VISIT(SOURCE);
    expect(DESCRIPTIONS).toEqual([DESCRIPTION, DESCRIPTION]);
  });

  it('derives the full MCP hint set from the HTTP method', async () => {
    const output = await codegen({ document });

    expect(hintsFor(output, 'thingList')).toEqual({
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    });
    expect(hintsFor(output, 'thingCreate')).toEqual({
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: false,
    });
    expect(hintsFor(output, 'thingUpdate')).toEqual({
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    });
    expect(hintsFor(output, 'thingDelete')).toEqual({
      readOnlyHint: false,
      destructiveHint: true,
      idempotentHint: true,
      openWorldHint: false,
    });
  });

  it('lets a per-action config override any derived hint, including to false', async () => {
    const output = await codegen({
      document,
      actions: {
        // A POST that is actually idempotent (e.g. taskComplete-style actions).
        thingCreate: { idempotentHint: true },
        // An explicit `false` override must beat a derived `true`.
        thingDelete: { destructiveHint: false },
      },
    });

    expect(hintsFor(output, 'thingCreate')).toEqual({
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    });
    expect(hintsFor(output, 'thingDelete')).toEqual({
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    });
  });
});

describe('codegen tool titles', () => {
  it('sets the action title at the top level and keeps it in the annotations', async () => {
    const TITLE = 'List "All" Things';
    const OUTPUT = await codegen({ document, actions: { thingList: { title: TITLE } } });

    const SOURCE = ts.createSourceFile('tools.ts', OUTPUT, ts.ScriptTarget.Latest, true);
    const stringProperty = (node: ts.Node | undefined, key: string) => {
      if (!node || !ts.isObjectLiteralExpression(node)) {
        return undefined;
      }
      const PROPERTY = node.properties.find(
        (item): item is ts.PropertyAssignment =>
          ts.isPropertyAssignment(item) && item.name.getText(SOURCE) === key,
      );
      return PROPERTY && ts.isStringLiteral(PROPERTY.initializer)
        ? PROPERTY.initializer.text
        : undefined;
    };

    // Each tool: the title of its `.update({ title })` call and its annotation title.
    const TITLES: Record<string, { title?: string; annotationTitle?: string }> = {};
    const VISIT = (node: ts.Node): void => {
      if (
        ts.isCallExpression(node) &&
        ts.isPropertyAccessExpression(node.expression) &&
        node.expression.name.text === 'tool' &&
        node.expression.expression.getText(SOURCE) === 'server'
      ) {
        const NAME = node.arguments[0];
        const PARENT = node.parent;
        const UPDATE =
          ts.isPropertyAccessExpression(PARENT) &&
          PARENT.name.text === 'update' &&
          ts.isCallExpression(PARENT.parent)
            ? PARENT.parent
            : undefined;
        if (ts.isStringLiteral(NAME)) {
          TITLES[NAME.text] = {
            title: stringProperty(UPDATE?.arguments[0], 'title'),
            annotationTitle: stringProperty(node.arguments[3], 'title'),
          };
        }
      }
      ts.forEachChild(node, VISIT);
    };

    VISIT(SOURCE);
    expect(TITLES).toEqual({
      thingList: { title: TITLE, annotationTitle: TITLE },
      // A tool with no title in its action config gets no title.
      thingCreate: { title: undefined, annotationTitle: undefined },
      thingUpdate: { title: undefined, annotationTitle: undefined },
      thingDelete: { title: undefined, annotationTitle: undefined },
    });
  });
});

describe('codegen parameter descriptions', () => {
  it('fills a missing parameter description from the action config and keeps a spec description', async () => {
    const OUTPUT = await codegen({
      document: {
        ...document,
        paths: {
          '/things/{thingId}': {
            get: {
              operationId: 'thingGet',
              description: 'Get a thing',
              parameters: [
                { name: 'thingId', in: 'path', required: true, schema: { type: 'string' } },
                {
                  name: 'limit',
                  in: 'query',
                  description: 'The spec text',
                  schema: { type: 'number' },
                },
              ],
              responses: {},
            },
          },
        },
      },
      actions: {
        thingGet: {
          parameterDescriptions: {
            thingId: 'The id of the thing.',
            limit: 'The override text',
            missing: 'A parameter that the tool does not have',
          },
        },
      },
    });

    expect(OUTPUT).toContain('thingId: z.string().describe("The id of the thing.")');
    expect(OUTPUT).toContain('limit: z.number().describe("The spec text").optional()');
    expect(OUTPUT).not.toContain('The override text');
    expect(OUTPUT).not.toContain('missing');
  });
});
