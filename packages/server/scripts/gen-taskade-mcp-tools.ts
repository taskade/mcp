import { dereference } from '@readme/openapi-parser';
import { codegen } from '@taskade/mcp-openapi-codegen';

import { ENABLED_TASKADE_ACTIONS, HUMANIZED_TASKADE_ACTIONS } from '../src/constants';

const document = await dereference('taskade-public.yaml');

// Supply a human-friendly title per tool from the humanized action map; the
// codegen derives readOnly/destructive hints from each operation's HTTP method.
const actions = Object.fromEntries(
  Object.entries(HUMANIZED_TASKADE_ACTIONS).map(([name, title]) => [name, { title }]),
);

await codegen({
  path: 'src/tools.generated.ts',
  document,
  isActionsEnabled: ENABLED_TASKADE_ACTIONS,
  actions,
});
