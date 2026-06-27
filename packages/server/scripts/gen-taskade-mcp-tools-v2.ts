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
  for (const [p, ms] of Object.entries(doc.paths ?? {})) {
    if (enabled.has(deriveName(p))) {
      paths[p] = ms;
    }
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
const document = await dereference(pruneToEnabled(raw) as never);

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
