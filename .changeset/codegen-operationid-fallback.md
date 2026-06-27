---
'@taskade/mcp-openapi-codegen': patch
---

Derive a camelCase tool name from an operation's path when the OpenAPI spec omits
`operationId` (and fall back to `summary` for the description). Enables generating
tools from specs like Taskade API v2's flat RPC routes (`POST /promptAgent`). Specs
that provide `operationId` (e.g. Taskade v1) are unaffected.
