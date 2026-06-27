---
'@taskade/mcp-server': minor
'@taskade/mcp-openapi-codegen': patch
---

Add a Taskade API **v2** tool layer alongside the existing v1 tools (additive — v1's
57 tools are unchanged). Exposes the highest-value capabilities v1 lacks: **agent chat**
(`promptAgent`, `listConversations`, `getConversation`) and **webhooks**
(`subscribeWebhook`, `unsubscribeWebhook`). The codegen gains an `exportName` option so
the second tool set (`setupToolsV2`) can be registered next to the first. v2 is beta;
the enabled set will grow as it stabilizes.
