---
"@taskade/mcp-server": minor
---

Add four tools from the Taskade API v2: `listTasks`, `createTask`, `setTaskFieldValue` and `renameProject`. The package now serves 66 tools (57 v1 and 9 v2). `setTaskFieldValue` writes text, number, Select and date fields. The v1 `taskFieldValuePut` takes no date. `renameProject` has no v1 tool. Every v1 tool name stays. The v2 snapshot comes from the live spec of 2026-11-13. With it, `getConversation` takes an optional `includeTranscript`, and the descriptions of `subscribeWebhook` and `unsubscribeWebhook` carry the deprecation note of the API.
