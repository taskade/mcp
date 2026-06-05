---
'@taskade/mcp-server': patch
'@taskade/mcp-openapi-codegen': patch
---

Add MCP tool annotations to every generated tool: a human-friendly `title`
(from the humanized action map) plus `readOnlyHint`/`destructiveHint` derived
from each operation's HTTP method (GET/HEAD → read-only, DELETE → destructive).
Improves client UX/safety display and is a prerequisite for connector directories.
