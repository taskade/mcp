export const ENABLED_TASKADE_ACTIONS = [
  // Workspace
  'workspacesGet',
  'workspaceFoldersGet',
  'workspaceCreateProject',

  // Projects
  'projectGet',
  'projectCreate',
  'projectCopy',
  'projectComplete',
  'projectRestore',
  'projectFromTemplate',
  'projectMembersGet',
  'projectFieldsGet',
  'projectShareLinkGet',
  'projectShareLinkEnable',
  'projectBlocksGet',
  'projectTasksGet',

  // Tasks
  'taskGet',
  'taskCreate',
  'taskPut',
  'taskDelete',
  'taskComplete',
  'taskUncomplete',
  'taskMove',
  'taskAssigneesGet',
  'taskPutAssignees',
  'taskDeleteAssignees',
  'taskGetDate',
  'taskPutDate',
  'taskDeleteDate',
  'taskNoteGet',
  'taskNotePut',
  'taskNoteDelete',
  'taskFieldsValueGet',
  'taskFieldValueGet',
  'taskFieldValuePut',
  'taskFieldValueDelete',

  // Folders
  'folderProjectsGet',
  'folderProjectTemplatesGet',

  // Agents
  'folderAgentGenerate',
  'folderCreateAgent',
  'folderAgentGet',
  'agentGet',
  'agentUpdate',
  'deleteAgent',
  'agentPublicAccessEnable',
  'agentPublicGet',
  'agentPublicUpdate',
  'agentKnowledgeProjectCreate',
  'agentKnowledgeMediaCreate',
  'agentKnowledgeProjectRemove',
  'agentKnowledgeMediaRemove',
  'agentConvosGet',
  'agentConvoGet',
  'publicAgentGet',

  // Media
  'mediasGet',
  'mediaGet',
  'mediaDelete',

  // Me
  'meProjectsGet',
];

// Specify a human readable name for each action
export const HUMANIZED_TASKADE_ACTIONS = {
  // Workspace
  workspacesGet: 'Get All Workspaces',
  workspaceFoldersGet: 'Get Workspace Folders',
  workspaceCreateProject: 'Create Workspace Project',

  // Projects
  projectGet: 'Get Project Details',
  projectCreate: 'Create New Project',
  projectCopy: 'Copy Project',
  projectComplete: 'Complete Project',
  projectRestore: 'Restore Project',
  projectFromTemplate: 'Create Project from Template',
  projectMembersGet: 'Get Project Members',
  projectFieldsGet: 'Get Project Fields',
  projectShareLinkGet: 'Get Project Share Link',
  projectShareLinkEnable: 'Enable Project Share Link',
  projectBlocksGet: 'Get Project Blocks',
  projectTasksGet: 'Get Project Tasks',

  // Tasks
  taskGet: 'Get Task Details',
  taskCreate: 'Create New Task',
  taskPut: 'Update Task',
  taskDelete: 'Delete Task',
  taskComplete: 'Complete Task',
  taskUncomplete: 'Mark Task Incomplete',
  taskMove: 'Move Task',
  taskAssigneesGet: 'Get Task Assignees',
  taskPutAssignees: 'Update Task Assignees',
  taskDeleteAssignees: 'Remove Task Assignees',
  taskGetDate: 'Get Task Date',
  taskPutDate: 'Set Task Date',
  taskDeleteDate: 'Remove Task Date',
  taskNoteGet: 'Get Task Note',
  taskNotePut: 'Update Task Note',
  taskNoteDelete: 'Delete Task Note',
  taskFieldsValueGet: 'Get All Task Field Values',
  taskFieldValueGet: 'Get Task Field Value',
  taskFieldValuePut: 'Set Task Field Value',
  taskFieldValueDelete: 'Delete Task Field Value',

  // Folders
  folderProjectsGet: 'Get Projects in Folder',
  folderProjectTemplatesGet: 'Get Project Templates',

  // Agents
  folderAgentGenerate: 'Generate AI Agent from Prompt',
  folderCreateAgent: 'Create AI Agent',
  folderAgentGet: 'Get Agents in Folder',
  agentGet: 'Get Agent Details',
  agentUpdate: 'Update Agent',
  deleteAgent: 'Delete Agent',
  agentPublicAccessEnable: 'Enable Agent Public Access',
  agentPublicGet: 'Get Public Agent',
  agentPublicUpdate: 'Update Public Agent',
  agentKnowledgeProjectCreate: 'Add Knowledge Project to Agent',
  agentKnowledgeMediaCreate: 'Add Knowledge Media to Agent',
  agentKnowledgeProjectRemove: 'Remove Knowledge Project from Agent',
  agentKnowledgeMediaRemove: 'Remove Knowledge Media from Agent',
  agentConvosGet: 'Get Agent Conversations',
  agentConvoGet: 'Get Agent Conversation',
  publicAgentGet: 'Get Public Agent by Public ID',

  // Media
  mediasGet: 'Get Media in Folder',
  mediaGet: 'Get Media Details',
  mediaDelete: 'Delete Media',

  // Me
  meProjectsGet: 'Get My Projects',
};

export type ActionHints = Partial<
  Record<'readOnlyHint' | 'destructiveHint' | 'idempotentHint' | 'openWorldHint', boolean>
>;

// The codegen derives hints from the HTTP method: GET is read-only, DELETE is
// destructive. A PUT or PATCH here replaces a stored value (task text, note,
// date, field value, assignees, agent settings), so it is destructive too.
// Claude asks for a confirmation before it runs a destructive tool.
export const TASKADE_ACTION_HINTS: Partial<Record<string, ActionHints>> = {
  taskPut: { destructiveHint: true },
  taskPutAssignees: { destructiveHint: true },
  taskPutDate: { destructiveHint: true },
  taskNotePut: { destructiveHint: true },
  taskFieldValuePut: { destructiveHint: true },
  agentUpdate: { destructiveHint: true, idempotentHint: true },
  agentPublicUpdate: { destructiveHint: true, idempotentHint: true },
};

// Descriptions for input parameters that the spec does not describe, keyed by parameter
// name. The v1 and v2 generators pass the same map to every tool. The codegen uses a
// text only for a parameter with no spec description, and it ignores a name that a tool
// does not have. Add a name here only when the text is true for each tool that has a
// parameter with that name.
export const TASKADE_PARAMETER_DESCRIPTIONS: Record<string, string> = {
  workspaceId: 'The id of the workspace.',
  folderId: 'Folder/Workspace/Space ID',
  projectId: 'The id of the project.',
  projectTitle: 'The title of the new copy of the project.',
  templateId: 'The id of the project template.',
  taskId: 'The id of the task.',
  fieldId: 'The id of the field.',
  assigneeHandle: 'The handle of the assignee.',
  agentId: 'The id of the agent.',
  publicAgentId: 'The id of the public agent.',
  convoId: 'The id of the conversation.',
  mediaId: 'The id of the media.',
  hookId: 'The id of the webhook subscription that subscribeWebhook returns.',
  targetUrl: 'The https URL that receives the webhook events.',
  limit: 'The maximum number of items in one page of results.',
  page: 'The page number of the results. The first page is 1.',
  includeTranscript: 'Set to true to return the transcript of the conversation too.',
};
