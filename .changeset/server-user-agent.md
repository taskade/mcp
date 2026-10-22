---
"@taskade/mcp-server": patch
---

Send `User-Agent: taskade-mcp-server/<version>` on every Taskade API request, v1 and v2. The server identifies itself, so the Taskade team can measure the usage of this package and debug its requests. The header holds no user data. Requests used the generic `node-fetch` value before.
