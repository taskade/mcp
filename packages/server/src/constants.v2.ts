// Taskade Public API v2 (https://www.taskade.com/api/documentation/v2) tools.
//
// v2 is a flat RPC API (POST /operationName) and is currently beta. It is exposed
// as an ADDITIVE layer alongside the v1 tools (constants.ts). v2 adds capabilities v1
// lacks (agent chat, webhooks, a project rename, a date field write). A v2 tool never
// replaces a v1 tool name, so a client that calls a v1 tool by name keeps working.
// Names are derived from the path by the codegen (v2 omits operationId).

import type { ActionHints } from './constants';

export const ENABLED_TASKADE_V2_ACTIONS = [
  // Agent chat — the capability v1 cannot do at all
  'promptAgent',
  'listConversations',
  'getConversation',
  // Real-time events
  'subscribeWebhook',
  'unsubscribeWebhook',
  // Task and field tools. v1 has no rename, and its field write takes no date.
  'listTasks',
  'createTask',
  'setTaskFieldValue',
  'renameProject',
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
  listTasks: 'List Tasks in a Project',
  createTask: 'Create Tasks',
  setTaskFieldValue: 'Set a Custom Field Value',
  renameProject: 'Rename a Project',
};

// v2 sends every operation as POST, so the codegen marks each tool as a
// non-destructive write. These overrides state the real behavior:
// - the conversation and task reads change nothing
// - unsubscribeWebhook deletes the subscription
// - setTaskFieldValue and renameProject replace a stored value, as the v1
//   taskFieldValuePut does. A second call with the same input changes nothing.
// - promptAgent runs an agent that can call its own tools (web search, and its
//   project tool, which can edit or delete tasks)
// createTask keeps the derived hints: it adds tasks and changes no task that exists.
export const TASKADE_V2_ACTION_HINTS: Partial<Record<TaskadeV2Action, ActionHints>> = {
  listConversations: { readOnlyHint: true, idempotentHint: true },
  getConversation: { readOnlyHint: true, idempotentHint: true },
  unsubscribeWebhook: { destructiveHint: true, idempotentHint: true },
  promptAgent: { destructiveHint: true, openWorldHint: true },
  listTasks: { readOnlyHint: true, idempotentHint: true },
  setTaskFieldValue: { destructiveHint: true, idempotentHint: true },
  renameProject: { destructiveHint: true, idempotentHint: true },
};

// Descriptions that replace the spec text. The spec text of these operations is a
// short summary, or a note that names a tool this package does not have (`listFields`).
// The codegen writes each one inside double quotes, so a description has no double
// quote and no line break.
export const TASKADE_V2_ACTION_DESCRIPTIONS: Partial<Record<TaskadeV2Action, string>> = {
  listTasks:
    'Read-only. List the tasks of a project, one page at a time. Returns the id, text, parent id and completed flag of each task. It returns no custom field values. Set completed to false to list only open tasks. To read the next page, pass the id of the last task as after.',
  createTask:
    'Create 1 to 20 tasks in a project. Give each task its text as content, a contentType (text/markdown or text/plain) and a placement. To add a task at the top or bottom of the project, leave out taskId and use afterbegin or beforeend. To add it next to or inside a task, give that taskId with beforebegin, afterend, afterbegin or beforeend. Returns the id of each new task.',
  setTaskFieldValue:
    'Set the value of one custom field on a task. It replaces the value that the field has now. It works for number, Select, text and date fields. Read the field ids and the Select option ids with projectFieldsGet. For a Select field, send the option id, not its label. For a date field, send YYYY-MM-DD or an ISO 8601 date-time. Use this tool, not taskFieldValuePut, for a date field.',
  renameProject:
    'Rename a project. It replaces the name of the project. The new name is one line of up to 2000 characters.',
};
