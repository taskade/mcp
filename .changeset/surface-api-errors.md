---
'@taskade/mcp-server': patch
'@taskade/mcp-openapi-codegen': patch
---

Surface API errors instead of returning them as successful tool results. The runtime now
checks `response.ok`: a non-2xx response (401/403/422/5xx) or a network failure comes back
as an `isError` tool result carrying the status and body, rather than the error payload
being handed to the model as if the call had succeeded. Applies to all generated tools
(v1 + v2); the 2xx path and the `normalizeResponse` handlers are unchanged.
