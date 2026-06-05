import { describe, expect, it } from 'vitest';

import { normalizeAllOf } from './openapi';

describe('normalizeAllOf', () => {
  it('merges plain allOf object members into a single object schema', () => {
    const out = normalizeAllOf({
      allOf: [
        { type: 'object', properties: { a: { type: 'string' } }, required: ['a'] },
        { type: 'object', properties: { b: { type: 'number' } }, required: ['b'] },
      ],
    } as never) as Record<string, never>;

    expect((out as Record<string, unknown>).allOf).toBeUndefined();
    expect(out.properties).toHaveProperty('a');
    expect(out.properties).toHaveProperty('b');
    expect(((out as Record<string, string[]>).required ?? []).sort()).toEqual(['a', 'b']);
  });

  // Regression for #34: taskCreate combined an allOf base ({content, contentType})
  // with an anyOf whose branches used additionalProperties:false (.strict()). The
  // strict branch rejected the sibling content/contentType, causing -32602.
  // normalizeAllOf must distribute the siblings into every branch.
  it('distributes sibling properties into strict anyOf branches (#34)', () => {
    const out = normalizeAllOf({
      allOf: [
        {
          type: 'object',
          properties: { content: { type: 'string' }, contentType: { type: 'string' } },
          required: ['content', 'contentType'],
        },
        {
          anyOf: [
            {
              type: 'object',
              properties: { placement: { type: 'string' } },
              additionalProperties: false,
            },
          ],
        },
      ],
    } as never) as Record<string, unknown>;

    expect(out.allOf).toBeUndefined();
    expect(Array.isArray(out.anyOf)).toBe(true);

    const branch = (out.anyOf as Array<{ properties: Record<string, unknown> }>)[0];
    // The strict branch now also knows about the sibling keys, so a payload
    // carrying content + contentType + placement validates instead of being rejected.
    expect(branch.properties).toHaveProperty('content');
    expect(branch.properties).toHaveProperty('contentType');
    expect(branch.properties).toHaveProperty('placement');
  });

  it('returns non-allOf schemas unchanged', () => {
    const schema = { type: 'object', properties: { x: { type: 'string' } } };
    expect(normalizeAllOf(schema as never)).toEqual(schema);
  });
});
