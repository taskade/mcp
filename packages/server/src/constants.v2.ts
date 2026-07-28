// Taskade Public API v2 (https://www.taskade.com/api/documentation/v2) tools.
//
// v2 is a flat RPC API (POST /operationName) and is currently beta. It is exposed
// as an ADDITIVE layer alongside the v1 tools (constants.ts) — v1 keeps the granular
// task-editing tools v2 does not yet have, and v2 adds capabilities v1 lacks (agent
// chat, webhooks). We start with the highest-value gaps and grow this list as v2
// stabilizes. Names are derived from the path by the codegen (v2 omits operationId).

export const ENABLED_TASKADE_V2_ACTIONS = [
  // Agent chat — the capability v1 cannot do at all
  'promptAgent',
  'listConversations',
  'getConversation',
  // Real-time events
  'subscribeWebhook',
  'unsubscribeWebhook',
  // Signed webhooks (HMAC) — upstream v6.213.0; these ops omit operationId AND
  // share paths (/webhooks, /webhooks/{id}), so their names come from the
  // nameOverrides map in scripts/gen-taskade-mcp-tools-v2.ts, not the path.
  'createWebhook',
  'listWebhooks',
  'getWebhook',
  'deleteWebhook',
] as const;

export type TaskadeV2Action = (typeof ENABLED_TASKADE_V2_ACTIONS)[number];

// Keyed to the allow-list so the two cannot drift: a missing, extra, or misspelled
// action here is a compile error rather than a silently untitled tool.
export const HUMANIZED_TASKADE_V2_ACTIONS: Record<TaskadeV2Action, string> = {
  promptAgent: 'Chat with an AI Agent',
  listConversations: 'List Agent Conversations',
  getConversation: 'Get Agent Conversation',
  subscribeWebhook: 'Subscribe to a Webhook',
  unsubscribeWebhook: 'Unsubscribe from a Webhook',
  createWebhook: 'Create a Signed Webhook',
  listWebhooks: 'List Signed Webhooks',
  getWebhook: 'Get a Signed Webhook',
  deleteWebhook: 'Delete a Signed Webhook',
};

// Per-action description overrides (fed to the codegen's ActionConfig.description).
// Only needed where the spec's summary omits something the model must know — or,
// for getWebhook/deleteWebhook, actively misleads: the upstream spec says the id is
// the webhook's "URL-encoded target URL", but the generated runtime already applies
// encodeURIComponent to every path param, so a caller that pre-encodes double-encodes
// the id and the lookup fails. The override tells the model to pass the RAW URL.
export const TASKADE_V2_ACTION_DESCRIPTIONS: Partial<Record<TaskadeV2Action, string>> = {
  createWebhook:
    'Register a signed outbound webhook for one or more Taskade events. ' +
    'The response includes the HMAC signing secret exactly ONCE — it cannot be ' +
    'retrieved again later, so store it securely (e.g. a secret manager) before ' +
    'doing anything else.',
  getWebhook:
    'Get a webhook subscription by id. Pass the webhook’s raw target URL as `id` ' +
    '— do NOT URL-encode it; encoding is applied automatically.',
  deleteWebhook:
    'Delete a webhook subscription by id. Pass the webhook’s raw target URL as `id` ' +
    '— do NOT URL-encode it; encoding is applied automatically.',
};
