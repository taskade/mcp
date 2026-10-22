---
"@taskade/mcp-openapi-codegen": patch
---

Publish built JavaScript and type declarations from `dist/`, and list the runtime imports (`json-schema-to-zod`, `prettier`, `openapi-types`) in `dependencies`. `import { codegen } from '@taskade/mcp-openapi-codegen'` now works after `npm install`. The package no longer ships its test files or `tsconfig.json`.
