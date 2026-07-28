---
'@taskade/mcp-server': minor
---

Four new signed-webhook management tools from Taskade API v2 (upstream v6.213.0 "Signed Webhooks"): `createWebhook`, `listWebhooks`, `getWebhook`, `deleteWebhook` — 62 → 66 tools. `createWebhook`'s description warns that the HMAC signing secret is returned exactly once and must be stored securely. The legacy unsigned `subscribeWebhook`/`unsubscribeWebhook` remain available but are deprecated upstream.
