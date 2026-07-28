import { OpenAPIV3 } from 'openapi-types';
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

  it('lets a per-action config override the LLM-visible description (spec text loses)', async () => {
    // Pins the mechanism used to fix misleading upstream descriptions (e.g. v2's
    // getWebhook/deleteWebhook telling callers to pre-URL-encode the id while the
    // runtime already encodes path params).
    const output = await codegen({
      document,
      actions: {
        thingDelete: { description: 'Delete a thing by raw id — do NOT URL-encode it.' },
      },
    });

    const chunkFor = (toolName: string) =>
      output.split('server.tool(').find((part) => part.trimStart().startsWith(`"${toolName}"`));

    // Overridden tool carries the override, not the spec description.
    expect(chunkFor('thingDelete')).toContain('Delete a thing by raw id — do NOT URL-encode it.');
    expect(chunkFor('thingDelete')).not.toContain('"Delete a thing"');
    // Tools without an override keep the spec description.
    expect(chunkFor('thingList')).toContain('"List things"');
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
