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
};
