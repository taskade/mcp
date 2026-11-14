import { dereference } from '@readme/openapi-parser';
import { codegen } from '@taskade/mcp-openapi-codegen';
import fs from 'fs';

import {
  ENABLED_TASKADE_V2_ACTIONS,
  HUMANIZED_TASKADE_V2_ACTIONS,
  TASKADE_V2_ACTION_DESCRIPTIONS,
  TASKADE_V2_ACTION_HINTS,
} from '../src/constants.v2';
import { inlineSchemaRelativeRefs } from './inlineSchemaRelativeRefs';

// Taskade API v2 is a flat RPC API whose operations omit `operationId`; the codegen
// derives tool names from the path (e.g. POST /promptAgent -> "promptAgent").
const deriveName = (p: string) => p.replace(/^\//, '').split('/')[0];

// The prune keeps only the allow-listed paths and the component schemas that they
// reach. It scopes the generated surface to the enabled tools.
const pruneToEnabled = (doc: any) => {
  const enabled = new Set<string>(ENABLED_TASKADE_V2_ACTIONS);
  const paths: Record<string, unknown> = {};
  const matched = new Set<string>();
  for (const [p, ms] of Object.entries(doc.paths ?? {})) {
    if (enabled.has(deriveName(p))) {
      paths[p] = ms;
      matched.add(deriveName(p));
    }
  }

  // Fail loudly if an allow-listed action has no matching path (typo, renamed/removed
  // upstream op). Without this the action is silently dropped and we ship fewer tools
  // than ENABLED_TASKADE_V2_ACTIONS declares, with a green build.
  const missing = [...enabled].filter((name) => !matched.has(name));
  if (missing.length > 0) {
    throw new Error(
      `v2 codegen: enabled action(s) have no matching path in taskade-public.v2.json: ${missing.join(', ')}`,
    );
  }

  const allSchemas = doc.components?.schemas ?? {};
  const keep = new Set<string>();
  const walk = (node: any): void => {
    if (!node || typeof node !== 'object') {
      return;
    }
    if (Array.isArray(node)) {
      return node.forEach(walk);
    }
    for (const [k, v] of Object.entries(node)) {
      if (k === '$ref' && typeof v === 'string') {
        const m = v.match(/#\/components\/schemas\/(.+)$/);
        if (m && !keep.has(m[1])) {
          keep.add(m[1]);
          walk(allSchemas[m[1]]);
        }
      } else {
        walk(v);
      }
    }
  };
  walk(paths);

  const schemas: Record<string, unknown> = {};
  for (const name of keep) {
    schemas[name] = allSchemas[name];
  }
  return { ...doc, paths, components: { ...doc.components, schemas } };
};

const raw = JSON.parse(fs.readFileSync('taskade-public.v2.json', 'utf8'));
let document;
try {
  document = await dereference(inlineSchemaRelativeRefs(pruneToEnabled(raw)) as never);
} catch (error) {
  // inlineSchemaRelativeRefs resolves a ref that points inside its own schema. A ref that
  // it cannot resolve stays, and the dereference fails on it here.
  throw new Error(
    `v2 codegen: failed to dereference the pruned spec (an enabled action reaches a $ref that resolves nowhere): ${(error as Error).message}`,
    { cause: error },
  );
}

const actions = Object.fromEntries(
  Object.entries(HUMANIZED_TASKADE_V2_ACTIONS).map(([name, title]) => [
    name,
    {
      title,
      description:
        TASKADE_V2_ACTION_DESCRIPTIONS[name as keyof typeof HUMANIZED_TASKADE_V2_ACTIONS],
      ...TASKADE_V2_ACTION_HINTS[name as keyof typeof HUMANIZED_TASKADE_V2_ACTIONS],
    },
  ]),
);

await codegen({
  path: 'src/tools.v2.generated.ts',
  document: document as never,
  isActionsEnabled: [...ENABLED_TASKADE_V2_ACTIONS],
  actions,
  exportName: 'setupToolsV2',
});
