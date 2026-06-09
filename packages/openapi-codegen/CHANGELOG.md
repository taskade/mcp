# @taskade/mcp-openapi-codegen

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
