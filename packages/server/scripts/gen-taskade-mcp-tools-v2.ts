import { dereference } from '@readme/openapi-parser';
import { codegen } from '@taskade/mcp-openapi-codegen';
import fs from 'fs';

import { ENABLED_TASKADE_V2_ACTIONS, HUMANIZED_TASKADE_V2_ACTIONS } from '../src/constants.v2';

// Taskade API v2 is a flat RPC API whose operations omit `operationId`; the codegen
// derives tool names from the path (e.g. POST /promptAgent -> "promptAgent").
const deriveName = (p: string) => p.replace(/^\//, '').split('/')[0];

// Why prune before dereferencing: the live v2 spec currently has a broken self-$ref
// inside components.schemas.Field (data.fillerConfig...sourceRef) that makes a full
// dereference throw. The enabled v2 tools don't reference Field, so we keep only the
// allow-listed paths + the component schemas transitively reachable from them. This
// is also what scopes the generated surface to the enabled tools. Remove once the
// upstream spec is fixed and the allow-list grows to need the rest.
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
  document = await dereference(pruneToEnabled(raw) as never);
} catch (error) {
  // The live v2 spec has a known broken self-$ref in components.schemas.Field; pruneToEnabled
  // sidesteps it only while the allow-list stays clear of schemas that reach Field. If this
  // throws, an enabled tool likely now references the broken node — see the pruneToEnabled note.
  throw new Error(
    `v2 codegen: failed to dereference the pruned spec (likely the known upstream Field self-$ref reached by a newly enabled action): ${(error as Error).message}`,
  );
}

const actions = Object.fromEntries(
  Object.entries(HUMANIZED_TASKADE_V2_ACTIONS).map(([name, title]) => [name, { title }]),
);

await codegen({
  path: 'src/tools.v2.generated.ts',
  document: document as never,
  isActionsEnabled: [...ENABLED_TASKADE_V2_ACTIONS],
  actions,
  exportName: 'setupToolsV2',
});
