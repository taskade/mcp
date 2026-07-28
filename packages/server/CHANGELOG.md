# @taskade/mcp-server

## 0.1.2

### Patch Changes

- [#68](https://github.com/taskade/mcp/pull/68) [`cd2a4d7`](https://github.com/taskade/mcp/commit/cd2a4d76aba68a426581ab96ee95db5f68b4aee6) Thanks [@johnxie](https://github.com/johnxie)! - MCP clients now see the real package version (was hardcoded 0.0.3). Releasing also publishes the canonical package README stub (#64) and corrected API-token link (#61) to npm.

- [#66](https://github.com/taskade/mcp/pull/66) [`4294c28`](https://github.com/taskade/mcp/commit/4294c288a771730ae284c6f7a89dd73ab5420969) Thanks [@johnxie](https://github.com/johnxie)! - Task and workspace tool results now include canonical Taskade URL hints (task node deep links, space and subspace URLs).

- [#69](https://github.com/taskade/mcp/pull/69) [`0ea4b4a`](https://github.com/taskade/mcp/commit/0ea4b4a41cd60724e25743b3b9fbd0982bed36dc) Thanks [@johnxie](https://github.com/johnxie)! - Generated tools now carry the full MCP annotation set: derived idempotentHint and openWorldHint:false alongside readOnly/destructive hints; per-action overrides supported.

## 0.1.1

### Patch Changes

- [#58](https://github.com/taskade/mcp/pull/58) [`34e978d`](https://github.com/taskade/mcp/commit/34e978d198da792a7bee98ab53938f16662ed0c4) Thanks [@johnxie](https://github.com/johnxie)! - Surface API errors instead of returning them as successful tool results. The runtime now
  checks `response.ok`: a non-2xx response (401/403/422/5xx) or a network failure comes back
  as an `isError` tool result carrying the status and body, rather than the error payload
  being handed to the model as if the call had succeeded. Applies to all generated tools
  (v1 + v2); the 2xx path and the `normalizeResponse` handlers are unchanged.

## 0.1.0

### Minor Changes

- [#55](https://github.com/taskade/mcp/pull/55) [`f4c9cf5`](https://github.com/taskade/mcp/commit/f4c9cf55c269d5fd5cc1c2d42317e5c84816af95) Thanks [@johnxie](https://github.com/johnxie)! - Add a Taskade API **v2** tool layer alongside the existing v1 tools (additive — v1's
  57 tools are unchanged). Exposes the highest-value capabilities v1 lacks: **agent chat**
  (`promptAgent`, `listConversations`, `getConversation`) and **webhooks**
  (`subscribeWebhook`, `unsubscribeWebhook`). The codegen gains an `exportName` option so
  the second tool set (`setupToolsV2`) can be registered next to the first. v2 is beta;
  the enabled set will grow as it stabilizes.

## 0.0.4

### Patch Changes

- [#44](https://github.com/taskade/mcp/pull/44) [`ff6a9da`](https://github.com/taskade/mcp/commit/ff6a9da911f0879557c74ee594e9f1d9a1d94067) Thanks [@johnxie](https://github.com/johnxie)! - Add MCP tool annotations to every generated tool: a human-friendly `title`
  (from the humanized action map) plus `readOnlyHint`/`destructiveHint` derived
  from each operation's HTTP method (GET/HEAD → read-only, DELETE → destructive).
  Improves client UX/safety display and is a prerequisite for connector directories.

## 0.0.3

### Patch Changes

- [`6b1ba50`](https://github.com/taskade/mcp/commit/6b1ba50acd2a5a2c64c37863432fe1cd1ad08d68) Thanks [@prevwong](https://github.com/prevwong)! - Temporary fix for openapi codegen

## 0.0.2

### Patch Changes

- [#23](https://github.com/taskade/mcp/pull/23) [`f479260`](https://github.com/taskade/mcp/commit/f47926029866f724c7702251d95e9f2f451e4698) Thanks [@johnxie](https://github.com/johnxie)! - Add mcpName field, registry configs, Glama metadata, and n8n examples

## 0.0.1

### Patch Changes

- [`60fed52`](https://github.com/taskade/mcp/commit/60fed52b6b285eae0678ee85c6d91ac308fa195a) Thanks [@prevwong](https://github.com/prevwong)! - Init NPM
