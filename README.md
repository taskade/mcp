<div align="center">

# Taskade MCP Server

**Connect [Taskade](https://www.taskade.com) to any AI assistant — Claude, Cursor, Windsurf, VS Code, and more — via the [Model Context Protocol](https://modelcontextprotocol.io/).**

[![npm](https://img.shields.io/npm/v/@taskade/mcp-server?style=flat-square&color=FF2D60)](https://www.npmjs.com/package/@taskade/mcp-server)
[![GitHub stars](https://img.shields.io/github/stars/taskade/mcp?style=flat-square)](https://github.com/taskade/mcp)
[![License](https://img.shields.io/github/license/taskade/mcp?style=flat-square)](https://github.com/taskade/mcp/blob/main/LICENSE)

[![Add to Cursor](https://img.shields.io/badge/Add_to-Cursor-0098FF?style=flat-square)](cursor://anysphere.cursor-deeplink/mcp/install?name=taskade&config=eyJjb21tYW5kIjoibnB4IiwiYXJncyI6WyIteSIsIkB0YXNrYWRlL21jcC1zZXJ2ZXIiXSwiZW52Ijp7IlRBU0tBREVfQVBJX0tFWSI6InlvdXItYXBpLWtleS1oZXJlIn19)
[![Install in VS Code](https://img.shields.io/badge/Install_in-VS_Code-007ACC?style=flat-square&logo=visualstudiocode&logoColor=white)](vscode:mcp/install?%7B%22name%22%3A%22taskade%22%2C%22command%22%3A%22npx%22%2C%22args%22%3A%5B%22-y%22%2C%22%40taskade%2Fmcp-server%22%5D%2C%22env%22%3A%7B%22TASKADE_API_KEY%22%3A%22%24%7Binput%3Ataskade_api_key%7D%22%7D%7D)

**57 tools** for workspaces, projects, tasks, AI agents, knowledge bases, templates, automations, media, and sharing — all from your AI client.

</div>

- [MCP Server](https://github.com/taskade/mcp/tree/main/packages/server) — Connect Taskade to Claude Desktop, Cursor, Windsurf, or any MCP client.
- [OpenAPI Codegen](https://github.com/taskade/mcp/tree/main/packages/openapi-codegen) — Generate MCP tools from any OpenAPI spec — not just Taskade.

---

## Contents

- [Demo](#demo)
- [Quick Start](#quick-start)
- [Tools (57)](#tools-57)
- [Why Taskade MCP?](#why-taskade-mcp)
- [Agent Recipes](#agent-recipes)
- [Use Cases](#use-cases)
- [OpenAPI Codegen](#openapi-codegen)
- [What is Taskade?](#what-is-taskade)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## Demo

MCP-powered Taskade agent running inside Claude Desktop by Anthropic:

![Taskade MCP Demo — AI agent managing tasks and projects in Claude Desktop](https://github.com/user-attachments/assets/0cee987b-b0d4-4d10-bb7f-da49a080d731)

| Build Agents via MCP | Automate Workflows | Manage Projects |
|:---:|:---:|:---:|
| <img src="https://raw.githubusercontent.com/taskade/taskade/main/media/agents/agent-generator.gif" width="280" alt="Create AI agents from your IDE via Taskade MCP"> | <img src="https://raw.githubusercontent.com/taskade/taskade/main/media/automations/automation-flows.gif" width="280" alt="Automate workflows via Taskade MCP"> | <img src="https://raw.githubusercontent.com/taskade/taskade/main/media/genesis/create-app.gif" width="280" alt="Manage projects and apps via Taskade MCP"> |
| Create, train, deploy AI agents from Claude/Cursor | Build multi-step automations across 100+ services | Full workspace management from your AI assistant |

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

### 7. HTTP / SSE Mode (remote & custom clients)

```bash
TASKADE_API_KEY=your-api-key npx @taskade/mcp-server --http
```

The server starts at `http://localhost:3000` (configure with `PORT` env var). Connect via SSE at `http://localhost:3000/sse?access_token=your-api-key`.

---

## Tools (57)

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

---

## Why Taskade MCP?

Taskade MCP gives your AI assistant **full access to your workspace** — projects, tasks, agents, knowledge bases, templates, and automations. Instead of writing API code, describe what you need in natural language.

```
┌──────────────────────────────────────────────────────────┐
│                HOW TASKADE MCP WORKS                     │
└──────────────────────────────────────────────────────────┘

  You (in Claude/Cursor/Windsurf):
  "Create a support agent trained on our docs project"
                         ↓
  ┌──────────────────────────────────┐
  │     Taskade MCP Server           │
  │     (57 tools, 7 categories)     │
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
| "Summarize yesterday's completed work" | Reads task history → generates standup summary |

### Why MCP Instead of REST API?

| | REST API | MCP Server |
|-|----------|-----------|
| **Setup** | Write HTTP client, handle auth, parse JSON | `npx @taskade/mcp-server` — one command |
| **Interface** | Code against endpoints | Natural language — describe what you need |
| **Chaining** | Manual orchestration | AI chains tools intelligently |
| **Error handling** | Write error handling code | AI interprets errors and retries |

### Why Taskade MCP Over Other MCP Servers?

Taskade is the only MCP server that includes **AI agent management** (create, train, deploy agents), **knowledge base training** (attach docs, projects, media), and **OpenAPI codegen** (generate MCP tools from any API spec). 57 tools across 7 categories.

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

[Taskade](https://www.taskade.com) ([Y Combinator S19](https://www.ycombinator.com/companies/taskade)) is the AI-native workspace for building apps, deploying agents, and automating workflows — from a single prompt. **150,000+ apps generated. Trusted by 3M, Nike, Tesla, Netflix, Airbnb, Disney, Adobe.** Rated 4.8/5 across 9,300+ reviews.

- **Genesis Apps** — Build complete apps from prompts. Dashboards, CRMs, portals, forms — deployed instantly. [Try it →](https://www.taskade.com/create)
- **AI Agents** — Custom agents with 22+ tools, persistent memory, multi-agent teams, public embedding
- **Automations** — No-code workflow automation with 100+ integrations, branching, looping, filtering
- **Real-time Collaboration** — Multiplayer workspace with chat, video, 7 project views
- **Templates** — 700+ templates for project management, engineering, marketing, and more
- **API & MCP** — REST API v2, this MCP Server, Agent API, webhooks, OAuth 2.0

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

## Privacy & Security

Your Taskade API token authorizes the MCP server to call the Taskade public API on your behalf. The server talks **only** to `https://www.taskade.com/api/v1` and does not send your data to other third-party services.

- **Privacy** — see the [Taskade Privacy Policy](https://www.taskade.com/privacy).
- **Security & vulnerability reporting** — see [SECURITY.md](./SECURITY.md).
- Store your token in an environment variable; never commit it.

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
