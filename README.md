<div align="center">

# Taskade MCP Server and Agent Plugin

**[Taskade](https://www.taskade.com) is the AI-native workspace for projects, AI agents and automations. [Taskade Genesis](https://www.taskade.com/create) builds a running app from one prompt.**

**Connect Taskade to Claude, Claude Code, ChatGPT, Codex, Cursor, VS Code, GitHub Copilot, Gemini CLI, Windsurf and any other client of the [Model Context Protocol](https://modelcontextprotocol.io/).**

[![Add to Cursor](https://cursor.com/deeplink/mcp-install-dark.svg)](https://cursor.com/install-mcp?name=taskade&config=eyJ1cmwiOiJodHRwczovL3d3dy50YXNrYWRlLmNvbS9tY3AifQ%3D%3D)
[![Install in VS Code](https://img.shields.io/badge/Install_in-VS_Code-007ACC?style=flat-square&logo=visualstudiocode&logoColor=white)](https://vscode.dev/redirect/mcp/install?name=taskade&config=%7B%22type%22%3A%22http%22%2C%22url%22%3A%22https%3A%2F%2Fwww.taskade.com%2Fmcp%22%7D)
[![Connect in Claude](https://img.shields.io/badge/Connect_in-Claude-D97757?style=flat-square)](#claude-web-desktop-and-mobile)

[![npm](https://img.shields.io/npm/v/@taskade/mcp-server?style=flat-square&color=FF2D60)](https://www.npmjs.com/package/@taskade/mcp-server)
[![GitHub stars](https://img.shields.io/github/stars/taskade/mcp?style=flat-square)](https://github.com/taskade/mcp)
[![License](https://img.shields.io/github/license/taskade/mcp?style=flat-square)](https://github.com/taskade/mcp/blob/main/LICENSE)

**Hosted server:** `https://www.taskade.com/mcp` (Streamable HTTP, OAuth). Nothing to install.

</div>

This repo holds the Taskade [agent plugin](#agent-plugin-for-claude-code-codex-copilot-gemini-cli-and-cursor) and two packages:

- [MCP Server](https://github.com/taskade/mcp/tree/main/packages/server) (`@taskade/mcp-server`): the local stdio server, for clients that cannot connect to a remote server.
- [OpenAPI Codegen](https://github.com/taskade/mcp/tree/main/packages/openapi-codegen): generate MCP tools from any OpenAPI spec, not only Taskade.

---

## Agent plugin for Claude Code, Codex, Copilot, Gemini CLI and Cursor

The `taskade` plugin connects your AI tool to your Taskade workspace through the hosted server, and adds 7 skills: a front door (`taskade`) and six jobs (`getting-started`, `import-spreadsheet`, `fix-my-app`, `app-report`, `backup-my-app`, `plan-new-app`). The skills tell the agent which tools to call, in which order, and what to check before it reports back.

- **Plan:** MCP access is part of every paid Taskade plan (Starter and up). Sign in once with your Taskade account.
- **What it does:** imports a spreadsheet into a project, fixes a Taskade Genesis app one checked change at a time, reports on your projects and automations, backs up an app to a folder, and plans a new app.
- **What stays in Taskade:** the plugin cannot create or edit an automation, build or publish an app, or set who can use an app. For those jobs, it writes the request for you to paste into Taskade EVE.

### Claude Code plugin

```bash
claude plugin marketplace add taskade/mcp
claude plugin install taskade@taskade
```

Then run `/mcp` in Claude Code and select **taskade** to sign in.

### Any other agent

Add the skills from this repository:

```bash
npx skills add https://github.com/taskade/mcp
```

After the Taskade release that serves it, an agent can also read the front door at `https://www.taskade.com/SKILL.md`:

```bash
npx skills add https://www.taskade.com/SKILL.md
```

### Codex plugin

```bash
codex plugin marketplace add taskade/mcp
codex plugin add taskade@taskade
```

To add only the hosted server, run `codex mcp add taskade --url https://www.taskade.com/mcp`, then `codex mcp login taskade`.

### GitHub Copilot CLI plugin

```bash
copilot plugin install taskade/mcp
```

### VS Code agent plugin

Turn on the `chat.plugins.enabled` setting. Then run **Chat: Install Plugin From Source** from the Command Palette and enter `https://github.com/taskade/mcp`.

### Gemini CLI extension

```bash
gemini extensions install https://github.com/taskade/mcp
```

### Cursor plugin

The Cursor plugin `taskade` (`.cursor-plugin/`) in this repository adds the same hosted server and skills.

---

## Contents

- [Agent plugin](#agent-plugin-for-claude-code-codex-copilot-gemini-cli-and-cursor)
- [Taskade MCP server: quick start](#taskade-mcp-server-quick-start) (Claude, Claude Code, ChatGPT, Cursor, VS Code, Windsurf)
- [Hosted tools (50)](#hosted-tools-50)
- [Example prompts](#example-prompts)
- [Troubleshooting](#troubleshooting)
- [Local package (stdio)](#local-package-stdio)
- [Local package tools (62)](#local-package-tools-62)
- [Why Taskade MCP?](#why-taskade-mcp)
- [Agent Recipes](#agent-recipes)
- [OpenAPI Codegen](#openapi-codegen)
- [What is Taskade?](#what-is-taskade)
- [Privacy & Security](#privacy--security)
- [Support](#support)
- [Contributing](#contributing)
- [License](#license)

---

## Demo

MCP-powered Taskade agent running inside Claude Desktop by Anthropic:

![Taskade MCP Demo: AI agent managing tasks and projects in Claude Desktop](https://github.com/user-attachments/assets/0cee987b-b0d4-4d10-bb7f-da49a080d731)

| Build Agents via MCP | Automate Workflows | Manage Projects |
|:---:|:---:|:---:|
| <img src="https://raw.githubusercontent.com/taskade/taskade/main/media/agents/agent-generator.gif" width="280" alt="Create AI agents from your IDE via Taskade MCP"> | <img src="https://raw.githubusercontent.com/taskade/taskade/main/media/automations/automation-flows.gif" width="280" alt="Automate workflows via Taskade MCP"> | <img src="https://raw.githubusercontent.com/taskade/taskade/main/media/genesis/create-app.gif" width="280" alt="Manage projects and apps via Taskade MCP"> |
| Create, train, deploy AI agents from Claude/Cursor | Build multi-step automations across 100+ services | Full workspace management from your AI assistant *(paid plans)* |

---

## Taskade MCP server: quick start

| | |
|---|---|
| **URL** | `https://www.taskade.com/mcp` |
| **Transport** | Streamable HTTP |
| **Auth** | OAuth 2.0 with PKCE and dynamic client registration. Your client opens a Taskade sign-in page once. |
| **Plan** | MCP access is part of every paid Taskade plan (Starter and up). On the Free plan, `list_spaces` returns no workspaces. |
| **Discovery** | `https://www.taskade.com/.well-known/oauth-protected-resource/mcp` |

An `initialize` request without a token returns `401` on purpose. The `401` tells your client where to start the OAuth sign-in.

### Claude (web, Desktop and mobile)

1. In Claude, go to [**Customize > Connectors**](https://claude.ai/customize/connectors) and select **Add custom connector**. On a Team or Enterprise plan, an Owner first adds the connector in **Organization settings > Connectors** (**Add**, then **Custom**).
2. Enter the name `Taskade` and the URL `https://www.taskade.com/mcp`, then select **Add**.
3. Select **Connect**, sign in to Taskade, and approve access.
4. In a chat, select **+ > Connectors** and turn on Taskade.

If the dialog asks for an **OAuth client**, select **Register automatically**. The connector also works in Claude Desktop and the Claude mobile apps on the same account.

### Claude Code

```bash
claude mcp add --transport http taskade https://www.taskade.com/mcp
```

Then run `/mcp` in Claude Code and select **taskade** to sign in.

### ChatGPT

ChatGPT connects to a remote MCP server as a custom connector in developer mode. It uses OAuth only.

1. In ChatGPT settings, turn on developer mode for apps and connectors.
2. Create a connector. Enter `Taskade` as the name and `https://www.taskade.com/mcp` as the server URL.
3. Select OAuth as the authentication. Sign in to Taskade and allow access.

Developer mode is available only on some ChatGPT plans, and its labels change often.

### Cursor

Select **Add to Cursor** at the top of this page, or add this to `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "taskade": {
      "url": "https://www.taskade.com/mcp"
    }
  }
}
```

### VS Code

Select **Install in VS Code** at the top of this page, or run:

```bash
code --add-mcp '{"name":"taskade","type":"http","url":"https://www.taskade.com/mcp"}'
```

### Windsurf

Add this to `~/.codeium/windsurf/mcp_config.json`:

```json
{
  "mcpServers": {
    "taskade": {
      "serverUrl": "https://www.taskade.com/mcp"
    }
  }
}
```

### Other clients and servers (API token)

A client that cannot do OAuth can send a Taskade personal access token as a Bearer token. Create the token in [Taskade Settings > API](https://www.taskade.com/settings/api).

```json
{
  "mcpServers": {
    "taskade": {
      "type": "http",
      "url": "https://www.taskade.com/mcp",
      "headers": { "Authorization": "Bearer YOUR_TASKADE_API_TOKEN" }
    }
  }
}
```

Full guide: [Hosted Taskade MCP](https://github.com/taskade/docs/blob/main/apis-living-system-development/genesis-app-mcp.md).

---

## Hosted tools (50)

Every hosted tool declares MCP tool annotations. Claude can run a read-only tool without a confirmation, and it asks before a tool that deletes or replaces data.

| Area | Read-only tools | Write tools |
|---|---|---|
| Workspaces | `list_spaces`, `list_folders`, `list_media`, `list_templates`, `inspect_space` | `write_file` (Genesis app source in `app/`) |
| Automations | `list_automations`, `get_flow_runs` | `run_flow` |
| Projects | `list_projects`, `list_my_projects`, `get_project`, `read_project`, `list_fields`, `list_blocks`, `list_project_members`, `get_share_link` | `create_project`, `create_project_from_template`, `copy_project`, `complete_project`, `restore_project`, `enable_share_link` |
| Tasks | `list_tasks` | `create_task`, `update_task`, `complete_task`, `uncomplete_task`, `delete_task`, `move_task`, `set_task_note`, `delete_task_note`, `set_task_date`, `delete_task_date`, `assign_task`, `unassign_task`, `set_task_field_value`, `delete_task_field_value` |
| AI agents | `list_agents`, `get_agent`, `list_conversations`, `get_conversation` | `create_agent`, `update_agent`, `delete_agent`, `prompt_agent`, `add_knowledge_project`, `remove_knowledge_project`, `add_knowledge_media`, `remove_knowledge_media` |

- `get_flow_runs`: reads the recent runs of one automation, newest first. Each run has its status and times. A failed run also names the failed step and a short error. It needs edit rights on automations.
- `run_flow`: starts one run of an automation that is On and starts "When asked". Every run is real: it counts toward the monthly automation runs of the plan, and AI steps use credits.

The server also serves the resource `taskade://getting-started`, a short guide for the model.

---

## Example prompts

1. **Weekly review.** "List my Taskade workspaces, read the Q4 Roadmap project, and give me the open tasks grouped by assignee."
   Tools: `list_spaces`, `list_projects`, `read_project`.
2. **Plan a launch.** "Create a project called Website Launch in my Marketing workspace with tasks for copy, design, QA and launch day, and set the launch task to November 3."
   Tools: `list_spaces`, `create_project`, `create_task`, `set_task_date`.
3. **Build a support agent.** "Create an agent called Help Bot in my Support workspace, add the FAQ project as its knowledge, then ask it how a customer resets a password."
   Tools: `create_agent`, `add_knowledge_project`, `prompt_agent`.
4. **Close out a sprint.** "In the Sprint 42 project, mark every task that mentions 'shipped' as complete, then mark the project as completed."
   Tools: `list_tasks`, `complete_task`, `complete_project`.
5. **Edit a Genesis app.** "In my CRM app, read `app/src/App.tsx` and change the page title to Acme CRM."
   Tools: `inspect_space`, `write_file`.

---

## Troubleshooting

| Symptom | Cause and fix |
|---|---|
| `401 Unauthorized` on the first request | Expected. Your client must start the OAuth sign-in. If it does not, update the client or use an API token (see above). |
| `list_spaces` returns no workspaces | MCP access needs a paid plan on that workspace. Upgrade at [taskade.com/pricing](https://www.taskade.com/pricing). |
| A tool returns "permission denied" | Your role in that workspace or project does not allow the action. Ask a workspace owner for access. |
| Claude shows "Authorization with the MCP server failed" | Remove the connector, add it again, and sign in to the correct Taskade account. |
| A local `npx` server fails with "TASKADE_API_KEY appears to be invalid" | Create a new token in [Settings > API](https://www.taskade.com/settings/api). |

If the problem continues, open an [issue](https://github.com/taskade/mcp/issues) or email [support@taskade.com](mailto:support@taskade.com).

---

## Local package (stdio)

Use the local package when your client supports only stdio servers, or when you need a tool that only the local package has, for example the webhook tools (`subscribeWebhook`, `unsubscribeWebhook`). It runs on your machine with `npx` and calls the Taskade public API over the network with a personal access token.

| I want to... | Use | Where / auth |
|---|---|---|
| Use Taskade from Claude, Cursor, VS Code or another client that supports remote servers | **Hosted server** | `https://www.taskade.com/mcp` · OAuth 2.0 or API token · paid plans |
| Run Taskade tools in a client that supports only stdio, or use the webhook tools | **Local package** (`@taskade/mcp-server`) | `npx` · personal access token · needs network access to taskade.com |
| Let my Taskade agents reach Slack, Shopify or Gmail | **[MCP Connectors](https://github.com/taskade/docs/blob/main/genesis-living-system-builder/genesis/mcp-connectors.md)** | Hosted, in the Taskade app |

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

### 4. Windsurf

Add to `~/.codeium/windsurf/mcp_config.json` (or **Settings → Cascade → MCP → Add Server**):

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

### 5. Cline

In VS Code, open the Cline **MCP Servers** panel → **Configure MCP Servers** and add:

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

### 6. VS Code

Add a `.vscode/mcp.json` to your workspace (VS Code uses the `servers` key; `${input:…}` prompts for your key on first run):

```json
{
  "servers": {
    "taskade": {
      "command": "npx",
      "args": ["-y", "@taskade/mcp-server"],
      "env": {
        "TASKADE_API_KEY": "${input:taskade_api_key}"
      }
    }
  }
}
```

### 7. Remote and HTTP clients

The local package runs over stdio only. It has no HTTP or SSE mode. For a client that connects over HTTP, use the hosted server at `https://www.taskade.com/mcp` (see [Taskade MCP server: quick start](#taskade-mcp-server-quick-start)).

---

## Local package tools (62)

The local package has its own tool names. They map to the Taskade public API v1 and v2.

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
| `projectMembersGet` | List project members |
| `projectFieldsGet` | Get custom fields for a project |
| `projectShareLinkGet` | Get the share link |
| `projectShareLinkEnable` | Enable the share link |
| `projectBlocksGet` | Get all blocks in a project |
| `projectTasksGet` | Get all tasks in a project |
| `folderProjectsGet` | List projects in a folder |

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

### Agent Chat & Webhooks (API v2, beta)

Capabilities the v1 API doesn't have: hold a live conversation with an AI agent, and receive real-time events.

| Tool | Description |
|------|-------------|
| `promptAgent` | Send a message to an AI agent and get its reply |
| `listConversations` | List an agent's conversations |
| `getConversation` | Get a conversation's messages |
| `subscribeWebhook` | Subscribe to real-time Taskade event webhooks |
| `unsubscribeWebhook` | Remove a webhook subscription |

---

## Why Taskade MCP?

Taskade MCP gives your AI assistant **access to your workspace**: projects, tasks, agents, knowledge bases, templates, and automations (on paid plans; some endpoints such as workspace listing are gated for free accounts). Instead of writing API code, describe what you need in natural language.

```
┌──────────────────────────────────────────────────────────┐
│                HOW TASKADE MCP WORKS                     │
└──────────────────────────────────────────────────────────┘

  You (in Claude/Cursor/Windsurf):
  "Create a support agent trained on our docs project"
                         ↓
  ┌──────────────────────────────────┐
  │     Taskade MCP Server           │
  │     (62 tools, 8 categories)     │
  └──────────────────────────────────┘
       ↓              ↓            ↓
  folderCreateAgent  agentKnowledge  agentPublicAccess
  (creates agent)    (attaches docs)  (publishes it)
                         ↓
  Result: Live AI chatbot trained on your data
```

| What You Say | What Happens |
|-------------|-------------|
| "Show me all overdue tasks" | Reads projects → filters tasks → formats report |
| "Create a support agent trained on our docs" | Creates agent → attaches knowledge → publishes |
| "Set up next week's sprint from our template" | Copies template → populates tasks → assigns team |
| "Summarize the completed work in my Sprint project" | Reads completed tasks → generates a standup summary |

### Why MCP Instead of REST API?

| | REST API | MCP Server |
|-|----------|-----------|
| **Setup** | Write HTTP client, handle auth, parse JSON | `npx @taskade/mcp-server`, one command |
| **Interface** | Code against endpoints | Natural language: describe what you need |
| **Chaining** | Manual orchestration | AI chains tools intelligently |
| **Error handling** | Write error handling code | AI interprets errors and retries |

### Why Taskade MCP Over Other MCP Servers?

Taskade MCP includes **AI agent management** (create, train, deploy agents), **knowledge base training** (attach docs, projects, media), and **OpenAPI codegen** (generate MCP tools from any API spec). 62 tools across 8 categories.

---

## Agent Recipes

<details>
<summary><b>Recipe 1: Daily Standup Summarizer</b></summary>
<br>

**Problem:** Team standup notes scattered across Slack, email, and docs.

```
You: "Check my Taskade workspace for yesterday's completed tasks,
      summarize them as a standup update, then create today's
      priority tasks based on what's still open."

Claude uses:
  1. meProjectsGet → find your active projects
  2. projectTasksGet → pull tasks from each project
  3. taskCreate → create today's priority tasks

Result: A formatted standup summary + fresh task list in Taskade.
```
</details>

<details>
<summary><b>Recipe 2: Knowledge Base Agent Builder</b></summary>
<br>

**Problem:** You have docs scattered across files and need an AI agent trained on them.

```
You: "Create an AI support agent called 'Help Bot' in my
      Customer Success folder, train it on our Documentation
      project, and publish it publicly."

Claude uses:
  1. workspaceFoldersGet → find "Customer Success" folder
  2. folderCreateAgent → create "Help Bot" with support instructions
  3. agentKnowledgeProjectCreate → attach Documentation project
  4. agentPublicAccessEnable → publish with shareable link

Result: Live AI chatbot trained on your docs, ready to embed.
```
</details>

<details>
<summary><b>Recipe 3: Sprint Planning Automation</b></summary>
<br>

**Problem:** Creating sprint projects manually every two weeks.

```
You: "Create a new sprint project from our 'Sprint Template',
      name it 'Sprint 2026-W15', move the top 10 backlog
      items into it, and assign them to the engineering team."

Claude uses:
  1. folderProjectTemplatesGet → find "Sprint Template"
  2. projectFromTemplate → create "Sprint 2026-W15"
  3. projectTasksGet → get backlog items
  4. taskMove → move top 10 tasks to new sprint
  5. taskPutAssignees → assign engineering team members

Result: Sprint ready to go, fully populated and assigned.
```
</details>

<details>
<summary><b>Recipe 4: Competitive Intelligence Agent</b></summary>
<br>

**Problem:** You need an agent that monitors competitors and reports findings.

```
You: "Generate an AI agent that researches our top 5 competitors.
      Train it on our Competitive Analysis project.
      Name it 'Market Intel Agent'."

Claude uses:
  1. folderAgentGenerate → generate agent from research prompt
  2. agentKnowledgeProjectCreate → connect Competitive Analysis project
  3. agentUpdate → refine instructions for research cadence

Result: AI research agent with domain knowledge, ready for briefings.
```
</details>

<details>
<summary><b>Recipe 5: Client Onboarding Pipeline</b></summary>
<br>

**Problem:** Each new client needs the same project structure, tasks, and materials.

```
You: "For our new client Acme Corp: create a project from
      the 'Client Onboarding' template, add tasks for
      kickoff meeting and SOW review, set due dates for
      the next 2 weeks, then share the project link."

Claude uses:
  1. projectFromTemplate → create "Acme Corp Onboarding"
  2. taskCreate → add kickoff, requirements, SOW tasks
  3. taskPutDate → set dates across next 2 weeks
  4. projectShareLinkEnable → generate share link

Result: Client onboarding project live and shareable in 30 seconds.
```
</details>

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

---

## OpenAPI Codegen

Use our generator to build MCP tools from any OpenAPI spec, not only Taskade.

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

[Taskade](https://www.taskade.com) ([Y Combinator S19](https://www.ycombinator.com/companies/taskade)) is the AI-native workspace for building apps, deploying agents, and automating workflows from a single prompt. **150,000+ apps built.**

- **Genesis Apps**: build complete apps from prompts. Dashboards, CRMs, portals and forms, deployed at once. [Try it →](https://www.taskade.com/create)
- **AI Agents**: custom agents with built-in tools, persistent memory, multi-agent teams, public embedding
- **Automations**: no-code workflow automation with 100+ integrations, branching, looping, filtering
- **Real-time Collaboration**: multiplayer workspace with chat, video, and multiple project views
- **Templates**: templates for project management, engineering, marketing, and more
- **API & MCP**: REST API v2, this MCP server, the agent plugin, Agent API, webhooks, OAuth 2.0

**Links:**
- App: [taskade.com](https://www.taskade.com)
- Create: [taskade.com/create](https://www.taskade.com/create)
- Apps gallery: [taskade.com/apps](https://www.taskade.com/apps)
- Agents: [taskade.com/agents](https://www.taskade.com/agents)
- Templates: [taskade.com/templates](https://www.taskade.com/templates)
- Docs: [taskade.com/docs](https://www.taskade.com/docs) · [docs.taskade.com](https://docs.taskade.com)
- **Workspace MCP guide:** https://github.com/taskade/docs/blob/main/apis-living-system-development/workspace-mcp.md
- **Hosted MCP guide:** https://github.com/taskade/docs/blob/main/apis-living-system-development/genesis-app-mcp.md
- Blog: [taskade.com/blog](https://www.taskade.com/blog)

---

## Roadmap

See [open issues](https://github.com/taskade/mcp/issues) for planned features and improvements.

**Recently shipped (v0.1.0):** Agent chat (`promptAgent`) and webhook triggers, live now via the [Taskade API v2 tool layer](#agent-chat--webhooks-api-v2-beta).

- **Automation tools**: the hosted server lists automations, reads their runs and runs a "When asked" automation (`list_automations`, `get_flow_runs`, `run_flow`). Create, enable and manage automations through MCP are on the roadmap.
- **`agent.js`**: open-source autonomous agent toolkit (coming soon)
- **TaskOS**: agent platform at [docs.taskade.com](https://docs.taskade.com)

---

## Privacy & Security

- **Hosted server.** Taskade runs it on `www.taskade.com`. It reads and writes only the workspaces that your Taskade account can access and that are on a paid plan. The server does not read your chat history with the AI client. `prompt_agent` runs a Taskade agent, which can use its own tools, for example web search.
- **Agent plugin.** The plugin holds skills (text files) and the address of the hosted server. It runs no code of its own. The backup skill writes workspace files to a local folder that you pick.
- **Local package.** Your API token authorizes the server to call the Taskade public API (`https://www.taskade.com/api/v1` and `https://www.taskade.com/api/v2`) on your behalf. The package sends your data to no other service. Keep the token in an environment variable, and never commit it.
- **Privacy policy:** [taskade.com/privacy](https://www.taskade.com/privacy). **Terms:** [taskade.com/terms](https://www.taskade.com/terms).
- **Security and vulnerability reports:** see [SECURITY.md](./SECURITY.md).

---

## Support

- Help center: [help.taskade.com](https://help.taskade.com)
- Email: [support@taskade.com](mailto:support@taskade.com)
- Bugs and feature requests: [GitHub issues](https://github.com/taskade/mcp/issues)

---

## Contributing

Help us improve MCP tools, OpenAPI workflows, and agent capabilities.

- [Issues](https://github.com/taskade/mcp/issues): report bugs or request features
- [Pull Requests](https://github.com/taskade/mcp/pulls): contributions welcome
- [Apps](https://www.taskade.com/apps): browse and clone community apps

---

## More from Taskade

- [Taskade Docs](https://docs.taskade.com) ([source](https://github.com/taskade/docs)): developer documentation and API reference
- [Integration Kit](https://github.com/taskade/integrations): open-source Zapier/n8n actions & triggers
- [Taskade](https://github.com/taskade/taskade): platform home, including Genesis, the AI app builder

---

## License

MIT

