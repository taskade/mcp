---
"@taskade/mcp-server": patch
---

Bundle `@modelcontextprotocol/sdk` 1.32.1 (was 1.12.1) with one copy of zod (3.25.28). The server accepts MCP protocol versions up to `2025-11-25`. A tool call with invalid arguments, or with an unknown tool name, now returns a tool result with `isError: true` instead of a JSON-RPC error, so the model can read the message and correct the call. The tool names and their order do not change. The `initialize` response no longer echoes an unused `capabilities` object inside `serverInfo`.
