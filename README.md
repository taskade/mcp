# Taskade MCP Server

Connect [Taskade](https://www.taskade.com) to any AI assistant — Claude, Cursor, Windsurf, n8n, and more — via the [Model Context Protocol](https://modelcontextprotocol.io/).

**50+ tools** for workspaces, projects, tasks, AI agents, knowledge bases, templates, automations, media, and sharing — all from your AI client.

- [MCP Server](https://github.com/taskade/mcp/tree/main/packages/server) — Connect Taskade to Claude Desktop, Cursor, Windsurf, or any MCP client.
- [OpenAPI Codegen](https://github.com/taskade/mcp/tree/main/packages/openapi-codegen) — Generate MCP tools from any OpenAPI schema.

---

## Demo

MCP-powered Taskade agent running inside Claude Desktop by Anthropic:

![Taskade MCP Demo — AI agent managing tasks and projects in Claude Desktop](https://github.com/user-attachments/assets/0cee987b-b0d4-4d10-bb7f-da49a080d731)

---

## Quick Start

### 1. Get Your API Key

Go to [Taskade Settings > API](https://www.taskade.com/settings/api) and create a Personal Access Token.

### 2. Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "taskade": {
      "command": "npx",
      "args": ["-y", "@taskade/mcp-server"],
      "env": {
        "TASKADE_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

### 3. Cursor

Add to your Cursor MCP settings:

```json
{
  "mcpServers": {
    "taskade": {
      "command": "npx",
      "args": ["-y", "@taskade/mcp-server"],
      "env": {
        "TASKADE_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

### 4. HTTP / SSE Mode (for n8n, custom clients)

```bash
TASKADE_API_KEY=your-api-key npx @taskade/mcp-server --http
```

The server starts at `http://localhost:3000` (configure with `PORT` env var). Connect via SSE at `http://localhost:3000/sse?access_token=your-api-key`.

---

## Tools (50+)

### Workspaces

| Tool | Description |
|------|-------------|
| `workspacesGet` | List all workspaces |
| `workspaceFoldersGet` | List folders in a workspace |
| `workspaceCreateProject` | Create a project in a workspace |

### Projects

| Tool | Description |
|------|-------------|
| `projectGet` | Get project details |
| `projectCreate` | Create a new project |
| `projectCopy` | Copy a project to a folder |
| `projectComplete` | Mark project as completed |
| `projectRestore` | Restore a completed project |
| `projectFromTemplate` | Create project from a template |
| `projectMembersGet` | List project members |
| `projectFieldsGet` | Get custom fields for a project |
| `projectShareLinkGet` | Get the share link |
| `projectShareLinkEnable` | Enable the share link |
| `projectBlocksGet` | Get all blocks in a project |
| `projectTasksGet` | Get all tasks in a project |

### Tasks

| Tool | Description |
|------|-------------|
| `taskGet` | Get task details |
| `taskCreate` | Create one or more tasks |
| `taskPut` | Update a task |
| `taskDelete` | Delete a task |
| `taskComplete` | Mark task as complete |
| `taskUncomplete` | Mark task as incomplete |
| `taskMove` | Move a task within a project |
| `taskAssigneesGet` | Get task assignees |
| `taskPutAssignees` | Assign users to a task |
| `taskDeleteAssignees` | Remove assignees |
| `taskGetDate` | Get task due date |
| `taskPutDate` | Set task due date |
| `taskDeleteDate` | Remove task due date |
| `taskNoteGet` | Get task note |
| `taskNotePut` | Update task note |
| `taskNoteDelete` | Delete task note |
| `taskFieldsValueGet` | Get all field values |
| `taskFieldValueGet` | Get a specific field value |
| `taskFieldValuePut` | Set a field value |
| `taskFieldValueDelete` | Delete a field value |

### AI Agents

Create, manage, and publish autonomous AI agents with custom knowledge and tools.

| Tool | Description |
|------|-------------|
| `folderAgentGenerate` | Generate an AI agent from a text prompt |
| `folderCreateAgent` | Create an agent with custom configuration |
| `folderAgentGet` | List agents in a folder |
| `agentGet` | Get agent details |
| `agentUpdate` | Update agent configuration |
| `deleteAgent` | Delete an agent |
| `agentPublicAccessEnable` | Publish agent publicly |
| `agentPublicGet` | Get public agent details |
| `agentPublicUpdate` | Update public agent settings |
| `agentKnowledgeProjectCreate` | Add a project as agent knowledge |
| `agentKnowledgeMediaCreate` | Add media as agent knowledge |
| `agentKnowledgeProjectRemove` | Remove project from knowledge |
| `agentKnowledgeMediaRemove` | Remove media from knowledge |
| `agentConvosGet` | List agent conversations |
| `agentConvoGet` | Get conversation details |
| `publicAgentGet` | Get agent by public ID |

### Templates

| Tool | Description |
|------|-------------|
| `folderProjectTemplatesGet` | List available project templates |
| `projectFromTemplate` | Create a project from a template |

### Media

| Tool | Description |
|------|-------------|
| `mediasGet` | List media files in a folder |
| `mediaGet` | Get media details |
| `mediaDelete` | Delete a media file |

### Personal

| Tool | Description |
|------|-------------|
| `meProjectsGet` | List all your projects |

---

## Use Cases

### Project Management with AI

Ask your AI assistant to manage your Taskade workspace:

- "Show me all my projects and their status"
- "Create a new project called Q1 Planning with tasks for each team"
- "Move all overdue tasks to the Backlog project"
- "Set due dates for all tasks in the Sprint project"

### AI Agent Creation

Build and deploy AI agents directly from your editor:

- "Create an AI agent called Customer Support Bot with knowledge from our docs project"
- "Generate an agent for code review using this prompt: ..."
- "Publish my agent publicly and give me the share link"
- "Add our API documentation project as knowledge to the agent"

### Template Workflows

Automate project creation from templates:

- "List all templates in my workspace"
- "Create 5 new client onboarding projects from the Client Template"
- "Copy the Sprint Retrospective project for this week"

### Workflow Automation

Connect Taskade to external services through automations:

- "Create an automation that notifies Slack when a task is completed"
- "Set up a weekly project report that runs every Monday"
- "Connect my CRM data to a Taskade project for tracking"

---

## OpenAPI Codegen

Use our generator to build MCP tools from any OpenAPI spec — not just Taskade.

```bash
npm install --save-dev @taskade/mcp-openapi-codegen @readme/openapi-parser
```

```ts
import { dereference } from '@readme/openapi-parser';
import { codegen } from '@taskade/mcp-openapi-codegen';

const document = await dereference('your-api-spec.yaml');

await codegen({
  path: 'src/tools.generated.ts',
  document,
});
```

Works with any OpenAPI 3.0+ spec. Generate MCP tools for your own APIs in minutes.

---

## What is Taskade?

[Taskade](https://www.taskade.com) ([YC W19](https://www.ycombinator.com/companies/taskade)) is the AI-powered workspace for teams — deploy agents, automate workflows, and ship faster.

- **AI Agents** — Autonomous agents with memory, knowledge bases, and custom tools
- **Automations** — No-code workflow automation with 100+ integrations
- **Real-time Collaboration** — Multiplayer workspace with chat, video, and shared projects
- **Genesis Apps** — Build and publish AI-powered apps to the [Taskade community](https://www.taskade.com/community)
- **Templates** — 700+ templates for project management, engineering, marketing, and more
- **API & MCP** — Full REST API and Model Context Protocol for developer integrations

**Links:**
- App: [taskade.com](https://www.taskade.com)
- Create: [taskade.com/create](https://www.taskade.com/create)
- Agents: [taskade.com/agents](https://www.taskade.com/agents)
- Templates: [taskade.com/templates](https://www.taskade.com/templates)
- Community: [taskade.com/community](https://www.taskade.com/community)
- Developer Docs: [developers.taskade.com](https://developers.taskade.com)
- Blog: [taskade.com/blog](https://www.taskade.com/blog)

---

## Roadmap

See [open issues](https://github.com/taskade/mcp/issues) for planned features and improvements.

- **Hosted MCP Endpoint** — `mcp.taskade.com` for zero-install MCP access ([#6](https://github.com/taskade/mcp/issues/6))
- **Automation & Flow Tools** — Create, enable, and manage workflow automations via MCP
- **Agent Chat via MCP** — Send messages to AI agents and receive responses
- **Webhook Triggers** — Receive real-time notifications from Taskade events
- **`agent.js`** — Open-source autonomous agent toolkit (coming soon)
- **TaskOS** — Agent platform at [developers.taskade.com](https://developers.taskade.com)

---

## Contributing

Help us improve MCP tools, OpenAPI workflows, and agent capabilities.

- [Issues](https://github.com/taskade/mcp/issues) — Report bugs or request features
- [Pull Requests](https://github.com/taskade/mcp/pulls) — Contributions welcome
- [Community](https://www.taskade.com/community) — Join the Taskade community
- [Contact](mailto:hello@taskade.com) — hello@taskade.com

---

## License

MIT
