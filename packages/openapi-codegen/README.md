# @taskade/mcp-openapi-codegen

Generate MCP tools from any OpenAPI Schema in seconds.


## Usage

- Install `@taskade/mcp-openapi-codegen` package:

```sh
npm install --dev @taskade/mcp-openapi-codegen
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

This will generate a new `tools.generated.ts` file in the `src/` folder.


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