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

import { dereference } from "@readme/openapi-parser";
import { codegen } from "@taskade/mcp-openapi-codegen";

const document = await dereference("taskade-public.yaml");

await codegen({
  path: "src/tools.generated.ts",
  document,
});
```

Then run `npx tsx scripts/generate-openapi-tools.ts`

> This will generate a new `tools.generated.ts` file in the `src/` folder.

- Link the generated tools with your MCP server:

```tsx
// src/server.ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import { setupTools } from "./tools.generated.ts";

const server = new McpServer({
  name: "taskade",
  version: "0.0.1",
  capabilities: {
    resources: {},
    tools: {},
  },
});

setupTools(server, {
  // 1. Base url for the openapi endpoints
  url: "https://www.taskade.com/api/v1",
  // 2. Additional headers to include in all requests
  headers: {
    "X-HEADER": "123",
  },
  // 3. Override the default fetch method (you most likely need to install `node-fetch` since most MCP clients don't have the Node.js fetch method)
  // fetch: nodeFetch
});
```

That's it - you're all set!

## Generate Xquik MCP tools

Xquik publishes an OpenAPI schema for its hosted X/Twitter data API. Generate
typed MCP tools from the schema, then provide the API base URL and key header at
runtime:

```tsx
import { dereference } from "@readme/openapi-parser";
import { codegen } from "@taskade/mcp-openapi-codegen";

const document = await dereference("https://xquik.com/openapi.yaml");

await codegen({
  path: "src/xquik-tools.generated.ts",
  document,
});
```

```tsx
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import { setupTools } from "./xquik-tools.generated.ts";

const server = new McpServer({
  name: "xquik-openapi",
  version: "0.0.1",
});

const apiKey = process.env.XQUIK_API_KEY;
if (!apiKey) {
  throw new Error("XQUIK_API_KEY is required");
}

setupTools(server, {
  url: "https://xquik.com",
  headers: {
    "x-api-key": apiKey,
  },
});
```

Keep `XQUIK_API_KEY` in the process environment. Xquik is a hosted,
closed-source service and an independent third-party service. It is not
affiliated with X Corp.

### Normalizing responses

By default, all responses from APIs are returned to the LLM in text. But there may be situations where you might want to specify custom responses for certain endpoints.

For example, you may want to include an additional text response alongside the JSON response of a specific API endpoint:

```tsx
setupTools(server, {
  // ...
  normalizeResponse: {
    folderProjectsGet: (response) => {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(response),
          },
          {
            type: "text",
            text: "The url to projects is in the format of: https://www.taskade.com/d/{projectId}. You should link all projects in the response to the user.",
          },
        ],
      };
    },
  },
});
```
