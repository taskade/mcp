# @taskade/mcp-openapi-codegen

## 0.0.4

### Patch Changes

- [#53](https://github.com/taskade/mcp/pull/53) [`93017a7`](https://github.com/taskade/mcp/commit/93017a77cca91b57b7518648f2dd21010ef9ca7d) Thanks [@johnxie](https://github.com/johnxie)! - Derive a camelCase tool name from an operation's path when the OpenAPI spec omits
  `operationId` (and fall back to `summary` for the description). Enables generating
  tools from specs like Taskade API v2's flat RPC routes (`POST /promptAgent`). Specs
  that provide `operationId` (e.g. Taskade v1) are unaffected.

## 0.0.3

### Patch Changes

- [#44](https://github.com/taskade/mcp/pull/44) [`ff6a9da`](https://github.com/taskade/mcp/commit/ff6a9da911f0879557c74ee594e9f1d9a1d94067) Thanks [@johnxie](https://github.com/johnxie)! - Add MCP tool annotations to every generated tool: a human-friendly `title`
  (from the humanized action map) plus `readOnlyHint`/`destructiveHint` derived
  from each operation's HTTP method (GET/HEAD → read-only, DELETE → destructive).
  Improves client UX/safety display and is a prerequisite for connector directories.

## 0.0.2

### Patch Changes

- [`6b1ba50`](https://github.com/taskade/mcp/commit/6b1ba50acd2a5a2c64c37863432fe1cd1ad08d68) Thanks [@prevwong](https://github.com/prevwong)! - Temporary fix for openapi codegen

## 0.0.1

### Patch Changes

- [`60fed52`](https://github.com/taskade/mcp/commit/60fed52b6b285eae0678ee85c6d91ac308fa195a) Thanks [@prevwong](https://github.com/prevwong)! - Init NPM
