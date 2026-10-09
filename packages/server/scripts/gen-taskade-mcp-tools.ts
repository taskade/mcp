import { dereference } from '@readme/openapi-parser';
import { codegen } from '@taskade/mcp-openapi-codegen';

import {
  ENABLED_TASKADE_ACTIONS,
  HUMANIZED_TASKADE_ACTIONS,
  TASKADE_ACTION_HINTS,
} from '../src/constants';

const document = await dereference('taskade-public.yaml');

// Supply a human-friendly title per tool from the humanized action map; the
// codegen derives readOnly/destructive hints from each operation's HTTP method,
// and TASKADE_ACTION_HINTS overrides them where the method does not tell.
const actions = Object.fromEntries(
  Object.entries(HUMANIZED_TASKADE_ACTIONS).map(([name, title]) => [
    name,
    { title, ...TASKADE_ACTION_HINTS[name] },
  ]),
);

await codegen({
  path: 'src/tools.generated.ts',
  document,
  isActionsEnabled: ENABLED_TASKADE_ACTIONS,
  actions,
});
