---
"@taskade/mcp-server": patch
---

Correct the MCP tool hints: the v2 conversation reads are read-only, `unsubscribeWebhook` and the PUT/PATCH tools that replace a value are destructive, and `promptAgent` is destructive and open-world. Claude now runs the reads without a confirmation and asks before the overwrites.
