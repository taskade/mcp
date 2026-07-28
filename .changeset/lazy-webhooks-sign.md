---
'@taskade/mcp-openapi-codegen': minor
---

New `nameOverrides` codegen/parser option: explicit tool-name overrides keyed by `"<lowercase-method> <path>"` (e.g. `'post /webhooks': 'createWebhook'`). An override beats both `operationId` and the path-derived fallback, disambiguating REST-shaped operations without `operationId` whose derived names would collide (`POST/GET /webhooks`, `GET/DELETE /webhooks/{id}` all derive to `webhooks`). The parser (`parseOpenApi`, `deriveToolName`) is now exported from the package root.
