# @taskade/mcp-openapi-codegen

Generate MCP tools from any OpenAPI Schema in seconds.


## Usage

- Install `@taskade/mcp-openapi-codegen` and `@readme/openapi-parser` package:

```sh
npm install --dev @taskade/mcp-openapi-codegen @readme/openapi-parser
```

- Create a script to run the codegen:

```tsx
// scripts/generate-openapi-tools.ts

import { dereference } from '@readme/openapi-parser';
import { codegen } from '@taskade/mcp-openapi-codegen';


const document = await dereference('taskade-public.yaml');

await codegen({
  path: 'src/tools.generated.ts',
  document,
});
```

Then run `npx tsx scripts/generate-openapi-tools.ts`

> This will generate a new `tools.generated.ts` file in the `src/` folder.

- Link the generated tools with your MCP server:

```tsx
// src/server.ts
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import { setupTools } from "./tools.generated.ts";

const server = new McpServer({
    name: 'taskade',
    version: '0.0.1',
    capabilities: {
        resources: {},
        tools: {},
    }
});

setupTools(server, {
    // 1. Base url for the openapi endpoints
    url: 'https://www.taskade.com/api/v1',
    // 2. Additional headers to include in all requests
    headers: {
        'X-HEADER': '123'
    },
    // 3. Override the default fetch method (you most likely need to install `node-fetch` since most MCP clients don't have the Node.js fetch method)
    // fetch: nodeFetch
});
```


That's it - you're all set!

### Normalizing responses

By default, all responses from APIs are returned to the LLM in text. But there may be situations where you might want to specify custom responses for certain endpoints. 

For example, you may want to include an additional text response alongside the JSON response of a specific API endpoint:

```tsx
setupTools(this, {
    // ... 
    normalizeResponse: {
        folderProjectsGet: (response) => {
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify(response),
                    },
                    {
                        type: 'text',
                        text: 'The url to projects is in the format of: https://www.taskade.com/d/{projectId}. You should link all projects in the response to the user.',
                    },
                ],
            };
        },
    },
});
```