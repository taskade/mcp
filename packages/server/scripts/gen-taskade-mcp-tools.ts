import { dereference } from '@readme/openapi-parser';
import { codegen } from '@taskade/mcp-openapi-codegen';

import { ENABLED_TASKADE_ACTIONS } from '../src/constants';

const document = await dereference('taskade-public.yaml');

await codegen({
  path: 'src/tools.generated.ts',
  document,
  isActionsEnabled: ENABLED_TASKADE_ACTIONS,
});
